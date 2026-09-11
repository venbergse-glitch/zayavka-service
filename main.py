from fastapi import FastAPI, Request, Form
from fastapi.responses import FileResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from generator import create_document

app = FastAPI()
app.mount('/static', StaticFiles(directory='static'), name='static')
templates = Jinja2Templates(directory='templates')


def render_form(request: Request, errors=None, form_data=None):
    return templates.TemplateResponse(
        request=request,
        name='index.html',
        context={
            'request': request,
            'errors': errors or [],
            'form_data': form_data or {}
        }
    )


@app.get('/')
def home(request: Request):
    return render_form(request)


@app.post('/create')
def create(
    request: Request,
    customer_name: str = Form(''),
    customer_short: str = Form(''),
    customer_ogrn: str = Form(''),
    customer_address: str = Form(''),
    customer_fact_address: str = Form(''),
    customer_phone: str = Form(''),
    customer_email: str = Form(''),
    person: str = Form(''),

    manufacturer_name: str = Form(''),
    manufacturer_short: str = Form(''),
    manufacturer_ogrn: str = Form(''),
    manufacturer_address: str = Form(''),
    manufacturer_fact_address: str = Form(''),
    manufacturer_phone: str = Form(''),
    manufacturer_email: str = Form(''),

    dssoi: str = Form(''),

    product_name: str = Form(''),
    okpd2: str = Form(''),
    tnved: str = Form(''),
    production_document: str = Form(''),
    batch_type: str = Form(''),

    standards: str = Form(''),
    indicators: str = Form('')
):
    data = {
        'customer_name': customer_name.strip(),
        'customer_short': customer_short.strip(),
        'customer_ogrn': customer_ogrn.strip(),
        'customer_address': customer_address.strip(),
        'customer_fact_address': customer_fact_address.strip(),
        'customer_phone': customer_phone.strip(),
        'customer_email': customer_email.strip(),
        'person': person.strip(),

        'manufacturer_name': manufacturer_name.strip(),
        'manufacturer_short': manufacturer_short.strip(),
        'manufacturer_ogrn': manufacturer_ogrn.strip(),
        'manufacturer_address': manufacturer_address.strip(),
        'manufacturer_fact_address': manufacturer_fact_address.strip(),
        'manufacturer_phone': manufacturer_phone.strip(),
        'manufacturer_email': manufacturer_email.strip(),

        'dssoi': dssoi.strip(),

        'product_name': product_name.strip(),
        'okpd2': okpd2.strip(),
        'tnved': tnved.strip(),
        'production_document': production_document.strip(),
        'batch_type': batch_type.strip(),

        'standards': standards.strip(),
        'indicators': indicators.strip(),
    }


    errors = []
    if not data['customer_name']:
        errors.append('Полное наименование заявителя')
    if not data['customer_ogrn']:
        errors.append('ОГРН заявителя')
    if not data['dssoi']:
        errors.append('Вид процедуры')
    if not data['product_name']:
        errors.append('Наименование продукции')
    if not data['batch_type']:
        errors.append('Тип выпуска продукции')

    if errors:
        return render_form(request, errors=errors, form_data=data)

    filename = create_document(data)
    return FileResponse(
        filename,
        filename='Заявка.docx',
        media_type='application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    )


