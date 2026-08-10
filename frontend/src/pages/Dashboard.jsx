function Dashboard() {
  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Overview of your pharmaceutical complaint management system.</p>
        </div>
      </div>

      <div className="welcome-card">
        <div>
          <h2>💊 Pharma Complaint Copilot</h2>
          <p>
            Manage customer complaints, analyze risk, upload complaint PDFs,
            and track complaint activity from one place.
          </p>
        </div>
      </div>

      <div className="quick-grid">
        <div className="quick-card">
          <span>🤖</span>
          <h3>AI Assistant</h3>
          <p>
            Describe a complaint and automatically extract complaint details.
          </p>
        </div>

        <div className="quick-card">
          <span>📋</span>
          <h3>Complaint Management</h3>
          <p>
            View, edit, search and delete submitted complaints.
          </p>
        </div>

        <div className="quick-card">
          <span>📄</span>
          <h3>PDF Processing</h3>
          <p>
            Upload complaint PDFs and extract information automatically.
          </p>
        </div>

        <div className="quick-card">
          <span>📊</span>
          <h3>Analytics</h3>
          <p>
            Monitor complaint severity and country-wise distribution.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;