from docxtpl import DocxTemplate
from pathlib import Path
from datetime import datetime
import tempfile

BASE_DIR = Path(__file__).resolve().parent


def create_document(data):
    template = BASE_DIR / 'documents' / 'template.docx'
    doc = DocxTemplate(template)

    context = {
        'customer_name': data.get('customer_name', ''),
        'customer_short': data.get('customer_short', ''),
        'customer_ogrn': data.get('customer_ogrn', ''),
        'customer_address': data.get('customer_address', ''),
        'customer_fact_address': data.get('customer_fact_address', ''),
        'customer_phone': data.get('customer_phone', ''),
        'customer_email': data.get('customer_email', ''),
        'person': data.get('person', ''),
        'manufacturer_name': data.get('manufacturer_name', ''),
        'manufacturer_short': data.get('manufacturer_short', ''),
        'manufacturer_ogrn': data.get('manufacturer_ogrn', ''),
        'manufacturer_address': data.get('manufacturer_address', ''),
        'manufacturer_fact_address': data.get('manufacturer_fact_address', ''),
        'manufacturer_phone': data.get('manufacturer_phone', ''),
        'manufacturer_email': data.get('manufacturer_email', ''),
        'dssoi': data.get('dssoi', ''),
        'product_name': data.get('product_name', ''),
        'okpd2': data.get('okpd2', ''),
        'tnved': data.get('tnved', ''),
        'production_document': data.get('production_document', ''),
        'batch_type': data.get('batch_type', ''),
        'standards': data.get('standards', ''),
        'indicators': data.get('indicators', ''),
    }

    doc.render(context)
    output = Path(tempfile.gettempdir()) / f"Заявка_{datetime.now().strftime('%Y%m%d_%H%M%S')}.docx"
    doc.save(output)
    return str(output)
