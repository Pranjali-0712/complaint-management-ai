import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Link,
} from "react-router-dom";

import Sidebar from "./components/Sidebar";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { setFormData, updateField } from "./features/formSlice";
import { addMessage, setLoading } from "./features/chatSlice";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";


// =====================================================
// BACKEND URL
// =====================================================

const API_URL = "https://complaint-management-ai.onrender.com";


// =====================================================
// FIELD CONFIGURATION
// =====================================================

const fieldOrder = [
  "complaint_number",
  "complaint_date",
  "customer_name",
  "product_name",
  "batch_number",
  "manufacturing_date",
  "complaint_description",
  "complaint_category",
  "severity",
  "country",
  "received_through",
  "remarks",
];

const fieldLabels = {
  complaint_number: "Complaint Number",
  complaint_date: "Complaint Date",
  customer_name: "Customer Name",
  product_name: "Product Name",
  batch_number: "Batch Number",
  manufacturing_date: "Manufacturing Date",
  complaint_description: "Complaint Description",
  complaint_category: "Complaint Category",
  severity: "Severity",
  country: "Country",
  received_through: "Received Through",
  remarks: "Remarks",
};


// =====================================================
// AI ASSESSMENT
// =====================================================

function deriveAssessment(form) {
  const description =
    form.complaint_description || form.remarks || "";

  const product =
    form.product_name || "the product";

  const severity =
    String(form.severity || "medium").toLowerCase();

  const summary = description
    ? `Customer reported an issue with ${product}: ${description}`
    : `Customer complaint received for ${product}.`;

  let riskLevel = "Low";

  let riskReason =
    "The complaint appears low risk and may be managed with routine review.";

  if (severity === "high" || severity === "critical") {
    riskLevel = "High";

    riskReason =
      "The complaint describes a significant quality or safety issue.";
  } else if (
    severity === "medium" ||
    severity === "moderate"
  ) {
    riskLevel = "Medium";

    riskReason =
      "The complaint indicates a moderate quality concern requiring follow-up.";
  }

  if (form.batch_number) {
    riskReason =
      `${riskReason} Batch ${form.batch_number} was referenced.`;
  }

  return {
    summary,
    risk_level: riskLevel,
    risk_reason: riskReason,
  };
}


// =====================================================
// UPDATE INSTRUCTION
// =====================================================

function parseUpdateInstruction(message) {
  const fieldMap = {
    "complaint number": "complaint_number",
    "complaint date": "complaint_date",
    "customer name": "customer_name",
    "product name": "product_name",
    "batch number": "batch_number",
    "manufacturing date": "manufacturing_date",
    "complaint description": "complaint_description",
    "complaint category": "complaint_category",
    severity: "severity",
    country: "country",
    "received through": "received_through",
    remarks: "remarks",
  };

  const lower = message.toLowerCase().trim();

  if (
    !/(change|update|set)/i.test(lower) ||
    !/(to|as|=)/i.test(lower)
  ) {
    return null;
  }

  const fieldKey = Object.keys(fieldMap).find((key) =>
    lower.includes(key)
  );

  if (!fieldKey) {
    return null;
  }

  const valueMatch = lower.match(
    /(?:to|as|=)\s*(.+)$/i
  );

  const value = valueMatch
    ? valueMatch[1].trim()
    : "";

  if (!value) {
    return null;
  }

  return {
    field: fieldMap[fieldKey],
    value,
  };
}


// =====================================================
// MAIN APP
// =====================================================

