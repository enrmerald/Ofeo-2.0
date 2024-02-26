from server import app
from flask import request, redirect, url_for, abort, jsonify

# Para poder trabajar con endoints de dominios o puertos diferentes (react esta en otro puerto)
from flask_cors import CORS

CORS(
    app
)  # Esto permite enviar/recibir a otros dominios y puertos y evitar problemas de CORS

# Para probar el registro de usuario con codigo. devolverá al usuario 2
REGISTER_CODE = "12345"

# Para el logeo de usuarios.
users = {
    "usuario": {
        "user_id": 1,
        "username": "usuario",
        "password": "password",
        "company": "Company1",
        "token": "123456",
        "tenants": [
            {
                "tenant_id": "t1",
                "token_tenant": "12345",
                "tenant_name": "Usuario 1A",
                "tenant_company": "Empresa A",
            },
            {
                "tenant_id": "t2",
                "token_tenant": "67890",
                "tenant_name": "Usuario 1B",
                "tenant_company": "Empresa B",
            },
        ],
    },
    "admin": {
        "user_id": 2,
        "username": "admin",
        "password": "password",
        "company": "Company2",
        "token": "abcdefg",
        "tenants": [
            {
                "tenant_id": "t3",
                "token_tenant": "ABCDE",
                "tenant_name": "Usuario 2C",
                "tenant_company": "Empresa C",
            },
            {
                "tenant_id": "t4",
                "token_tenant": "FGHIJ",
                "tenant_name": "Usuario 2C",
                "tenant_company": "Empresa D",
            },
        ],
    },
}


def check_token(token, user_id) -> bool:
    """Metodo simple para comprobar si un token es valido"""
    return token == users[user_id]["token"]


def check_userpass(username, password):
    """Metodo para comprobar si un usuario y contraseña son validos en el login"""
    return username in users and users[username].get("password") == password


@app.route("/")
def dashboard():
    """Ruta dashboard. Debe estar protegido"""
    authorization_header = request.headers.get("Authorization")

    if authorization_header:
        # Separamos el token del Bearer
        token = (
            authorization_header.split(" ")[1]
            if "Bearer" in authorization_header
            else None
        )

        if token:
            # Logica de verificar token... no la usamos aqui, ya qeu esto es solo para prueba
            # Estamos de pruebas de momento que devuelva unos valores sin comprobar mñas
            result = {
                "security": [],
                "data": [
                    {
                        "name": "Channels",
                        "url": "/channels/",
                        "idComp": "kpi-Channels",
                        "icon": "fa-solid fa-sitemap",
                        "header": "Channels",
                        "body": "22",
                        "colorHeader": "#8dc1a9",
                    },
                    {
                        "name": "Organizations",
                        "url": "/organizations/",
                        "idComp": "kpi-Organizations",
                        "icon": "fa-solid fa-briefcase",
                        "header": "Organizations",
                        "body": "3",
                        "colorHeader": "#ea7e53",
                    },
                    {
                        "name": "Employees",
                        "url": "/employees/",
                        "idComp": "kpi-Employees",
                        "icon": "fa-solid fa-users",
                        "header": "Employees",
                        "body": "15",
                        "colorHeader": "#eedd78",
                    },
                    {
                        "name": "Entities",
                        "url": "/entities/",
                        "idComp": "kpi-Entities",
                        "icon": "fa-solid fa-magnifying-glass",
                        "header": "Entities",
                        "body": "100",
                        "colorHeader": "#73a373",
                    },
                ],
            }
            return result
        else:
            print("Falta token de autenticacion")
            return jsonify({"http_request": {"status": "error", "code": 500}})


@app.route("/login", methods=["GET", "POST"])
def login():
    """Ruta de login. Ruta de acceso para usuarios no logeados"""
    result = {}  # Para enviar datos al front
    data = {}  # Para los datos leidos del front
    code = 404  # Por defecto lo damos como erroneo
    if request.method == "POST":
        try:
            data = request.get_json()
            usuario = data["security"]["username"]
            password = data["security"]["password"]

            if check_userpass(usuario, password):
                result["security"] = users[usuario]
                code = 200

        except Exception as ex:
            print("Error producido al cargar los datos: ", str(ex))
    return jsonify(result), code


