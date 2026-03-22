import PyPDF2
import os

pdf_path = r"C:\Users\Nara Vikram\AppData\Local\Packages\5319275A.WhatsAppDesktop_cv1g1gvanyjgm\LocalState\sessions\E6E88DD49EA3E6FB2684F945C9E9FB7D2EF0FB84\transfers\2026-12\Formatting Guidelines for Cornerstone Project Report.pdf"
output_path = r"c:\Users\Nara Vikram\OneDrive\Documents\24B11AI290\my projects\Documentaion_format\guide_extracted.txt"

def extract_pdf():
    try:
        if not os.path.exists(pdf_path):
            print(f"File not found: {pdf_path}")
            return
        
        with open(pdf_path, 'rb') as f:
            reader = PyPDF2.PdfReader(f)
            text = []
            for i, page in enumerate(reader.pages):
                text.append(f"--- Page {i+1} ---")
                text.append(page.extract_text())
            
            with open(output_path, 'w', encoding='utf-8') as out:
                out.write("\n\n".join(text))
            
            print(f"Extracted to {output_path}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    extract_pdf()
