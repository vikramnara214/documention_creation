import PyPDF2

def extract_all(path):
    try:
        with open(path, 'rb') as f:
            r = PyPDF2.PdfReader(f)
            return "\n".join([p.extract_text() for p in r.pages])
    except Exception as e:
        return str(e)

with open("guidelines_extracted.txt", "w", encoding="utf-8") as f:
    f.write("=== GUIDELINES ===\n")
    f.write(extract_all(r"C:\Users\Nara Vikram\Downloads\my_imporant\reviews\Formatting Guidelines for Cornerstone Project Report.pdf"))
    f.write("\n\n=== CONTENTS ===\n")
    f.write(extract_all(r"C:\Users\Nara Vikram\Downloads\my_imporant\reviews\Final project report contents.pdf"))

print("Extracted to guidelines_extracted.txt")
