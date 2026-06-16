from io import BytesIO
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib.units import cm


def money(value: float) -> str:
    return f"R$ {value:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")


def generate_budget_pdf(company, budget):
    buffer = BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4

    y = height - 2 * cm

    pdf.setFont("Helvetica-Bold", 16)
    pdf.drawString(2 * cm, y, company.name if company else "Marcenaria")
    y -= 0.7 * cm

    pdf.setFont("Helvetica", 9)
    if company:
        pdf.drawString(2 * cm, y, f"Documento: {company.document or '-'}")
        y -= 0.4 * cm
        pdf.drawString(2 * cm, y, f"Telefone/WhatsApp: {company.whatsapp or company.phone or '-'}")
        y -= 0.4 * cm
        pdf.drawString(2 * cm, y, f"E-mail: {company.email or '-'}")
        y -= 0.4 * cm
        pdf.drawString(2 * cm, y, f"Endereço: {company.address or '-'}")

    y -= 1 * cm

    pdf.setFont("Helvetica-Bold", 14)
    pdf.drawString(2 * cm, y, f"ORÇAMENTO Nº {budget.id}")
    y -= 0.8 * cm

    pdf.setFont("Helvetica", 10)
    pdf.drawString(2 * cm, y, f"Cliente: {budget.client.name}")
    y -= 0.5 * cm
    pdf.drawString(2 * cm, y, f"Telefone: {budget.client.phone or '-'}")
    y -= 0.5 * cm
    pdf.drawString(2 * cm, y, f"Endereço: {budget.client.address or '-'}")
    y -= 0.8 * cm

    pdf.setFont("Helvetica-Bold", 11)
    pdf.drawString(2 * cm, y, budget.title)
    y -= 0.5 * cm

    pdf.setFont("Helvetica", 10)
    pdf.drawString(2 * cm, y, f"Ambiente: {budget.environment or '-'}")
    y -= 0.5 * cm
    pdf.drawString(2 * cm, y, f"Descrição: {budget.description or '-'}")
    y -= 0.9 * cm

    pdf.setFont("Helvetica-Bold", 10)
    pdf.drawString(2 * cm, y, "Item")
    pdf.drawString(10 * cm, y, "Qtd")
    pdf.drawString(12 * cm, y, "Unitário")
    pdf.drawString(15 * cm, y, "Subtotal")
    y -= 0.4 * cm

    pdf.line(2 * cm, y, 19 * cm, y)
    y -= 0.5 * cm

    pdf.setFont("Helvetica", 9)
    for item in budget.items:
        pdf.drawString(2 * cm, y, item.description[:45])
        pdf.drawString(10 * cm, y, str(item.quantity))
        pdf.drawString(12 * cm, y, money(item.unit_price))
        pdf.drawString(15 * cm, y, money(item.subtotal))
        y -= 0.5 * cm

    y -= 0.5 * cm
    pdf.line(11 * cm, y, 19 * cm, y)
    y -= 0.6 * cm

    subtotal = sum(item.subtotal for item in budget.items)

    pdf.setFont("Helvetica", 10)
    pdf.drawString(12 * cm, y, "Subtotal:")
    pdf.drawString(16 * cm, y, money(subtotal))
    y -= 0.5 * cm

    pdf.drawString(12 * cm, y, "Desconto:")
    pdf.drawString(16 * cm, y, money(budget.discount))
    y -= 0.5 * cm

    pdf.drawString(12 * cm, y, "Acréscimo/Frete:")
    pdf.drawString(16 * cm, y, money(budget.extra_cost))
    y -= 0.5 * cm

    pdf.setFont("Helvetica-Bold", 12)
    pdf.drawString(12 * cm, y, "Total:")
    pdf.drawString(16 * cm, y, money(budget.total))
    y -= 1 * cm

    pdf.setFont("Helvetica", 10)
    pdf.drawString(2 * cm, y, f"Prazo de entrega: {budget.delivery_time or '-'}")
    y -= 0.5 * cm
    pdf.drawString(2 * cm, y, f"Forma de pagamento: {budget.payment_method or '-'}")
    y -= 0.5 * cm
    pdf.drawString(2 * cm, y, f"Validade: {budget.validity or '-'}")
    y -= 0.8 * cm

    pdf.drawString(2 * cm, y, f"Observações: {budget.notes or '-'}")

    pdf.showPage()
    pdf.save()

    buffer.seek(0)
    return buffer
