function Assistant() {
  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1>🤖 AI Complaint Assistant</h1>
          <p>
            Analyze customer complaints using AI.
          </p>
        </div>
      </div>

      <div className="welcome-card">
        <h2>AI Complaint Analysis</h2>

        <p>
          Your existing complaint analysis system will be connected here.
          You can describe a complaint, upload a PDF, and automatically
          extract the required information.
        </p>

        <div className="assistant-actions">
          <button className="primary-button">
            🤖 Start AI Analysis
          </button>

          <button className="secondary-button">
            📎 Upload Complaint PDF
          </button>
        </div>
      </div>
    </div>
  );
}

export default Assistant;