@app.route("/tenants", methods=["GET", "POST"])
def tenant():
    """Ruta de selección de tenant. Para usuarios autenticados que necesitan seleccionar Tenant"""
    result = {}  # Datos a devolver
    data = {}  # Datos cargados desde POST
    code = 404  # Codigo a devolver

    if request.method == "POST":
        try:
            data = request.get_json()
            username = data["security"]["username"]
            token = data["security"]["token"]

            # Comprobamos que el token es válido
            if check_token(token, username):
                result["security"] = users[username]["tenants"]
                result["data"] = data["data"]
                code = 200

        except Exception as ex:
            print("Error producido: " + str(ex))
    return jsonify(result), code


@app.route("/tenants/<id>", methods=["GET", "POST"])
def tenant_options(id):
    """Ruta para que un usuario obtenga los tenants que se deben mostrar para elegir"""
    code = 400
    try:
        for k in users.keys():
            u = users[k]
            if str(u.get("user_id")) == str(id):
                code = 200
                print(u["tenants"])
                return jsonify(u["tenants"]), code
    except Exception as ex:
        return jsonify({"error": "Can't retreive the data: " + str(ex)}), code


@app.route("/tenants/<id_user>/<id_tenant>", methods=["GET", "POST"])
def tenant_selected(id_user, id_tenant):
    """Ruta para obtener el token tenant de acceso al dashboard.
    params:
      id_user: El id del usuario
      id_tenant: El id del tenant
    returns:
        json con los datos solicitados y code 200 o json con error y code 400
    """
    result = {}
    code = 400
    try:
        data = request.get_json()

        username = data["security"]["username"]
        if username in users and users[username]["token"] == data["security"]["token"]:
            for tenant in users[username]["tenants"]:
                if tenant["tenant_id"] == data["security"]["tenant_id"]:
                    result["security"] = tenant
                    code = 200
                    return jsonify(result), code
        return Exception("Nope, cant find the data!")
    except Exception as ex:
        result["error"] = "Can't retreive the data: " + str(ex)

    return jsonify(result), code


@app.route("/register", methods=["GET", "POST"])
def register():
    """Ruta para establecer el registro del usuario mediante un código en la ventana del login
    El codigo de prueba es 12345
    """
    result = {"message": "The received code is not successfull", "code": 400}
    code = 400
    try:
        data = request.get_json()
        if (
            request.method == "POST"
            and data.get("security").get("register") == REGISTER_CODE
        ):
            code = 200
            result["message"] = "Registration was Successfull"
            result["security"] = users["usuario2"]
            result["code"] = code
    except Exception as ex:
        print("ERROR ", str(ex))
        result["message"] = "Exception produced in the registration: " + str(ex)

    return jsonify(result), code


@app.route("/navigation", methods=["POST"])
def get_nav_data():
    """Método para enviar los datos de navegación disponibles para el usuario
    Necesita llegar por método POST y un diccionario con la clave security -> token
    No hace mas comprobaciones en esta version de prueba
    """
    result = {"http_request": {"status": "error", "code": 500}}
    try:
        data = request.get_json()
        # No me complico ahora mismo y simplemente compruebo que lleva token
        if data.get("security").get("token"):
            result["links"] = [
                # Grupo Ac"value" Management
                {
                    "name": "Account Management",
                    "type" : "dropdown",
                    "elements": [
                        {
                            "name": "Channels", 
                            "url": "http://localhost:5173/channels/",
                        },
                        {
                            "name": "Organizations",
                            "url": "http://localhost:5173/organizations/",
                        },
                    ],
                },

                {
                    "name": "Assets Management",
                    "type" : "dropdown",
                    "elements": [
                        {
                            "name": "Overview", 
                            "url": "http://localhost:5173/assets/overview/"
                        },
                        {
                            "name": "New Asset",
                            "url": "http://localhost:5173/assets/newassets/",
                        },
                    ],
                },
                {
                    "name": "Context",
                    "type" : "newdropdown",
                    "elements": [
                    {
                        "name": "Domains",
                        "type" : "dropdown",
                        "elements": [
                            { "name": "Attributes", "url": "http://localhost:5173/context/domains/attributes/" },
                            { "name": "Insights", "url": "http://localhost:5173/context/domains/insights/" },
                            { "name": "Reputation", "url": "http://localhost:5173/context/domains/reputation/" }
                            ]
                    },
                    {
                        "name": "IPs",
                        "type" : "dropdown",
                        "elements": [
                        { "name": "Attributes", "url": "http://localhost:5173/context/ips/attributes/" },
                        { "name": "Insights", "url": "http://localhost:5173/context/ips/insights/" },
                        { "name": "Reputation", "url": "http://localhost:5173/context/ips/reputation/" }
                        ]
                    },
                    {
                        "name": "Emails",
                        "type" : "dropdown",
                        "elements": [
                        { "name": "Attributes", "url": "http://localhost:5173/context/emails/attributes/" },
                        { "name": "Insights", "url": "http://localhost:5173/context/emails/insights/" },
                        { "name": "Reputation", "url": "http://localhost:5173/context/emails/reputation/" }
                        ]
                    }
                    ]
                },

                # Grupo "Monitoring"
                {
                    "name": "Domain Monitoring",
                    "type" : "dropdown",
                    "elements": [
                        {
                            "name": "Discoveries",
                            "url": "http://localhost:5173/discoveries/",
                        },
                    ],
                },
                
                {"name": "Requests", "url": "http://localhost:5173/requests/"},                
                {"name": "Report", "url": "http://localhost:5173/report/"}
            ]
            result["http_request"]["code"] = 200
            result["http_request"]["status"] = "ok"

    except Exception as ex:
        print("Error in the navigation data request")

    return jsonify(result), result["http_request"]["code"]


