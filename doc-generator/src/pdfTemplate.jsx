import {
  Document, Page, Text, View, StyleSheet, Image
} from "@react-pdf/renderer";

// 1 inch = 72 pts in PDF land
const inch = 72;

const styles = StyleSheet.create({
  page: {
    fontFamily: "Times-Roman",
    fontSize: 12,
    paddingTop: inch,           // 1 inch top
    paddingBottom: inch,        // 1 inch bottom
    paddingLeft: inch * 1.5,    // 1.5 inch left (binding)
    paddingRight: inch,         // 1 inch right
  },

  // -------- Cover Page --------
  coverPage: {
    fontFamily: "Times-Roman",
    paddingTop: inch,
    paddingBottom: inch,
    paddingLeft: inch * 1.5,
    paddingRight: inch,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  coverTitle: { fontSize: 20, fontFamily: "Times-Bold", textAlign: "center", textTransform: "uppercase" },
  coverSub: { fontSize: 14, textAlign: "center" },
  coverInfo: { fontSize: 12, textAlign: "center", marginTop: 8 },

  // -------- Chapter heading --------
  chapterTitle: {
    fontSize: 16,
    fontFamily: "Times-Bold",
    textAlign: "center",
    textTransform: "uppercase",
    marginBottom: 16,
    lineHeight: 1,
  },

  // -------- Section headings --------
  heading1: {
    fontSize: 14,
    fontFamily: "Times-Bold",
    textAlign: "left",
    lineHeight: 1,
    marginTop: 14,
    marginBottom: 6,
  },
  heading2: {
    fontSize: 12,
    fontFamily: "Times-Bold",
    textAlign: "left",
    lineHeight: 1,
    marginTop: 10,
    marginBottom: 4,
  },


  // -------- Body text --------
  body: {
    fontSize: 12,
    lineHeight: 1.5,
    textAlign: "justify",
    textIndent: 36,    // 0.5 inch indent (~36pt)
    marginBottom: 6,
  },

  // -------- Bullet list --------
  bulletRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  bullet: { fontSize: 12, lineHeight: 1.5, width: 18, marginLeft: 36 },
  bulletText: { fontSize: 12, lineHeight: 1.5, flex: 1 },

  // -------- Page number --------
  pageNumber: {
    position: "absolute",
    bottom: 36,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 10,
    color: "#555",
  },

  // -------- Table --------
  tableTitle: { fontSize: 12, fontFamily: "Times-Bold", textAlign: "center", marginBottom: 6 },
  tableRow: { flexDirection: "row", borderBottom: "0.5pt solid #999" },
  tableCell: { flex: 1, fontSize: 12, padding: 5, borderRight: "0.5pt solid #999" },
  tableHeader: { flex: 1, fontSize: 12, fontFamily: "Times-Bold", padding: 5, borderRight: "0.5pt solid #999", backgroundColor: "#e8e8e8" },
});

// ---------------------------------------------------------------------------
// Helper components
// ---------------------------------------------------------------------------
const BodyText = ({ children }) =>
  children ? <Text style={styles.body}>{children}</Text> : null;

const BulletList = ({ items }) => {
  if (!items) return null;
  return items
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, i) => (
      <View key={i} style={styles.bulletRow}>
        <Text style={styles.bullet}>•</Text>
        <Text style={styles.bulletText}>{line.replace(/^[-•]\s*/, "")}</Text>
      </View>
    ));
};

