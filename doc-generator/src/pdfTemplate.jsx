import {
  Document, Page, Text, View, StyleSheet
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

    {/* ===== ABSTRACT ===== */}
    <Page size="A4" style={styles.page}>
      <Text style={styles.chapterTitle}>Abstract</Text>
      <BodyText>{data.abstract}</BodyText>
      <Text style={styles.pageNumber} render={({ pageNumber }) => `i`} fixed />
    </Page>

    {/* ===== CHAPTER 1: INTRODUCTION ===== */}
    <Page size="A4" style={styles.page}>
      <Text style={styles.chapterTitle}>CHAPTER 1{"\n"}INTRODUCTION</Text>
      <Text style={styles.heading1}>1.1 Introduction</Text>
      <BodyText>{data.ch1_intro}</BodyText>

      <Text style={styles.heading1}>1.2 Problem Statement</Text>
      <BodyText>{data.ch1_problem}</BodyText>

      <Text style={styles.heading1}>1.3 Objectives of the Project</Text>
      <BulletList items={data.ch1_objectives} />

      <Text style={styles.heading1}>1.4 Scope of the Project</Text>
      <BodyText>{data.ch1_scope}</BodyText>

      <Text style={styles.pageNumber} render={({ pageNumber }) => pageNumber - 1} fixed />
    </Page>

    {/* ===== CHAPTER 2: SYSTEM OVERVIEW ===== */}
    <Page size="A4" style={styles.page}>
      <Text style={styles.chapterTitle}>CHAPTER 2{"\n"}SYSTEM OVERVIEW</Text>
      <Text style={styles.heading1}>2.1 Existing System</Text>
      <BodyText>{data.ch2_existing}</BodyText>

      <Text style={styles.heading1}>2.2 Limitations of Existing System</Text>
      <BulletList items={data.ch2_limitations} />

      <Text style={styles.heading1}>2.3 Proposed System</Text>
      <BodyText>{data.ch2_proposed}</BodyText>

      <Text style={styles.heading1}>2.4 Software Requirements</Text>
      <BulletList items={data.ch2_software} />

      <Text style={styles.heading1}>2.5 Hardware Requirements</Text>
      <BulletList items={data.ch2_hardware} />

      <Text style={styles.pageNumber} render={({ pageNumber }) => pageNumber - 1} fixed />
    </Page>

    {/* ===== CHAPTER 3: TECHNOLOGIES USED ===== */}
    <Page size="A4" style={styles.page}>
      <Text style={styles.chapterTitle}>CHAPTER 3{"\n"}TECHNOLOGIES USED</Text>
      {["tech1", "tech2", "tech3", "tech4"].map((k, i) => {
        const techName = data[`${k}_name`];
        const techDesc = data[`${k}_desc`];
        if (!techName && !techDesc) return null;
        return (
          <View key={k}>
            <Text style={styles.heading1}>3.{i + 1} {techName || `Technology ${i + 1}`}</Text>
            <BodyText>{techDesc}</BodyText>
          </View>
        );
      })}
      <Text style={styles.pageNumber} render={({ pageNumber }) => pageNumber - 1} fixed />
    </Page>

    {/* ===== CHAPTER 4: DATABASE DESIGN ===== */}
    <Page size="A4" style={styles.page}>
      <Text style={styles.chapterTitle}>CHAPTER 4{"\n"}DATABASE DESIGN</Text>
      <Text style={styles.heading1}>4.1 Database Tables</Text>
      <BodyText>{data.ch4_tables}</BodyText>

      <Text style={styles.heading1}>4.2 Table Structure</Text>
      <BodyText>{data.ch4_structure}</BodyText>

      <Text style={styles.heading1}>4.3 Keys and Constraints</Text>
      <BulletList items={data.ch4_keys} />

      <Text style={styles.heading1}>4.4 Table Relationships</Text>
      <BodyText>{data.ch4_relations}</BodyText>

      <Text style={styles.heading1}>4.5 Sample Data / Records</Text>
      <BodyText>{data.ch4_sample}</BodyText>

      <Text style={styles.pageNumber} render={({ pageNumber }) => pageNumber - 1} fixed />
    </Page>

    {/* ===== CHAPTER 5: SYSTEM MODULES ===== */}
    <Page size="A4" style={styles.page}>
      <Text style={styles.chapterTitle}>CHAPTER 5{"\n"}SYSTEM MODULES</Text>
      {["mod1", "mod2", "mod3", "mod4"].map((k, i) => {
        const modName = data[`${k}_name`];
        const modDesc = data[`${k}_desc`];
        if (!modName && !modDesc) return null;
        return (
          <View key={k}>
            <Text style={styles.heading1}>Module {i + 1}: {modName}</Text>
            <BodyText>{modDesc}</BodyText>
          </View>
        );
      })}
      <Text style={styles.pageNumber} render={({ pageNumber }) => pageNumber - 1} fixed />
    </Page>

    {/* ===== CHAPTER 6: IMPLEMENTATION ===== */}
    <Page size="A4" style={styles.page}>
      <Text style={styles.chapterTitle}>CHAPTER 6{"\n"}IMPLEMENTATION</Text>
      <Text style={styles.heading1}>6.1 Database Connection</Text>
      <BodyText>{data.ch6_connection}</BodyText>

      <Text style={styles.heading1}>6.2 Input Validation</Text>
      <BodyText>{data.ch6_validation}</BodyText>

      <Text style={styles.heading1}>6.3 Exception Handling</Text>
      <BodyText>{data.ch6_exception}</BodyText>

      <Text style={styles.pageNumber} render={({ pageNumber }) => pageNumber - 1} fixed />
    </Page>

    {/* ===== CHAPTER 7: OUTPUT SCREENS ===== */}
    <Page size="A4" style={styles.page}>
      <Text style={styles.chapterTitle}>CHAPTER 7{"\n"}OUTPUT SCREENS</Text>
      <BodyText>{data.ch7_screens}</BodyText>
      <Text style={[styles.body, { color: "#666", fontSize: 10 }]}>Note: Insert screenshots after printing if using standard generator.</Text>
      <Text style={styles.pageNumber} render={({ pageNumber }) => pageNumber - 1} fixed />
    </Page>

    {/* ===== CHAPTER 8: CONCLUSION ===== */}
    <Page size="A4" style={styles.page}>
      <Text style={styles.chapterTitle}>CHAPTER 8{"\n"}CONCLUSION</Text>
      <BodyText>{data.ch8_conclusion}</BodyText>
      <Text style={styles.pageNumber} render={({ pageNumber }) => pageNumber - 1} fixed />
    </Page>

    {/* ===== CHAPTER 9: FUTURE ENHANCEMENTS ===== */}
    <Page size="A4" style={styles.page}>
      <Text style={styles.chapterTitle}>CHAPTER 9{"\n"}FUTURE ENHANCEMENTS</Text>
      <BulletList items={data.ch9_future} />
      <Text style={styles.pageNumber} render={({ pageNumber }) => pageNumber - 1} fixed />
    </Page>

    {/* ===== CHAPTER 10: REFERENCES ===== */}
    <Page size="A4" style={styles.page}>
      <Text style={styles.chapterTitle}>CHAPTER 10{"\n"}REFERENCES</Text>
      <BulletList items={data.references} />
      <Text style={styles.pageNumber} render={({ pageNumber }) => pageNumber - 1} fixed />
    </Page>

    {/* ===== APPENDIX ===== */}
    <Page size="A4" style={styles.page}>
      <Text style={styles.chapterTitle}>APPENDIX</Text>
      <BodyText>{data.appendix}</BodyText>
      <Text style={styles.pageNumber} render={({ pageNumber }) => pageNumber - 1} fixed />
    </Page>
  </Document>
);

