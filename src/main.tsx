import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { DesktopWorkbench } from "./concepts/desktop/DesktopWorkbench";
import "./styles/base.css";
import "./styles/tokens.css";
import "./styles/concepts.css";
import "./styles/ux.css";
import "./styles/sources.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {new URLSearchParams(location.search).has("desktop") ? <div className="dt-standalone"><DesktopWorkbench workflowScreen={new URLSearchParams(location.search).get("desktop") === "editor" ? "desktop-editor" : "desktop-welcome"} /><a className="dt-standalone-link" href="./">← Design gallery</a></div> : <App />}
  </StrictMode>,
);
