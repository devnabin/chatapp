// Where the backend lives. Defaults to the local uvicorn server for `npm run dev`;
// the Docker build sets VITE_API_URL=/api so nginx proxies to the backend container.
export const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

// Same location as API_URL but ws:// or wss:// (works for absolute or relative API_URL).
const wsBase = new URL(API_URL, window.location.origin);
wsBase.protocol = wsBase.protocol === "https:" ? "wss:" : "ws:";
export const WS_URL = wsBase.href.replace(/\/$/, "");
