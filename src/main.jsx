import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { createHead, UnheadProvider } from "@unhead/react/client";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthorContext.jsx";
import { UserProvider } from "./context/UserContext.jsx";

const head = createHead();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <UnheadProvider value={head}>
      <BrowserRouter>
        <AuthProvider>
          <UserProvider>
            <App />
          </UserProvider>
        </AuthProvider>
      </BrowserRouter>
    </UnheadProvider>
  </StrictMode>,
);
