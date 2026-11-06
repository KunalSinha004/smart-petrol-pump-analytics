import io
import csv
from typing import List, Dict, Any
from reportlab.lib.pagesizes import letter, landscape
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from app.snowflake.mock_data import FUEL_SALES_DATA, INVENTORY_DATA, EXPENSES_DATA, EMPLOYEES_DATA

class ReportsService:
    def __init__(self):
        pass

    def export_sales_csv(self) -> str:
        output = io.StringIO()
        if not FUEL_SALES_DATA:
            return ""
        writer = csv.DictWriter(output, fieldnames=list(FUEL_SALES_DATA[0].keys()))
        writer.writeheader()
        writer.writerows(FUEL_SALES_DATA)
        return output.getvalue()

    def export_inventory_csv(self) -> str:
        output = io.StringIO()
        if not INVENTORY_DATA:
            return ""
        writer = csv.DictWriter(output, fieldnames=list(INVENTORY_DATA[0].keys()))
        writer.writeheader()
        writer.writerows(INVENTORY_DATA)
        return output.getvalue()

    def export_sales_pdf(self) -> bytes:
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=landscape(letter), rightMargin=30, leftMargin=30, topMargin=30, bottomMargin=30)
        styles = getSampleStyleSheet()
        
        elements = []
        
        # Title
        title_style = ParagraphStyle(
            name="TitleStyle",
            parent=styles["Heading1"],
            fontSize=18,
            leading=22,
            textColor=colors.HexColor("#064E3B"), # Emerald Dark
            spaceAfter=10
        )
        sub_style = ParagraphStyle(
            name="SubStyle",
            parent=styles["Normal"],
            fontSize=10,
            leading=14,
            textColor=colors.HexColor("#4B5563"),
            spaceAfter=15
        )
        
        elements.append(Paragraph("SMART PETROL PUMP ANALYTICS - SALES AUDIT REPORT", title_style))
        elements.append(Paragraph("Verified Snowflake Foundation (SPPA_WH / SMART_PETROL_DB.SALES_MANAGEMENT)", sub_style))
        elements.append(Spacer(1, 10))
        
        # Table of top 25 sales
        headers = ["Sale ID", "Date", "Shift", "Pump", "Operator", "Fuel", "Qty (L)", "Price", "Amount (Rs)", "Profit", "Payment"]
        data = [headers]
        
        for s in FUEL_SALES_DATA[:25]:
            data.append([
                s.get("SALE_ID", ""),
                s.get("SALE_DATE", ""),
                s.get("SHIFT_TYPE", ""),
                s.get("PUMP_ID", ""),
                s.get("OPERATOR_ID", ""),
                s.get("FUEL_TYPE_ID", ""),
                f"{s.get('QUANTITY_LITRES', 0):.1f}",
                f"{s.get('SELLING_PRICE', 0):.2f}",
                f"{s.get('SALES_AMOUNT', 0):.2f}",
                f"{s.get('GROSS_PROFIT', 0):.2f}",
                s.get("PAYMENT_METHOD", "")
            ])
            
        table = Table(data, repeatRows=1)
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#065F46")), # Emerald 800
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 9),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 6),
            ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor("#F9FAFB")),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#E5E7EB")),
            ('FONTSIZE', (0, 1), (-1, -1), 8),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]))
        
        elements.append(table)
        doc.build(elements)
        buffer.seek(0)
        return buffer.getvalue()

reports_service = ReportsService()
