import React, { useState } from "react";
import "./App.css";

function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setResult(null);
    setError(null);

    // Create preview
    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

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
      ? "https://deepfake-29ub.onrender.com/analyze-video"
      : "https://deepfake-29ub.onrender.com/analyze-image";

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

  const getConfidenceColor = (probability) => {
    if (probability > 0.7) return "#ef4444";
    if (probability > 0.5) return "#f59e0b";
    return "#10b981";
  };

  return (
    <div className="app-container">
      <div className="background-gradient"></div>
      
      <div className="content-wrapper">
        <header className="header">
          <div className="logo-section">
            <div className="logo-icon">🎭</div>
            <h1 className="title">AI Deepfake Detector</h1>
          </div>
          <p className="subtitle">
            Advanced AI-powered detection for synthetic media analysis
          </p>
        </header>

        <div className="main-card">
          <div className="upload-section">
            <input
              type="file"
              id="file-input"
              accept="image/*,video/*"
              onChange={handleFileChange}
              className="file-input-hidden"
            />
            <label htmlFor="file-input" className="upload-area">
              {!preview ? (
                <>
                  <div className="upload-icon">📁</div>
                  <h3>Drop your file here or click to browse</h3>
                  <p className="upload-hint">
                    Supports images (JPG, PNG) and videos (MP4, AVI)
                  </p>
                </>
              ) : (
                <div className="preview-container">
                  {file && file.type.startsWith("image") ? (
                    <img src={preview} alt="Preview" className="preview-image" />
                  ) : (
                    <video src={preview} className="preview-video" controls />
                  )}
                  <div className="file-name">{file?.name}</div>
                </div>
              )}
            </label>

            {file && (
              <button
                onClick={analyzeFile}
                disabled={loading}
                className={`analyze-button ${loading ? "loading" : ""}`}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <span className="scan-icon">🔍</span>
                    Analyze for Deepfake
                  </>
                )}
              </button>
            )}
          </div>

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          {result && (
            <div className="result-card">
              <div className="result-header">
                <h2>Analysis Results</h2>
                <span className="result-badge">{result.type}</span>
              </div>

              <div className="result-content">
                <div className="verdict-section">
                  <div className="verdict-icon">
                    {result.deepfake_probability > 0.5 ? "🚨" : "✅"}
                  </div>
                  <div>
                    <h3 className="verdict-label">Verdict</h3>
                    <p
                      className="verdict-text"
                      style={{ color: getConfidenceColor(result.deepfake_probability) }}
                    >
                      {result.result}
                    </p>
                  </div>
                </div>

                <div className="confidence-section">
                  <div className="confidence-header">
                    <span>Deepfake Probability</span>
                    <span className="confidence-value">
                      {(result.deepfake_probability * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${result.deepfake_probability * 100}%`,
                        backgroundColor: getConfidenceColor(result.deepfake_probability),
                      }}
                    ></div>
                  </div>
                </div>

                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Confidence Score</span>
                    <span className="info-value">{result.deepfake_probability}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Analysis Type</span>
                    <span className="info-value">{result.type.toUpperCase()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <footer className="footer">
          <p>Powered by Advanced AI & Machine Learning Models</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
