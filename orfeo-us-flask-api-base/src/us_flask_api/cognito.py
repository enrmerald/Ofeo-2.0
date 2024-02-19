import logging
import os

import boto3
import us_flask_api.config as config
import requests
from requests.auth import HTTPBasicAuth

# Token para autenticar el usuario
JWKS_URL = "https://cognito-idp.%s.amazonaws.com/%s/.well-known/jwks.json" % (
    config.DevelopmentConfig.AWS_REGION,
    config.DevelopmentConfig.COGNITO_POOL_ID,
)

JWKS = requests.get(JWKS_URL).json()["keys"]


def show_group(username):
    """Función para mostrar los datos de un usuario según su username"""
    # Conexión boto3
    conn = conexion_boto3()
 
    try:
        user_group = conn.admin_list_groups_for_user(
            UserPoolId=config.DevelopmentConfig.COGNITO_POOL_ID, Username=username
        )
        groups = []
        for group in user_group["Groups"]:
            groups.append(group["GroupName"])
        return groups
    except Exception as ex:
        logging.error("Show user group error:", str(ex))
        return False

'''
def redirigir_login(session, request_args):
    # http://docs.aws.amazon.com/cognito/latest/developerguide/login-endpoint.html
    session["csrf_state"] = os.urandom(8).hex()

    return (
        "https://%s/"
        "login?response_type=code&client_id=%s"
        "&state=%s"
        "&redirect_uri=%s/callback"
        % (
            config.DevelopmentConfig.COGNITO_DOMAIN,
            config.DevelopmentConfig.COGNITO_CLIENT_ID,
            session["csrf_state"],
            config.DevelopmentConfig.BASE_URL,
        )
    )


def redirigir_logout():
    # http://docs.aws.amazon.com/cognito/latest/developerguide/logout-endpoint.html
    return (
        "https://%s/logout?response_type=code&client_id=%s"
        "&logout_uri=%s/inicio&redirect_uri=%s/inicio"
        % (
            config.Config.COGNITO_DOMAIN,
            config.Config.COGNITO_CLIENT_ID,
            config.Config.BASE_URL,
            config.Config.BASE_URL,
        )
    )


def callback_usuario(session, request_args):
    """Exchange the 'code' for Cognito tokens"""
    # http://docs.aws.amazon.com/cognito/latest/developerguide/token-endpoint.html
    csrf_state = request_args.get("state")
    code = request_args.get("code")
    request_parameters = {
        "grant_type": "authorization_code",
        "client_id": config.Config.COGNITO_CLIENT_ID,
        "code": code,
        "redirect_uri": config.Config.BASE_URL + "/callback",
    }
    response = requests.post(
        "https://%s/oauth2/token" % config.Config.COGNITO_DOMAIN,
        data=request_parameters,
        auth=HTTPBasicAuth(
            config.Config.COGNITO_CLIENT_ID, config.Config.COGNITO_CLIENT_SECRET
        ),
    )
    if (
        response.status_code == requests.codes.ok
        and "csrf_state" in session
        and csrf_state == session["csrf_state"]
    ):
        id_token = verify(response.json()["id_token"], response.json()["access_token"])
        datos_usuario = show_user(username=id_token["cognito:username"])
        rt = {
            "username": id_token["cognito:username"],
            "email": id_token["email"],
            "expires": id_token["exp"],
        }
        return rt
    return None


def verify(token, access_token=None):
    """Verify a cognito JWT"""
    # get the key id from the header, locate it in the cognito keys
    # and verify the key
    header = jwt.get_unverified_header(token)
    key = [k for k in JWKS if k["kid"] == header["kid"]][0]
    id_token = jwt.decode(
        token,
        key,
        audience=config.Config.COGNITO_CLIENT_ID,
        access_token=access_token,
    )
    return id_token
'''


def conexion_boto3():
    """Conectar con Cognito

    Parámetros requeridos:
        - Secret Access Key -> Variable de entorno
        - Access Key ID -> Variable de entorno
        - Region Name -> Variable de entorno
        - Service Name
    Devuelve:
        Conexión

    """
    connection = boto3.client(
        region_name=config.DevelopmentConfig.AWS_REGION,
        service_name="cognito-idp",
        aws_access_key_id=config.DevelopmentConfig.ACCESS_KEY,
        aws_secret_access_key=config.DevelopmentConfig.SECRET_ACCESS_KEY,
    )
    return connection


