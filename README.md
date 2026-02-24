# Real-Time Chat Application

## Overview
A modern, full-stack real-time chat application built with TypeScript, WebSockets, and Next.js, featuring channel-based messaging, delivery/read receipts, user presence, and live user synchronization.

## Live Version
You can try the deployed version [HERE](https://socket-next-orcin.vercel.app/)

## Table of Contents

- [Overview](#overview)
- [Demo](#live-version)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Deployment](#deployment)
- [Scalability & Future Improvements](#scalability--future-improvements)
- [Status](#status)
- [Credits](#credits)

## Features

### Authentication & Sessions
- Secure user registration and login
- Server-side session management with expiration
- Cookie-based authentication shared between frontend and WebSocket backend

### Real-Time Messaging
- Channel-based chat (create & join channels dynamically)
- Instant message delivery via WebSockets
- Message history persisted in PostgreSQL
- Seamless channel switching with state preservation

### Delivery & Read Receipts
- Message states: Sent → Delivered → Seen
- Per-message receipts stored and synced in real time
- Accurate unread counters per channel

### Presence & User Activity
- Real-time online/offline status
- Live channel presence events (join / leave)
- Active channel tracking per user

### User panel showing
- All registered users
- Online/offline status
- Currently active chat (if any)

### Live User Synchronization
- Newly registered users appear instantly for all connected clients
- No refresh required
- Single source of truth across REST + WebSocket layers

### Optimized Client State
- Centralized WebSocket state management
- Incremental updates (snapshots + deltas)
- Deduplication and consistency guarantees

### Architecture Overview
- Backend (Express.js + WebSockets)
- Express.js for REST & internal endpoints
- Native WebSocket server for real-time communication
- Stateless message routing with explicit handlers:
- **Centralized in-memory connection store:**
    - Active sockets
    - User presence
    - Active channel per user
- Frontend (Next.js)
- App Router (React Server Components + Client Components)
- Server Actions for authentication
- WebSocket lifecycle managed via React Context
- Optimized re-rendering using memoized selectors
- **Clean separation between:**
    - UI components
    - Transport
    - State logic
    - Database (PostgreSQL)
    - Users
    - Sessions
    - Channels
    - Messages
    - Message receipts
    - Designed for extensibility and indexing

### Data Flow (High Level)
- User authenticates via Next.js
- WebSocket connection is established using session cookie
- Server sends initial snapshots:
- Users
- Channels
- Presence
- Unread counts
- Incremental real-time events keep all clients in sync
- State resets cleanly on disconnect / logout

## Tech Stack
- **Frontend**
    - <a href="https://nextjs.org/" target="_blank"><img src="https://raw.githubusercontent.com/tandpfun/skill-icons/65dea6c4eaca7da319e552c09f4cf5a9a8dab2c8/icons/NextJS-Light.svg" width="auto" height="20" alt="NextJS" /></a>&emsp;<span><strong>Next.js (App Router)</strong> — The React Framework for the Web</span>

    - <a href="https://react.dev/" target="_blank"><img src="https://raw.githubusercontent.com/tandpfun/skill-icons/65dea6c4eaca7da319e552c09f4cf5a9a8dab2c8/icons/React-Dark.svg" width="auto" height="20" alt="React" /></a>&emsp;<span><strong>React</strong> — The library for web and native user interfaces</span>

    - <a href="https://www.typescriptlang.org/" target="_blank"><img src="https://raw.githubusercontent.com/tandpfun/skill-icons/65dea6c4eaca7da319e552c09f4cf5a9a8dab2c8/icons/TypeScript.svg" width="auto" height="20" alt="TypeScript" /></a>&emsp;<span><strong>TypeScript</strong> — Programming language that builds on JavaScript, giving you better tooling at any scale.</span>

    - <a href="https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API/Writing_WebSocket_client_applications" target="_blank"><img src="https://upload.wikimedia.org/wikipedia/commons/c/cd/WebSocket_colored_logo.svg" width="auto" height="20" alt="WebSocket" /></a>&emsp;<span><strong>WebSocket</strong> — WebSocket-based client application</span>

    - <a href="https://daisyui.com/" target="_blank"><img src="https://raw.githubusercontent.com/tandpfun/skill-icons/65dea6c4eaca7da319e552c09f4cf5a9a8dab2c8/icons/TailwindCSS-Dark.svg" width="auto" height="20" alt="Tailwind" /></a>&emsp;<span><strong>Tailwind / DaisyUI (UI)</strong> — Faster, cleaner, easier Tailwind CSS development</span>

- **Backend**
    - <a href="https://nodejs.org/" target="_blank"><img src="https://raw.githubusercontent.com/tandpfun/skill-icons/65dea6c4eaca7da319e552c09f4cf5a9a8dab2c8/icons/NodeJS-Dark.svg" width="auto" height="20" alt="Node.js" /></a>&emsp;<span><strong>Node.js</strong> — JavaScript runtime environment</span>

    - <a href="https://expressjs.com/" target="_blank"><img src="https://raw.githubusercontent.com/tandpfun/skill-icons/65dea6c4eaca7da319e552c09f4cf5a9a8dab2c8/icons/ExpressJS-Dark.svg" width="auto" height="20" alt="Express.js" /></a>&emsp;<span><strong>Express.js</strong> — Minimalist web framework for Node.js</span>

    - <a href="https://github.com/websockets/ws" target="_blank"><img src="https://upload.wikimedia.org/wikipedia/commons/c/cd/WebSocket_colored_logo.svg" width="auto" height="20" alt="WebSocket" /></a>&emsp;<span><strong>WebSocket</strong> — Node.js WebSocket library</span>

    - <a href="https://www.typescriptlang.org/" target="_blank"><img src="https://raw.githubusercontent.com/tandpfun/skill-icons/65dea6c4eaca7da319e552c09f4cf5a9a8dab2c8/icons/TypeScript.svg" width="auto" height="20" alt="TypeScript" /></a>&emsp;<span><strong>TypeScript</strong> — Programming language that builds on JavaScript, giving you better tooling at any scale.</span>

    - <a href="https://www.postgresql.org/" target="_blank"><img src="https://raw.githubusercontent.com/tandpfun/skill-icons/65dea6c4eaca7da319e552c09f4cf5a9a8dab2c8/icons/PostgreSQL-Dark.svg" width="auto" height="20" alt="PostgreSQL" /></a>&emsp;<span><strong>PostgreSQL</strong> — Open Source Relational Database</span>

## Deployment
- Backend & WebSocket server: [Render](https://render.com/)
- Frontend: [Vercel](https://vercel.com/)
- Database: Managed PostgreSQL [Render](https://render.com/)

## Scalability & Future Improvements
- **This project is intentionally structured for growth:**
    - Horizontal Scaling
    - WebSocket server can be scaled behind a load balancer
    - Presence & channel state can be externalized to Redis
    - Performance
    - Add message pagination / infinite scroll
    - Introduce per-channel message limits & lazy loading
    - Features
    - Typing indicators
    - Reactions & message edits
    - Direct messages (1-to-1 channels)
    - Push notifications
    - File & image uploads
    - Security
    - Rate limiting
    - CSRF protection for REST endpoints
    - Role-based permissions

## Status
**This project demonstrates a production-ready real-time architecture, not a prototype:**
- Explicit event contracts
- Clear separation of concerns
- Predictable state flow
- Designed to scale

## Credits

[OpenAI ChatGPT](https://chatgpt.openai.com/)\
[Google Gemini](https://gemini.google.com/)