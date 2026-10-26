import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";
import "./dev-theme.css";
import "./tracks.css";
import "./learning.css";
import "./lesson-player.css";
import "./explore-player.css";
import "./experience.css";
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