// ---------------------------------------------------------------------------
// Main PDF Document
// ---------------------------------------------------------------------------
export const CapstoneDocument = ({ data }) => (
  <Document>
    {/* ===== COVER PAGE ===== */}
    <Page size="A4" style={styles.coverPage}>
      <Text style={[styles.coverTitle, { fontSize: 18 }]}>
        {data.institutionName || "INSTITUTION NAME"}
      </Text>
      <Text style={[styles.coverSub, { marginTop: 40 }]}>
        A Capstone Project Report
      </Text>
      <Text style={[styles.coverTitle, { marginTop: 20 }]}>
        {data.projectTitle || "PROJECT TITLE"}
      </Text>
      <Text style={[styles.coverInfo, { marginTop: 30 }]}>
        Submitted by
      </Text>
      {(data.students || []).map((s, idx) => (
        <View key={idx} style={{ marginTop: 6, alignItems: "center" }}>
          <Text style={styles.coverInfo}>{s.name || `Student ${idx + 1}`}</Text>
          <Text style={{ fontSize: 11, fontFamily: "Times-Roman", color: "#444" }}>{s.roll || "Roll Number"}</Text>
        </View>
      ))}
      <Text style={[styles.coverInfo, { marginTop: 20 }]}>
        Under the guidance of
      </Text>
      <Text style={styles.coverInfo}>{data.guideName || "Guide Name"}</Text>
      <Text style={[styles.coverInfo, { marginTop: 30 }]}>
        {data.department || "Department"}
      </Text>
      <Text style={styles.coverInfo}>{data.academicYear || "Academic Year"}</Text>
    </Page>

    {/* ===== TABLE OF CONTENTS PAGE ===== */}
    <Page size="A4" style={styles.page}>
      <Text style={[styles.chapterTitle, { marginBottom: 25, textAlign: "center" }]}>TABLE OF CONTENTS</Text>
      
      {(() => {
        let cnt = { ch: 0, h1: 0, h2: 0 };
        return (data.blocks || [])
          .filter(b => b.type === 'chapter' || b.type === 'heading1')
          .map((b, idx) => {
             const isChapter = b.type === "chapter";
             let label = "";
             if (b.type === 'chapter') { cnt.ch++; cnt.h1 = 0; label = `${cnt.ch}`; }
             else if (b.type === 'heading1') { cnt.h1++; label = `${cnt.ch}.${cnt.h1}`; }

             return (
               <View key={idx} style={{ 
                 display: "flex", 
                 flexDirection: "row", 
                 justifyContent: "space-between", 
                 marginBottom: 10,
                 paddingLeft: b.type === 'heading1' ? 20 : 0 
               }}>
                 <Text style={{ 
                   fontSize: 12, 
                   fontFamily: isChapter ? "Times-Bold" : "Times-Roman",
                 }}>
                   {label}. {b.title || (isChapter ? "Untitled Chapter" : "Untitled Heading")}
                 </Text>
                 <Text style={{ flex: 1, borderBottomWidth: 1, borderBottomColor: "#999", borderBottomStyle: "dotted", marginHorizontal: 8 }} />
                 <Text style={{ fontSize: 11, color: "#666" }}>---</Text>
               </View>
             );
          });
      })()}
      <Text style={styles.pageNumber} render={() => "ii"} fixed />
    </Page>

    {/* ===== CONTINUOUS BODY PAGES WITH BLOCKS ===== */}
    <Page size="A4" style={styles.page}>
      {(() => {
        let cnt = { ch: 0, h1: 0, h2: 0 };
        return (data.blocks || []).map((b, idx) => {
          const isChapter = b.type === "chapter";
          
          let label = "";
          if (b.type === 'chapter') { cnt.ch++; cnt.h1 = 0; cnt.h2 = 0; label = `${cnt.ch}. ${b.title}`; }
          else if (b.type === 'heading1') { cnt.h1++; cnt.h2 = 0; label = `${cnt.ch}.${cnt.h1} ${b.title}`; }
          else if (b.type === 'heading2') { cnt.h2++; label = `${cnt.ch}.${cnt.h1}.${cnt.h2} ${b.title}`; }

          return (
            <View key={b.id || idx} break={isChapter && idx > 0} style={{ marginBottom: 14 }}>
              {b.type === "chapter" && <Text style={styles.chapterTitle}>{label}</Text>}
              {b.type === "heading1" && <Text style={styles.heading1}>{label}</Text>}
              {b.type === "heading2" && <Text style={styles.heading2}>{label}</Text>}
            
            {b.content && b.type !== 'image' && (
              b.type === 'list' 
                ? <BulletList items={b.content} /> 
                : b.type === 'code'
                  ? <Text style={{ fontFamily: "Courier", fontSize: 11, padding: 8, backgroundColor: "#f4f4f4", marginBottom: 6, marginLeft: 36, whiteSpace: "pre-wrap" }}>{b.content}</Text>
                  : <BodyText>{b.content}</BodyText>
            )}

            {b.type === "image" && b.src && (
              <View style={{ alignItems: "center", marginTop: 10, marginBottom: 10 }}>
                <Image src={b.src} style={{ maxHeight: 220, maxWidth: "80%", marginBottom: 6, objectFit: "contain" }} />
                {b.title && <Text style={{ fontSize: 11, fontFamily: "Times-Italic", textAlign: "center" }}>{b.title}</Text>}
              </View>
              )}
            </View>
          );
        });
      })()}
      {/* Dynamic Page Numbers */}
      <Text style={styles.pageNumber} render={({ pageNumber }) => pageNumber - 2} fixed />
    </Page>
  </Document>
);

