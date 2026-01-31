#http://127.0.0.1:8002
from fastapi import FastAPI
from fpdf import FPDF
import uuid

app = FastAPI()

@app.get("/")
def root():
    return {"message": "Case Report API is running", "status": "healthy"}

@app.post("/report")
def generate_case_report(tourist_id: str, alert: str, last_location: str):
    filename = f"report_{uuid.uuid4().hex}.pdf"

    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=12)

    pdf.cell(200, 10, txt="Tourist Safety Incident Report", ln=True, align="C")
    pdf.ln(10)
    pdf.cell(200, 10, txt=f"Tourist ID: {tourist_id}", ln=True)
    pdf.cell(200, 10, txt=f"Alert: {alert}", ln=True)
    pdf.cell(200, 10, txt=f"Last Location: {last_location}", ln=True)

    pdf.output(filename)
    return {"status": "success", "file": filename}
