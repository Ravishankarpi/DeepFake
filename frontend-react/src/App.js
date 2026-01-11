import React, { useState } from "react";

function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const analyzeFile = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    // Decide endpoint based on file type
    const isVideo = file.type.startsWith("video");
    const endpoint = isVideo
      ? "http://localhost:8000/analyze-video"
      : "http://localhost:8000/analyze-image";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("API error: " + response.status);
      }

      const data = await response.json();
      setResult(data);

    } catch (err) {
      console.error(err);
      setError("Detection failed. Please try another file.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "40px", fontFamily: "Arial" }}>
      <h2>Deepfake Detection</h2>

      <input
        type="file"
        accept="image/*,video/*"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <br /><br />

      <button onClick={analyzeFile} disabled={loading}>
        {loading ? "Analyzing..." : "Analyze"}
      </button>

      <br /><br />

      {error && <p style={{ color: "red" }}>{error}</p>}

      {result && (
        <div
          style={{
            border: "1px solid #ccc",
            padding: "20px",
            width: "420px",
            background: "#f9f9f9"
          }}
        >
          <p><b>Type:</b> {result.type}</p>
          <p>
            <b>Result:</b>{" "}
            <span
              style={{
                color:
                  result.deepfake_probability > 0.5 ? "red" : "green",
                fontWeight: "bold",
              }}
            >
              {result.result}
            </span>
          </p>
          <p><b>Confidence:</b> {result.deepfake_probability}</p>
        </div>
      )}
    </div>
  );
}

export default App;
