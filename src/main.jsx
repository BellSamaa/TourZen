import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ParallaxProvider } from "react-scroll-parallax";
import App from "./App.jsx";
import "./index.css"; // ⚠️ đây là file chứa @tailwind base/components/utilities

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ParallaxProvider>
        <App />
      </ParallaxProvider>
    </BrowserRouter>
  </React.StrictMode>
);