@app.route("/tenants/<id>/kpis", methods=["GET"])
def get_apis(id):
    """Metodo que devuelve los assets registrados para un tenant"""
    # Capturamos la autenticación de la cabecera
    authorization_header = request.headers.get("Authorization")

    if authorization_header:
        # Separamos el token del Bearer
        token = (
            authorization_header.split(" ")[1]
            if "Bearer" in authorization_header
            else None
        )

        if token:
            # Logica de verificar token... no la usamos aqui, ya qeu esto es solo para prueba
            # Estamos de pruebas de momento que devuelva unos valores sin comprobar mñas
            result = {
                "security": [],
                "data": {
                    "assets": 80,
                    "protocols": 20,
                    "detected": 1000,
                    "prevented": 90,
                },
            }
            return result
        else:
            print("Falta token de autenticacion")
            return jsonify({"http_request": {"status": "error", "code": 500}})


@app.route("/kpis", methods=["GET"])
def get_kpis():
    # Coger los datos de las credenciales
    print(request.headers.get("Authorization"))
    authorization_header = request.headers.get("Authorization")
    if authorization_header:
        # Separamos el token del Bearer
        token = (
            authorization_header.split(" ")[1]
            if "Bearer" in authorization_header
            else None
        )

        if token:
            # Logica de verificar token... no la usamos aqui, ya qeu esto es solo para prueba
            # Estamos de pruebas de momento que devuelva unos valores sin comprobar mñas
            result = {
                "security": [],
                "data": [
                    {
                        "id": 1,
                        "idPosition": 1,
                        "type": "card",
                        "name": "Channels",
                        "value": "22",
                    },
                    {
                        "id": 2,
                        "idPosition": 1,
                        "type": "card",
                        "name": "Organizations",
                        "value": "3",
                    },
                    {
                        "id": 3,
                        "idPosition": 1,
                        "type": "card",
                        "name": "Persons",
                        "value": "15",
                    },
                    {
                        "id": 4,
                        "idPosition": 1,
                        "type": "card",
                        "name": "Entities",
                        "value": "100",
                    },
                     {
                         "id": 5,
                         "idPosition": 2,
                         "type": "card",
                         "name": "Discoveries",
                         "value": "116816",
                     },
                     {
                         "id":6,
                         "idPosition": 2,
                         "type": "card",
                         "name": "Leaks",
                         "value": "5555",
                     },
                    {
                        "id": 6,
                        "idPosition": 3,
                        "type": "graph",
                        "type_name": "pie",
                        "name": "PieChart",
                        "data_levels": [
                            {"value": 1048, "name": "Search Engine"},
                            {"value": 735, "name": "Direct"},
                            {"value": 580, "name": "Email"},
                            {"value": 484, "name": "Union Ads"},
                            {"value": 300, "name": "Video Ads"},
                        ],
                    },
                    {
                        "id": 7,
                        "idPosition": 2,
                        "type": "graph",
                        "type_name": "donnut",
                        "name": "DonnutChart",
                        "data_levels": [
                            {"name": "Low", "value": 1048},
                            {"name": "Medium", "value": 735},
                            {"name": "High", "value": 580},
                            {"name": "Critical", "value": 484},
                        ],
                    },
                ],
            }
            return jsonify(result), 200
        else:
            print("Falta token de autenticacion")
            return jsonify({"http_request": {"status": "error", "code": 500}})


