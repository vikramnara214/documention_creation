import { useState, useCallback, useEffect } from "react";
import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";
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

// ─── Numbering Helper ────────────────────────────────────────────────────────
const getNumberedLabel = (b, cnt) => {
  if (b.type === 'chapter') { cnt.ch++; cnt.h1 = 0; cnt.h2 = 0; return `${cnt.ch}`; }
  if (b.type === 'heading1') { cnt.h1++; cnt.h2 = 0; return `${cnt.ch}.${cnt.h1}`; }
  if (b.type === 'heading2') { cnt.h2++; return `${cnt.ch}.${cnt.h1}.${cnt.h2}`; }
  return b.type.toUpperCase();
};

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [data, setData] = useState(INIT);
  const [ready, setReady] = useState(false);

  // --- LocalStorage Persistence ---
  useEffect(() => {
    const saved = localStorage.getItem("capstone_doc_data");
    if (saved) {
      try {
        setData(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load saved data", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("capstone_doc_data", JSON.stringify(data));
  }, [data]);

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
    <div className="app-grid">
      {/* ─── Left Sidebar (Controls) ─── */}
      <div className="app-sidebar" style={{ 
        display: "flex", flexDirection: "column", 
        background: "#ffffff",
        padding: "20px", overflow: "hidden" 
      }}>
        
        {/* Sidebar Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, paddingBottom: 16, borderBottom: "1px solid #f1f5f9", marginBottom: 16 }}>
          <div style={{ background: "#2563eb", padding: "6px", borderRadius: "8px" }}>
            <Sparkles size={18} color="white" />
          </div>
          <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "#0f172a" }}>Capstone Doc Generator</span>
        </div>

        {/* Progress */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#f8fafc", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0", marginBottom: 16 }}>
          <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#64748b" }}>Progress</span>
          <div className="progress-bar" style={{ flex: 1 }}>
            <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
          </div>
          <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#2563eb" }}>{progress}%</span>
        </div>

        {/* Scrollable inputs list area */}
        <div className="sidebar-scroll" style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
          
          {/* Cover Metadata */}
          <div className="glass" style={{ padding: "16px" }}>
            <div style={{ fontWeight: 600, marginBottom: 12, color: "#1e293b", fontSize: "0.88rem" }}>Cover Page & Metadata</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10 }}>
              <Input label="Institution Name" value={data.institutionName} onChange={(_, v) => update("institutionName", v)} />
              <Input label="Department" value={data.department} onChange={(_, v) => update("department", v)} />
              <Input label="Project Title" value={data.projectTitle} onChange={(_, v) => update("projectTitle", v)} />
              <Input label="Guide / Supervisor Name" value={data.guideName} onChange={(_, v) => update("guideName", v)} />
              <Input label="Academic Year" value={data.academicYear} onChange={(_, v) => update("academicYear", v)} placeholder="2024–2025" />
              <div style={{ marginTop: 8 }}>
                <label style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>Abstract</label>
                <textarea 
                  className="field-input" 
                  rows={4} 
                  value={data.abstract || ""} 
                  onChange={(e) => update("abstract", e.target.value)} 
                  placeholder="Type Abstract text here..." 
                  style={{ fontSize: "0.82rem", padding: "6px 8px", marginTop: 4 }} 
                />
              </div>
            </div>
            
            <div style={{ marginTop: 16 }}>
              <div style={{ fontWeight: 600, fontSize: "0.78rem", color: "#64748b", marginBottom: 8 }}>Students</div>
              {(data.students || []).map((st, idx) => (
                <div key={idx} style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 8, alignItems: "end", marginBottom: 6 }}>
                  <Input label={`Student ${idx + 1}`} value={st.name} onChange={(_, v) => updateStudent(idx, "name", v)} />
                  <Input label="Roll No" value={st.roll} onChange={(_, v) => updateStudent(idx, "roll", v)} />
                  {idx > 0 && (
                    <button onClick={() => removeStudent(idx)} style={{ background: "#fee2e2", color: "#ef4444", border: "none", padding: "8px", borderRadius: "6px", cursor: "pointer" }}>
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
              <button 
                className="btn-primary" 
                style={{ padding: "6px 10px", fontSize: "0.78rem", background: "#f1f5f9", color: "#475569", border: "1px solid #e2e8f0", marginTop: 4, width: "auto" }} 
                onClick={addStudent}
              >
                + Student
              </button>
            </div>
          </div>

          {/* Canvas Blocks Layout sequential list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ fontWeight: 600, color: "#475569", fontSize: "0.82rem" }}>Sections Canvas</div>
            {(() => {
              let cnt = { ch: 0, h1: 0, h2: 0 };
              return (data.blocks || []).map((b, bIdx) => {
                const label = getNumberedLabel(b, cnt);
                return (
              <div key={b.id} className="glass" style={{ padding: "12px", borderLeft: b.type === 'chapter' ? '3px solid #ef4444' : '1px solid var(--border)' }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: "0.68rem", fontWeight: 700, color: b.type === 'chapter' ? '#dc2626' : b.type==='image' ? '#059669' : '#2563eb', textTransform: "uppercase" }}>
                    {label}
                  </span>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button onClick={() => moveBlock(bIdx, -1)} disabled={bIdx === 0} style={{ opacity: bIdx === 0 ? 0.3 : 1, padding: "2px 6px", background: "#f1f5f9", border: "none", borderRadius: 4, cursor: "pointer", fontSize: "0.75rem" }}>↑</button>
                    <button onClick={() => moveBlock(bIdx, 1)} disabled={bIdx === (data.blocks.length - 1)} style={{ opacity: bIdx === (data.blocks.length - 1) ? 0.3 : 1, padding: "2px 6px", background: "#f1f5f9", border: "none", borderRadius: 4, cursor: "pointer", fontSize: "0.75rem" }}>↓</button>
                    <button onClick={() => removeBlock(b.id)} style={{ color: "#ef4444", padding: "4px", background: "#fee2e2", border: "none", borderRadius: 4, cursor: "pointer" }}><Trash2 size={12} /></button>
                  </div>
                </div>

                {/* Block Content inputs */}
                {(b.type === "chapter" || b.type === "heading1" || b.type === "heading2") && (
                  <input 
                    className="field-input" 
                    style={{ fontWeight: b.type === 'chapter' ? 700 : 600, fontSize: "0.85rem", padding: "6px 8px", marginBottom: 6 }}
                    value={b.title} 
                    onChange={(e) => updateBlock(b.id, "title", e.target.value)} 
                    placeholder={b.type === "chapter" ? "e.g. ABSTRACT or CHAPTER 1" : "e.g. 1.1 Introduction"} 
                  />
                )}

                {(b.type === "paragraph" || b.type === "list") && (
                  <textarea 
                    className="field-input" 
                    rows={b.type === "paragraph" ? 4 : 2}
                    style={{ fontSize: "0.82rem", padding: "6px 8px" }}
                    value={b.content} 
                    onChange={(e) => updateBlock(b.id, "content", e.target.value)} 
                    onKeyDown={(e) => {
                      if (e.key === 'Tab') {
                        e.preventDefault();
                        const start = e.target.selectionStart;
                        const end = e.target.selectionEnd;
                        const val = e.target.value;
                        const newVal = val.substring(0, start) + "\t" + val.substring(end);
                        updateBlock(b.id, "content", newVal);
                        setTimeout(() => {
                          e.target.selectionStart = e.target.selectionEnd = start + 1;
                        }, 0);
                      }
                    }}
                    placeholder={b.type === "list" ? "Point 1\nPoint 2\nPoint 3..." : "Type text content..."} 
                  />
                )}
                
                {b.type === "code" && (
                  <textarea 
                    className="field-input" 
                    rows={6}
                    style={{ fontSize: "0.82rem", padding: "6px 8px", fontFamily: "Courier New, monospace", background: "#f8fafc" }}
                    value={b.content} 
                    onChange={(e) => updateBlock(b.id, "content", e.target.value)} 
                    placeholder="Enter support code or paste Appendix text..." 
                  />
                )}

                {b.type === "image" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <input type="file" accept="image/*" style={{ fontSize: "0.75rem" }} onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => updateBlock(b.id, "src", reader.result);
                        reader.readAsDataURL(file);
                      }
                    }} />
                    {b.src && <img src={b.src} style={{ maxHeight: "100px", width: "fit-content", borderRadius: 6, margin: "4px auto" }} />}
                    <input className="field-input" style={{ fontSize: "0.82rem", padding: "6px 8px" }} value={b.title} onChange={(e) => updateBlock(b.id, "title", e.target.value)} placeholder="Figure Caption" />
                  </div>
                )}

                {b.type === "page_break" && (
                  <div style={{ padding: "8px", background: "#f8fafc", border: "1px dashed #e2e8f0", borderRadius: 6, textAlign: "center", fontSize: "0.78rem", color: "#64748b" }}>
                    --- Page Break ---
                  </div>
                )}
              </div>
                );
              });
            })()}
          </div>

        </div>

        {/* Sidebar Footer Toolbar absolute stick */}
        <div style={{ padding: "12px", borderTop: "1px solid #e2e8f0", marginTop: "auto", display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center", background: "#ffffff", borderRadius: "0 0 12px 12px" }}>
          <button className="btn-primary" style={{ padding: "6px 8px", fontSize: "0.75rem", background: "#fee2e2", color: "#dc2626", border: "1px solid #fecaca" }} onClick={() => addBlock("chapter")}>+ Chapter</button>
          <button className="btn-primary" style={{ padding: "6px 8px", fontSize: "0.75rem", background: "#dbeafe", color: "#2563eb", border: "1px solid #bfdbfe" }} onClick={() => addBlock("heading1")}>+ H1</button>
          <button className="btn-primary" style={{ padding: "6px 8px", fontSize: "0.75rem", background: "#dbeafe", color: "#2563eb", border: "1px solid #bfdbfe" }} onClick={() => addBlock("heading2")}>+ H2</button>
          <button className="btn-primary" style={{ padding: "6px 8px", fontSize: "0.75rem", background: "#f1f5f9", color: "#475569", border: "1px solid #e2e8f0" }} onClick={() => addBlock("paragraph")}>+ Text</button>
          <button className="btn-primary" style={{ padding: "6px 8px", fontSize: "0.75rem", background: "#f1f5f9", color: "#475569", border: "1px solid #e2e8f0" }} onClick={() => addBlock("list")}>+ List</button>
          <button className="btn-primary" style={{ padding: "6px 8px", fontSize: "0.75rem", background: "#d1fae5", color: "#059669", border: "1px solid #a7f3d0" }} onClick={() => addBlock("image")}>+ Photo</button>
          <button className="btn-primary" style={{ padding: "6px 8px", fontSize: "0.75rem", background: "#fef08a", color: "#854d0e", border: "1px solid #fde047" }} onClick={() => addBlock("code")}>+ Code</button>
          <button className="btn-primary" style={{ padding: "6px 8px", fontSize: "0.75rem", background: "#e0e7ff", color: "#4338ca", border: "1px solid #c7d2fe" }} onClick={() => addBlock("page_break")}>+ Break</button>
        </div>

        {/* Credits */}
        <div style={{ textAlign: "center", color: "#64748b", fontSize: "0.74rem", marginTop: 8, paddingBottom: 4 }}>
          Created by <span style={{ fontWeight: 600, color: "#0f172a" }}>Nara Vikram</span>
          <a href="https://github.com/vikramnara214" target="_blank" rel="noreferrer" style={{ marginLeft: 5, color: "#2563eb", textDecoration: "none", fontWeight: 500 }}>
            @vikramnara214
          </a>
        </div>

      </div>

      {/* ─── Right Pane (Live HTML Preview) ─── */}
      <div className="app-preview" style={{ flex: 1, background: "#cbd5e1", padding: "20px", overflowY: "auto", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
        
        {/* Top toolbar with Download Button */}
        <div style={{ display: "flex", justifyContent: "flex-end", width: "100%", maxWidth: "800px" }}>
          <PDFDownloadLink
            document={<CapstoneDocument data={data} />}
            fileName={`${(data.projectTitle || "capstone_report").replace(/\s+/g, "_")}.pdf`}
            style={{ textDecoration: "none" }}
          >
            {({ loading }) => (
              <button className="btn-primary" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.82rem", padding: "8px 16px" }}>
                <Download size={16} /> 
                {loading ? "Generating PDF…" : "Download PDF"}
              </button>
            )}
          </PDFDownloadLink>
        </div>

        {/* ==================== PAGE 1: COVER ==================== */}
        <div className="paper-sheet" style={{ textAlign: "left", position: "relative" }}>
          <div style={{ 
            height: "100%", 
            display: "flex", 
            flexDirection: "column", 
            alignItems: "center", 
            justifyContent: "center", 
            fontFamily: "'Times New Roman', Times, serif",
            color: "#000000"
          }}>
            <div style={{ fontSize: "16pt", fontWeight: "bold", textAlign: "center", textTransform: "uppercase", marginBottom: "8pt" }}>
              {data.institutionName || "[INSTITUTION NAME]"}
            </div>
            
            <div style={{ fontSize: "14pt", marginTop: "32pt", textAlign: "center", marginBottom: "8pt" }}>
              A Capstone Project Report
            </div>
            
            <div style={{ fontSize: "16pt", fontWeight: "bold", marginTop: "16pt", textAlign: "center", textTransform: "uppercase", marginBottom: "24pt" }}>
              {data.projectTitle || "[PROJECT TITLE]"}
            </div>
            
            <div style={{ fontSize: "12pt", marginTop: "24pt", textAlign: "center" }}>
              Submitted by
            </div>
            
            <div style={{ fontSize: "12pt", marginTop: "6pt", textAlign: "center" }}>
              {(data.students || []).map((s, idx) => (
                <div key={idx} style={{ marginBottom: "4pt" }}>
                  {s.name} {s.roll ? `(${s.roll})` : ""}
                </div>
              ))}
            </div>
            
            <div style={{ fontSize: "12pt", marginTop: "24pt", textAlign: "center" }}>
              Under the guidance of
            </div>
            <div style={{ fontSize: "12pt", textAlign: "center", marginTop: "4pt" }}>
              {data.guideName || "[GUIDE NAME]"}
            </div>
            
            <div style={{ fontSize: "12pt", marginTop: "24pt", textTransform: "uppercase", textAlign: "center" }}>
              {data.department || "[DEPARTMENT]"}
            </div>
            <div style={{ fontSize: "12pt", textAlign: "center", marginTop: "4pt" }}>
              {data.academicYear || "[ACADEMIC YEAR]"}
            </div>
          </div>
        </div>

        {/* ==================== PAGE 1.5: ABSTRACT ==================== */}
        {data.abstract && (
          <div className="paper-sheet" style={{ textAlign: "left", position: "relative" }}>
            <div style={{ marginTop: 20, marginBottom: 40 }}>
              <div style={{ fontSize: "14pt", fontWeight: "bold", textTransform: "uppercase", textAlign: "center", marginBottom: 30, fontFamily: "serif" }}>
                ABSTRACT
              </div>
              <p style={{ fontSize: "12pt", textAlign: "justify", lineHeight: 1.6, textIndent: "0.5in", fontFamily: "serif", padding: "0 10px" }}>
                {data.abstract}
              </p>
            </div>
            <div style={{ position: "absolute", bottom: 40, left: 100, right: 100, textAlign: "center", fontSize: "10pt", color: "#555", fontFamily: "serif" }}>ii</div>
          </div>
        )}

        {/* ==================== PAGE 2: APPENDIX / ToC ==================== */}
        <div className="paper-sheet" style={{ textAlign: "left", position: "relative" }}>
          <div style={{ marginTop: 20, marginBottom: 40 }}>
            <div style={{ fontSize: "14pt", fontWeight: "bold", textTransform: "uppercase", textAlign: "center", marginBottom: 30, fontFamily: "serif" }}>
              TABLE OF CONTENTS
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "0 10px" }}>
              {(() => {
                let tocCnt = { ch: 0, h1: 0, h2: 0 };
                return (data.blocks || [])
                  .filter(b => b.type === 'chapter' || b.type === 'heading1')
                  .map((b, idx) => {
                    const label = getNumberedLabel(b, tocCnt);
                    const isChapter = b.type === 'chapter';
                    return (
                      <div key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: "12pt", paddingLeft: b.type === 'heading1' ? 24 : 0, fontWeight: isChapter ? "bold" : "normal" }}>
                        <span>{label}. {b.title || (isChapter ? "Untitled Chapter" : "Untitled Heading")}</span>
                        <span style={{ flex: 1, borderBottom: "1px dotted #94a3b8", margin: "0 8px", alignSelf: "bottom", marginBottom: 4 }}></span>
                        <span style={{ color: "#64748b", fontSize: "10pt" }}>---</span>
                      </div>
                    );
                  });
              })()}
            </div>
            <div style={{ position: "absolute", bottom: 40, left: 100, right: 100, textAlign: "center", fontSize: "10pt", color: "#555", fontFamily: "serif" }}>{data.abstract ? "iii" : "ii"}</div>
          </div>
        </div>

        {/* ==================== PAGE 3+: DYNAMIC BODY PAGES ==================== */}
        {(() => {
          let pCnt = { ch: 0, h1: 0, h2: 0 };
          const pages = [];
          let currentBlocks = [];
          let currentHeight = 0; // Heuristic height counter in px

          (data.blocks || []).forEach((b) => {
            const label = getNumberedLabel(b, pCnt);
            
            // Approximate block heights for A4 pagination
            let blockHeight = 30;
            if (b.type === "chapter") blockHeight = 110;
            else if (b.type === "heading1") blockHeight = 70;
            else if (b.type === "heading2") blockHeight = 50;
            else if (b.type === "paragraph" && b.content) {
              const lines = Math.ceil(b.content.length / 92); // ~92 chars per line
              blockHeight = lines * 22 + 18; 
            } else if (b.type === "list" && b.content) {
              const lines = b.content.split('\n').filter(l => l.trim()).length;
              blockHeight = lines * 22 + 12;
            } else if (b.type === "code" && b.content) {
              const lines = b.content.split('\n').length;
              blockHeight = lines * 16 + 32;
            } else if (b.type === "image") {
              blockHeight = 280;
            }

            const isForced = b.type === "chapter" || b.type === "page_break";
            const isOverflown = (currentHeight + blockHeight) > 850; // Threshold for content space

            if ((isForced || isOverflown) && currentBlocks.length > 0) {
              pages.push(
                <div className="paper-sheet" style={{ textAlign: "left", position: "relative", marginBottom: "20px" }} key={`page-${pages.length}`}>
                  {currentBlocks}
                  <div style={{ position: "absolute", bottom: 40, left: 100, right: 100, textAlign: "center", fontSize: "10pt", color: "#555", fontFamily: "serif" }}>{pages.length + 1}</div>
                </div>
              );
              currentBlocks = [];
              currentHeight = 0; // Reset height
            }

            currentBlocks.push(
              <div key={b.id}>
                {b.type === "page_break" && <div style={{ borderTop: "2px dashed #94a3b8", margin: "20px 0", textAlign: "center", color: "#64748b", fontSize: "0.75rem", letterSpacing: "1px" }}>--- PAGE BREAK ---</div>}
                {b.type === "chapter" && <div className="doc-chapter">{label}. {b.title}</div>}
                {b.type === "heading1" && <div className="doc-h1">{label} {b.title}</div>}
                {b.type === "heading2" && <div className="doc-h2">{label} {b.title}</div>}
                {b.type === "paragraph" && <p className="doc-p">{b.content}</p>}
                {b.type === "code" && (
                  <pre style={{ 
                    fontFamily: "Courier New, monospace", 
                    fontSize: "11pt", 
                    background: "#f8fafc", 
                    padding: "10px", 
                    borderRadius: "4px", 
                    whiteSpace: "pre-wrap", 
                    marginLeft: "36px", 
                    marginBottom: "12px",
                    border: "1px solid #e2e8f0"
                  }}>{b.content}</pre>
                )}
                {b.type === "list" && (
                  <ul className="doc-ul">
                    {(b.content || "").split('\n').filter(l => l.trim()).map((l, i) => <li key={i}>{l}</li>)}
                  </ul>
                )}
                {b.type === "image" && (
                  <div style={{ textAlign: "center", margin: "20px 0" }}>
                    {b.src && <img src={b.src} style={{ maxWidth: "100%", maxHeight: "360px", borderRadius: 4 }} alt="Preview" />}
                    <p style={{ fontSize: "11pt", fontStyle: "italic", marginTop: 6, color: "#4b5563" }}>{b.title}</p>
                  </div>
                )}
              </div>
            );
            currentHeight += blockHeight; // Accumulate height for auto-pagination
          });

          if (currentBlocks.length > 0) {
            pages.push(
              <div className="paper-sheet" style={{ textAlign: "left", position: "relative" }} key={`page-last`}>
                {currentBlocks}
                <div style={{ position: "absolute", bottom: 40, left: 100, right: 100, textAlign: "center", fontSize: "10pt", color: "#555", fontFamily: "serif" }}>{pages.length + 1}</div>
              </div>
            );
          }

          return pages;
        })()}
      </div>

    </div>
  );
}
