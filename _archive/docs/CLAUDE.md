# Crowd Data Dashboard - CLAUDE.md

## Project Overview
This repository contains a crowd data dashboard built with Vite + React + TypeScript.  
Primary entry point: `src/`  

## Bash Commands
- npm run dev            # Launch Vite dev server
- npm run build          # TypeScript compile + Vite build
- npm run lint           # ESLint
- npm run typecheck      # TypeScript type checking
- npm run preview        # Preview production build

## Code Style
- Use ES modules, NEVER `require`
- Prefer named exports; default exports only for pages
- 2-space indent; single quotes; trailing comma = all
- IMPORTANT: run `npm run typecheck` before every commit

## Workflow
1. Ask Claude to PLAN first, then confirm TODO list.
2. After each logical unit:
   - Run lint + typecheck
   - `git commit -m "$(claude-code commit-msg)"`
3. Use `/compact` when context meter >80 %.

## Testing
- Testing setup to be determined

## Sensitive files to avoid
- .env
- .env.*
- ./secrets/**

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.