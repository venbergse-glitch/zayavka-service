from fastapi import FastAPI, Request, Form
from fastapi.responses import FileResponse
from fastapi.templating import Jinja2Templates

from generator import create_document


app = FastAPI()


templates = Jinja2Templates(
    directory="templates"
)


@app.get("/")
def home(request: Request):

    return templates.TemplateResponse(
        request=request,
        name="index.html",
        context={
            "request": request
        }
    )



@app.post("/create")
def create(

    customer_name: str = Form(...),
    ogrn: str = Form(...),
    legal_address: str = Form(...),
    phone: str = Form(...),
    email: str = Form(...),
    person: str = Form(...)

):

    data = {

        "customer_name": customer_name,
        "ogrn": ogrn,
        "legal_address": legal_address,
        "phone": phone,
        "email": email,
        "person": person

    }


    file = create_document(data)


    return FileResponse(
        file,
        filename="Заявка.docx"
    )