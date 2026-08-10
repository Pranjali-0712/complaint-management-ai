from app.graph import run_complaint_graph


def test_graph_extracts_basic_fields():
    result = run_complaint_graph(
        "The customer received broken tablets of Paracetamol 500mg. Batch B123. Manufactured on 10 July. Complaint received on 15 July."
    )
    expected_fields = [
        "complaint_number",
        "complaint_date",
        "customer_name",
        "product_name",
        "batch_number",
        "manufacturing_date",
        "complaint_description",
        "complaint_category",
        "severity",
        "country",
        "received_through",
        "remarks",
        "summary",
        "risk_level",
        "risk_reason",
    ]
    for field in expected_fields:
        assert field in result
