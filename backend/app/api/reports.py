from fastapi import APIRouter, Depends, Response
from app.services.reports_service import reports_service
from app.security.auth import get_current_user, User

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get("/sales/csv")
def download_sales_csv(current_user: User = Depends(get_current_user)):
    csv_content = reports_service.export_sales_csv()
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=sales_report.csv"}
    )

@router.get("/inventory/csv")
def download_inventory_csv(current_user: User = Depends(get_current_user)):
    csv_content = reports_service.export_inventory_csv()
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=inventory_report.csv"}
    )

@router.get("/sales/pdf")
def download_sales_pdf(current_user: User = Depends(get_current_user)):
    pdf_bytes = reports_service.export_sales_pdf()
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=sales_audit_report.pdf"}
    )
