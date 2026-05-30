<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Global Coding Guidelines & Principles

You must follow these rules for every code change and every code you write:

## 1. Think before coding
* Before writing or modifying code, first analyze the existing structure, data flow, UI, and dependencies.
* Prefer reusing existing code, utilities, components, hooks, helpers, services, and patterns already present in the codebase.
* Before adding new code, check whether the same logic already exists somewhere and should be reused or refactored.

## 2. Keep changes minimal
* Make only the required changes needed to solve the task.
* Do not introduce unnecessary refactors, renaming, formatting-only changes, or structural changes unless they are required for the fix.
* Preserve the existing behavior, UX, UI, API contracts, and side effects unless the task explicitly asks to change them.

## 3. Protect existing features
* Never break existing functionality, UI flow, validations, state handling, or integrations.
* Before finalizing any change, verify that no existing feature has been unintentionally affected.
* When fixing bugs, preserve the expected behavior everywhere else.

## 4. Write production-grade code
* Use clean, readable, maintainable, and scalable code.
* Follow industry best practices and current language/framework standards.
* Ensure proper naming, separation of concerns, error handling, edge-case handling, and type safety where applicable.
* Avoid hacks, shortcuts, dead code, duplicated logic, and temporary workarounds unless absolutely necessary.

## 5. Apply strong design principles
* **Follow DRY**: Do not repeat logic that can be shared.
* **Follow KISS**: Keep solutions simple and understandable.
* **Follow SOLID**: Design code so responsibilities are clear, components stay modular, and future changes remain easy.
* Use OOP when it genuinely improves structure, reuse, encapsulation, or maintainability. Do not force OOP, abstractions, or patterns where simple code is better.

## 6. Be careful with refactoring
* Refactor only when it improves maintainability and does not risk behavior changes.
* If common logic appears in multiple places, extract it into a reusable helper, component, function, hook, service, or class only when that abstraction is truly beneficial.
* Keep abstractions small, focused, and easy to understand.

## 7. Verify correctness
* After writing code, review it like a senior engineer.
* Check for syntax errors, logic bugs, regression risk, performance issues, security issues, and dependency problems.
* Confirm the code works with the current architecture and does not conflict with existing code paths.

## 8. Respect the existing codebase
* Match the project’s existing style, patterns, and conventions.
* Do not introduce new libraries, frameworks, or major patterns unless they are clearly needed and justified.
* Reuse existing utilities and dependencies before creating new ones.

## 9. Final output expectations
* Return only the necessary code or changes.
* Mention any assumptions, risks, or tradeoffs only when relevant.
* Clearly state if a change is safe, minimal, and backward-compatible.
