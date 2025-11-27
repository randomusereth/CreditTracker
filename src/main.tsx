import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initTelegramWebApp } from "./lib/telegram-debug";

// Initialize Telegram WebApp if running in Telegram
initTelegramWebApp();

createRoot(document.getElementById("root")!).render(<App />);