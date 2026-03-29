import { useState } from "react";
import { useAppContext } from "../api/app-context";

export default function Login() {
  const { login, signup } = useAppContext();
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const BG = "linear-gradient(160deg,#1e1b4b 0%,#3730a3 60%,#6d28d9 100%)";

  const handle = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await signup(email, password, { full_name: name });
      }
      window.location.href = "/";
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Segoe UI', system-ui, sans-serif", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 56 }}>🎓</div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: "white", margin: "8px 0 4px" }}>11+ Quest</h1>
          <p style={{ color: "#c7d2fe", fontSize: 13, margin: 0 }}>GL · CEM · ISEB · Independent Schools</p>
        </div>

        {/* Card */}
        <div style={{ background: "white", borderRadius: 24, padding: "28px 24px", boxShadow: "0 20px 60px rgba(0,0,0,0.4)" }}>
          {/* Toggle */}
          <div style={{ display: "flex", background: "#f1f5f9", borderRadius: 14, padding: 4, marginBottom: 24 }}>
            {["login", "signup"].map(m => (
              <button key={m} onClick={() => { setMode(m); setError(""); }} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "none", fontWeight: 800, fontSize: 14, cursor: "pointer", background: mode === m ? "white" : "transparent", color: mode === m ? "#3730a3" : "#6b7280", boxShadow: mode === m ? "0 2px 8px rgba(0,0,0,0.1)" : "none", transition: "all 0.2s" }}>
                {m === "login" ? "Sign In" : "Register"}
              </button>
            ))}
          </div>

          <form onSubmit={handle}>
            {mode === "signup" && (
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontWeight: 700, fontSize: 13, color: "#374151", marginBottom: 6 }}>Your Name</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Ahmed" required style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "2px solid #e5e7eb", fontSize: 15, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} onFocus={e => e.target.style.borderColor = "#4F46E5"} onBlur={e => e.target.style.borderColor = "#e5e7eb"} />
              </div>
            )}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontWeight: 700, fontSize: 13, color: "#374151", marginBottom: 6 }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" required style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "2px solid #e5e7eb", fontSize: 15, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} onFocus={e => e.target.style.borderColor = "#4F46E5"} onBlur={e => e.target.style.borderColor = "#e5e7eb"} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontWeight: 700, fontSize: 13, color: "#374151", marginBottom: 6 }}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "2px solid #e5e7eb", fontSize: 15, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} onFocus={e => e.target.style.borderColor = "#4F46E5"} onBlur={e => e.target.style.borderColor = "#e5e7eb"} />
            </div>

            {error && (
              <div style={{ background: "#FEF2F2", border: "1.5px solid #FECACA", borderRadius: 10, padding: "10px 14px", marginBottom: 16 }}>
                <p style={{ margin: 0, fontSize: 13, color: "#DC2626", fontWeight: 600 }}>⚠️ {error}</p>
              </div>
            )}

            <button type="submit" disabled={loading} style={{ width: "100%", padding: "14px", borderRadius: 14, border: "none", background: loading ? "#e5e7eb" : "linear-gradient(135deg,#4F46E5,#7C3AED)", color: loading ? "#9ca3af" : "white", fontWeight: 800, fontSize: 16, cursor: loading ? "not-allowed" : "pointer", boxShadow: !loading ? "0 4px 20px rgba(79,70,229,0.4)" : "none" }}>
              {loading ? "Please wait..." : mode === "login" ? "Sign In →" : "Create Account →"}
            </button>
          </form>

          <p style={{ textAlign: "center", fontSize: 12, color: "#9ca3af", marginTop: 16, marginBottom: 0 }}>
            {mode === "login" ? "No account? " : "Already have one? "}
            <span onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }} style={{ color: "#4F46E5", fontWeight: 700, cursor: "pointer", textDecoration: "underline" }}>
              {mode === "login" ? "Register free" : "Sign in"}
            </span>
          </p>
        </div>

        <p style={{ textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: 11, marginTop: 16 }}>
          Your progress saves automatically once signed in 🔒
        </p>
      </div>
    </div>
  );
}
