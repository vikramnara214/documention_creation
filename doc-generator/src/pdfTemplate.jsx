/**
 * pdfTemplate.jsx
 *
 * Drop this file into  doc-generator/src/pdfTemplate.jsx
 * (replace whatever was there before).
 *
 * It mirrors the HTML preview in App.jsx 1-to-1:
 *   • Cover page  – centred, Times New Roman, same font sizes
 *   • Table of Contents page  – dotted leader lines, bold chapters
 *   • Body pages  – one chapter per page break, correct heading hierarchy,
 *                    paragraphs, numbered lists, images, code blocks
 *
 * Uses @react-pdf/renderer (already in your package.json).
 */

import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

// ─── Page dimensions (A4) ────────────────────────────────────────────────────
const PAGE_W = 595.28;
const PAGE_H = 841.89;

// Margins match the HTML "paper-sheet" look (roughly 1 inch / 72 pt each side)
const M_TOP    = 72; // 1 inch
const M_BOTTOM = 72; // 1 inch
const M_LEFT   = 108; // 1.5 inch (Binding)
const M_RIGHT  = 72; // 1 inch
const CONTENT_W = PAGE_W - M_LEFT - M_RIGHT;   // ~451 pt

// ─── Styles ──────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  page: {
    fontFamily: "Times-Roman",
    fontSize: 12,
    paddingTop:    M_TOP,
    paddingBottom: M_BOTTOM,
    paddingLeft:   M_LEFT,
    paddingRight:  M_RIGHT,
    color: "#000000",
    backgroundColor: "#ffffff",
  },

  // ── Page number footer ──
  pageNumber: {
    position: "absolute",
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 10,
    color: "#555555",
    fontFamily: "Times-Roman",
  },

  // ── Cover ──
  coverPage: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  coverInstitution: {
    fontSize: 16,
    fontFamily: "Times-Bold",
    textAlign: "center",
    textTransform: "uppercase",
    marginBottom: 8,
  },
  coverSubtitle: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 32,
    marginBottom: 8,
  },
  coverTitle: {
    fontSize: 16,
    fontFamily: "Times-Bold",
    textAlign: "center",
    textTransform: "uppercase",
    marginTop: 16,
    marginBottom: 24,
  },
  coverLabel: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 24,
  },
  coverValue: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 4,
  },
  coverDept: {
    fontSize: 12,
    textAlign: "center",
    textTransform: "uppercase",
    marginTop: 24,
  },
  coverYear: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 4,
  },

  // ── Table of Contents ──
  tocTitle: {
    fontSize: 14,
    fontFamily: "Times-Bold",
    textTransform: "uppercase",
    textAlign: "center",
    marginBottom: 24,
    marginTop: 8,
  },
  tocRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 8,
  },
  tocChapterText: {
    fontSize: 12,
    fontFamily: "Times-Bold",
  },
  tocHeadingText: {
    fontSize: 12,
    paddingLeft: 16,
  },
  tocDots: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomStyle: "dotted",
    borderBottomColor: "#94a3b8",
    marginBottom: 3,
    marginLeft: 6,
    marginRight: 6,
  },
  tocPage: {
    fontSize: 10,
    color: "#64748b",
  },

  // ── Body content ──
  chapterTitle: {
    fontSize: 16,
    fontFamily: "Times-Bold",
    textTransform: "uppercase",
    marginBottom: 16,
    marginTop: 4,
  },
  heading1: {
    fontSize: 14,
    fontFamily: "Times-Bold",
    marginTop: 14,
    marginBottom: 8,
  },
  heading2: {
    fontSize: 13,
    fontFamily: "Times-Bold",
    marginTop: 10,
    marginBottom: 6,
  },
  paragraph: {
    fontSize: 12,
    lineHeight: 1.6,
    textAlign: "justify",
    marginBottom: 10,
    marginLeft: 36,
  },
  listItem: {
    fontSize: 12,
    lineHeight: 1.5,
    marginBottom: 4,
    marginLeft: 48,
    flexDirection: "row",
  },
  listBullet: {
    width: 14,
    fontSize: 12,
  },
  listText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 1.5,
  },
  codeBlock: {
    fontFamily: "Courier",
    fontSize: 10,
    backgroundColor: "#f8fafc",
    padding: 10,
    borderRadius: 4,
    marginLeft: 36,
    marginBottom: 12,
    // react-pdf doesn't support border shorthand, use individual sides:
    borderLeftWidth: 1,
    borderLeftColor: "#e2e8f0",
    borderLeftStyle: "solid",
    borderRightWidth: 1,
    borderRightColor: "#e2e8f0",
    borderRightStyle: "solid",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    borderTopStyle: "solid",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    borderBottomStyle: "solid",
  },
  imageWrapper: {
    alignItems: "center",
    marginVertical: 16,
  },
  image: {
    maxWidth: CONTENT_W,
    maxHeight: 300,
    objectFit: "contain",
  },
  imageCaption: {
    fontSize: 11,
    fontFamily: "Times-Italic",
    marginTop: 6,
    color: "#4b5563",
    textAlign: "center",
  },
});

// ─── Numbering counter ───────────────────────────────────────────────────────
const getLabel = (b, cnt) => {
  if (b.type === "chapter")  { cnt.ch++; cnt.h1 = 0; cnt.h2 = 0; return `${cnt.ch}`; }
  if (b.type === "heading1") { cnt.h1++; cnt.h2 = 0; return `${cnt.ch}.${cnt.h1}`; }
  if (b.type === "heading2") { cnt.h2++; return `${cnt.ch}.${cnt.h1}.${cnt.h2}`; }
  return "";
};

