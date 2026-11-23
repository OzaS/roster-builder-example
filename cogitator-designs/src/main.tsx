import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { applyTheme } from "./route";
import "./styles.css";
import "./directions/frame.css";

applyTheme();
createRoot(document.getElementById("root")!).render(<StrictMode><App /></StrictMode>);
