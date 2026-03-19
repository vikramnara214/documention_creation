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

// ─── Initial form state matching all PDF fields ───────────────────────────────
const INIT = {
  // Cover page
  institutionName: "", projectTitle: "", guideName: "", department: "", academicYear: "",
  students: [{ name: "", roll: "" }], 

  // Dynamic Sequential Blocks Canvas
  blocks: [
    { id: "1", type: "chapter", title: "Abstract", content: "Write your abstract here..." }
  ]
};

// ─── Progress helper ──────────────────────────────────────────────────────────
const calcProgress = (data) => {
  const blocksCount = (data.blocks || []).length;
  if (!blocksCount) return 0;
  const filled = (data.blocks || []).filter(b => b.title?.trim() || b.content?.trim() || b.src).length;
  return Math.round((filled / blocksCount) * 100);
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
  const [ready, setReady] = useState(false);

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

  // --- Block Handlers ---
  const addBlock = useCallback((type) => {
    setData((prev) => ({
      ...prev,
      blocks: [...(prev.blocks || []), { id: Date.now().toString(), type, title: "", content: "", src: "" }]
    }));
    setReady(false);
  }, []);

  const updateBlock = useCallback((id, field, val) => {
    setData((prev) => ({
      ...prev,
      blocks: (prev.blocks || []).map(b => b.id === id ? { ...b, [field]: val } : b)
    }));
    setReady(false);
  }, []);

  const removeBlock = useCallback((id) => {
    setData((prev) => ({
      ...prev,
      blocks: (prev.blocks || []).map(b => b.id === id ? null : b).filter(Boolean)
    }));
    setReady(false);
  }, []);

  const moveBlock = useCallback((idx, dir) => {
    setData((prev) => {
      const list = [...(prev.blocks || [])];
      const target = idx + dir;
      if (target < 0 || target >= list.length) return prev;
      const temp = list[idx];
      list[idx] = list[target];
      list[target] = temp;
      return { ...prev, blocks: list };
    });
    setReady(false);
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

        {/* Cover Metadata */}
        <div className="glass" style={{ padding: "24px", marginBottom: 24 }}>
          <div style={{ fontWeight: 600, marginBottom: 16, color: "#a78bfa" }}>Cover Page & Metadata</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Input label="Institution Name" value={data.institutionName} onChange={(_, v) => update("institutionName", v)} />
            <Input label="Department" value={data.department} onChange={(_, v) => update("department", v)} />
            <Input label="Project Title" value={data.projectTitle} onChange={(_, v) => update("projectTitle", v)} />
            <Input label="Guide / Supervisor Name" value={data.guideName} onChange={(_, v) => update("guideName", v)} />
            <Input label="Academic Year" value={data.academicYear} onChange={(_, v) => update("academicYear", v)} placeholder="e.g. 2024–2025" />
          </div>
          
          <div style={{ marginTop: 20 }}>
            <div style={{ fontWeight: 600, fontSize: "0.85rem", color: "#94a3b8", marginBottom: 10 }}>Students</div>
            {(data.students || []).map((st, idx) => (
              <div key={idx} style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 10, alignItems: "end", marginBottom: 8 }}>
                <Input label={`Student ${idx + 1} Name`} value={st.name} onChange={(_, v) => updateStudent(idx, "name", v)} />
                <Input label="Roll Number" value={st.roll} onChange={(_, v) => updateStudent(idx, "roll", v)} />
                {idx > 0 && (
                  <button onClick={() => removeStudent(idx)} style={{ background: "#ef4444", border: "none", padding: "10px", borderRadius: "6px", cursor: "pointer" }}>
                    <Trash2 size={16} color="white" />
                  </button>
                )}
              </div>
            ))}
            <button className="btn-primary" style={{ alignSelf: "start", padding: "6px 12px", fontSize: "0.8rem", background: "rgba(255,255,255,0.1)" }} onClick={addStudent}>+ Add Student</button>
          </div>
        </div>

        {/* --- Block Canvas Workspace --- */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontWeight: 600, letterSpacing: "0.05em", color: "#e2e8f0", fontSize: "0.9rem", marginBottom: 4 }}>Document Report Workflow</div>
          {(data.blocks || []).map((b, bIdx) => (
            <div key={b.id} className="glass" style={{ padding: "16px", position: "relative", borderLeft: b.type === 'chapter' ? '4px solid #ef4444' : '1px solid rgba(255,255,255,0.1)' }}>
              {/* Block Header Toolbar */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span style={{ fontSize: "0.74rem", fontWeight: 700, color: b.type === 'chapter' ? '#f87171' : b.type==='image' ? '#34d399' : '#818cf8', textTransform: "uppercase" }}>
                  {b.type}
                </span>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => moveBlock(bIdx, -1)} disabled={bIdx === 0} style={{ opacity: bIdx === 0 ? 0.3 : 1, padding: "4px 8px", background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 4, cursor: "pointer" }}>↑</button>
                  <button onClick={() => moveBlock(bIdx, 1)} disabled={bIdx === (data.blocks.length - 1)} style={{ opacity: bIdx === (data.blocks.length - 1) ? 0.3 : 1, padding: "4px 8px", background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 4, cursor: "pointer" }}>↓</button>
                  <button onClick={() => removeBlock(b.id)} style={{ color: "#f87171", padding: "4px 8px", background: "rgba(239, 68, 68, 0.1)", border: "none", borderRadius: 4, cursor: "pointer" }}><Trash2 size={14} /></button>
                </div>
              </div>

              {/* Block Content Inputs */}
              {(b.type === "chapter" || b.type === "heading1" || b.type === "heading2") && (
                <input 
                  className="field-input" 
                  style={{ fontWeight: b.type === 'chapter' ? 700 : 600, fontSize: b.type === 'chapter' ? '1.05rem' : '0.98rem', marginBottom: 8 }}
                  value={b.title} 
                  onChange={(e) => updateBlock(b.id, "title", e.target.value)} 
                  placeholder={b.type === "chapter" ? "e.g. ABSTRACT or CHAPTER 1" : "e.g. 1.1 Introduction"} 
                />
              )}

              {(b.type === "paragraph" || b.type === "list" || b.type === "chapter" || b.type === "heading1" || b.type === "heading2") && (
                <textarea 
                  className="field-input" 
                  rows={b.type === "paragraph" ? 4 : 2}
                  value={b.content} 
                  onChange={(e) => updateBlock(b.id, "content", e.target.value)} 
                  placeholder={b.type === "list" ? "Point 1\nPoint 2\nPoint 3..." : "Type text content here..."} 
                />
              )}

              {b.type === "image" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <input 
                    type="file" 
                    accept="image/*" 
                    style={{ fontSize: "0.82rem", color: "#94a3b8" }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => updateBlock(b.id, "src", reader.result);
                        reader.readAsDataURL(file);
                      }
                    }} 
                  />
                  {b.src && <img src={b.src} style={{ maxHeight: "140px", width: "fit-content", borderRadius: 8, marginTop: 4, alignSelf: "center" }} alt="Preview" />}
                  <input 
                    className="field-input" 
                    value={b.title} 
                    onChange={(e) => updateBlock(b.id, "title", e.target.value)} 
                    placeholder="Figure Description (e.g. Fig 4.1 Login Screen Dialog)" 
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* --- Toolbar Footer --- */}
        <div style={{ padding: "16px", background: "rgba(0,0,0,0.3)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12, marginTop: 24, display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center", position: "sticky", bottom: 20, zIndex: 10 }}>
          <button className="btn-primary" style={{ padding: "8px 12px", fontSize: "0.84rem", background: "none", border: "1px solid #ef4444", color: "#fff" }} onClick={() => addBlock("chapter")}>+ Chapter</button>
          <button className="btn-primary" style={{ padding: "8px 12px", fontSize: "0.84rem", background: "none", border: "1px solid #818cf8" }} onClick={() => addBlock("heading1")}>+ H1</button>
          <button className="btn-primary" style={{ padding: "8px 12px", fontSize: "0.84rem", background: "none", border: "1px solid #818cf8" }} onClick={() => addBlock("heading2")}>+ H2</button>
          <button className="btn-primary" style={{ padding: "8px 12px", fontSize: "0.84rem", background: "none", border: "1px solid rgba(255,255,255,0.2)" }} onClick={() => addBlock("paragraph")}>+ Paragraph</button>
          <button className="btn-primary" style={{ padding: "8px 12px", fontSize: "0.84rem", background: "none", border: "1px solid rgba(255,255,255,0.2)" }} onClick={() => addBlock("list")}>+ Bullet List</button>
          <button className="btn-primary" style={{ padding: "8px 12px", fontSize: "0.84rem", background: "linear-gradient(135deg,#10b981,#059669)" }} onClick={() => addBlock("image")}>+ Photo / Fig</button>
        </div>

        {/* Download Button */}
        <div style={{ marginTop: 48, display: "flex", justifyContent: "center" }}>
          <PDFDownloadLink
            document={<CapstoneDocument data={data} />}
            fileName={`${(data.projectTitle || "capstone_report").replace(/\s+/g, "_")}.pdf`}
            style={{ textDecoration: "none" }}
          >
            {({ loading, error }) => (
              <button className="btn-primary" style={{ fontSize: "1rem", padding: "16px 40px" }}>
                {loading
                  ? "Generating PDF…"
                  : error
                  ? "Error framing canvas"
                  : <><Download size={18} /> Download pdf</>}
              </button>
            )}
          </PDFDownloadLink>
        </div>
        <p style={{ textAlign: "center", color: "#475569", fontSize: "0.78rem", marginTop: 12 }}>
          PDF is compiled frame-by-frame entirely on node clusters. No data leaves your space.
        </p>
      </div>

      <style>{`
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      `}</style>
    </div>
  );
}
