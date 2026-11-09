# http://127.0.0.1:8002
from fastapi import Depends, FastAPI, HTTPException
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from auth import require_token
from pydantic import BaseModel, Field
from typing import Optional
import base64
from html import escape
import io
import uuid
from datetime import datetime

from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import cm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.enums import TA_CENTER, TA_LEFT

app = FastAPI(title="Travira Case Report Service", version="2.0.0")


@app.exception_handler(HTTPException)
async def http_error_handler(_request, exc: HTTPException):
    code = {400: "BAD_REQUEST", 401: "UNAUTHENTICATED", 403: "FORBIDDEN", 500: "INTERNAL_ERROR", 503: "SERVICE_UNAVAILABLE"}.get(exc.status_code, "REQUEST_FAILED")
    return JSONResponse(status_code=exc.status_code, content={"error": str(exc.detail), "code": code})


@app.exception_handler(RequestValidationError)
async def validation_error_handler(_request, exc: RequestValidationError):
    return JSONResponse(status_code=400, content={
        "error": "Request validation failed",
        "code": "VALIDATION_ERROR",
        "details": [{"field": ".".join(map(str, issue["loc"])), "message": issue["msg"]} for issue in exc.errors()],
    })


@app.exception_handler(Exception)
async def unexpected_error_handler(_request, _exc: Exception):
    return JSONResponse(status_code=500, content={"error": "Internal server error", "code": "INTERNAL_ERROR"})

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class IncidentReport(BaseModel):
    incident_id: str = Field(min_length=1, max_length=80)
    type: str = Field(min_length=1, max_length=80)
    location: str = Field(min_length=1, max_length=300)
    severity: str = Field(min_length=1, max_length=30)
    description: str = Field(min_length=1, max_length=5000)
    tourist_name: Optional[str] = Field(default="Unknown", max_length=120)
    tourist_id: Optional[str] = Field(default="-", max_length=80)
    officer_name: Optional[str] = Field(default="Unassigned", max_length=120)
    timestamp: Optional[str] = Field(default=None, max_length=80)
    safety_score_at_time: Optional[float] = Field(default=None, ge=0, le=100)
    coordinates: Optional[str] = Field(default=None, max_length=100)
    blockchain_hash: Optional[str] = Field(default=None, max_length=200)
    status: Optional[str] = Field(default="Open", max_length=40)


@app.get("/")
def root():
    return {"message": "Travira Case Report API is running", "status": "healthy", "version": "2.0.0"}


