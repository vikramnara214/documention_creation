import { useState, useCallback } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { CapstoneDocument } from "./pdfTemplate";
import {
  ChevronDown, ChevronRight, Download, FileText,
  Plus, Trash2, Sparkles, BookOpen, Cpu, FlaskConical,
  LayoutDashboard, Code2, CheckSquare, CheckCheck, Link, Copy
} from "lucide-react";

// ... (INIT, calcProgress, CHAPTERS, Field, Input, Chapter stay the same)
// I will keep the original lines for everything else and just append the state and JSX inside App()

const generatePrompt = (title, desc) => {
  return `You are an academic writing expert. I need content for a Capstone Project Report.
Project Title: "${title || "[Insert Title]"}"
Project Description: "${desc || "[Insert Description]"}"

Please generate detailed, academic, and structured content for the following sections:

1. **Abstract**: A 200-word concise summary of the project.
2. **Chapter 1 – Introduction**:
   - 1.1 Introduction: General background.
   - 1.2 Problem Statement: Current limitations.
   - 1.3 Objectives: Bullet points of goals.
   - 1.4 Scope: Application areas.
3. **Chapter 2 – System Overview**:
   - 2.1 Existing System.
   - 2.2 Limitations.
   - 2.3 Proposed System.
   - 2.4 Software Requirements.
   - 2.5 Hardware Requirements.
4. **Chapter 3 – Technologies Used**:
   - List 3-4 technologies with short explanations of use.
5. **Chapter 4 – Database Design**:
   - 4.1 Database Tables.
   - 4.2 Table Structure (specify fields for tables).
   - 4.3 Keys and Constraints.
   - 4.4 Table Relationships.
   - 4.5 Sample Data.
6. **Chapter 5 – System Modules**:
   - Describe 3-4 major functional modules (e.g., Add, Search).
7. **Chapter 6 – Implementation**:
   - 6.1 Database Connection.
   - 6.2 Input Validation.
   - 6.3 Exception Handling.
8. **Chapter 7 – Output Screens**:
   - General summary describing UI screen items required.
9. **Chapter 8 – Conclusion & Chapter 9 – Future Enhancements**.

Maintain a formal, professional, and academic tone.`;
};const HEADERS_MAP = [
  { key: "abstract", markers: ["Abstract"] },
  { key: "ch1_intro", markers: ["1.1 Introduction"] },
  { key: "ch1_problem", markers: ["1.2 Problem Statement"] },
  { key: "ch1_objectives", markers: ["1.3 Objectives"] },
  { key: "ch1_scope", markers: ["1.4 Scope"] },
  { key: "ch2_existing", markers: ["2.1 Existing System"] },
  { key: "ch2_limitations", markers: ["2.2 Limitations"] },
  { key: "ch2_proposed", markers: ["2.3 Proposed System"] },
  { key: "ch2_software", markers: ["2.4 Software Requirements"] },
  { key: "ch2_hardware", markers: ["2.5 Hardware Requirements"] },
  { key: "ch4_tables", markers: ["4.1 Database Tables"] },
  { key: "ch4_structure", markers: ["4.2 Table Structure"] },
  { key: "ch4_keys", markers: ["4.3 Keys and Constraints"] },
  { key: "ch4_relations", markers: ["4.4 Table Relationships"] },
  { key: "ch4_sample", markers: ["4.5 Sample Data"] },
  { key: "ch6_connection", markers: ["6.1 Database Connection"] },
  { key: "ch6_validation", markers: ["6.2 Input Validation"] },
  { key: "ch6_exception", markers: ["6.3 Exception Handling"] },
  { key: "ch7_screens", markers: ["7. Output Screens", "7. Output screens"] },
  { key: "ch8_conclusion", markers: ["8. Conclusion"] },
  { key: "ch9_future", markers: ["9. Future Enhancements"] },
  { key: "references", markers: ["10. References"] },
  { key: "appendix", markers: ["APPENDIX"] }
];

