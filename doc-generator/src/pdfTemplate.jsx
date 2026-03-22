/**
 * pdfTemplate.jsx
 *
 * Drop this file into  doc-generator/src/pdfTemplate.jsx
 * (replace whatever was there before).
 *
 * Implements Cornerstone Project Report Formatting Guidelines:
 *   §1  A4 Portrait
 *   §2  Margins: Top 1in | Bottom 1in | Left 1.5in (binding) | Right 1in
 *   §3  Font: Times New Roman throughout
 *   §4  Chapter 16pt Bold UPPERCASE | H1 14pt Bold | H2 12pt Bold
 *       Normal 12pt Regular | Captions 11pt Bold Italic
 *   §5  Normal text 1.5× spacing | Headings single spacing | 6pt after §
 *   §6  Normal text Justified | Chapter headings Centered | Section headings Left
 *   §7  First-line indent 0.5in | 6pt paragraph spacing
 *   §8  Each chapter starts on a new page
 *   §9  Page numbers bottom-center; Roman (i,ii…) prelims; Arabic (1,2…) body
 *   §12 Code: Courier New, 10pt
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

// Margins per Cornerstone guidelines:
//   Top: 1 inch = 72 pt
//   Bottom: 1 inch = 72 pt
//   Left: 1.5 inches (binding) = 108 pt
//   Right: 1 inch = 72 pt
const M_TOP    = 72;
const M_BOTTOM = 72;
const M_LEFT   = 108;
const M_RIGHT  = 72;
const CONTENT_W = PAGE_W - M_LEFT - M_RIGHT;   // 595.28 - 108 - 72 = ~415 pt

// ─── Styles (Cornerstone Formatting Guidelines) ──────────────────────────────
//
//  Font sizes:
//    Chapter titles  → 16 pt, Bold, UPPERCASE, center-aligned
//    Main headings   → 14 pt, Bold, left-aligned          (1.1, 2.1 …)
//    Sub-headings    → 12 pt, Bold, left-aligned          (1.1.1 …)
//    Normal text     → 12 pt, Regular, justified
//    Table headings  → 12 pt, Bold
//    Figure captions → 11 pt, Bold, Italic, center
//    Code            → Courier New, 10–11 pt
//
//  Spacing:
//    Normal text     → 1.5 line spacing
//    Headings        → single (1.0) line spacing
//    Between §       → 6 pt after paragraph + one blank line (≈ marginBottom 18 pt)
//    First-line indent → 0.5 inch = 36 pt
//
//  Page numbers: bottom-center; Roman for prelims, Arabic for chapters
//
const s = StyleSheet.create({
  page: {
    fontFamily: "Times-Roman",
    fontSize: 12,
    paddingTop:    M_TOP,
    paddingBottom: M_BOTTOM + 24,   // extra room for page-number footer
    paddingLeft:   M_LEFT,
    paddingRight:  M_RIGHT,
    color: "#000000",
    backgroundColor: "#ffffff",
  },

  // ── Page number – bottom center ──────────────────────────────────────────
  pageNumber: {
    position: "absolute",
    bottom: 24,          // sits within the 1-inch bottom margin
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 12,
    color: "#000000",
    fontFamily: "Times-Roman",
  },

  // ── Cover page ───────────────────────────────────────────────────────────
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
    lineHeight: 1,
    marginBottom: 8,
  },
  coverSubtitle: {
    fontSize: 14,
    fontFamily: "Times-Roman",
    textAlign: "center",
    lineHeight: 1,
    marginTop: 32,
    marginBottom: 8,
  },
  coverTitle: {
    fontSize: 16,
    fontFamily: "Times-Bold",
    textAlign: "center",
    textTransform: "uppercase",
    lineHeight: 1,
    marginTop: 16,
    marginBottom: 24,
  },
  coverLabel: {
    fontSize: 12,
    fontFamily: "Times-Roman",
    textAlign: "center",
    lineHeight: 1,
    marginTop: 24,
  },
  coverValue: {
    fontSize: 12,
    fontFamily: "Times-Roman",
    textAlign: "center",
    lineHeight: 1,
    marginTop: 4,
  },
  coverDept: {
    fontSize: 12,
    fontFamily: "Times-Roman",
    textAlign: "center",
    textTransform: "uppercase",
    lineHeight: 1,
    marginTop: 24,
  },
  coverYear: {
    fontSize: 12,
    fontFamily: "Times-Roman",
    textAlign: "center",
    lineHeight: 1,
    marginTop: 4,
  },

  // ── Table of Contents ────────────────────────────────────────────────────
  tocTitle: {
    // Treated as a chapter-level heading: 16 pt Bold UPPERCASE center
    fontSize: 16,
    fontFamily: "Times-Bold",
    textTransform: "uppercase",
    textAlign: "center",
    lineHeight: 1,           // single spacing for headings
    marginBottom: 24,
    marginTop: 8,
  },
  tocRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 6,
  },
  tocChapterText: {
    fontSize: 12,
    fontFamily: "Times-Bold",
    lineHeight: 1,
  },
  tocHeadingText: {
    fontSize: 12,
    fontFamily: "Times-Roman",
    lineHeight: 1,
    paddingLeft: 16,
  },
  tocDots: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomStyle: "dotted",
    borderBottomColor: "#000000",
    marginBottom: 3,
    marginLeft: 6,
    marginRight: 6,
  },
  tocPage: {
    fontSize: 12,
    fontFamily: "Times-Roman",
    color: "#000000",
  },

  // ── Body content ─────────────────────────────────────────────────────────

  // Chapter title: 16 pt Bold UPPERCASE center-aligned, single spacing
  chapterTitle: {
    fontSize: 16,
    fontFamily: "Times-Bold",
    textTransform: "uppercase",
    textAlign: "center",          // §6: chapter headings center-aligned
    lineHeight: 1,                // §5: headings single spacing
    marginBottom: 18,             // one blank line worth of space after
    marginTop: 4,
  },

  // Main heading (1.1): 14 pt Bold left-aligned, single spacing
  heading1: {
    fontSize: 14,
    fontFamily: "Times-Bold",
    textAlign: "left",            // §6: section headings left-aligned
    lineHeight: 1,                // §5: headings single spacing
    marginTop: 18,                // one blank line before
    marginBottom: 6,
  },

  // Sub-heading (1.1.1): 12 pt Bold left-aligned, single spacing
  heading2: {
    fontSize: 12,
    fontFamily: "Times-Bold",
    textAlign: "left",            // §6: section headings left-aligned
    lineHeight: 1,                // §5: headings single spacing
    marginTop: 12,
    marginBottom: 6,
  },

  // Normal text: 12 pt Regular, justified, 1.5 line spacing
  // First-line indent: 0.5 inch = 36 pt  (§7)
  // 6 pt after paragraph + ~12 pt blank line = 18 pt total bottom margin (§7)
  paragraph: {
    fontSize: 12,
    fontFamily: "Times-Roman",
    lineHeight: 1.5,              // §5: 1.5 line spacing
    textAlign: "justify",         // §6: normal text justified
    textIndent: 36,               // §7: 0.5 inch first-line indent
    marginBottom: 18,             // §7: 6 pt after + one blank line
  },

  // List items: 12 pt Regular, 1.5 spacing, justified, indented
  listItem: {
    fontSize: 12,
    fontFamily: "Times-Roman",
    lineHeight: 1.5,
    marginBottom: 6,
    marginLeft: 36,               // align with paragraph indent
    flexDirection: "row",
  },
  listBullet: {
    width: 16,
    fontSize: 12,
    fontFamily: "Times-Roman",
  },
  listText: {
    flex: 1,
    fontSize: 12,
    fontFamily: "Times-Roman",
    lineHeight: 1.5,
    textAlign: "justify",
  },

  // Code: Courier New 10 pt (§12: Java code, Courier New, 10–11 pt)
  codeBlock: {
    fontFamily: "Courier",        // react-pdf built-in Courier = Courier New
    fontSize: 10,                 // §12: 10 or 11 pt
    lineHeight: 1.3,
    backgroundColor: "#f8fafc",
    padding: 10,
    marginBottom: 18,
    borderLeftWidth: 1,
    borderLeftColor: "#cccccc",
    borderLeftStyle: "solid",
    borderRightWidth: 1,
    borderRightColor: "#cccccc",
    borderRightStyle: "solid",
    borderTopWidth: 1,
    borderTopColor: "#cccccc",
    borderTopStyle: "solid",
    borderBottomWidth: 1,
    borderBottomColor: "#cccccc",
    borderBottomStyle: "solid",
  },

  // Images / screenshots (§11)
  imageWrapper: {
    alignItems: "center",
    marginVertical: 16,
  },
  image: {
    maxWidth: CONTENT_W,
    maxHeight: 300,
    objectFit: "contain",
  },
  // Figure caption: 11 pt Bold Italic center (§4 + §11)
  imageCaption: {
    fontSize: 11,
    fontFamily: "Times-BoldItalic",
    textAlign: "center",
    marginTop: 6,
    marginBottom: 12,
  },

  // Table title: 12 pt Bold center (§4 + §10)
  tableTitle: {
    fontSize: 12,
    fontFamily: "Times-Bold",
    textAlign: "center",
    marginBottom: 6,
    marginTop: 12,
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

// ─── Body: single flowing Page – react-pdf handles overflow automatically ────
//
// KEY FIX: Do NOT create one <Page> per chapter. Instead render ALL blocks
// inside ONE <Page> with `wrap` enabled (the default). react-pdf will insert
// real page breaks whenever content overflows the physical page height.
//
// §8 "each chapter starts on a new page" is achieved with
//   break="before"  on the chapter-title <View>, which is the react-pdf way
//   to say "always start this element on a fresh page".
//
const BodyPages = ({ blocks }) => {
  const cnt = { ch: 0, h1: 0, h2: 0 };

  return (
    <Page size="A4" style={s.page} wrap>

      {/* Arabic page numbers – auto-incremented by react-pdf (§9)          */}
      {/* Offset by -2 because cover=page1, toc=page2, body starts at 3     */}
      <Text
        style={s.pageNumber}
        render={({ pageNumber }) => String(pageNumber - 2)}
        fixed
      />

      {(blocks || []).map((b) => {
        const label = getLabel(b, cnt);

        // ── Chapter title ──────────────────────────────────────────────────
        // break="before" forces a new page before every chapter (§8).
        // The first chapter gets break="before" too – react-pdf ignores it
        // when the element is already at the very top of the first page.
        if (b.type === "chapter") {
          return (
            <View key={b.id} break>
              <Text style={s.chapterTitle}>
                {label}. {b.title}
              </Text>
            </View>
          );
        }

        if (b.type === "page_break") {
          return <View key={b.id} break />;
        }

        // ── Main heading (1.1) ─────────────────────────────────────────────
        // wrap={false} keeps heading glued to the content that follows it.
        if (b.type === "heading1") {
          return (
            <Text key={b.id} style={s.heading1} wrap={false}>
              {label} {b.title}
            </Text>
          );
        }

        // ── Sub-heading (1.1.1) ────────────────────────────────────────────
        if (b.type === "heading2") {
          return (
            <Text key={b.id} style={s.heading2} wrap={false}>
              {label} {b.title}
            </Text>
          );
        }

        // ── Paragraph ──────────────────────────────────────────────────────
        if (b.type === "paragraph") {
          return (
            <Text key={b.id} style={s.paragraph}>
              {b.content}
            </Text>
          );
        }

        // ── Bullet list ────────────────────────────────────────────────────
        if (b.type === "list") {
          return (
            <View key={b.id}>
              {(b.content || "")
                .split("\n")
                .filter((l) => l.trim())
                .map((line, li) => (
                  <View key={li} style={s.listItem} wrap={false}>
                    <Text style={s.listBullet}>•</Text>
                    <Text style={s.listText}>{line}</Text>
                  </View>
                ))}
            </View>
          );
        }

        // ── Code block ─────────────────────────────────────────────────────
        if (b.type === "code") {
          return (
            <Text key={b.id} style={s.codeBlock}>
              {b.content}
            </Text>
          );
        }

        // ── Image / screenshot ─────────────────────────────────────────────
        if (b.type === "image" && b.src) {
          return (
            <View key={b.id} style={s.imageWrapper} wrap={false}>
              <Image src={b.src} style={s.image} />
              {b.title ? (
                <Text style={s.imageCaption}>{b.title}</Text>
              ) : null}
            </View>
          );
        }

        return null;
      })}
    </Page>
  );
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
