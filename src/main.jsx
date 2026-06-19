import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { CURRENT_USER_ID } from "./lib/userHelpers";

// Ensure the app uses the current dev user as the application user.
// This sets a safe fallback in localStorage for any code that reads it directly.
try {
	if (typeof localStorage !== "undefined") {
		const cur = localStorage.getItem("userId");
		if (cur !== String(CURRENT_USER_ID)) localStorage.setItem("userId", String(CURRENT_USER_ID));
	}
} catch (e) {
	// ignore (server-side rendering or restricted env)
}

createRoot(document.getElementById("root")).render(<App />);
