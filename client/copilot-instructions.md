# Rules for agent for Nextjs latest version 

## General

- Use TypeScript everywhere. Always infer or define explicit types - never use the any type
- Follow modern JavaScript/TypeScript best practices (ES modules, no `var`).
- Prefer concise, readable code over verbose solutions.
- always be very concise when implementing code for me
- never edit code that you were not asked to, that is not explicitly relevant and necessary to change for the current task
- when implementing util functions, check first in the utils dir of either the client or server project that it doesn't already exist. add new util functions to the relevant existing util file, don't create more util files unless sufficiently different in domain from the current files
⦁	Always prefer simple, elegant solutions (KISS principle).
⦁	Avoid duplication of code (DRY principle); check existing codebase first.
⦁	Only add functionality when explicitly needed (YAGNI principle).
⦁	Adhere to SOLID principles where applicable (e.g., single responsibility, dependency inversion).
⦁	Keep code clean, organized, and under 200-300 lines per file; refactor proactively.
⦁	You are careful to only make changes that are requested or you are confident are well understood and related to the change being requested
⦁	– When fixing an issue or bug, do not introduce a new pattern or technology without first exhausting all options for the existing implementation. And if you finally do this, make sure to remove the old implementation afterwards so we don’t have duplicate logic.



##Implementation Guidelines
⦁	Write code that respects dev, test, and prod environments.
⦁	!You never mock data for dev or prod—only for tests.
⦁	!You never introduce new patterns or technologies unless existing options are exhausted; remove old logic afterward.
⦁	!You never overwrite .env without my explicit confirmation.


##Quality and Documentation
⦁	After each major feature, generate a brief markdown doc in /docs/[feature].md and update /docs/overview.md.
⦁	Start every response with a random emoji (e.g., 🐳, 🌟) to signal context retention.
⦁	Optimize your outputs to minimize token usage while retaining clarity.


## Frontend (Next js with typescript)

- Use functional components with React hooks (e.g., useState, useEffect).
- Prefer arrow functions for component definitions: `const MyComponent = () => {...}`.
- Avoid class components or outdated React patterns.
- where posisble break big UIs down into smaller components

## Backend (Express js  + mongodb)

- Validate inputs with Zod: `import { z } from 'zod'`  when needed.
- Keep mongoose models in sync  and use generated types.
- never make external api calls within database transactions. database transactions are only for database queries.

## File Structure
- the project resides in `app`, which contains three folders: `app` for  front end, `server` for the backend api (app), and `shared` where we have some types/consts to be imported in both client/server
- Frontend files: Place in `app/` (e.g., `/components/`, `/hooks/`).
- Backend files: Place in `src` (e.g., `/api/`, `/db.ts`).
- Shared types/consts: Place in `shared`


## Formatting
- Use tab indentation.
- Prefer single quotes for strings.
- End files with a newline.
- Follow Prettier defaults (assume Prettier is in use unless specified).

## Naming Conventions
- Components: PascalCase (e.g., `MyComponent.tsx`).
- Hooks: camelCase with `use` prefix (e.g., `useMyHook.ts`).



## help

- do not edit code that isn't directly relevant to what I'm asking you to do. be concise and focussed on exactly the task at hand only
- don't add loads of pointless commentary - be very sparing.
- never modify existing commentary unless you have changed the code which the comment covers
- DO NOT give me commands to re-run the project to test the changes you've made, that is not needed since my project is running constantly and auto-restarts on file changes
- never change copy in the app unless I have told you to
