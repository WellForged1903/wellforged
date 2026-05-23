import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// One-time Production Migration: Clear stale cart data from local storage
(function() {
  const MIGRATION_VERSION = "1.2";
  const currentVersion = localStorage.getItem("wf_migration_version");
  if (currentVersion !== MIGRATION_VERSION) {
    localStorage.removeItem("wellforged_cart");
    localStorage.setItem("wf_migration_version", MIGRATION_VERSION);
    console.debug("Production Migration: Stale cart data cleared.");
  }
})();

createRoot(document.getElementById("root")!).render(<App />);
