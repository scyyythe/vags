import { initializeTokenCleanup } from "./secureStorage";
import { getCSPDirectives } from "./xssProtection";

// Initialize security features
export const initializeSecurity = (): void => {
  // Initialize token cleanup
  initializeTokenCleanup();

  // Set Content Security Policy meta tag if not already present
  if (typeof document !== "undefined") {
    let cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');

    if (!cspMeta) {
      cspMeta = document.createElement("meta");
      cspMeta.setAttribute("http-equiv", "Content-Security-Policy");
      document.head.appendChild(cspMeta);
    }

    cspMeta.setAttribute("content", getCSPDirectives());
  }

  console.log("🔒 Security features initialized");
};

// Auto-initialize when module is imported
if (typeof window !== "undefined") {
  initializeSecurity();
}
