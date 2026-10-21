import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { DesktopWorkbench } from "./concepts/desktop/DesktopWorkbench";
import type { ColorScheme, WorkflowScreen } from "./types";
import { applyStoredAmbient } from "./concepts/desktop/desktopAmbient";

import "./styles/base.css";
import "./styles/tokens.css";
import "./styles/concepts.css";
import "./styles/ux.css";
import "./styles/sources.css";

const ambientParam = new URLSearchParams(location.search).get("ambient");
applyStoredAmbient(ambientParam === null ? undefined : ambientParam !== "0");

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {new URLSearchParams(location.search).has("desktop") ? <div className="dt-standalone"><DesktopWorkbench workflowScreen={`desktop-${new URLSearchParams(location.search).get("desktop") || "welcome"}` as WorkflowScreen} themeMode={new URLSearchParams(location.search).get("theme") === "light" ? "light" : "dark"} colorScheme={(new URLSearchParams(location.search).get("scheme") ?? "default") as ColorScheme} /><a className="dt-standalone-link" href="?gallery=desktop">← Desktop design library</a></div> : <App />}
  </StrictMode>,
);
