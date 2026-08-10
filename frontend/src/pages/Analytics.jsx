function Analytics() {
  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1>📊 Analytics</h1>
          <p>
            Analyze complaint trends and risk distribution.
          </p>
        </div>
      </div>

      <div className="quick-grid">
        <div className="quick-card">
          <span>🔴</span>
          <h3>High Risk</h3>
          <p>Complaints requiring immediate attention.</p>
        </div>

        <div className="quick-card">
          <span>🟠</span>
          <h3>Medium Risk</h3>
          <p>Complaints requiring follow-up.</p>
        </div>

        <div className="quick-card">
          <span>🟢</span>
          <h3>Low Risk</h3>
          <p>Complaints suitable for routine monitoring.</p>
        </div>

        <div className="quick-card">
          <span>🌍</span>
          <h3>Country Analysis</h3>
          <p>View complaint distribution by country.</p>
        </div>
      </div>
    </div>
  );
}

export default Analytics;