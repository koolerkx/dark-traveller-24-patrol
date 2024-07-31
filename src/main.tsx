import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { FirebaseProvider } from "./contexts/firebase";
import { AuthProvider } from "./contexts/auth";
import { RepositoryProvider } from "./contexts/repository";

const container = document.getElementById("root");
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <FirebaseProvider>
      <AuthProvider>
        <RepositoryProvider>
          <App />
        </RepositoryProvider>
      </AuthProvider>
    </FirebaseProvider>
  </React.StrictMode>
);
