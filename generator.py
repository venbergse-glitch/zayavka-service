from docxtpl import DocxTemplate
from datetime import datetime


def create_document(data):

    doc = DocxTemplate(
        "documents/template.docx"
    )

    context = {

        "customer_name": data["customer_name"],
        "ogrn": data["ogrn"],
        "legal_address": data["legal_address"],
        "phone": data["phone"],
        "email": data["email"],
        "person": data["person"]

    }


    doc.render(context)


    filename = (
        "documents/"
        "Заявка_"
        + datetime.now().strftime("%Y%m%d_%H%M")
        + ".docx"
    )


    doc.save(filename)


    return filename