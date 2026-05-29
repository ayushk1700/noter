# Fokus

Fokus is a single-page note-taking workspace built with Next.js 15, React 19, TypeScript, and Tailwind CSS. The app is centered around fast capture, a rich text editor, draggable note surfaces, and a built-in calendar view.

## Overview

The application runs as a client-side shell in [src/components/App.tsx](src/components/App.tsx) and persists its working state in `localStorage`. Notes, calendar days, calendar events, the active date, layout selection, and Google sync configuration are all restored on load. The entry page uses a dynamic import with a loading fallback in [src/app/page.tsx](src/app/page.tsx).

## Features

- Quick capture from the splash screen, including a one-line thought input.
- Note workspace with canvas and grid modes, tag grouping, search UI, and draggable note cards.
- Rich text editing powered by Tiptap with task lists, mentions, page blocks, embedded notes, and zoomable list items.
- Media attachments for images, videos, files, and voice notes.
- Drag and drop file attachment support in the editor.
- Calendar workspace with day, week, month, and agenda layouts.
- Local persistence for notes and calendar state in the browser.
- PWA metadata, sitemap, robots configuration, and security headers.
- Light/dark theme toggles and a chrono mode toggle in the UI shell.

## Tech Stack

- Next.js 15 App Router
- React 19
- TypeScript
- Tailwind CSS
- Tiptap editor
- Framer Motion
- Lucide icons
- XYFlow for canvas-style note relationships

## Project Structure

```
src/
  app/          Next.js app router, metadata, API routes, globals
  components/   App shell, views, and reusable UI pieces
  hooks/        Client hooks such as voice recording
  lib/          Types, constants, utilities, and Tiptap extensions
public/         PWA manifest and static assets
middleware.ts   Security headers for incoming requests
```

## Getting Started

### Requirements

- Node.js 20 or newer
- npm 11 or newer

### Install

```bash
npm install
```

### Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for production

```bash
npm run build
npm start
```

## Scripts

- `npm run dev` starts the Next.js development server.
- `npm run build` creates a production build.
- `npm start` serves the production build.
- `npm run lint` runs ESLint across the workspace.

## Data Model And Runtime Behavior

- Notes are tag-based. The note type includes optional `parentId` and `connections` fields, but the active workspace groups root notes by first tag rather than folders.
- The workspace loads seed data from [src/lib/constants.tsx](src/lib/constants.tsx).
- Voice recording is handled in [src/hooks/useVoiceRecorder.ts](src/hooks/useVoiceRecorder.ts) and saved as audio attachments.
- The editor supports file drops directly onto the note surface.
- Calendar state is seeded from [src/lib/constants.tsx](src/lib/constants.tsx) and rendered through [src/components/views/CalendarView.tsx](src/components/views/CalendarView.tsx).

## API Routes

The repository includes lightweight route handlers in `src/app/api`, backed by in-memory arrays rather than a real database.

- `GET /api/notes` returns all notes, or notes filtered by `parentId`.
- `POST /api/notes` creates a note.
- `PUT /api/notes` updates a note.
- `DELETE /api/notes?id=...` deletes a note.
- `GET /api/folders` returns folders.
- `POST /api/folders` creates a folder.
- `PUT /api/folders` updates a folder.
- `DELETE /api/folders?id=...` deletes a folder.
- `GET /api/initialize` returns app status.
- `POST /api/initialize` returns a success response for initialization.

## Security And SEO

- Middleware adds `X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`, and `Referrer-Policy` headers.
- The app includes metadata, a manifest, robots instructions, and a sitemap.

## Deployment

The app is ready to deploy as a standard Next.js project. `vercel.json` is included for Vercel deployments.

## Notes

The codebase currently focuses on the interactive client experience. The API routes are present for structure and future backend integration, but the app state shown in the UI is primarily browser-local today.