@app.route("/graphs/scatter", methods=["GET"])
def get_graphs():
    print("--------------graps")
    # Coger los datos de las credenciales
    authorization_header = request.headers.get("Authorization")
    if authorization_header:
        # Separamos el token del Bearer
        token = (
            authorization_header.split(" ")[1]
            if "Bearer" in authorization_header
            else None
        )

        if token:
            # Logica de verificar token... no la usamos aqui, ya qeu esto es solo para prueba
            # Estamos de pruebas de momento que devuelva unos valores sin comprobar mñas
            result = {
                "security": [],
                "data": [
                    {
                        "id": 1,
                        "idPosition": 1,
                        "type": "scatter",
                        "name": "scatterplot",
                        "data_levels": [
                            {"date": "2023-02-01", "category": "low", "value": 8},
                            {"date": "2023-03-01", "category": "low", "value": 12},
                            {"date": "2023-01-01", "category": "medium", "value": 10},
                            {"date": "2012-02-01", "category": "medium", "value": 15},
                            {"date": "2021-03-05", "category": "medium", "value": 20},
                            {"date": "2023-01-01", "category": "high", "value": 20},
                            {"date": "2020-02-01", "category": "high", "value": 25},
                            {"date": "2023-03-01", "category": "high", "value": 4},
                            {"date": "2020-02-01", "category": "high", "value": 25},
                            {"date": "2023-03-01", "category": "high", "value": 30},
                            {"date": "2020-02-01", "category": "medium", "value": 25},
                            {"date": "2023-03-04", "category": "low", "value": 1},
                            {"date": "2020-02-01", "category": "high", "value": 1},
                            {"date": "2021-05-05", "category": "medium", "value": 2},
                            {"date": "2020-02-01", "category": "medium", "value": 25},
                            {"date": "2023-08-01", "category": "high", "value": 30},
                            {"date": "2019-07-11", "category": "low", "value": 10},
                            {"date": "2015-01-27", "category": "high", "value": 1},
                            {"date": "2020-02-01", "category": "low", "value": 25},
                            {"date": "2023-03-01", "category": "high", "value": 3},
                        ],
                    }
                ],
            }
            return jsonify(result), 200
        else:
            print("Falta token de autenticacion")
            return jsonify({"http_request": {"status": "error", "code": 500}})