const autoFillFromText = (text, currentData) => {
  const result = { ...currentData };
  let currentKey = null;
  const lines = text.split("\n");

  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) return;

    let matchedKey = null;
    HEADERS_MAP.forEach(item => {
      item.markers.forEach(m => {
        if (trimmed.toLowerCase().startsWith(m.toLowerCase())) {
          matchedKey = item.key;
        }
      });
    });

    if (matchedKey) {
      currentKey = matchedKey;
      return; 
    }

    if (currentKey) {
      result[currentKey] = result[currentKey] ? result[currentKey] + "\n" + trimmed : trimmed;
    }
  });

  return result;
};


// ─── Initial form state matching all PDF fields ───────────────────────────────
const INIT = {
  // Cover page
  institutionName: "", projectTitle: "", guideName: "", department: "", academicYear: "",
  students: [{ name: "", roll: "" }], // Dynamic list

  abstract: "",

  // Ch 1
  ch1_intro: "", ch1_problem: "", ch1_objectives: "", ch1_scope: "",

  // Ch 2
  ch2_existing: "", ch2_limitations: "", ch2_proposed: "", ch2_software: "", ch2_hardware: "",

  // Ch 3
  tech1_name: "", tech1_desc: "", tech2_name: "", tech2_desc: "", tech3_name: "", tech3_desc: "", tech4_name: "", tech4_desc: "",

  // Ch 4 - Database Design
  ch4_tables: "", ch4_structure: "", ch4_keys: "", ch4_relations: "", ch4_sample: "",

  // Ch 5 - Modules
  mod1_name: "", mod1_desc: "", mod2_name: "", mod2_desc: "", mod3_name: "", mod3_desc: "", mod4_name: "", mod4_desc: "",

  // Ch 6 - Implementation
  ch6_connection: "", ch6_validation: "", ch6_exception: "",

  ch7_screens: "",
  ch8_conclusion: "",
  ch9_future: "",

  references: "",
  appendix: "",
};

// ─── Progress helper ──────────────────────────────────────────────────────────
const calcProgress = (data) => {
  const keys = Object.keys(INIT);
  const filled = keys.filter((k) => {
    if (k === "students") {
      return data.students && data.students.some(s => s.name?.trim() || s.roll?.trim());
    }
    return data[k] && typeof data[k] === "string" && data[k].trim() !== "";
  }).length;
  return Math.round((filled / keys.length) * 100);
};

// ─── Chapter section IDs ─────────────────────────────────────────────────────
const CHAPTERS = [
  { id: "cover",  icon: BookOpen,       label: "Cover Page" },
  { id: "abs",    icon: FileText,       label: "Abstract" },
  { id: "ch1",    icon: BookOpen,       label: "Chapter 1 – Introduction" },
  { id: "ch2",    icon: LayoutDashboard,label: "Chapter 2 – System Overview" },
  { id: "ch3",    icon: Cpu,            label: "Chapter 3 – Technologies Used" },
  { id: "ch4",    icon: LayoutDashboard,label: "Chapter 4 – Database Design" },
  { id: "ch5",    icon: Code2,          label: "Chapter 5 – System Modules" },
  { id: "ch6",    icon: Code2,          label: "Chapter 6 – Implementation" },
  { id: "ch7",    icon: LayoutDashboard,label: "Chapter 7 – Output Screens" },
  { id: "ch8",    icon: CheckSquare,    label: "Chapter 8 – Conclusion" },
  { id: "ch9",    icon: Plus,           label: "Chapter 9 – Future Enhancements" },
  { id: "refs",   icon: Link,           label: "References" },
  { id: "appx",   icon: Plus,           label: "Appendix" },
];


// ─── Reusable field helpers ───────────────────────────────────────────────────
const Field = ({ label, id, value, onChange, rows = 3, hint }) => (
  <div>
    <div className="section-label">{label}</div>
    {hint && <p style={{ fontSize: "0.78rem", color: "#64748b", margin: "0 0 5px" }}>{hint}</p>}
    <textarea
      id={id}
      className="field-input"
      rows={rows}
      value={value}
      onChange={(e) => onChange(id, e.target.value)}
      placeholder={hint || label}
    />
  </div>
);