def list_users():
    conn = conexion_boto3()
    try:
        poolId = config.DevelopmentConfig.COGNITO_POOL_ID
        listUsers = conn.list_users(UserPoolId=poolId)
        data = {}
        i = 1
        # Para cada elemento(usuario) en la lista de usuarios[Users]

        for usuario in listUsers["Users"]:
            user = usuario["Username"]
            # Obtiene todos los datos de cada usuario
            a = {
                "username": user,
                "name": "",
                "sub": "",
                "email": "",
                "email_verified": "",
                "group": "",
                "element_id": "",
            }
            for atributo in usuario["Attributes"]:
                name = atributo["Name"].lower().replace("custom:", "")
                a[name] = atributo["Value"]
                data[i] = a
            i = i + 1
            logging.info("List user succesful")
        return data
    except Exception as ex:
        logging.error("List users error: %s", str(ex))
    

def insert_user(body):
    """Función para insertar un nuevo usuario en cognito"""
    # Conexión boto3
    conn = conexion_boto3()

    # Obtener los datos del body
    attributes = []
    username = body.get("username")
    for k, v in body.items():
        if k != "username":
            if k == "element_id":
                attributes.append({"Name": "custom:element_id", "Value": v})
            elif k == "group":
                attributes.append({"Name": "custom:group", "Value": v})
            else:
                attributes.append({"Name": k, "Value": v})

    # Función crear usuario cognito
    try:
        conn.admin_create_user(
            UserPoolId=config.DevelopmentConfig.COGNITO_POOL_ID,
            # Username es el nombre del NUEVO USUARIO
            Username=username,
            # 'atributos' es la lista creada
            UserAttributes=attributes,
            DesiredDeliveryMediums=["EMAIL"],
        )
        logging.info("User created")
        return True
    except Exception as ex:
        logging.error("Create user error: %s", str(ex))
        return False

def show_user(username):
    """Función para mostrar los datos de un usuario según su username"""
    # Conexión boto3
    conn = conexion_boto3()
    result = {}
    try:
        user = conn.admin_get_user(
            UserPoolId=config.DevelopmentConfig.COGNITO_POOL_ID, Username=username
        )
        attributes = user["UserAttributes"]
        user_data = {}

        for dato in attributes:
            attribute_name = dato["Name"]
            attribute_value = dato["Value"]

            # Eliminar 'custom:' del nombre del atributo (si existe)
            if attribute_name.startswith("custom:"):
                attribute_name = attribute_name.replace("custom:", "")

            user_data[attribute_name] = attribute_value

        result["user_data"] = user_data
        return result
    except Exception as ex:
        logging.error("Show user error:", str(ex))
        return False


def delete_user(username):
    """Función para eliminar el usuario según username"""
    conn = conexion_boto3()
    try:
        conn.admin_delete_user(
            UserPoolId=config.DevelopmentConfig.COGNITO_POOL_ID, Username=username
        )
        # Si se elimina correctamente, Status: True
        status = True
        logging.info("User deleted")
    # Si hay algun error en la eliminación, se muestra el error y Status: False
    except Exception as e:
        status = False
        logging.error("Error al eliminar el usuario: ", str(e))
    return status


def edit_user(username, body):
    """Editar usuario"""
    conn = conexion_boto3()
    attributes = []
    username = body.get("username")
    for k, v in body.items():
        if k != "username":
            attributes[k] = v
    name = attributes.get("name")
    group = attributes.get("group")
    email = attributes.get("email")
    element_id = attributes.get("element_id")
    try:
        edited = conn.admin_update_user_attributes(
            UserPoolId=config.DevelopmentConfig.COGNITO_POOL_ID,
            Username=username,
            UserAttributes=[
                {"Name": "group", "Value": group},
                {"Name": "name", "Value": name},
                {"Name": "email_verified", "Value": "true"},
                {"Name": "email", "Value": email},
                {"Name": "element_id", "Value": element_id},
            ],
        )
        logging.info("User  edited")
        return edited
    except Exception as ex:
        logging.error("Edit user error: ", str(ex))