@app.route("/graphs/map", methods=["GET"])
def get_maps():
    print("--------------graps")
    # Coger los datos de las credenciales
    authorization_header = request.headers.get("Authorization")
    if authorization_header:
        # Separamos el token del Bearer
        token = (
            authorization_header.split(" ")[1]
            if "Bearer" in authorization_header
            else None
        )

        if token:
            # Logica de verificar token... no la usamos aqui, ya qeu esto es solo para prueba
            # Estamos de pruebas de momento que devuelva unos valores sin comprobar mñas
            result = {
                "security": [],
                "data": [
                    {
                        "id": 2,
                        "idPosition": 2,
                        "type": "map",
                        "name": "map",
                        "region": "Global",
                        "sector": "E-Commerce",
                        "data_levels": [
                            {
                                "country_id": 1,
                                "lat": 40.7128,
                                "lon": -74.0060,
                                "sectors": {
                                    "Agriculture and livestock": 10,
                                    "Consumer states": 2,
                                    "E-Commerce": 3,
                                    "Commerce and establishments": 4,
                                    "Construction": 5,
                                    "Sport and leisure": 3,
                                    "Energy and environment": 1,
                                    "Finance, insurance and real estate": 33,
                                    "International": 1,
                                    "Internet": 10,
                                    "Logistics and transportation": 0,
                                    "Media and marketing": 5,
                                    "Metallurgy and electronics": 23,
                                    "Chemicals and raw materials": 1,
                                    "Health and pharmatheutical industry": 23,
                                    "Tourism and hospitality": 3,
                                },
                            },
                            {
                                "country_id": 2,
                                "lat": 34.0522,
                                "lon": -118.2437,
                                "sectors": {
                                    "Agriculture and livestock": 8,
                                    "Consumer states": 4,
                                    "E-Commerce": 2,
                                    "Shops and establishments": 6,
                                    "Construction": 7,
                                    "Sport and leisure": 3,
                                    "Energy and environment": 1,
                                    "Finance, insurance and real estate": 33,
                                    "International": 1,
                                    "Internet": 10,
                                    "Logistics and transportation": 0,
                                    "Media and marketing": 5,
                                    "Metallurgy and electronics": 23,
                                    "Chemicals and raw materials": 1,
                                    "Health and pharmatheutical industry": 23,
                                    "Tourism and hospitality": 3,
                                },
                            },
                            {
                                "country_id": 3,
                                "lat": 51.5074,
                                "lon": -0.1278,
                                "sectors": {
                                    "Agriculture and livestock": 5,
                                    "Consumer states": 3,
                                    "E-Commerce": 8,
                                    "Shops and establishments": 1,
                                    "Construction": 4,
                                    "Sport and leisure": 3,
                                    "Energy and environment": 1,
                                    "Finance, insurance and real estate": 33,
                                    "International": 1,
                                    "Internet": 10,
                                    "Logistics and transportation": 0,
                                    "Media and marketing": 5,
                                    "Metallurgy and electronics": 23,
                                    "Chemicals and raw materials": 1,
                                    "Health and pharmatheutical industry": 23,
                                    "Tourism and hospitality": 3,
                                },
                            },
                            {
                                "country_id": 4,
                                "lat": 48.8566,
                                "lon": 2.3522,
                                "sectors": {
                                    "Agriculture and livestock": 7,
                                    "Consumer states": 50,
                                    "E-Commerce": 40,
                                    "Shops and establishments": 30,
                                    "Construction": 20,
                                    "Sport and leisure": 3,
                                    "Energy and environment": 1,
                                    "Finance, insurance and real estate": 33,
                                    "International": 1,
                                    "Internet": 10,
                                    "Logistics and transportation": 0,
                                    "Media and marketing": 5,
                                    "Metallurgy and electronics": 23,
                                    "Chemicals and raw materials": 1,
                                    "Health and pharmatheutical industry": 23,
                                    "Tourism and hospitality": 3,
                                },
                            },
                            {
                                "country_id": 5,
                                "lat": 52.5200,
                                "lon": 13.4050,
                                "sectors": {
                                    "Agriculture and livestock": 6,
                                    "Consumer states": 1,
                                    "E-Commerce": 9,
                                    "Shops and establishments": 5,
                                    "Construction": 8,
                                    "Sport and leisure": 3,
                                    "Energy and environment": 1,
                                    "Finance, insurance and real estate": 33,
                                    "International": 1,
                                    "Internet": 10,
                                    "Logistics and transportation": 0,
                                    "Media and marketing": 5,
                                    "Metallurgy and electronics": 23,
                                    "Chemicals and raw materials": 1,
                                    "Health and pharmatheutical industry": 23,
                                    "Tourism and hospitality": 3,
                                },
                            },
                            {
                                "country_id": 6,
                                "lat": -33.8688,
                                "lon": 151.2093,
                                "sectors": {
                                    "Agriculture and livestock": 3,
                                    "Consumer states": 7,
                                    "E-Commerce": 1,
                                    "Shops and establishments": 8,
                                    "Construction": 6,
                                    "Sport and leisure": 3,
                                    "Energy and environment": 1,
                                    "Finance, insurance and real estate": 33,
                                    "International": 1,
                                    "Internet": 10,
                                    "Logistics and transportation": 0,
                                    "Media and marketing": 5,
                                    "Metallurgy and electronics": 23,
                                    "Chemicals and raw materials": 1,
                                    "Health and pharmatheutical industry": 23,
                                    "Tourism and hospitality": 3,
                                },
                            },
                            {
                                "country_id": 7,
                                "lat": 35.6895,
                                "lon": 139.6917,
                                "sectors": {
                                    "Agriculture and livestock": 9,
                                    "Consumer states": 2,
                                    "E-Commerce": 5,
                                    "Shops and establishments": 4,
                                    "Construction": 10,
                                    "Sport and leisure": 3,
                                    "Energy and environment": 1,
                                    "Finance, insurance and real estate": 33,
                                    "International": 1,
                                    "Internet": 10,
                                    "Logistics and transportation": 0,
                                    "Media and marketing": 5,
                                    "Metallurgy and electronics": 23,
                                    "Chemicals and raw materials": 1,
                                    "Health and pharmatheutical industry": 23,
                                    "Tourism and hospitality": 3,
                                },
                            },
                            {
                                "country_id": 8,
                                "lat": 37.7749,
                                "lon": -122.4194,
                                "sectors": {
                                    "Agriculture and livestock": 4,
                                    "Consumer states": 6,
                                    "E-Commerce": 3,
                                    "Shops and establishments": 9,
                                    "Construction": 1,
                                    "Sport and leisure": 3,
                                    "Energy and environment": 1,
                                    "Finance, insurance and real estate": 33,
                                    "International": 1,
                                    "Internet": 10,
                                    "Logistics and transportation": 0,
                                    "Media and marketing": 5,
                                    "Metallurgy and electronics": 23,
                                    "Chemicals and raw materials": 1,
                                    "Health and pharmatheutical industry": 23,
                                    "Tourism and hospitality": 3,
                                },
                            },
                            {
                                "country_id": 14,
                                "lat": -22.9068,
                                "lon": -43.1729,
                                "sectors": {
                                    "Agriculture and livestock": 1,
                                    "Consumer states": 9,
                                    "E-Commerce": 6,
                                    "Shops and establishments": 2,
                                    "Construction": 3,
                                    "Sport and leisure": 3,
                                    "Energy and environment": 1,
                                    "Finance, insurance and real estate": 33,
                                    "International": 1,
                                    "Internet": 10,
                                    "Logistics and transportation": 0,
                                    "Media and marketing": 5,
                                    "Metallurgy and electronics": 23,
                                },
                            },
                        ],
                    },
                ],
                "sectors": [
                    {"name": "Agriculture and livestock", "value": "1"},
                    {"name": "Consumer states", "value": "2"},
                    {"name": "E-Commerce", "value": "3"},
                    {"name": "Shops and establishments", "value": "4"},
                    {"name": "Construction", "value": "5"},
                    {"name": "Sport and leisure", "value": "6"},
                    {"name": "Energy and environment", "value": "7"},
                    {"name": "Finance, insurance and real estate", "value": "8"},
                    {"name": "International", "value": "9"},
                    {"name": "Internet", "value": "10"},
                    {"name": "Logistics and transportation", "value": "11"},
                    {"name": "Media and marketing", "value": "12"},
                    {"name": "Chemicals and raw materials", "value": "13"},
                    {"name": "Health and pharmatheutical industry", "value": "14"},
                    {"name": "Tourism and hospitality", "value": "15"},
                    {"name": "Services", "value": "20"},
                    {"name": "Society", "value": "4"},
                    {"name": "Technology and Telecommunications", "value": "10"},
                ],
                "regions": [
                    {"name": "Default", "value": "default"},
                    {"name": "Global", "value": "global"},
                    {"name": "Europe", "value": "europe"},
                    {"name": "Asia", "value": "asia"},
                    {"name": "North America", "value": "northamerica"},
                    {"name": "South America", "value": "southamerica"},
                    {"name": "Oceania", "value": "oceania"},
                ],
            }
            return jsonify(result), 200
        else:
            print("Falta token de autenticacion")
            return jsonify({"http_request": {"status": "error", "code": 500}})