@app.post("/report")
def generate_case_report(report: IncidentReport, _user=Depends(require_token)):
    """Generate a structured E-FIR PDF and return it as a base64-encoded string."""
    try:
        buf = io.BytesIO()
        doc = SimpleDocTemplate(
            buf,
            pagesize=A4,
            rightMargin=2 * cm,
            leftMargin=2 * cm,
            topMargin=2 * cm,
            bottomMargin=2 * cm,
        )

        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            "TitleStyle",
            parent=styles["Title"],
            fontSize=18,
            spaceAfter=6,
            textColor=colors.HexColor("#1e3a5f"),
            alignment=TA_CENTER,
        )
        subtitle_style = ParagraphStyle(
            "SubtitleStyle",
            parent=styles["Normal"],
            fontSize=10,
            textColor=colors.grey,
            alignment=TA_CENTER,
            spaceAfter=12,
        )
        section_style = ParagraphStyle(
            "SectionStyle",
            parent=styles["Heading2"],
            fontSize=11,
            textColor=colors.HexColor("#1e3a5f"),
            spaceBefore=14,
            spaceAfter=4,
        )
        body_style = ParagraphStyle(
            "BodyStyle",
            parent=styles["Normal"],
            fontSize=10,
            leading=14,
        )

        severity_color = {
            "Low": colors.HexColor("#16a34a"),
            "Medium": colors.HexColor("#d97706"),
            "High": colors.HexColor("#dc2626"),
            "Critical": colors.HexColor("#7c3aed"),
        }.get(report.severity, colors.grey)

        timestamp_str = report.timestamp or datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
        fir_number = f"FIR-{report.incident_id}-{uuid.uuid4().hex[:6].upper()}"
        generated_at = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")

        story = []

        # ── Header ──────────────────────────────────────────────────────────────
        story.append(Paragraph("FIRST INFORMATION REPORT", title_style))
        story.append(Paragraph("Travira AI-Powered Tourist Safety System", subtitle_style))
        story.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor("#1e3a5f")))
        story.append(Spacer(1, 0.3 * cm))

        # FIR meta table
        meta_data = [
            ["FIR Number", fir_number, "Generated At", generated_at],
            ["Incident ID", report.incident_id, "Status", report.status],
        ]
        meta_table = Table(meta_data, colWidths=[3.5 * cm, 6.5 * cm, 3.5 * cm, 4.5 * cm])
        meta_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#e8f0fe")),
            ("BACKGROUND", (2, 0), (2, -1), colors.HexColor("#e8f0fe")),
            ("FONTNAME", (0, 0), (-1, -1), "Helvetica"),
            ("FONTSIZE", (0, 0), (-1, -1), 9),
            ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
            ("FONTNAME", (2, 0), (2, -1), "Helvetica-Bold"),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
            ("PADDING", (0, 0), (-1, -1), 5),
        ]))
        story.append(meta_table)
        story.append(Spacer(1, 0.4 * cm))

        # ── Incident Details ─────────────────────────────────────────────────────
        story.append(Paragraph("1. Incident Details", section_style))
        inc_data = [
            ["Type", report.type],
            ["Severity", report.severity],
            ["Location", report.location],
            ["Coordinates", report.coordinates or "Not available"],
            ["Date & Time", timestamp_str],
        ]
        inc_table = Table(inc_data, colWidths=[4.5 * cm, 13.5 * cm])
        inc_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#f1f5f9")),
            ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
            ("FONTNAME", (1, 0), (1, -1), "Helvetica"),
            ("FONTSIZE", (0, 0), (-1, -1), 9),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
            ("PADDING", (0, 0), (-1, -1), 5),
            # Colour the severity cell
            ("TEXTCOLOR", (1, 1), (1, 1), severity_color),
            ("FONTNAME", (1, 1), (1, 1), "Helvetica-Bold"),
        ]))
        story.append(inc_table)

        # ── Tourist Information ──────────────────────────────────────────────────
        story.append(Paragraph("2. Tourist Information", section_style))
        tourist_data = [
            ["Tourist Name", report.tourist_name],
            ["Tourist ID", report.tourist_id],
            ["Safety Score at Time", f"{report.safety_score_at_time:.1f} / 100" if report.safety_score_at_time is not None else "N/A"],
        ]
        tourist_table = Table(tourist_data, colWidths=[4.5 * cm, 13.5 * cm])
        tourist_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#f1f5f9")),
            ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
            ("FONTNAME", (1, 0), (1, -1), "Helvetica"),
            ("FONTSIZE", (0, 0), (-1, -1), 9),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
            ("PADDING", (0, 0), (-1, -1), 5),
        ]))
        story.append(tourist_table)

        # ── Description ─────────────────────────────────────────────────────────
        story.append(Paragraph("3. Incident Description", section_style))
        story.append(Paragraph(escape(report.description), body_style))

        # ── Officer ─────────────────────────────────────────────────────────────
        story.append(Paragraph("4. Assigned Officer", section_style))
        story.append(Paragraph(escape(report.officer_name or "Unassigned"), body_style))

        # ── Blockchain ──────────────────────────────────────────────────────────
        if report.blockchain_hash:
            story.append(Paragraph("5. Blockchain Verification", section_style))
            story.append(Paragraph(
                f"This incident has been anchored to the blockchain.<br/>"
                f"<b>Hash:</b> {escape(report.blockchain_hash)}",
                body_style,
            ))

        # ── Footer ──────────────────────────────────────────────────────────────
        story.append(Spacer(1, 1 * cm))
        story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#cbd5e1")))
        story.append(Spacer(1, 0.2 * cm))
        story.append(Paragraph(
            "This document is auto-generated by Travira AI Safety Platform. "
            "It is admissible as a First Information Report under applicable law.",
            ParagraphStyle("Footer", parent=styles["Normal"], fontSize=7, textColor=colors.grey, alignment=TA_CENTER),
        ))

        doc.build(story)

        pdf_bytes = buf.getvalue()
        pdf_b64 = base64.b64encode(pdf_bytes).decode("utf-8")

        return {
            "status": "success",
            "incident_id": report.incident_id,
            "fir_number": fir_number,
            "pdf_base64": pdf_b64,
            "generated_at": generated_at,
        }

    except Exception:
        raise HTTPException(status_code=500, detail="PDF generation failed")
