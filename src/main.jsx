import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthorContext.jsx";
import { UserProvider } from "./context/UserContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <UserProvider>
          <App />
        </UserProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
