import { useState } from "react";
import axios from "axios";

const BASE_URL = "https://vi-notes-pd8x.onrender.com";

function App() {
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [keystrokes, setKeystrokes] = useState([]);
  const [pasteDetected, setPasteDetected] = useState(false);

  const handleKeyDown = () => {
    const time = Date.now();
    setKeystrokes(prev => [...prev, time]);
  };

  const handlePaste = () => {
    setPasteDetected(true);
  };

  const saveSession = async () => {
    const res = await axios.post(`${BASE_URL}/api/save-session`, {
      user: "User",
      text
    });
    setResult({ type: "session", data: res.data });
  };

  const getSessions = async () => {
    const res = await axios.get(`${BASE_URL}/api/sessions`);
    setResult({ type: "sessions", data: res.data });
  };

  const clearSessions = async () => {
    await axios.post(`${BASE_URL}/api/clear-sessions`);
    setResult({ type: "clear" });
  };

  const checkKeystroke = async () => {
    const res = await axios.post(`${BASE_URL}/api/keystroke`, {
      keystrokes
    });
    setResult({ type: "keystroke", data: res.data });
  };

  const checkPaste = async () => {
    const res = await axios.post(`${BASE_URL}/api/paste`, {
      pasteDetected
    });
    setResult({ type: "paste", data: res.data });
  };

  const finalCheck = () => {
    let score = 0;

    let pauses = 0;
    for (let i = 1; i < keystrokes.length; i++) {
      if (keystrokes[i] - keystrokes[i - 1] > 500) {
        pauses++;
      }
    }

    if (pauses > 2) score += 50;
    else score += 20;

    if (!pasteDetected) score += 50;
    else score -= 30;

    let verdict = "AI Generated ❌";

    if (score >= 70) verdict = "Human Written ✅";
    else if (score >= 40) verdict = "Possibly Human ⚠️";

    setResult({
      type: "final",
      data: { score, verdict }
    });
  };

  const renderResult = () => {
    if (!result) return null;

    if (result.type === "session") {
      return (
        <div>
          <h3>Session Saved ✅</h3>
          <p>Total Sessions: {result.data.totalSessions}</p>
        </div>
      );
    }

    if (result.type === "clear") {
      return <h3>All Sessions Cleared 🗑️</h3>;
    }

    if (result.type === "sessions") {
      return (
        <div>
          <h3>Saved Sessions 📂</h3>
          {result.data.length === 0 ? (
            <p>No sessions found</p>
          ) : (
            result.data.map((s, i) => (
              <div key={i} style={{ marginBottom: "10px" }}>
                <p><strong>User:</strong> {s.user}</p>
                <p><strong>Text:</strong> {s.text}</p>
                <hr />
              </div>
            ))
          )}
        </div>
      );
    }

    if (result.type === "keystroke") {
      return (
        <div>
          <h3>Typing Analysis ⌨️</h3>
          <p>Total Keystrokes: {result.data.totalKeystrokes}</p>
          <p>Pauses Detected: {result.data.pauseCount}</p>
          <p style={{ color: result.data.pauseCount > 2 ? "lightgreen" : "orange" }}>
            {result.data.pauseCount > 2
              ? "Natural Human Typing"
              : "Less Variation Detected"}
          </p>
        </div>
      );
    }

    if (result.type === "paste") {
      return (
        <div>
          <h3>Paste Detection 📋</h3>
          <p style={{
            color: result.data.status === "Suspicious" ? "red" : "lightgreen"
          }}>
            {result.data.status}
          </p>
        </div>
      );
    }

    if (result.type === "final") {
      return (
        <div>
          <h3>Final Authenticity Result 🧠</h3>
          <p>Score: {result.data.score}%</p>
          <p style={{
            fontWeight: "bold",
            color:
              result.data.score >= 70 ? "lightgreen" :
              result.data.score >= 40 ? "orange" : "red"
          }}>
            {result.data.verdict}
          </p>
        </div>
      );
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0f172a",
      color: "white",
      display: "flex",
      justifyContent: "center",
      alignItems: "center"
    }}>
      <div style={{
        width: "520px",
        padding: "30px",
        borderRadius: "15px",
        background: "#1e293b",
        boxShadow: "0 0 20px rgba(0,0,0,0.5)"
      }}>
        <h1 style={{ textAlign: "center" }}>Vi-Notes</h1>

        <textarea
          rows={6}
          placeholder="Start typing here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "10px",
            border: "none",
            marginTop: "15px"
          }}
        />

        <div style={{
          marginTop: "15px",
          display: "flex",
          gap: "10px",
          flexWrap: "wrap"
        }}>
          <button onClick={saveSession} style={btnStyle}>Save</button>
          <button onClick={getSessions} style={btnStyle}>View</button>
          <button onClick={clearSessions} style={dangerBtn}>Clear</button>
          <button onClick={checkKeystroke} style={btnStyle}>Analyze</button>
          <button onClick={checkPaste} style={btnStyle}>Paste</button>
          <button onClick={finalCheck} style={btnStyle}>Final Result</button>
        </div>

        <div style={{
          marginTop: "20px",
          padding: "15px",
          borderRadius: "10px",
          background: "#334155"
        }}>
          {renderResult() || <p>No analysis yet...</p>}
        </div>
      </div>
    </div>
  );
}

const btnStyle = {
  padding: "8px 12px",
  borderRadius: "8px",
  border: "none",
  cursor: "pointer",
  background: "#3b82f6",
  color: "white"
};

const dangerBtn = {
  ...btnStyle,
  background: "#ef4444"
};

export default App;