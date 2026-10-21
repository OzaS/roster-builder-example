import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { DesktopWorkbench } from "./concepts/desktop/DesktopWorkbench";
import type { ColorScheme } from "./types";
import "./styles/base.css";
import "./styles/tokens.css";
import "./styles/concepts.css";
import "./styles/ux.css";
import "./styles/sources.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {new URLSearchParams(location.search).has("desktop") ? <div className="dt-standalone"><DesktopWorkbench workflowScreen={new URLSearchParams(location.search).get("desktop") === "editor" ? "desktop-editor" : "desktop-welcome"} themeMode={new URLSearchParams(location.search).get("theme") === "light" ? "light" : "dark"} colorScheme={(new URLSearchParams(location.search).get("scheme") ?? "generic") as ColorScheme} /><a className="dt-standalone-link" href="?gallery=desktop">← Desktop design library</a></div> : <App />}
  </StrictMode>,
);
