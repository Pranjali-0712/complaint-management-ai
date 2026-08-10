import os
import re
import json
from typing import Any, Dict, TypedDict

from langgraph.graph import StateGraph, END


class ComplaintState(TypedDict, total=False):
    input_text: str
    extracted: Dict[str, Any]
    validated: Dict[str, Any]
    summary: str
    risk: Dict[str, str]
    result: Dict[str, Any]


FORM_FIELDS = [
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
]


def _blank_payload() -> Dict[str, Any]:
    return {field: "" for field in FORM_FIELDS}


def _merge_payload(payload: Dict[str, Any]) -> Dict[str, Any]:
    merged = _blank_payload()

    for key in merged:
        if key in payload:
            merged[key] = payload.get(key) or ""

    # Also keep AI-generated fields
    for key in ["summary", "risk_level", "risk_reason"]:
        if key in payload:
            merged[key] = payload.get(key) or ""

    return merged


# ---------------------------------------------------------
# GROQ EXTRACTION
# ---------------------------------------------------------

def _extract_with_groq(text: str) -> Dict[str, Any] | None:
    api_key = os.getenv("GROQ_API_KEY")

    if not api_key:
        return None

    try:
        from groq import Groq

        client = Groq(api_key=api_key)

        response = client.chat.completions.create(
            model="openai/gpt-oss-20b",
            messages=[
                {
                    "role": "system",
                    "content": """
You are a pharmaceutical complaint extraction assistant.

Extract information from the complaint text and return ONLY valid JSON.

Use exactly these keys:

complaint_number
complaint_date
customer_name
product_name
batch_number
manufacturing_date
complaint_description
complaint_category
severity
country
received_through
remarks

Rules:

1. Extract the exact customer name.
2. Extract the exact product name.
3. Extract the complaint number.
4. Extract the batch number.
5. Extract the manufacturing date.
6. Extract the complaint date.
7. Extract ONLY the actual complaint/problem description.

8. The complaint_description must include the complete sentence describing
   the customer's problem.

9. Do NOT include batch number, manufacturing date, complaint category,
   severity, country, received through, complaint number, customer name,
   or product name as separate metadata in complaint_description.

10. Do not copy the entire input paragraph into complaint_description.

11. Extract the complaint category.
12. Extract severity exactly as High, Medium, Low, or Critical.
13. Extract the country.
14. Extract how the complaint was received, such as Email, Phone, Website, Portal, etc.
15. Put additional information into remarks.
16. If a field is missing, return an empty string.
14. Do not invent information.

Return JSON only.
""",
                },
                {
                    "role": "user",
                    "content": text,
                },
            ],
            temperature=0,
        )

        content = response.choices[0].message.content or "{}"

        # Remove markdown JSON fences if the model returns them
        content = content.strip()

        if content.startswith("```"):
            content = re.sub(r"```json", "", content, flags=re.I)
            content = content.replace("```", "").strip()

        payload = json.loads(content)

        if isinstance(payload, dict):
            return _merge_payload(payload)

    except Exception as exc:
        print("Groq extraction failed:", exc)

    return None


# ---------------------------------------------------------
# FALLBACK EXTRACTION
# ---------------------------------------------------------

