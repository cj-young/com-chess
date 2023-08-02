import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.scss";
import { BrowserRouter } from "react-router-dom";
import { AuthContextProvider } from "./contexts/AuthContext.tsx";
import { UserContextProvider } from "./contexts/UserContext.tsx";
import { LiveGameContextProvider } from "./contexts/LiveGameContext.tsx";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <AuthContextProvider>
      <UserContextProvider>
        <LiveGameContextProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </LiveGameContextProvider>
      </UserContextProvider>
    </AuthContextProvider>
  </React.StrictMode>
);