function App() {
  const dispatch = useDispatch();

  const form = useSelector((state) => state.form);

  const chat = useSelector((state) => state.chat);

  const [input, setInput] = useState("");

  const [complaints, setComplaints] = useState([]);

  const [dashboard, setDashboard] = useState({
    total: 0,
    high: 0,
    medium: 0,
    low: 0,
    countries: {},
  });

  const [search, setSearch] = useState("");

  const [editingId, setEditingId] = useState(null);

  const [isEditing, setIsEditing] = useState(false);


  // =====================================================
  // AI ASSESSMENT
  // =====================================================

  useEffect(() => {
    const assessment = deriveAssessment(form);

    const shouldUpdate =
      form.summary !== assessment.summary ||
      form.risk_level !== assessment.risk_level ||
      form.risk_reason !== assessment.risk_reason;

    if (shouldUpdate) {
      dispatch(
        setFormData({
          ...form,
          ...assessment,
        })
      );
    }
  }, [
    dispatch,
    form.summary,
    form.risk_level,
    form.risk_reason,
    form.complaint_description,
    form.remarks,
    form.product_name,
    form.batch_number,
    form.severity,
  ]);


  // =====================================================
  // LOAD COMPLAINTS
  // =====================================================

  const loadComplaints = async () => {
    try {
      const response = await fetch(
        `${API_URL}/complaints`
      );

      if (!response.ok) {
        throw new Error(
          "Unable to load complaints"
        );
      }

      const data = await response.json();

      setComplaints(
        Array.isArray(data) ? data : []
      );
    } catch (error) {
      console.error(
        "Complaint loading error:",
        error
      );
    }
  };


  // =====================================================
  // LOAD DASHBOARD
  // =====================================================

  const loadDashboard = async () => {
    try {
      const response = await fetch(
        `${API_URL}/dashboard`
      );

      if (!response.ok) {
        throw new Error(
          "Unable to load dashboard"
        );
      }

      const data = await response.json();

      setDashboard({
        total: data.total || 0,
        high: data.high || 0,
        medium: data.medium || 0,
        low: data.low || 0,
        countries: data.countries || {},
      });
    } catch (error) {
      console.error(
        "Dashboard loading error:",
        error
      );
    }
  };


  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    loadComplaints();
    loadDashboard();
  }, []);


  // =====================================================
  // AI CHAT
  // =====================================================

  const handleSend = async () => {
    if (!input.trim() || chat.loading) {
      return;
    }

    const message = input.trim();

    dispatch(
      addMessage({
        role: "user",
        content: message,
      })
    );

    dispatch(setLoading(true));

    const updateInstruction =
      parseUpdateInstruction(message);


    // ---------------------------------------------------
    // FIELD UPDATE
    // ---------------------------------------------------

    if (updateInstruction) {
      dispatch(
        updateField(updateInstruction)
      );

      try {
        const response = await fetch(
          `${API_URL}/update`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify(
              updateInstruction
            ),
          }
        );

        if (!response.ok) {
          console.warn(
            "Backend field update failed."
          );
        }
      } catch (error) {
        console.error(
          "Field update error:",
          error
        );
      }

      dispatch(
        addMessage({
          role: "assistant",
          content: `Updated ${updateInstruction.field.replace(
            /_/g,
            " "
          )}.`,
        })
      );

      dispatch(setLoading(false));

      setInput("");

      return;
    }


    // ---------------------------------------------------
    // AI CHAT
    // ---------------------------------------------------

    try {
      const response = await fetch(
        `${API_URL}/chat`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            message,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          "Chat request failed"
        );
      }

      const data = await response.json();

      const complaint =
        data.complaint || {};

      dispatch(
        setFormData({
          ...form,
          ...complaint,
        })
      );

      dispatch(
        addMessage({
          role: "assistant",
          content:
            "Complaint details extracted and form updated successfully.",
        })
      );
    } catch (error) {
      console.error(
        "AI chat error:",
        error
      );

      dispatch(
        addMessage({
          role: "assistant",
          content:
            "Unable to reach the backend service. Please make sure the backend is running on port 8000.",
        })
      );
    } finally {
      dispatch(setLoading(false));
      setInput("");
    }
  };


  // =====================================================
  // EDIT COMPLAINT
  // =====================================================

  const editComplaint = (item) => {
    dispatch(
      setFormData({
        ...item,
      })
    );

    setEditingId(item.id);

    setIsEditing(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };


  // =====================================================
  // GENERATE PDF
  // =====================================================

  const generatePDF = async () => {
    try {
      const response = await fetch(
        `${API_URL}/generate-pdf`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            complaint: form,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          "PDF generation failed"
        );
      }

      const blob = await response.blob();

      const url =
        window.URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = url;

      link.download =
        "complaint_report.pdf";

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);

      alert(
        "PDF downloaded successfully!"
      );
    } catch (error) {
      console.error(
        "PDF error:",
        error
      );

      alert(
        "Unable to generate PDF."
      );
    }
  };


  // =====================================================
  // SAVE / UPDATE COMPLAINT
  // =====================================================

  const saveComplaint = async () => {
    try {
      let response;

      if (isEditing) {
        response = await fetch(
          `${API_URL}/complaint/${editingId}`,
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              complaint: form,
            }),
          }
        );
      } else {
        response = await fetch(
          `${API_URL}/submit`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              complaint: form,
            }),
          }
        );
      }

      if (!response.ok) {
        throw new Error(
          "Save failed"
        );
      }

      await response.json();

      alert(
        isEditing
          ? "Complaint updated successfully!"
          : "Complaint saved successfully!"
      );

      setEditingId(null);

      setIsEditing(false);

      await loadComplaints();

      await loadDashboard();
    } catch (error) {
      console.error(
        "Save error:",
        error
      );

      alert(
        "Unable to save complaint. Please check that the backend is running."
      );
    }
  };


  // =====================================================
  // DELETE COMPLAINT
  // =====================================================

  const deleteComplaint = async (id) => {
    const confirmed = window.confirm(
      "Delete this complaint?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/complaint/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error(
          "Delete failed"
        );
      }

      await loadComplaints();

      await loadDashboard();

      alert(
        "Complaint deleted."
      );
    } catch (error) {
      console.error(
        "Delete error:",
        error
      );

      alert(
        "Delete failed."
      );
    }
  };


  // =====================================================
  // PDF UPLOAD
  // =====================================================

  const handleFileUpload = async (
    event
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    const formData =
      new FormData();

    formData.append(
      "file",
      file
    );

    try {
      const response =
        await fetch(
          `${API_URL}/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

      if (!response.ok) {
        throw new Error(
          "Upload failed"
        );
      }

      const data =
        await response.json();

      const complaint =
        data.complaint || {};

      dispatch(
        setFormData({
          ...form,
          ...complaint,
        })
      );

      dispatch(
        addMessage({
          role: "assistant",
          content:
            "PDF processed successfully and complaint information was extracted.",
        })
      );
    } catch (error) {
      console.error(
        "PDF upload error:",
        error
      );

      dispatch(
        addMessage({
          role: "assistant",
          content:
            "Unable to process the PDF upload.",
        })
      );
    }

    event.target.value = "";
  };


  // =====================================================
  // REQUIRED FIELDS
  // =====================================================

  const requiredFields = [
    "customer_name",
    "product_name",
    "batch_number",
    "manufacturing_date",
    "country",
    "received_through",
    "complaint_description",
    "severity",
  ];

  const completed =
    requiredFields.filter(
      (field) => form[field]
    );

  const completeness = {
    percent: Math.round(
      (completed.length /
        requiredFields.length) *
        100
    ),
  };


  // =====================================================
  // SEARCH
  // =====================================================

  const filteredComplaints =
    complaints.filter((item) => {
      const customer =
        String(
          item.customer_name || ""
        ).toLowerCase();

      const product =
        String(
          item.product_name || ""
        ).toLowerCase();

      const number =
        String(
          item.complaint_number || ""
        ).toLowerCase();

      const searchText =
        search.toLowerCase();

      return (
        customer.includes(searchText) ||
        product.includes(searchText) ||
        number.includes(searchText)
      );
    });


  // =====================================================
  // CHART DATA
  // =====================================================

  const pieData = [
    {
      name: "High",
      value: dashboard.high || 0,
    },
    {
      name: "Medium",
      value: dashboard.medium || 0,
    },
    {
      name: "Low",
      value: dashboard.low || 0,
    },
  ];

  const COLORS = [
    "#ef4444",
    "#f59e0b",
    "#22c55e",
  ];

  const countryData =
    Object.entries(
      dashboard.countries || {}
    ).map(
      ([country, count]) => ({
        country,
        count,
      })
    );


  // =====================================================
  // WEBSITE
  // =====================================================

  return (
    <BrowserRouter
  future={{
    v7_relativeSplatPath: true,
  }}
>

      <div className="app-shell">

        <Sidebar />

        <div className="main-content">

          <Routes>

            {/* DASHBOARD */}

            <Route
              path="/"
              element={
                <DashboardPage
                  dashboard={dashboard}
                  pieData={pieData}
                  countryData={
                    countryData
                  }
                  COLORS={COLORS}
                />
              }
            />


            {/* NEW COMPLAINT */}

            <Route
              path="/new-complaint"
              element={
                <ComplaintPage
                  form={form}
                  dispatch={dispatch}
                  fieldOrder={fieldOrder}
                  fieldLabels={
                    fieldLabels
                  }
                  chat={chat}
                  input={input}
                  setInput={setInput}
                  handleSend={
                    handleSend
                  }
                  saveComplaint={
                    saveComplaint
                  }
                  generatePDF={
                    generatePDF
                  }
                  handleFileUpload={
                    handleFileUpload
                  }
                  completeness={
                    completeness
                  }
                  requiredFields={
                    requiredFields
                  }
                  isEditing={
                    isEditing
                  }
                  editingId={
                    editingId
                  }
                />
              }
            />


            {/* COMPLAINT HISTORY */}

            <Route
              path="/complaints"
              element={
                <ComplaintsPage
                  complaints={
                    filteredComplaints
                  }
                  search={search}
                  setSearch={
                    setSearch
                  }
                  editComplaint={
                    editComplaint
                  }
                  deleteComplaint={
                    deleteComplaint
                  }
                />
              }
            />


            {/* ANALYTICS */}

            <Route
              path="/analytics"
              element={
                <AnalyticsPage
                  pieData={pieData}
                  countryData={
                    countryData
                  }
                  COLORS={COLORS}
                />
              }
            />


            {/* INVALID URL */}

            <Route
              path="*"
              element={
                <Navigate
                  to="/"
                  replace
                />
              }
            />

          </Routes>

        </div>

      </div>

    </BrowserRouter>
  );
}


// =====================================================
// DASHBOARD PAGE
// =====================================================

function DashboardPage({
  dashboard,
  pieData,
  countryData,
  COLORS,
}) {
  return (
    <>

      <header className="app-header">

        <div>
          <h1>
            💊 Pharma Complaint Copilot
          </h1>

          <p>
            AI-powered complaint intake,
            risk assessment & case management
          </p>
        </div>

        <div className="system-status">
          <span className="status-dot"></span>
          System Online
        </div>

      </header>


      {/* STATISTICS */}

      <section className="stats-grid">

        <div className="risk-card stat-card">

          <div className="stat-icon">
            📋
          </div>

          <div>
            <h3>
              Total Complaints
            </h3>

            <h1>
              {dashboard.total || 0}
            </h1>

            <p>
              All submitted cases
            </p>
          </div>

        </div>


        <div className="risk-card stat-card high-card">

          <div className="stat-icon">
            🔴
          </div>

          <div>
            <h3>
              High Risk
            </h3>

            <h1>
              {dashboard.high || 0}
            </h1>

            <p>
              Requires attention
            </p>
          </div>

        </div>


        <div className="risk-card stat-card medium-card">

          <div className="stat-icon">
            🟠
          </div>

          <div>
            <h3>
              Medium Risk
            </h3>

            <h1>
              {dashboard.medium || 0}
            </h1>

            <p>
              Needs review
            </p>
          </div>

        </div>


        <div className="risk-card stat-card low-card">

          <div className="stat-icon">
            🟢
          </div>

          <div>
            <h3>
              Low Risk
            </h3>

            <h1>
              {dashboard.low || 0}
            </h1>

            <p>
              Routine monitoring
            </p>
          </div>

        </div>

      </section>


      {/* QUICK ACTIONS */}

      <section className="risk-panel">

        <h2>
          Quick Actions
        </h2>

        <p>
          Start managing your
          pharmaceutical complaints.
        </p>

        <div className="button-row">

          <Link
            to="/new-complaint"
            className="primary-button"
          >
            ➕ New Complaint
          </Link>

          <Link
            to="/complaints"
            className="secondary-button"
          >
            📑 View Complaints
          </Link>

          <Link
            to="/analytics"
            className="secondary-button"
          >
            📊 View Analytics
          </Link>

        </div>

      </section>


      {/* CHARTS */}

      <section className="analytics-grid">

        <section className="risk-panel chart-panel">

          <h3>
            Risk Distribution
          </h3>

          <ResponsiveContainer
            width="100%"
            height={300}
          >

            <PieChart>

              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={95}
                innerRadius={55}
                dataKey="value"
                label
              >

                {pieData.map(
                  (entry, index) => (
                    <Cell
                      key={index}
                      fill={
                        COLORS[
                          index %
                            COLORS.length
                        ]
                      }
                    />
                  )
                )}

              </Pie>

              <Tooltip />

              <Legend />

            </PieChart>

          </ResponsiveContainer>

        </section>


        <section className="risk-panel chart-panel">

          <h3>
            Complaints by Country
          </h3>

          <ResponsiveContainer
            width="100%"
            height={300}
          >

            <BarChart
              data={countryData}
            >

              <CartesianGrid
                strokeDasharray="3 3"
              />

              <XAxis
                dataKey="country"
              />

              <YAxis />

              <Tooltip />

              <Legend />

              <Bar
                dataKey="count"
                name="Complaints"
                fill="#2563eb"
                radius={[
                  6,
                  6,
                  0,
                  0,
                ]}
              />

            </BarChart>

          </ResponsiveContainer>

        </section>

      </section>

    </>
  );
}


// =====================================================
// NEW COMPLAINT PAGE
// =====================================================

function ComplaintPage({
  form,
  dispatch,
  fieldOrder,
  fieldLabels,
  chat,
  input,
  setInput,
  handleSend,
  saveComplaint,
  generatePDF,
  handleFileUpload,
  completeness,
  requiredFields,
  isEditing,
  editingId,
}) {
  return (
    <>

      <header className="app-header">

        <div>

          <h1>
            📝{" "}
            {isEditing
              ? "Edit Complaint"
              : "New Complaint"}
          </h1>

          <p>
            Create and analyze a
            pharmaceutical complaint
          </p>

        </div>

        <div className="system-status">

          <span className="status-dot"></span>

          System Online

        </div>

      </header>


      {/* =================================================
          TWO COLUMN WORKSPACE
      ================================================= */}

      <div className="complaint-workspace">


        {/* =================================================
            LEFT - COMPLAINT FORM
        ================================================= */}

        <section className="panel document-panel">

          <div className="section-heading">

            <div>

              <span className="section-icon">
                📋
              </span>

              <div>

                <h2>
                  Customer Complaint
                </h2>

                <p>
                  Enter or review complaint
                  information
                </p>

              </div>

            </div>


            {isEditing && (

              <span className="editing-badge">
                Editing #{editingId}
              </span>

            )}

          </div>


          <div className="form-grid">

            {fieldOrder.map(
              (field) => (

                <label
                  key={field}
                  className={
                    `field ${
                      field ===
                        "complaint_description" ||
                      field === "remarks"
                        ? "full-width-field"
                        : ""
                    }`
                  }
                >

                  <span>
                    {fieldLabels[field]}
                  </span>


                  {field === "severity" ? (

                    <select
                      value={
                        form[field] || ""
                      }
                      onChange={(
                        event
                      ) =>
                        dispatch(
                          updateField({
                            field,
                            value:
                              event.target
                                .value,
                          })
                        )
                      }
                    >

                      <option value="">
                        Select severity
                      </option>

                      <option value="Low">
                        Low
                      </option>

                      <option value="Medium">
                        Medium
                      </option>

                      <option value="High">
                        High
                      </option>

                      <option value="Critical">
                        Critical
                      </option>

                    </select>

                  ) : field ===
                    "complaint_description" ||
                    field === "remarks" ? (

                    <textarea
                      value={
                        form[field] || ""
                      }
                      onChange={(
                        event
                      ) =>
                        dispatch(
                          updateField({
                            field,
                            value:
                              event.target
                                .value,
                          })
                        )
                      }
                      placeholder={
                        `Enter ${fieldLabels[
                          field
                        ].toLowerCase()}`
                      }
                      rows={4}
                    />

                  ) : (

                    <input
                      value={
                        form[field] || ""
                      }
                      onChange={(
                        event
                      ) =>
                        dispatch(
                          updateField({
                            field,
                            value:
                              event.target
                                .value,
                          })
                        )
                      }
                      placeholder={
                        `Enter ${fieldLabels[
                          field
                        ].toLowerCase()}`
                      }
                    />

                  )}

                </label>

              )
            )}

          </div>


          {/* FORM ACTIONS */}

          <div className="document-actions">

            <button
              className="primary-button"
              onClick={saveComplaint}
            >
              💾{" "}
              {isEditing
                ? "Update Complaint"
                : "Save Complaint"}
            </button>

            <button
              className="secondary-button"
              onClick={generatePDF}
            >
              📄 Generate PDF
            </button>

            <label className="upload-button">

              📎 Upload PDF

              <input
                type="file"
                accept="application/pdf"
                onChange={
                  handleFileUpload
                }
                hidden
              />

            </label>

          </div>

        </section>


        {/* =================================================
            RIGHT - AI COPILOT
        ================================================= */}

        <section className="panel chat-panel">

          <div className="section-heading">

            <div>

              <span className="section-icon">
                🤖
              </span>

              <div>

                <h2>
                  AI Copilot
                </h2>

                <p>
                  Extract, analyze and
                  update complaints
                </p>

              </div>

            </div>

            <span className="ai-badge">
              ✨ AI Active
            </span>

          </div>


          <div className="chat-messages">

            {chat.messages.length === 0 ? (

              <div className="chat-welcome">

                <div className="welcome-icon">
                  🤖
                </div>

                <h3>
                  Welcome to Pharma Copilot
                </h3>

                <p>
                  Describe a customer
                  complaint and I will
                  extract the relevant
                  information automatically.
                </p>

                <div className="example-prompt">

                  💡 Example:

                  "Customer John reported
                  damaged packaging for
                  Paracetamol 500 mg..."

                </div>

              </div>

            ) : (

              chat.messages.map(
                (message, index) => (

                  <div
                    key={index}
                    className={
                      `message ${
                        message.role
                      }`
                    }
                  >

                    <strong>
                      {message.role ===
                      "user"
                        ? "You"
                        : "Copilot"}
                    </strong>

                    <div>
                      {message.content}
                    </div>

                  </div>

                )
              )

            )}

          </div>


          {/* AI INPUT */}

          <div className="chat-actions">

            <textarea
              value={input}
              onChange={(event) =>
                setInput(
                  event.target.value
                )
              }
              rows={4}
              placeholder="Describe the complaint or ask me to update a field..."
            />


            <button
              className="primary-button ai-analyze-button"
              onClick={handleSend}
              disabled={chat.loading}
            >

              {chat.loading
                ? "⏳ Analyzing..."
                : "➤ Analyze Complaint"}

            </button>

          </div>

        </section>

      </div>


      {/* =================================================
          AI RISK ASSESSMENT
      ================================================= */}

      <section className="risk-panel">

        <div className="section-heading">

          <div>

            <span className="section-icon">
              🛡️
            </span>

            <div>

              <h3>
                AI Risk Assessment
              </h3>

              <p>
                Automated complaint risk
                evaluation
              </p>

            </div>

          </div>


          <span
            className={
              `risk-badge ${
                (
                  form.risk_level ||
                  "pending"
                ).toLowerCase()
              }`
            }
          >

            {form.risk_level ||
              "Pending"}

          </span>

        </div>


        <div className="assessment-grid">

          <div className="assessment-item">

            <span>
              Summary
            </span>

            <p>
              {form.summary ||
                "No summary available yet."}
            </p>

          </div>


          <div className="assessment-item">

            <span>
              Risk Reason
            </span>

            <p>
              {form.risk_reason ||
                "Risk analysis will appear here after complaint information is entered."}
            </p>

          </div>

        </div>

      </section>


      {/* =================================================
          COMPLETENESS
      ================================================= */}

      <section className="risk-panel">

        <div className="section-heading">

          <div>

            <span className="section-icon">
              ✅
            </span>

            <div>

              <h3>
                Complaint Completeness
              </h3>

              <p>
                Required information status
              </p>

            </div>

          </div>


          <strong className="completion-value">
            {completeness.percent}%
          </strong>

        </div>


        <div className="progress-container">

          <div className="progress-bar">

            <div
              className="progress-fill"
              style={{
                width: `${completeness.percent}%`,
              }}
            />

          </div>

        </div>


        <div className="completion-grid">

          {requiredFields.map(
            (field) => (

              <div
                key={field}
                className={
                  `completion-item ${
                    form[field]
                      ? "complete"
                      : "incomplete"
                  }`
                }
              >

                <span>
                  {form[field]
                    ? "✓"
                    : "○"}
                </span>

                {fieldLabels[field]}

              </div>

            )
          )}

        </div>

      </section>

    </>
  );
}


// =====================================================
// COMPLAINT HISTORY
// =====================================================

function ComplaintsPage({
  complaints,
  search,
  setSearch,
  editComplaint,
  deleteComplaint,
}) {
  return (
    <>

      <header className="app-header">

        <div>

          <h1>
            📑 Complaint History
          </h1>

          <p>
            Search and manage submitted
            complaints
          </p>

        </div>

      </header>


      <section className="risk-panel">

        <div className="section-heading">

          <div>

            <h2>
              All Complaints
            </h2>

            <p>
              {complaints.length} Records
            </p>

          </div>

        </div>


        <div className="search-wrapper">

          <span>
            🔍
          </span>

          <input
            type="text"
            placeholder="Search by customer, product or complaint number..."
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
          />

        </div>


        <div className="table-wrapper">

          <table>

            <thead>

              <tr>

                <th>
                  ID
                </th>

                <th>
                  Customer
                </th>

                <th>
                  Product
                </th>

                <th>
                  Severity
                </th>

                <th>
                  Country
                </th>

                <th>
                  Actions
                </th>

              </tr>

            </thead>


            <tbody>

              {complaints.length === 0 ? (

                <tr>

                  <td
                    colSpan="6"
                    className="empty-table"
                  >
                    No complaints found.
                  </td>

                </tr>

              ) : (

                complaints.map(
                  (item) => (

                    <tr key={item.id}>

                      <td>
                        #{item.id}
                      </td>

                      <td>
                        {item.customer_name ||
                          "-"}
                      </td>

                      <td>
                        {item.product_name ||
                          "-"}
                      </td>

                      <td>

                        <span
                          className={
                            `table-risk ${
                              String(
                                item.severity ||
                                  ""
                              ).toLowerCase()
                            }`
                          }
                        >

                          {item.severity ||
                            "N/A"}

                        </span>

                      </td>

                      <td>
                        {item.country ||
                          "-"}
                      </td>

                      <td>

                        <div className="table-actions">

                          <button
                            className="edit-button"
                            onClick={() =>
                              editComplaint(
                                item
                              )
                            }
                          >
                            Edit
                          </button>

                          <button
                            className="delete-button"
                            onClick={() =>
                              deleteComplaint(
                                item.id
                              )
                            }
                          >
                            Delete
                          </button>

                        </div>

                      </td>

                    </tr>

                  )
                )

              )}

            </tbody>

          </table>

        </div>

      </section>

    </>
  );
}


// =====================================================
// ANALYTICS
// =====================================================

function AnalyticsPage({
  pieData,
  countryData,
  COLORS,
}) {
  return (
    <>

      <header className="app-header">

        <div>

          <h1>
            📊 Analytics
          </h1>

          <p>
            Complaint trends and risk
            distribution
          </p>

        </div>

      </header>


      <section className="analytics-grid">

        {/* RISK */}

        <section className="risk-panel chart-panel">

          <h2>
            Risk Distribution
          </h2>

          <p>
            Complaints by risk level
          </p>

          <ResponsiveContainer
            width="100%"
            height={350}
          >

            <PieChart>

              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={110}
                innerRadius={60}
                dataKey="value"
                label
              >

                {pieData.map(
                  (entry, index) => (

                    <Cell
                      key={index}
                      fill={
                        COLORS[
                          index %
                            COLORS.length
                        ]
                      }
                    />

                  )
                )}

              </Pie>

              <Tooltip />

              <Legend />

            </PieChart>

          </ResponsiveContainer>

        </section>


        {/* COUNTRY */}

        <section className="risk-panel chart-panel">

          <h2>
            Complaints by Country
          </h2>

          <p>
            Geographic complaint
            distribution
          </p>

          <ResponsiveContainer
            width="100%"
            height={350}
          >

            <BarChart
              data={countryData}
            >

              <CartesianGrid
                strokeDasharray="3 3"
              />

              <XAxis
                dataKey="country"
              />

              <YAxis />

              <Tooltip />

              <Legend />

              <Bar
                dataKey="count"
                name="Complaints"
                fill="#2563eb"
                radius={[
                  6,
                  6,
                  0,
                  0,
                ]}
              />

            </BarChart>

          </ResponsiveContainer>

        </section>

      </section>

    </>
  );
}


export default App;