def _fallback_extract(text: str) -> Dict[str, Any]:
    payload = _blank_payload()

    clean = " ".join(text.strip().split())

    # -----------------------------------------
    # Complaint Number
    # -----------------------------------------

    match = re.search(
        r"complaint\s*(?:number|no\.?|id)?\s*(?:is|:)?\s*([A-Za-z0-9-]+)",
        clean,
        re.I,
    )

    if match:
        payload["complaint_number"] = match.group(1).strip()

    # -----------------------------------------
    # Complaint Date
    # -----------------------------------------

    match = re.search(
        r"complaint\s*date\s*(?:is|:)?\s*([^.;]+)",
        clean,
        re.I,
    )

    if match:
        payload["complaint_date"] = match.group(1).strip()

    # -----------------------------------------
    # Customer Name
    # -----------------------------------------

    match = re.search(
        r"complaint\s+(?:number|no\.?|id)\s*(?:is|:)?\s*([A-Za-z0-9-]+)",
        clean,
        re.I,
    )

    if match:
        payload["complaint_number"] = match.group(1).strip()

    # -----------------------------------------
    # Product Name
    # -----------------------------------------

    match = re.search(
        r"reported\s+that\s+(.+?)\s+(?:had|has|was|were|showed|showing)\b",
        clean,
        re.I,
    )

    if match:
        product = match.group(1).strip()

        # Remove common unnecessary words
        product = re.sub(
            r"\btablets?\b|\bcapsules?\b",
            lambda m: m.group(0),
            product,
            flags=re.I,
        )

        payload["product_name"] = product

    # -----------------------------------------
    # Batch Number
    # -----------------------------------------

    match = re.search(
        r"batch\s*(?:number|no\.?)?\s*(?:is|:)?\s*([A-Za-z0-9-]+)",
        clean,
        re.I,
    )

    if match:
        payload["batch_number"] = match.group(1).strip()

    # -----------------------------------------
    # Manufacturing Date
    # -----------------------------------------

    match = re.search(
        r"manufacturing\s*date\s*(?:is|:)?\s*([^.;]+)",
        clean,
        re.I,
    )

    if match:
        payload["manufacturing_date"] = match.group(1).strip()

    # -----------------------------------------
    # Complaint Category
    # -----------------------------------------

    match = re.search(
        r"complaint\s*category\s*(?:is|:)?\s*(.+?)(?=\s+and\s+(?:the\s+)?severity\b|\.\s*(?:severity|received\s+through|country)\b|$)",
       clean,
       re.I,
    )

    if match:
        payload["complaint_category"] = match.group(1).strip()

    # -----------------------------------------
    # Severity
    # -----------------------------------------

    match = re.search(
        r"severity\s*(?:is|:)?\s*(High|Medium|Low|Critical)",
        clean,
        re.I,
    )

    if match:
        payload["severity"] = match.group(1).capitalize()

    # -----------------------------------------
    # Received Through
    # -----------------------------------------

    match = re.search(
        r"received\s+through\s+(Email|Phone|Call|Portal|Website|Mail|Post)",
        clean,
        re.I,
    )

    if match:
        payload["received_through"] = match.group(1).title()

    # -----------------------------------------
    # Country
    # -----------------------------------------

    # Handles:
    # "through Email from India"
    match = re.search(
        r"through\s+(?:Email|Phone|Call|Portal|Website|Mail|Post)\s+from\s+([A-Za-z ]+?)(?:\.|,|\s+The|\s+The customer|$)",
        clean,
        re.I,
    )

    if match:
        payload["country"] = match.group(1).strip()

 
    # -----------------------------------------
    # Complaint Description
    # -----------------------------------------


    payload["complaint_description"] = ""

# Example:
# "The customer reported that the tablets were discolored
# and some tablets were broken."

    description_match = re.search(
        r"(The\s+customer\s+reported\s+that\s+.+?)(?=\.\s*(?:The\s+complaint\s+category|Complaint\s+category|Severity|The\s+complaint\s+was\s+received|Received\s+through)\b|$)",
        clean,
        re.I,
    )

    if description_match:
        payload["complaint_description"] = description_match.group(1).strip()

    else:
    # Alternative format:
    # "The customer received a damaged product and is complaining..."
        description_match = re.search(
            r"(The\s+customer\s+(?:received|is\s+complaining|complained|reported|stated|said)\s+.+?)(?=\.\s*(?:The\s+complaint\s+category|Complaint\s+category|Severity|The\s+complaint\s+was\s+received|Received\s+through)\b|$)",
            clean,
            re.I,
        )

        if description_match:
            payload["complaint_description"] = description_match.group(1).strip()

    # -----------------------------------------
    # Remarks
    # -----------------------------------------

    match = re.search(
        r"(?:remarks?|notes?|customer requested)\s*(?:is|are|:)?\s*(.+?)(?:\.|$)",
        clean,
        re.I,
    )

    if match:
        payload["remarks"] = match.group(1).strip()
    elif "customer requested" in clean.lower():
        match = re.search(
            r"(customer\s+requested.+?)(?:\.|$)",
            clean,
            re.I,
        )

        if match:
            payload["remarks"] = match.group(1).strip()

    # -----------------------------------------
    # Default category
    # -----------------------------------------

    if not payload["complaint_category"]:
        lower = clean.lower()

        if "packaging" in lower:
            payload["complaint_category"] = "Packaging"
        elif "label" in lower or "labeling" in lower:
            payload["complaint_category"] = "Labeling"
        elif "tablet" in lower or "capsule" in lower:
            payload["complaint_category"] = "Quality"
        else:
            payload["complaint_category"] = "Quality"

    # -----------------------------------------
    # Default Severity
    # -----------------------------------------

    if not payload["severity"]:
        lower = clean.lower()

        if any(
            word in lower
            for word in [
                "serious",
                "safety",
                "dangerous",
                "broken",
                "contamination",
            ]
        ):
            payload["severity"] = "High"

        elif any(
            word in lower
            for word in [
                "defect",
                "discoloration",
                "quality issue",
            ]
        ):
            payload["severity"] = "Medium"

        elif any(
            word in lower
            for word in [
                "damaged",
                "packaging",
            ]
        ):
            payload["severity"] = "Low"

        else:
            payload["severity"] = "Low"

    return payload