// ─── Cover Page ──────────────────────────────────────────────────────────────
const CoverPage = ({ data }) => (
  <Page size="A4" style={s.page}>
    <View style={s.coverPage}>
      <Text style={s.coverInstitution}>
        {data.institutionName || "[INSTITUTION NAME]"}
      </Text>

      <Text style={s.coverSubtitle}>A Capstone Project Report</Text>

      <Text style={s.coverTitle}>
        {data.projectTitle || "[PROJECT TITLE]"}
      </Text>

      <Text style={s.coverLabel}>Submitted by</Text>
      {(data.students || []).map((st, i) => (
        <Text key={i} style={s.coverValue}>
          {st.name}{st.roll ? ` (${st.roll})` : ""}
        </Text>
      ))}

      <Text style={s.coverLabel}>Under the guidance of</Text>
      <Text style={s.coverValue}>{data.guideName || "[GUIDE NAME]"}</Text>

      <Text style={s.coverDept}>{data.department || "[DEPARTMENT]"}</Text>
      <Text style={s.coverYear}>{data.academicYear || "[ACADEMIC YEAR]"}</Text>
    </View>

    <Text style={s.pageNumber}>i</Text>
  </Page>
);

// ─── Table of Contents ───────────────────────────────────────────────────────
const TocPage = ({ blocks }) => {
  const tocCnt = { ch: 0, h1: 0, h2: 0 };
  const tocItems = (blocks || []).filter(
    (b) => b.type === "chapter" || b.type === "heading1"
  );

  return (
    <Page size="A4" style={s.page}>
      <Text style={s.tocTitle}>TABLE OF CONTENTS</Text>

      {tocItems.map((b, i) => {
        const label = getLabel(b, tocCnt);
        const isChapter = b.type === "chapter";
        return (
          <View key={i} style={s.tocRow}>
            <Text
              style={isChapter ? s.tocChapterText : s.tocHeadingText}
            >
              {label}.{" "}
              {b.title || (isChapter ? "Untitled Chapter" : "Untitled Heading")}
            </Text>
            <View style={s.tocDots} />
            <Text style={s.tocPage}>---</Text>
          </View>
        );
      })}

      <Text style={s.pageNumber}>ii</Text>
    </Page>
  );
};

// ─── Body: one Page per Chapter ─────────────────────────────────────────────
const BodyPages = ({ blocks }) => {
  // Group blocks: split on every "chapter" block (new page per chapter)
  const groups = [];
  let current = [];

  (blocks || []).forEach((b) => {
    if (b.type === "chapter" && current.length > 0) {
      groups.push(current);
      current = [];
    }
    current.push(b);
  });
  if (current.length > 0) groups.push(current);

  return groups.map((group, gIdx) => {
    const cnt = { ch: gIdx, h1: 0, h2: 0 }; // ch starts at group index

    // Re-derive correct chapter number by scanning all previous groups
    const allBlocks = blocks || [];
    const chaptersSoFar = allBlocks
      .slice(0, allBlocks.indexOf(group[0]))
      .filter((b) => b.type === "chapter").length;
    cnt.ch = chaptersSoFar;

    return (
      <Page key={gIdx} size="A4" style={s.page}>
        {group.map((b) => {
          const label = getLabel(b, cnt);

          if (b.type === "chapter") {
            return (
              <Text key={b.id} style={s.chapterTitle}>
                {label}. {b.title}
              </Text>
            );
          }

          if (b.type === "heading1") {
            return (
              <Text key={b.id} style={s.heading1}>
                {label} {b.title}
              </Text>
            );
          }

          if (b.type === "heading2") {
            return (
              <Text key={b.id} style={s.heading2}>
                {label} {b.title}
              </Text>
            );
          }

          if (b.type === "paragraph") {
            return (
              <Text key={b.id} style={s.paragraph}>
                {b.content}
              </Text>
            );
          }

          if (b.type === "list") {
            return (
              <View key={b.id}>
                {(b.content || "")
                  .split("\n")
                  .filter((l) => l.trim())
                  .map((line, li) => (
                    <View key={li} style={s.listItem}>
                      <Text style={s.listBullet}>•</Text>
                      <Text style={s.listText}>{line}</Text>
                    </View>
                  ))}
              </View>
            );
          }

          if (b.type === "code") {
            return (
              <Text key={b.id} style={s.codeBlock}>
                {b.content}
              </Text>
            );
          }

          if (b.type === "image" && b.src) {
            return (
              <View key={b.id} style={s.imageWrapper}>
                <Image src={b.src} style={s.image} />
                {b.title ? (
                  <Text style={s.imageCaption}>{b.title}</Text>
                ) : null}
              </View>
            );
          }

          return null;
        })}

        {/* Page number */}
        <Text
          style={s.pageNumber}
          render={({ pageNumber }) => `${pageNumber}`}
          fixed
        />
      </Page>
    );
  });
};

// ─── Root Document export ─────────────────────────────────────────────────────
export const CapstoneDocument = ({ data }) => (
  <Document
    title={data.projectTitle || "Capstone Report"}
    author={
      (data.students || []).map((s) => s.name).filter(Boolean).join(", ") ||
      "Author"
    }
  >
    <CoverPage data={data} />
    <TocPage blocks={data.blocks} />
    <BodyPages blocks={data.blocks} />
  </Document>
);