const Input = ({ label, id, value, onChange, placeholder }) => (
  <div>
    <div className="section-label">{label}</div>
    <input
      id={id}
      className="field-input"
      style={{ resize: "none" }}
      value={value}
      onChange={(e) => onChange(id, e.target.value)}
      placeholder={placeholder || label}
    />
  </div>
);

// ─── Accordion Chapter ───────────────────────────────────────────────────────
const Chapter = ({ chapter, open, toggle, children }) => {
  const Icon = chapter.icon;
  return (
    <div className="chapter-card">
      <div className="chapter-header" onClick={() => toggle(chapter.id)}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <Icon size={16} color="white" />
        </div>
        <span style={{ flex: 1, fontWeight: 600, fontSize: "0.92rem" }}>{chapter.label}</span>
        {open
          ? <ChevronDown size={18} color="#6366f1" />
          : <ChevronRight size={18} color="#64748b" />}
      </div>
      {open && <div className="chapter-body">{children}</div>}
    </div>
  );
};

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [data, setData] = useState(INIT);
  const [open, setOpen] = useState({ cover: true });
  const [ready, setReady] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [aiDesc, setAiDesc] = useState("");
  const [copied, setCopied] = useState(false);
  const [pasteText, setPasteText] = useState("");

  const update = useCallback((key, val) => {
    setData((prev) => ({ ...prev, [key]: val }));
    setReady(false);
  }, []);

  const updateStudent = useCallback((idx, field, val) => {
    setData((prev) => {
      const list = [...(prev.students || [])];
      list[idx] = { ...list[idx], [field]: val };
      return { ...prev, students: list };
    });
    setReady(false);
  }, []);

  const addStudent = useCallback(() => {
    setData((prev) => ({
      ...prev,
      students: [...(prev.students || []), { name: "", roll: "" }]
    }));
  }, []);

  const removeStudent = useCallback((idx) => {
    setData((prev) => ({
      ...prev,
      students: (prev.students || []).filter((_, i) => i !== idx)
    }));
  }, []);

  const toggle = useCallback((id) => {
    setOpen((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const progress = calcProgress(data);
  const filename = `${(data.projectTitle || "capstone_report").replace(/\s+/g, "_")}.pdf`;

  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
      {/* Background blobs */}
      <div className="blob" style={{ width: 600, height: 600, background: "#6366f1", top: -100, left: -200 }} />
      <div className="blob" style={{ width: 400, height: 400, background: "#8b5cf6", bottom: 0, right: -100, animationDelay: "6s" }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 860, margin: "0 auto", padding: "40px 20px 80px" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <Sparkles size={20} color="#6366f1" />
            <span style={{ fontSize: "0.8rem", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "#6366f1" }}>
              Capstone Documentation Generator
            </span>
          </div>
          <h1 style={{ margin: 0, fontSize: "2.4rem", fontWeight: 700, lineHeight: 1.15 }}>
            Fill in your content,<br />
            <span style={{ background: "linear-gradient(90deg,#6366f1,#a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              download the PDF.
            </span>
          </h1>
          <p style={{ color: "#64748b", marginTop: 14, fontSize: "0.95rem" }}>
            Follows the official Cornerstone Project formatting guidelines — Times New Roman, A4, correct margins &amp; headings.
          </p>
        </div>

        {/* Progress */}
        <div className="glass" style={{ padding: "18px 24px", marginBottom: 28, display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: "0.82rem", color: "#94a3b8", whiteSpace: "nowrap" }}>Completion</span>
          <div className="progress-bar" style={{ flex: 1 }}>
            <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
          </div>
          <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#a78bfa", minWidth: 38 }}>{progress}%</span>
        </div>

        {/* AI Prompt Assistant */}
        <div className="glass" style={{ padding: "20px", marginBottom: 24, background: "rgba(99, 102, 241, 0.05)", borderColor: "rgba(99, 102, 241, 0.2)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }} onClick={() => setShowPrompt(!showPrompt)}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Sparkles size={18} color="#8b5cf6" />
              <span style={{ fontWeight: 600, fontSize: "0.95rem", color: "#f0f4ff" }}>💡 AI Content Assistant</span>
            </div>
            {showPrompt ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          </div>
          
          {showPrompt && (
            <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>
              <p style={{ fontSize: "0.82rem", color: "#94a3b8", margin: 0 }}>
                Briefly describe your project. This generates a structured prompt to paste into AI tools to get back content ready to fill sections below.
              </p>
              <textarea 
                className="field-input" 
                rows={2} 
                placeholder="e.g., An IOT based smart home energy management dashboard using React & ESP32."
                value={aiDesc}
                onChange={(e) => { setAiDesc(e.target.value); setCopied(false); }}
              />
              
              <div style={{ background: "rgba(0,0,0,0.2)", padding: "12px", borderRadius: "8px", position: "relative" }}>
                <pre style={{ margin: 0, fontSize: "0.78rem", color: "#e2e8f0", whiteSpace: "pre-wrap", maxHeight: "150px", overflowY: "auto", fontFamily: "monospace" }}>
                  {generatePrompt(data.projectTitle, aiDesc)}
                </pre>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(generatePrompt(data.projectTitle, aiDesc));
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  style={{ position: "absolute", top: 8, right: 8, background: "rgba(255,255,255,0.1)", border: "none", padding: "6px", borderRadius: "4px", cursor: "pointer" }}
                >
                  {copied ? <CheckCheck size={14} color="#10b981" /> : <Copy size={14} color="#94a3b8" />}
                </button>
              </div>
            </div>
          )}
        </div>


        {/* 🤖 Auto-Fill From Text */}
        <div className="glass" style={{ padding: "20px", marginBottom: 24, background: "rgba(16, 185, 129, 0.05)", borderColor: "rgba(16, 185, 129, 0.2)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <Sparkles size={18} color="#10b981" />
            <span style={{ fontWeight: 600, fontSize: "0.95rem", color: "#f0f4ff" }}>🤖 Auto-Fill Content Helper</span>
          </div>
          <p style={{ fontSize: "0.82rem", color: "#94a3b8", margin: "0 0 10px 0" }}>
            Paste the full output response from your AI tool here, and it will parse and distribute it across the sections below automatically!
          </p>
          <textarea 
            className="field-input" 
            rows={2} 
            placeholder="Paste the full ChatGPT / Gemini text response here..."
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
          />
          <button 
            className="btn-primary" 
            style={{ marginTop: 12, padding: "8px 16px", fontSize: "0.85rem", background: "linear-gradient(135deg,#059669,#10b981)" }}
            onClick={() => {
              if (pasteText.trim()) {
                const newData = autoFillFromText(pasteText, data);
                setData(newData);
                setPasteText("");
              }
            }}
          >
            Apply Autofill
          </button>
        </div>


        {/* Sections */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Cover Page */}
          <Chapter chapter={CHAPTERS[0]} open={!!open.cover} toggle={toggle}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Input label="Institution Name" id="institutionName" value={data.institutionName} onChange={update} placeholder="e.g. ABC College" />
              <Input label="Department" id="department" value={data.department} onChange={update} placeholder="e.g. CSE" />
              <Input label="Project Title" id="projectTitle" value={data.projectTitle} onChange={update} />
              <Input label="Guide / Supervisor Name" id="guideName" value={data.guideName} onChange={update} />
              <Input label="Academic Year" id="academicYear" value={data.academicYear} onChange={update} placeholder="e.g. 2024–2025" />
            </div>

            <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ fontWeight: 600, fontSize: "0.85rem", color: "#94a3b8" }}>Students</div>
              {(data.students || []).map((st, idx) => (
                <div key={idx} style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 10, alignItems: "end" }}>
                  <Input label={`Student ${idx + 1} Name`} value={st.name} onChange={(_, v) => updateStudent(idx, "name", v)} />
                  <Input label="Roll Number" value={st.roll} onChange={(_, v) => updateStudent(idx, "roll", v)} />
                  {idx > 0 && (
                    <button 
                      onClick={() => removeStudent(idx)} 
                      style={{ background: "#ef4444", border: "none", padding: "10px", borderRadius: "6px", cursor: "pointer", display: "flex", alignItems: "center" }}
                    >
                      <Trash2 size={16} color="white" />
                    </button>
                  )}
                </div>
              ))}
              <button 
                className="btn-primary" 
                style={{ alignSelf: "start", marginTop: 5, padding: "6px 12px", fontSize: "0.8rem", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)" }}
                onClick={addStudent}
              >
                + Add Student
              </button>
            </div>
          </Chapter>


          {/* Abstract */}
          <Chapter chapter={CHAPTERS[1]} open={!!open.abs} toggle={toggle}>
            <Field label="Abstract" id="abstract" value={data.abstract} onChange={update} rows={6}
              hint="A concise summary of the entire project (typically 150–250 words)." />
          </Chapter>

          {/* Chapter 1 */}
          <Chapter chapter={CHAPTERS[2]} open={!!open.ch1} toggle={toggle}>
            <Field label="1.1 Introduction" id="ch1_intro" value={data.ch1_intro} onChange={update} rows={5}
              hint="General introduction to the project — what it does and why it is needed." />
            <Field label="1.2 Problem Statement" id="ch1_problem" value={data.ch1_problem} onChange={update} rows={4}
              hint="Describe the problem that exists in the current system." />
            <Field label="1.3 Objectives of the Project" id="ch1_objectives" value={data.ch1_objectives} onChange={update} rows={5}
              hint="List each objective on a new line (they will be formatted as bullet points)." />
            <Field label="1.4 Scope of the Project" id="ch1_scope" value={data.ch1_scope} onChange={update} rows={4}
              hint="Where and how the system can be used." />
          </Chapter>

          {/* Chapter 2 */}
          <Chapter chapter={CHAPTERS[3]} open={!!open.ch2} toggle={toggle}>
            <Field label="2.1 Existing System" id="ch2_existing" value={data.ch2_existing} onChange={update} rows={4}
              hint="Explain how the task is currently done without this software." />
            <Field label="2.2 Limitations of Existing System" id="ch2_limitations" value={data.ch2_limitations} onChange={update} rows={5}
              hint="List each limitation on a new line — they will appear as bullet points." />
            <Field label="2.3 Proposed System" id="ch2_proposed" value={data.ch2_proposed} onChange={update} rows={4}
              hint="Explain the solution developed in this project." />
            <Field label="2.4 Software Requirements" id="ch2_software" value={data.ch2_software} onChange={update} rows={4}
              hint="List software (one per line). e.g. Node.js, MySQL, VS Code, Windows" />
            <Field label="2.5 Hardware Requirements" id="ch2_hardware" value={data.ch2_hardware} onChange={update} rows={4}
              hint="List hardware specs (one per line). e.g. Processor: Intel i3 or above" />
          </Chapter>

          {/* Chapter 3 */}
          <Chapter chapter={CHAPTERS[4]} open={!!open.ch3} toggle={toggle}>
            <p style={{ color: "#64748b", fontSize: "0.82rem", margin: 0 }}>
              Add up to 4 technologies used in your project (e.g. React, Node.js, MySQL, Java…)
            </p>
            {[1, 2, 3, 4].map((n) => (
              <div key={n} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
                <Input label={`3.${n} Technology Name`} id={`tech${n}_name`} value={data[`tech${n}_name`]} onChange={update} placeholder={`e.g. ${["React.js","Node.js","MySQL","Java"][n-1]}`} />
                <Field label="Description" id={`tech${n}_desc`} value={data[`tech${n}_desc`]} onChange={update} rows={3}
                  hint="Briefly explain what it is and why it's used in your project." />
              </div>
            ))}
          </Chapter>

          {/* Chapter 4 - Database Design */}
          <Chapter chapter={CHAPTERS[5]} open={!!open.ch4} toggle={toggle}>
            <Field label="4.1 Database Tables" id="ch4_tables" value={data.ch4_tables} onChange={update} rows={3} hint="List all tables used in the project." />
            <Field label="4.2 Table Structure" id="ch4_structure" value={data.ch4_structure} onChange={update} rows={4} hint="Explain columns and data types." />
            <Field label="4.3 Keys and Constraints" id="ch4_keys" value={data.ch4_keys} onChange={update} rows={3} hint="Explain primary keys, unique fields, etc." />
            <Field label="4.4 Table Relationships" id="ch4_relations" value={data.ch4_relations} onChange={update} rows={3} hint="Explain how tables are connected." />
            <Field label="4.5 Sample Data / Records" id="ch4_sample" value={data.ch4_sample} onChange={update} rows={3} hint="Show sample rows/records." />
          </Chapter>

          {/* Chapter 5 - System Modules */}
          <Chapter chapter={CHAPTERS[6]} open={!!open.ch5} toggle={toggle}>
            <p style={{ color: "#64748b", fontSize: "0.82rem", margin: 0 }}>List major functional modules (e.g., Add, Search).</p>
            {[1, 2, 3, 4].map((n) => (
              <div key={n} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: 12, display: "flex", flexDirection: "column", gap: 10 }}>
                <Input label={`Module ${n} Name`} id={`mod${n}_name`} value={data[`mod${n}_name`]} onChange={update} placeholder={`e.g. Add Record`} />
                <Field label="Description" id={`mod${n}_desc`} value={data[`mod${n}_desc`]} onChange={update} rows={2} />
              </div>
            ))}
          </Chapter>

          {/* Chapter 6 - Implementation */}
          <Chapter chapter={CHAPTERS[7]} open={!!open.ch6} toggle={toggle}>
            <Field label="6.1 Database Connection" id="ch6_connection" value={data.ch6_connection} onChange={update} rows={3} />
            <Field label="6.2 Input Validation" id="ch6_validation" value={data.ch6_validation} onChange={update} rows={3} />
            <Field label="6.3 Exception Handling" id="ch6_exception" value={data.ch6_exception} onChange={update} rows={3} />
          </Chapter>

          {/* Chapter 7 - Output Screens */}
          <Chapter chapter={CHAPTERS[8]} open={!!open.ch7} toggle={toggle}>
            <Field label="Output Screens Summary" id="ch7_screens" value={data.ch7_screens} onChange={update} rows={3} hint="Describe screenshots that should be included." />
          </Chapter>

          {/* Chapter 8 - Conclusion */}
          <Chapter chapter={CHAPTERS[9]} open={!!open.ch8} toggle={toggle}>
            <Field label="Conclusion Summary" id="ch8_conclusion" value={data.ch8_conclusion} onChange={update} rows={4} />
          </Chapter>

          {/* Chapter 9 - Future Enhancements */}
          <Chapter chapter={CHAPTERS[10]} open={!!open.ch9} toggle={toggle}>
            <Field label="Future Enhancements" id="ch9_future" value={data.ch9_future} onChange={update} rows={4} hint="Separate items with newlines for bullet points." />
          </Chapter>

          {/* References */}
          <Chapter chapter={CHAPTERS[11]} open={!!open.refs} toggle={toggle}>
            <Field label="References" id="references" value={data.references} onChange={update} rows={5} hint="List references." />
          </Chapter>

          {/* Appendix */}
          <Chapter chapter={CHAPTERS[12]} open={!!open.appx} toggle={toggle}>
            <Field label="Appendix" id="appendix" value={data.appendix} onChange={update} rows={5} hint="Code snippets, queries, screenshots." />
          </Chapter>

        </div>

        {/* Download Button */}
        <div style={{ marginTop: 40, display: "flex", justifyContent: "center" }}>
          <PDFDownloadLink
            document={<CapstoneDocument data={data} />}
            fileName={filename}
            style={{ textDecoration: "none" }}
          >
            {({ loading, error }) => (
              <button className="btn-primary" style={{ fontSize: "1rem", padding: "16px 40px" }}>
                {loading
                  ? <><Sparkles size={18} style={{ animation: "spin 1s linear infinite" }} /> Generating PDF…</>
                  : error
                  ? "Error — check console"
                  : <><Download size={18} /> Download {filename}</>}
              </button>
            )}
          </PDFDownloadLink>
        </div>
        <p style={{ textAlign: "center", color: "#475569", fontSize: "0.78rem", marginTop: 12 }}>
          PDF is generated entirely in your browser. No data leaves your device.
        </p>
      </div>

      <style>{`
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      `}</style>
    </div>
  );
}
