import sys
import os

try:
    import PyPDF2
except ImportError:
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "PyPDF2"])
    import PyPDF2

def extract_text(pdf_path):
    try:
        with open(pdf_path, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            text = ''
            for page in reader.pages:
                text += page.extract_text() + '\n'
            return text
    except Exception as e:
        return str(e)

print("--- Guidelines ---")
print(extract_text(r"C:\Users\Nara Vikram\Downloads\my_imporant\reviews\Formatting Guidelines for Cornerstone Project Report.pdf")[:2500])

print("\n--- Contents ---")
print(extract_text(r"C:\Users\Nara Vikram\Downloads\my_imporant\reviews\Final project report contents.pdf")[:2500])