# ---------------------------------------------------------
# LANGGRAPH NODES
# ---------------------------------------------------------

def detect_input(state: ComplaintState) -> ComplaintState:
    state["input_text"] = (state.get("input_text") or "").strip()
    return state


def extract_complaint(state: ComplaintState) -> ComplaintState:
    text = state.get("input_text", "")

    extracted = _extract_with_groq(text)

    if not extracted:
        print("Using fallback extraction")
        extracted = _fallback_extract(text)

    state["extracted"] = extracted

    print("EXTRACTED COMPLAINT:")
    print(json.dumps(extracted, indent=2))

    return state


def validate_fields(state: ComplaintState) -> ComplaintState:
    extracted = state.get("extracted", {}) or {}

    state["validated"] = {
        key: extracted.get(key, "") or ""
        for key in FORM_FIELDS
    }

    return state


def generate_summary(state: ComplaintState) -> ComplaintState:
    validated = state.get("validated", {})

    description = validated.get("complaint_description", "")
    product = validated.get("product_name", "the product")

    if description:
        summary = (
            f"Customer reported an issue with "
            f"{product}: {description}"
        )
    else:
        summary = (
            f"Customer complaint received for {product}."
        )

    state["summary"] = summary

    return state


def generate_risk(state: ComplaintState) -> ComplaintState:
    validated = state.get("validated", {})

    severity = validated.get("severity", "Medium")
    product = validated.get("product_name", "the product")
    batch = validated.get("batch_number", "")

    severity_upper = severity.upper()

    if severity_upper in {"HIGH", "CRITICAL"}:

        risk_level = "High"

        risk_reason = (
            "The complaint describes a significant "
            "quality or safety issue."
        )

    elif severity_upper in {"MEDIUM", "MODERATE"}:

        risk_level = "Medium"

        risk_reason = (
            "The complaint indicates a moderate "
            "quality concern requiring follow-up."
        )

    else:

        risk_level = "Low"

        risk_reason = (
            "The complaint appears low risk and may "
            "be managed with routine review."
        )

    if batch:
        risk_reason += f" Batch {batch} was referenced."

    if product:
        risk_reason += f" Product {product} is involved."

    state["risk"] = {
        "risk_level": risk_level,
        "risk_reason": risk_reason,
    }

    return state


def return_json(state: ComplaintState) -> ComplaintState:

    validated = state.get("validated", {}) or {}
    risk = state.get("risk", {}) or {}

    state["result"] = {
        **{
            field: validated.get(field, "")
            for field in FORM_FIELDS
        },
        "summary": state.get("summary", ""),
        "risk_level": risk.get("risk_level", ""),
        "risk_reason": risk.get("risk_reason", ""),
    }

    return state


# ---------------------------------------------------------
# GRAPH
# ---------------------------------------------------------

def run_complaint_graph(text: str) -> Dict[str, Any]:

    builder = StateGraph(ComplaintState)

    builder.add_node("detect_input", detect_input)
    builder.add_node("extract_complaint", extract_complaint)
    builder.add_node("validate_fields", validate_fields)
    builder.add_node("generate_summary", generate_summary)
    builder.add_node("generate_risk", generate_risk)
    builder.add_node("return_json", return_json)

    builder.set_entry_point("detect_input")

    builder.add_edge(
        "detect_input",
        "extract_complaint"
    )

    builder.add_edge(
        "extract_complaint",
        "validate_fields"
    )

    builder.add_edge(
        "validate_fields",
        "generate_summary"
    )

    builder.add_edge(
        "generate_summary",
        "generate_risk"
    )

    builder.add_edge(
        "generate_risk",
        "return_json"
    )

    builder.add_edge(
        "return_json",
        END
    )

    graph = builder.compile()

    result = graph.invoke(
        {
            "input_text": text
        }
    )

    return result["result"]