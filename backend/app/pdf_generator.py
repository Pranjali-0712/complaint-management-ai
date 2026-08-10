from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)


def generate_pdf(data, filename):
    """
    Generate a professional pharmaceutical complaint report PDF.
    """

    doc = SimpleDocTemplate(
        filename,
        pagesize=A4,
        rightMargin=18 * mm,
        leftMargin=18 * mm,
        topMargin=18 * mm,
        bottomMargin=18 * mm,
    )

    styles = getSampleStyleSheet()

    # -------------------------
    # Custom Styles
    # -------------------------

    title_style = ParagraphStyle(
        "TitleStyle",
        parent=styles["Title"],
        fontName="Helvetica-Bold",
        fontSize=20,
        leading=24,
        alignment=TA_CENTER,
        spaceAfter=6,
    )

    subtitle_style = ParagraphStyle(
        "SubtitleStyle",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        leading=12,
        alignment=TA_CENTER,
        spaceAfter=15,
    )

    section_style = ParagraphStyle(
        "SectionStyle",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=12,
        leading=15,
        spaceBefore=10,
        spaceAfter=6,
    )

    label_style = ParagraphStyle(
        "LabelStyle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=9,
        leading=12,
    )

    value_style = ParagraphStyle(
        "ValueStyle",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        leading=12,
    )

    normal_style = ParagraphStyle(
        "NormalStyle",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        leading=13,
    )

    # -------------------------
    # Helper function
    # -------------------------

    def value(key):
        result = data.get(key, "")

        if result is None:
            return ""

        return str(result)

    def make_table(rows, widths=None):
        table = Table(rows, colWidths=widths, repeatRows=1)

        table.setStyle(
            TableStyle(
                [
                    (
                        "BACKGROUND",
                        (0, 0),
                        (-1, 0),
                        colors.HexColor("#17365D"),
                    ),
                    (
                        "TEXTCOLOR",
                        (0, 0),
                        (-1, 0),
                        colors.white,
                    ),
                    (
                        "FONTNAME",
                        (0, 0),
                        (-1, 0),
                        "Helvetica-Bold",
                    ),
                    (
                        "FONTSIZE",
                        (0, 0),
                        (-1, -1),
                        9,
                    ),
                    (
                        "GRID",
                        (0, 0),
                        (-1, -1),
                        0.5,
                        colors.HexColor("#B7B7B7"),
                    ),
                    (
                        "VALIGN",
                        (0, 0),
                        (-1, -1),
                        "TOP",
                    ),
                    (
                        "LEFTPADDING",
                        (0, 0),
                        (-1, -1),
                        7,
                    ),
                    (
                        "RIGHTPADDING",
                        (0, 0),
                        (-1, -1),
                        7,
                    ),
                    (
                        "TOPPADDING",
                        (0, 0),
                        (-1, -1),
                        6,
                    ),
                    (
                        "BOTTOMPADDING",
                        (0, 0),
                        (-1, -1),
                        6,
                    ),
                ]
            )
        )

        return table

    # -------------------------
    # Document content
    # -------------------------

    story = []

    # Title
    story.append(
        Paragraph(
            "PHARMA COMPLAINT REPORT",
            title_style,
        )
    )

    story.append(
        Paragraph(
            "AI-Assisted Complaint Intake and Case Review",
            subtitle_style,
        )
    )

    # -------------------------
    # Complaint Identification
    # -------------------------

    story.append(
        Paragraph(
            "Complaint Information",
            section_style,
        )
    )

    complaint_info = [
        [
            Paragraph("Complaint Number", label_style),
            Paragraph(value("complaint_number"), value_style),
            Paragraph("Complaint Date", label_style),
            Paragraph(value("complaint_date"), value_style),
        ],
    ]

    table = Table(
        complaint_info,
        colWidths=[38 * mm, 48 * mm, 38 * mm, 48 * mm],
    )

    table.setStyle(
        TableStyle(
            [
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#B7B7B7")),
                ("BACKGROUND", (0, 0), (0, 0), colors.HexColor("#EAF2F8")),
                ("BACKGROUND", (2, 0), (2, 0), colors.HexColor("#EAF2F8")),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 7),
                ("RIGHTPADDING", (0, 0), (-1, -1), 7),
                ("TOPPADDING", (0, 0), (-1, -1), 7),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
            ]
        )
    )

    story.append(table)
    story.append(Spacer(1, 8))

    # -------------------------
    # Customer Information
    # -------------------------

    story.append(
        Paragraph(
            "1. Customer Information",
            section_style,
        )
    )

    customer_rows = [
        [
            Paragraph("Field", label_style),
            Paragraph("Value", label_style),
        ],
        [
            Paragraph("Customer Name", label_style),
            Paragraph(value("customer_name"), value_style),
        ],
        [
            Paragraph("Country", label_style),
            Paragraph(value("country"), value_style),
        ],
        [
            Paragraph("Received Through", label_style),
            Paragraph(value("received_through"), value_style),
        ],
    ]

    story.append(
        make_table(
            customer_rows,
            [55 * mm, 117 * mm],
        )
    )

    # -------------------------
    # Product Information
    # -------------------------

    story.append(
        Paragraph(
            "2. Product Information",
            section_style,
        )
    )

    product_rows = [
        [
            Paragraph("Field", label_style),
            Paragraph("Value", label_style),
        ],
        [
            Paragraph("Product Name", label_style),
            Paragraph(value("product_name"), value_style),
        ],
        [
            Paragraph("Batch Number", label_style),
            Paragraph(value("batch_number"), value_style),
        ],
        [
            Paragraph("Manufacturing Date", label_style),
            Paragraph(value("manufacturing_date"), value_style),
        ],
    ]

    story.append(
        make_table(
            product_rows,
            [55 * mm, 117 * mm],
        )
    )

    # -------------------------
    # Complaint Details
    # -------------------------

    story.append(
        Paragraph(
            "3. Complaint Details",
            section_style,
        )
    )

    complaint_rows = [
        [
            Paragraph("Field", label_style),
            Paragraph("Value", label_style),
        ],
        [
            Paragraph("Complaint Category", label_style),
            Paragraph(value("complaint_category"), value_style),
        ],
        [
            Paragraph("Severity", label_style),
            Paragraph(value("severity"), value_style),
        ],
        [
            Paragraph("Complaint Description", label_style),
            Paragraph(value("complaint_description"), value_style),
        ],
        [
            Paragraph("Remarks", label_style),
            Paragraph(value("remarks"), value_style),
        ],
    ]

    story.append(
        make_table(
            complaint_rows,
            [55 * mm, 117 * mm],
        )
    )

    # -------------------------
    # Risk Assessment
    # -------------------------

    story.append(
        Paragraph(
            "4. AI Risk Assessment",
            section_style,
        )
    )

    risk_rows = [
        [
            Paragraph("Risk Level", label_style),
            Paragraph(value("risk_level"), value_style),
        ],
        [
            Paragraph("Risk Reason", label_style),
            Paragraph(value("risk_reason"), value_style),
        ],
    ]

    risk_table = Table(
        risk_rows,
        colWidths=[55 * mm, 117 * mm],
    )

    risk_table.setStyle(
        TableStyle(
            [
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#B7B7B7")),
                (
                    "BACKGROUND",
                    (0, 0),
                    (0, -1),
                    colors.HexColor("#EAF2F8"),
                ),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 7),
                ("RIGHTPADDING", (0, 0), (-1, -1), 7),
                ("TOPPADDING", (0, 0), (-1, -1), 7),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
            ]
        )
    )

    story.append(risk_table)

    # -------------------------
    # AI Summary
    # -------------------------

    story.append(
        Paragraph(
            "5. AI-Generated Summary",
            section_style,
        )
    )

    summary_table = Table(
        [
            [
                Paragraph(
                    value("summary") or "No summary available.",
                    normal_style,
                )
            ]
        ],
        colWidths=[172 * mm],
    )

    summary_table.setStyle(
        TableStyle(
            [
                ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#B7B7B7")),
                (
                    "BACKGROUND",
                    (0, 0),
                    (-1, -1),
                    colors.HexColor("#F7F9F9"),
                ),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
                ("RIGHTPADDING", (0, 0), (-1, -1), 8),
                ("TOPPADDING", (0, 0), (-1, -1), 8),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
            ]
        )
    )

    story.append(summary_table)

    story.append(Spacer(1, 15))

    # -------------------------
    # Footer
    # -------------------------

    story.append(
        Paragraph(
            "This report was generated using the Pharma Complaint Copilot.",
            subtitle_style,
        )
    )

    # Build PDF
    doc.build(story)