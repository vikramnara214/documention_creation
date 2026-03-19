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
   - 2.1 Existing System: How it works now.
   - 2.2 Limitations: Bullet points of issues.
   - 2.3 Proposed System: Solution description.

Maintain a formal, professional, and academic tone.`;
};

// ─── Initial form state matching all PDF fields ───────────────────────────────
const INIT = {
  // Cover page
  institutionName: "",
  projectTitle: "",
  studentName: "",
  rollNumber: "",
  guideName: "",
  department: "",
  academicYear: "",

  // Abstract
  abstract: "",

  // Chapter 1 – Introduction
  ch1_intro: "",
  ch1_problem: "",
  ch1_objectives: "",
  ch1_scope: "",

  // Chapter 2 – System Overview
  ch2_existing: "",
  ch2_limitations: "",
  ch2_proposed: "",
  ch2_software: "",
  ch2_hardware: "",

  // Chapter 3 – Technologies
  tech1_name: "", tech1_desc: "",
  tech2_name: "", tech2_desc: "",
  tech3_name: "", tech3_desc: "",
  tech4_name: "", tech4_desc: "",

  // Chapter 4 – System Design
  ch4_architecture: "",
  ch4_database: "",
  ch4_modules: "",

  // Chapter 5 – Implementation
  ch5_overview: "",
  ch5_modules: "",

  // Chapter 6 – Testing
  ch6_strategy: "",
  ch6_cases: "",
  ch6_results: "",

  // Chapter 7 – Conclusion
  ch7_conclusion: "",
  ch7_future: "",

  // References
  references: "",
};

// ─── Progress helper ──────────────────────────────────────────────────────────
const calcProgress = (data) => {
  const keys = Object.keys(INIT);
  const filled = keys.filter((k) => data[k] && data[k].trim() !== "").length;
  return Math.round((filled / keys.length) * 100);
};

// ─── Chapter section IDs ─────────────────────────────────────────────────────
const CHAPTERS = [
  { id: "cover",  icon: BookOpen,       label: "Cover Page",       num: null },
  { id: "abs",    icon: FileText,       label: "Abstract",         num: null },
  { id: "ch1",    icon: BookOpen,       label: "Chapter 1 – Introduction",  num: "1" },
  { id: "ch2",    icon: LayoutDashboard,label: "Chapter 2 – System Overview", num: "2" },
  { id: "ch3",    icon: Cpu,            label: "Chapter 3 – Technologies Used", num: "3" },
  { id: "ch4",    icon: LayoutDashboard,label: "Chapter 4 – System Design", num: "4" },
  { id: "ch5",    icon: Code2,          label: "Chapter 5 – Implementation", num: "5" },
  { id: "ch6",    icon: FlaskConical,   label: "Chapter 6 – Testing",       num: "6" },
  { id: "ch7",    icon: CheckSquare,    label: "Chapter 7 – Conclusion",    num: "7" },
  { id: "refs",   icon: Link,           label: "References",       num: null },
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

  const update = useCallback((key, val) => {
    setData((prev) => ({ ...prev, [key]: val }));
    setReady(false);
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


        {/* Sections */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Cover Page */}
          <Chapter chapter={CHAPTERS[0]} open={!!open.cover} toggle={toggle}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Input label="Institution Name" id="institutionName" value={data.institutionName} onChange={update} placeholder="e.g. ABC Engineering College" />
              <Input label="Department" id="department" value={data.department} onChange={update} placeholder="e.g. Dept. of Computer Science" />
              <Input label="Project Title" id="projectTitle" value={data.projectTitle} onChange={update} placeholder="Your Project Title" />
              <Input label="Academic Year" id="academicYear" value={data.academicYear} onChange={update} placeholder="e.g. 2024–2025" />
              <Input label="Student Name" id="studentName" value={data.studentName} onChange={update} />
              <Input label="Roll Number" id="rollNumber" value={data.rollNumber} onChange={update} />
              <Input label="Guide / Supervisor Name" id="guideName" value={data.guideName} onChange={update} />
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

          {/* Chapter 4 */}
          <Chapter chapter={CHAPTERS[5]} open={!!open.ch4} toggle={toggle}>
            <Field label="4.1 System Architecture" id="ch4_architecture" value={data.ch4_architecture} onChange={update} rows={5}
              hint="Describe the overall architecture — client-server, MVC, layered etc." />
            <Field label="4.2 Database Design" id="ch4_database" value={data.ch4_database} onChange={update} rows={5}
              hint="Describe the database schema, tables, and relationships." />
            <Field label="4.3 Module Description" id="ch4_modules" value={data.ch4_modules} onChange={update} rows={5}
              hint="Describe the main modules and how they interact." />
          </Chapter>

          {/* Chapter 5 */}
          <Chapter chapter={CHAPTERS[6]} open={!!open.ch5} toggle={toggle}>
            <Field label="5.1 Implementation Overview" id="ch5_overview" value={data.ch5_overview} onChange={update} rows={5}
              hint="Describe how the system was built — languages, frameworks, tools." />
            <Field label="5.2 Key Modules" id="ch5_modules" value={data.ch5_modules} onChange={update} rows={5}
              hint="Describe how each key module was implemented." />
          </Chapter>

          {/* Chapter 6 */}
          <Chapter chapter={CHAPTERS[7]} open={!!open.ch6} toggle={toggle}>
            <Field label="6.1 Testing Strategy" id="ch6_strategy" value={data.ch6_strategy} onChange={update} rows={4}
              hint="Explain the types of testing performed (unit, integration, user acceptance etc.)." />
            <Field label="6.2 Test Cases" id="ch6_cases" value={data.ch6_cases} onChange={update} rows={5}
              hint="Describe the test cases executed." />
            <Field label="6.3 Test Results" id="ch6_results" value={data.ch6_results} onChange={update} rows={4}
              hint="Summarize the test outcomes." />
          </Chapter>

          {/* Chapter 7 */}
          <Chapter chapter={CHAPTERS[8]} open={!!open.ch7} toggle={toggle}>
            <Field label="7.1 Conclusion" id="ch7_conclusion" value={data.ch7_conclusion} onChange={update} rows={5}
              hint="Summarize what was achieved in this project." />
            <Field label="7.2 Future Scope" id="ch7_future" value={data.ch7_future} onChange={update} rows={5}
              hint="Mention possible future enhancements." />
          </Chapter>

          {/* References */}
          <Chapter chapter={CHAPTERS[9]} open={!!open.refs} toggle={toggle}>
            <Field label="References" id="references" value={data.references} onChange={update} rows={8}
              hint="List each reference on a new line. They will be formatted as a numbered bullet list." />
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
