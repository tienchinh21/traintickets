# TrainTickets CMS

React CMS base for the TrainTickets admin app.

## Stack

- Vite + React + TypeScript
- Ant Design
- React Router
- TanStack Query
- Zustand
- Axios
- Zod

## Run

```bash
npm install
npm run dev
```

## Environment

Create `.env.local` when connecting to the backend:

```bash
VITE_API_URL=http://localhost:3000
```

## Structure

```txt
src/
  app/               app providers and router
  features/auth/     auth page and auth store
  pages/             route pages
  shared/api/        axios client and react-query client
  shared/components/ reusable UI blocks
  shared/config/     env config
  shared/layouts/    CMS layout
```

The current login is a demo flow. Replace `features/auth/store/authStore.ts` with real login/logout calls when the API contract is ready.