## Configuración
@app.route("/config", methods=["GET", "POST"])
def get_config():
    # Coger los datos de las credenciales
    print(request.headers.get("Authorization"))
    authorization_header = request.headers.get("Authorization")
    if authorization_header:
        # Separamos el token del Bearer
        token = (
            authorization_header.split(" ")[1]
            if "Bearer" in authorization_header
            else None
        )

    if request.method == "GET":
        if token:
            # Logica de verificar token... no la usamos aqui, ya qeu esto es solo para prueba
            # Estamos de pruebas de momento que devuelva unos valores sin comprobar mñas
            # Fichero de configuración por defecto
            settingsFile = "src/neotec-fe/src/static/settings.json"

            result = {
                "security": [],
                "data": [
                    {
                        "Sources": {
                            "id": 1,
                            "idName": "sources",
                            "img": "fa-screwdriver-wrench",
                            "data": [
                                {
                                    "title": "Free Sources",
                                    "type": "checkbox",
                                    "content": [],
                                }
                            ],
                        },
                        "General": {
                            "id": 2,
                            "idName": "general",
                            "img": "fa-toolbox",
                            "data": [],
                        },
                        "Display": {
                            "id": 3,
                            "idName": "display",
                            "img": "fa-pen-to-square",
                            "data": [
                                {
                                    "title": "Palette theme",
                                    "subtitle": "",
                                    "type": "colorpicker",
                                    "content": [
                                        {
                                            "id": 1,
                                            "label": "A",
                                            "defaultColor": "#00e58d",
                                        },
                                        {
                                            "id": 2,
                                            "label": "B",
                                            "defaultColor": "#368e75",
                                        },
                                        {
                                            "id": 3,
                                            "label": "C",
                                            "defaultColor": "#48716D",
                                        },
                                        {
                                            "id": 4,
                                            "label": "D",
                                            "defaultColor": "#5a5465",
                                        },
                                        {
                                            "id": 5,
                                            "label": "E",
                                            "defaultColor": "#008064",
                                        },
                                        {
                                            "id": 6,
                                            "label": "F",
                                            "defaultColor": "#7e1b54",
                                        },
                                    ],
                                },
                                {
                                    "title": "Counters",
                                    "subtitle": "Select four counters",
                                    "type": "checkbox",
                                    "content": [
                                        {"channels": 1},
                                        {"organizations": 1},
                                        {"persons": 1},
                                        {"entities": 1},
                                        {"discoveries": 1},
                                        {"leaks": 0},
                                        {"requests": 0},
                                    ],
                                },
                                {
                                    "title": "System theme",
                                    "subtitle": "Select the theme",
                                    "type": "switch",
                                    "content": [{"dark": 0}, {"light": 1}],
                                },
                            ],
                        },
                    }
                ],
            }

            return jsonify(result), 200
        else:
            print("Falta token de autenticacion")
            return jsonify({"http_request": {"status": "error", "code": 500}})
    if request.method == "POST":
        print("POST")
        return 'asdad'
    
    
