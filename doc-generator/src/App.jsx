import { useState, useCallback } from "react";
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
            {(data.blocks || []).map((b, bIdx) => (
              <div key={b.id} className="glass" style={{ padding: "12px", borderLeft: b.type === 'chapter' ? '3px solid #ef4444' : '1px solid var(--border)' }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: "0.68rem", fontWeight: 700, color: b.type === 'chapter' ? '#dc2626' : b.type==='image' ? '#059669' : '#2563eb', textTransform: "uppercase" }}>
                    {b.type}
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

                {(b.type === "paragraph" || b.type === "list" || b.type === "chapter" || b.type === "heading1" || b.type === "heading2") && (
                  <textarea 
                    className="field-input" 
                    rows={b.type === "paragraph" ? 4 : 2}
                    style={{ fontSize: "0.82rem", padding: "6px 8px" }}
                    value={b.content} 
                    onChange={(e) => updateBlock(b.id, "content", e.target.value)} 
                    placeholder={b.type === "list" ? "Point 1\nPoint 2\nPoint 3..." : "Type text content..."} 
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
              </div>
            ))}
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
        </div>

      </div>

      {/* ─── Right Pane (Live PDF Preview) ─── */}
      <div className="app-preview" style={{ flex: 1, background: "#cbd5e1", padding: "16px", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <PDFViewer style={{ width: "100%", height: "100%", border: "none", borderRadius: "6px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)" }}>
          <CapstoneDocument data={data} />
        </PDFViewer>
      </div>

    </div>
  );
}
