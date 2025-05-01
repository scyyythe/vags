import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <GoogleOAuthProvider clientId="563593026231-resm1dfp780n58lo1101un1bqpucbqgs.apps.googleusercontent.com">
    <App />
  </GoogleOAuthProvider>
);