@app.route("/config/<int:id>", methods=["GET", "POST"])
def get_config_user(id):
     # Coger los datos de las credenciales
    print(request.headers.get("Authorization"))
    authorization_header = request.headers.get("Authorization")
    if authorization_header:
        # Separamos el token del Bearer
        token = (
            authorization_header.split(" ")[1]
            if "Bearer" in authorization_header
            else None
        )

    if request.method == "GET":
        return 'get'
    
    elif request.method == 'POST':
        try:
            data = request.get_json()
            print('----', data)
        except Exception as ex:
            print('ERROR: ', str(ex))
        print('post de config/id')
        return jsonify('post')@app.route("/leaks/", methods=["GET", "POST"])
def get_leaks():
     # Coger los datos de las credenciales
    print(request.headers.get("Authorization"))
    authorization_header = request.headers.get("Authorization")
    if authorization_header:
        # Separamos el token del Bearer
        token = (
            authorization_header.split(" ")[1]
            if "Bearer" in authorization_header
            else None
        )

    if request.method == "GET":
        # Obtener datos del formulario enviado por método GET
        name = request.args.get('name')
        domain = request.args.get('domain')
        data_bytes = request.args.get('data_bytes')
        # Puedes seguir obteniendo otros campos del formulario de la misma manera

        # Realizar alguna lógica con los datos obtenidos
        result = {
            'message': 'get',
            'name': name,
            'domain': domain,
            'data_bytes': data_bytes
            # Agrega más campos según sea necesario
        }
        print(result)
        return jsonify(result)
    
    elif request.method == 'POST':
        try:
            data = request.get_json()
            print('Received data:', data)
            # Aquí procesa y almacena los datos en tu base de datos
            # Retorna una respuesta exitosa si todo va bien
            return jsonify({'message': 'post success'})
        except Exception as ex:
            print('Error:', str(ex))
            # Retorna una respuesta de error en caso de excepción
            return jsonify({'error': 'Invalid JSON format'}), 400
