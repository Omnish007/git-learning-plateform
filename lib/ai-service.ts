import { useAiStore, AiProvider } from "./ai-store";

const SYSTEM_PROMPT = `You are the GitMaster Socratic Coach. 
Your purpose is to help the user learn Git using the Socratic method.
RULES:
1. Do NOT just give the solution or the command to copy-paste.
2. Ask short, leading questions that prompt the user to think about what is happening in their repository state.
3. Be supportive and brief. Use friendly, clear language.
`;

interface CoachContext {
  commandHistory: string[];
  gitStatus: string;
  activeBranch: string;
  fileList: string[];
  userQuery: string;
}

/**
 * Generates structured context information representing current repository bounds.
 */
function buildUserMessage(context: CoachContext): string {
  return `REPOSITORY STATE:
- Active branch: ${context.activeBranch}
- Current file tree: [${context.fileList.join(", ")}]
- Git CLI Command history:
${context.commandHistory.slice(-5).map((c) => `  $ ${c}`).join("\n")}
- Current 'git status' output:
${context.gitStatus}

USER QUESTION / STUCK QUERY:
"${context.userQuery}"

Please coach me socratically based on my query and my repository state. Remember: ask questions, don't give the commands!`;
}

/**
 * Streams Socratic responses from the active configured AI provider.
 */
export async function streamSocraticCoach(
  context: CoachContext,
  onChunk: (text: string) => void,
  onComplete: () => void,
  onError: (error: string) => void
): Promise<void> {
  const store = useAiStore.getState();
  const provider = store.activeProvider;

  const userMessage = buildUserMessage(context);

  // --- MOCK PROVIDER FALLBACK ---
  if (provider === "mock") {
    simulateMockStream(context.userQuery, onChunk, onComplete);
    return;
  }

  const decryptedKey = store.getDecryptedKey(provider);
  if (!decryptedKey && provider !== "ollama") {
    onError(`Missing API key for ${provider}. Please configure it in Settings.`);
    return;
  }

  try {
    if (provider === "google") {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?key=${decryptedKey}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            { role: "user", parts: [{ text: `${SYSTEM_PROMPT}\n\n${userMessage}` }] },
          ],
          generationConfig: { maxOutputTokens: 500, temperature: 0.7 },
        }),
      });

      if (!response.ok) {
        throw new Error(`Gemini API Error: Status ${response.status}`);
      }

      await consumeReadableStream(response, (chunk) => {
        try {
          const json = JSON.parse(chunk);
          const text = json.candidates?.[0]?.content?.parts?.[0]?.text || "";
          if (text) onChunk(text);
        } catch {
          // Ignore parse errors from partial streaming lines
        }
      });
      onComplete();
    } 
    
    else if (provider === "groq" || provider === "huggingface") {
      const url = provider === "groq"
        ? "https://api.groq.com/openai/v1/chat/completions"
        : "https://api-inference.huggingface.co/models/meta-llama/Llama-3.2-3B-Instruct/v1/chat/completions";

      const model = provider === "groq" ? "llama-3.1-70b-versatile" : "meta-llama/Llama-3.2-3B-Instruct";

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${decryptedKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userMessage },
          ],
          stream: true,
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        throw new Error(`${provider} API Error: Status ${response.status}`);
      }

      await parseSseStream(response, onChunk);
      onComplete();
    } 
    
    else if (provider === "ollama") {
      const url = `${store.ollamaEndpoint}/api/chat`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "llama3",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userMessage },
          ],
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama Error: Status ${response.status}. Ensure Ollama is running and model llama3 is installed.`);
      }

      await parseOllamaStream(response, onChunk);
      onComplete();
    }
  } catch (err: any) {
    console.error("Streaming error:", err);
    onError(err.message || "An unexpected error occurred during streaming.");
  }
}

/**
 * Consumes raw body reader chunks for basic API parses.
 */
async function consumeReadableStream(response: Response, onChunk: (text: string) => void) {
  const reader = response.body?.getReader();
  if (!reader) return;
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    buffer += decoder.decode(value, { stream: true });
    
    // Gemini stream chunks are enclosed in brackets [...]
    // For simplicity, find candidates block
    const parts = buffer.split("}\n,");
    for (let i = 0; i < parts.length - 1; i++) {
      let segment = parts[i].trim();
      if (segment.startsWith("[")) segment = segment.substring(1);
      if (!segment.endsWith("}")) segment += "}";
      onChunk(segment);
    }
    buffer = parts[parts.length - 1];
  }
  
  if (buffer.trim()) {
    let segment = buffer.trim();
    if (segment.startsWith("[")) segment = segment.substring(1);
    if (segment.endsWith("]")) segment = segment.slice(0, -1);
    onChunk(segment);
  }
}

/**
 * Standard SSE parser for Groq / OpenAI compatible JSON lines.
 */
async function parseSseStream(response: Response, onChunk: (text: string) => void) {
  const reader = response.body?.getReader();
  if (!reader) return;
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    
    for (let i = 0; i < lines.length - 1; i++) {
      const line = lines[i].trim();
      if (line.startsWith("data: ")) {
        const jsonStr = line.substring(6);
        if (jsonStr === "[DONE]") continue;
        try {
          const parsed = JSON.parse(jsonStr);
          const token = parsed.choices?.[0]?.delta?.content || "";
          if (token) onChunk(token);
        } catch {
          // partial segment
        }
      }
    }
    buffer = lines[lines.length - 1];
  }
}

/**
 * Custom line parser for Ollama's stream chat objects.
 */
async function parseOllamaStream(response: Response, onChunk: (text: string) => void) {
  const reader = response.body?.getReader();
  if (!reader) return;
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    
    for (let i = 0; i < lines.length - 1; i++) {
      const line = lines[i].trim();
      if (line) {
        try {
          const parsed = JSON.parse(line);
          const token = parsed.message?.content || "";
          if (token) onChunk(token);
        } catch {
          // partial line
        }
      }
    }
    buffer = lines[lines.length - 1];
  }
}

/**
 * Standard simulated word-by-word Socratic typing fallback.
 */
function simulateMockStream(query: string, onChunk: (text: string) => void, onComplete: () => void) {
  const lower = query.toLowerCase();
  
  let responses = [
    "I notice you have modified files in your directory. What command would tell Git to take snapshots of those modifications before locking them in?",
    "Think about the difference between files in your working directory and files in the staging area. How do we transfer files into the stage?",
    "Every commit is like a photograph of your workspace. But before taking a photograph, you must invite people into the staging frame. How do we do that?"
  ];

  if (lower.includes("status")) {
    responses = [
      "Let's look at the colors of your files tree. Red files indicate unstaged changes, and green files represent staged additions. What does running 'git status' help you verify?",
      "Running 'git status' is like checking the list of ingredients before baking a commit. Are you ready to see what is staged?"
    ];
  } else if (lower.includes("commit")) {
    responses = [
      "You are trying to commit your changes! Have you added them to the index yet? What happens if you try to make a commit with nothing staged?",
      "To create a commit, we need a descriptive message explaining the changes. Do you remember the flag for adding a commit message in the CLI?"
    ];
  } else if (lower.includes("stash")) {
    responses = [
      "Stashing lets you clean your active desk and put your working papers in a safe drawer. What command puts them away, and how do we pull them back later?"
    ];
  }

  const selection = responses[Math.floor(Math.random() * responses.length)];
  const tokens = selection.split(" ");
  let idx = 0;

  const interval = setInterval(() => {
    if (idx < tokens.length) {
      onChunk(tokens[idx] + " ");
      idx++;
    } else {
      clearInterval(interval);
      onComplete();
    }
  }, 100);
}
