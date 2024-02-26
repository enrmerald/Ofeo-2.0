# -*- coding: utf-8 -*-
""" KARONT3 Threat Intelligence API

## Project Overview
This is the project overview.

## Authentication
This is how authentication works.

"""
# pylint: disable=W0102,E0712,C0103
# fmt: on


import os
import platform
import sys
import us_flask_api.db as db
import us_flask_api.cognito as cognito
import logging
import json
import us_flask_api.config as config
import us_flask_api.api as api
from apifairy import APIFairy, authenticate, response, other_responses, body
from flask import (
    Flask,
    make_response,
    url_for,
    request,
    jsonify,
    session,
    redirect,
    Blueprint,
)
import flask_login
from flask_httpauth import HTTPTokenAuth
from time import time
import jwt
#import us_flask_api.schema as schema
from typing import Annotated
import datetime
from botocore.exceptions import ClientError
import boto3
import hashlib
import hmac
import base64
from PIL import Image
from io import BytesIO

from flask import request, redirect, url_for, abort, jsonify
from werkzeug.utils import secure_filename

# Para poder trabajar con endoints de dominios o puertos diferentes (react esta en otro puerto)
from flask_cors import CORS



app = Flask(__name__)
app.config.from_object("us_flask_api.config.DevelopmentConfig")
app.json.sort_keys = False  # type: ignore
apifairy = APIFairy(app)

logging.basicConfig(
    level=logging.WARNING, format="%(asctime)s -%(levelname)s -%(" "message)s"
)
logging.basicConfig(level=logging.getLevelName(config.Config.LOGGING_LEVEL))

login_manager = flask_login.LoginManager()
login_manager.init_app(app)

CORS(
    app
)  # Esto permite enviar/recibir a otros dominios y puertos y evitar problemas de CORS
# print(app.config)

cognito_client = boto3.client("cognito-idp", region_name=app.config["AWS_REGION"])

token_auth = HTTPTokenAuth(scheme="Bearer", header="X-API-token", realm="EWALA")


# Mocked list of tokens
# The UUID4 used as seed for the tokens is 916fa43a-ed06-489f-9744-cfd0d42f10af
# The namespace format for the tokens is ewala_device-enforcement_module_NNNN being NNNN an incremental number
tokens = {
    "80d027a9-9022-5225-9b35-0c38e23f1324": "jonathan",  # ewala_device-enforcement_module_0001
    "ff8f3978-feeb-5666-b9d6-f4b7bbff18e0": "jorge",  # ewala_device-enforcement_module_0002
    "f00f4eda-c04e-5fcf-abf9-512f086997e9": "hugo",  # ewala_device-enforcement_module_0003
    "8bab55b3-7da8-5fa5-9b9f-cb9cf8e74a30": "esther",  # ewala_device-enforcement_module_0004
}


# Verify token function
# Now a dict is used for static use; later a database call will be implemented
@token_auth.verify_token
def verify_token(token):
    try:
        data = jwt.decode(token, config.Config.SECRET_KEY, algorithms=["HS256"])
    except:  # noqa: E722
        return False
    if "username" in data:
        return data["username"]


@app.before_request
def before_request_func():
    # app.logger.debug("This is executed BEFORE each request.")
    pass


@app.after_request
def after_request_func(response):
    # app.logger.debug("This is executed AFTER each request.")
    return response


headers = {"X-Project": "Karont3", "X-Company": "Ewala"}


# Listado de usuarios de los que obtener los tokens
user_token = {}
users = cognito.list_users()
for user in users.keys():
    username = users[user].get("username")

    (users[user].get("username"))
    token = jwt.encode(
        {"username": username, "exp": int(time()) + 3600},
        config.Config.SECRET_KEY,
        algorithm="HS256",
    )
    user_token[username] = token
    print("*** token for {}: {}\n".format(username, token))


@token_auth.verify_token
def verify_token(token):
    try:
        data = jwt.decode(token, config.Config.SECRET_KEY, algorithms=["HS256"])
    except:  # noqa: E722
        return False
    if "username" in data:
        return data["username"]


# Status route
@app.route("/status/", methods=["GET"])
def status():
    """API status
    This endpoint offers a JSON with information from the Python process in use.
    Returns:
        string: a JSON is returned
    """

    sys_version = sys.version
    os_name = os.name
    platform_sys = platform.system()
    platform_rel = platform.release()
    index_url = url_for("index", _external=True)

    # Here comes business logic
    # app.logger.debug(f'Returning response on {index_url}')
    # --

    payload = {
        "status": "ok",
        "http_code": 200,
        "data": {
            "python": sys_version,
            "os": os_name,
            "platform": platform_sys,
            "release": platform_rel,
        },
        "links": set_links(),
    }
    headers = {"X-Project": "NEOTEC", "X-Company": "Ewala"}
    response = make_response(payload, headers)
    return response, 200


# Get params
def get_url_params():
    """Obtener los parámetros de la url al listar datos"""
    filters_json = request.args.get("filters", default="{}")
    sorters_json = request.args.get("sorters", default="[]")

    page_json = request.args.get("page", default="0")
    size_json = request.args.get("size", default="10")

    filters = json.loads(filters_json)
    sorters = json.loads(sorters_json)
    page = int(page_json)
    size = int(size_json)

    return filters, sorters, page, size


def set_links():
    """Returns navigation links"""
    links = {
        "index": "http://localhost:5000/index/",
        "docs": "http://localhost:5000/docs/",
        "navigation": "http://localhost:5000/navigation/",
    }
    return links


# Index/Apex route
@app.route("/", methods=["GET"])
def index():
    """Apex endpoint for the API
    This is the home of the API site.
    Returns:
        string: a JSON is returned
    """

    index_url = url_for("index", _external=True)
    status_url = url_for("status", _external=True)
    channels_url = url_for("channels", _external=True)
    organizations_url = url_for("organizations", _external=True)
    overview_url = url_for("overview", _external=True)
    newassets_url = url_for("newassets", _external=True)
    domain_attributes_url = url_for("domains/attributes", _external=True)
    domain_insights_url = url_for("domains/insights", _external=True)
    domain_reputation_url = url_for("domains/reputation", _external=True)
    ips_attributes_url = url_for("ips/attributes", _external=True)
    ips_insights_url = url_for("ips/insights", _external=True)
    ips_reputation_url = url_for("ips/reputation", _external=True)
    emails_attributes_url = url_for("emails/attributes", _external=True)
    emails_insights_url = url_for("emails/insights", _external=True)
    emails_reputation_url = url_for("emails/reputation", _external=True)
    discoveries_url = url_for("discoveries", _external=True)
    requests_url = url_for("requests", _external=True)
    
    api_docs_url = url_for("apifairy.docs", _external=True)

    # Here comes business logic
    # app.logger.debug(f'Returning response on {index_url}')
    # --

    payload = {"status": "ok", "http_code": 200, "links": set_links()}
    headers = {"X-Project": "Karont3", "X-Company": "Ewala"}
    response = make_response(payload, headers)
    return response, 200


results = {
    "security" : {
        "token" : "1234"
    },
    "data" : {
        "message" : "Hola buenas tardes"
    }
    
}

# List elements

@app.route("/overview/", methods=["GET"])
def overview():
    overview_url = url_for("overview", _external=True)
    
    return results


@app.route("/newassets/", methods=["GET"])
def newassets():
    newassets_url = url_for("newassets", _external=True)
    
    return results


@app.route("/domains/attributes/", methods=["GET"])
def domain_attributes():
    domain_attributes_url = url_for("domains/attributes", _external=True)
    
    return results
    
    
@app.route("/domains/insights/", methods=["GET"])
def domain_insights():
    domain_insights_url = url_for("domains/insights", _external=True)
    
    return results


@app.route("/domains/reputation/", methods=["GET"])
def domain_reputation():
    domain_reputation_url = url_for("domains/reputation", _external=True)
    
    return results


@app.route("/ips/attributes/", methods=["GET"])
def ips_attributes():
    ips_attributes_url = url_for("ips/attributes", _external=True)
    
    return results


@app.route("/ips/insights/", methods=["GET"])
def ips_insights():
    ips_insights_url = url_for("ips/insights", _external=True)
    
    return results


@app.route("/ips/reputation/", methods=["GET"])
def ips_reputation():
    ips_reputation_url = url_for("ips/reputation", _external=True)
    
    return results

    
@app.route("/emails/attributes/", methods=["GET"])
def emails_attributes():
    emails_attributes_url = url_for("emails/attributes", _external=True)
    
    return results


@app.route("/emails/insights/", methods=["GET"])
def emails_insights():
    emails_insights_url = url_for("emails/insights", _external=True)
    
    return results


@app.route("/emails/reputation/", methods=["GET"])
def emails_reputation():
    emails_reputation_url = url_for("emails/reputation", _external=True)
    return results


@app.route("/channels/", methods=["GET", "POST"])
# @authenticate(token_auth)
##@response(schema.Response)


@other_responses({400: "Invalid request."})
def channels():
    """Channels
    Returns a JSON where variable 'data' is the list of channels.
    """
    (filters, sorters, page, size) = get_url_params()
    index_url = url_for("index", _external=True)

    try:
        db_result = db.list_table("channels", filters, sorters, page, size)
        # Serialize manualmente los datos
        db_result = [
            {
                "id": channel["id"],
                "refcode": channel["refcode"],
                "name": channel["name"],
                "email": channel.get("email"),
                "phonenum": channel.get("phonenum"),
                "created": str(channel.get("created")),
                "modified": str(channel.get("modified")),
            }
            for channel in db_result
        ]
    except Exception as ex:
        db_result = []
        logging.ERROR("Error al listar canales: ", str(ex))

    if request.method == "POST":
        recived = request.get_json()
        filter = {recived["filter"].get("name"): recived["filter"].get("value")}
        # filters = recived["filter"].replace("'", '"')
        db_result = db.list_table("channels", filter, sorters, page, size)
    payload = {
        "status": "ok",
        "http_code": 200,
        "data": db_result,
        "page": 1,
        "last_page": 1,
        "links": set_links(),
    }

    return (payload), 200


@app.route("/organizations/", methods=["GET"])
# @authenticate(token_auth)
# @response(schema.Response)


@other_responses({400: "Invalid request."})
def organizations():
    """Organizations
    Returns a JSON where variable 'data' is the list of organizations.
    """
    (filters, sorters, page, size) = get_url_params()

    index_url = url_for("index", _external=True)
    try:
        db_result = db.list_table("organizations", filters, sorters, page, size)
    except Exception as ex:
        db_result = []
        logging.ERROR("Error al listar organizations: ", str(ex))
    payload = {
        "status": "ok",
        "http_code": 200,
        "data": db_result,
        "links": set_links(),
    }
    response = make_response(payload, headers)
    return response, 200


# @authenticate(token_auth)
@app.route("/persons/", methods=["GET"])
# @response(schema.Response)


@other_responses({400: "Invalid request."})
def persons():
    """People
    Returns a JSON where variable 'data' is the list of people.
    """
    (filters, sorters, page, size) = get_url_params()

    index_url = url_for("index", _external=True)
    try:
        db_result = db.list_table("persons", filters, sorters, page, size)
    except Exception as ex:
        db_result = []
        logging.ERROR("Error al listar persons: ", str(ex))
    payload = {
        "status": "ok",
        "http_code": 200,
        "data": db_result,
        "links": set_links(),
    }
    response = make_response(payload, headers)
    return response, 200


# @authenticate(token_auth)
@app.route("/entities/<string:type>/", methods=["GET"])
# @response(schema.Response)
@other_responses({400: "Invalid request."})
def entities(type):
    """Entities according type
    Returns a JSON where variable 'data' is the list of entities.
    """
    index_url = url_for("index", _external=True)

    if not check_entity_type(type):
        http_code = 400
        payload = {
            "status": "error",
            "http_code": http_code,
            "message": "Entity type don't exists.",
            "links": set_links(),
        }
    else:
        (filters, sorters, page, size) = get_url_params()
        try:
            db_result = db.list_table(type, filters, sorters, page, size)
            http_code = 200
        except Exception as ex:
            db_result = []
            http_code = 400
            logging.ERROR("Error al listar persons: ", str(ex))
        payload = {
            "status": "ok",
            "http_code": http_code,
            "data": db_result,
            "links": set_links(),
        }
    response = make_response(payload, headers)
    return response, http_code


# @authenticate(token_auth)
@app.route("/discoveries/", methods=["GET"])
# @response(schema.Response)


@other_responses({400: "Invalid request."})
def discoveries():
    """Discoveries
    Returns a JSON where variable 'data' is the list of discoveries.
    """
    (filters, sorters, page, size) = get_url_params()
    index_url = url_for("index", _external=True)
    try:
        db_result = db.list_table("discoveries", filters, sorters, page, size)
    except Exception as ex:
        db_result = []
        logging.ERROR("Error al listar discoveries: ", str(ex))
    payload = {
        "status": "ok",
        "http_code": 200,
        "data": db_result,
        "links": set_links(),
    }
    response = make_response(payload, headers)
    return response, 200


# @authenticate(token_auth)
@app.route("/requests/", methods=["GET"])
# @response(schema.Response)


@other_responses({400: "Invalid request."})
def requests():
    """Requests
    Returns a JSON where variable 'data' is the list of requests.
    """
    (filters, sorters, page, size) = get_url_params()
    index_url = url_for("index", _external=True)
    try:
        db_result = db.list_table("requests", filters, sorters, page, size)
    except Exception as ex:
        db_result = []
        logging.ERROR("Error al listar requests: ", str(ex))
    payload = {
        "status": "ok",
        "http_code": 200,
        "data": db_result,
        "links": set_links(),
    }
    response = make_response(payload, headers)
    return response, 200


# @authenticate(token_auth)
@app.route("/users/", methods=["GET"])
##@response(schema.Response)


@other_responses({400: "Invalid request."})
def users():
    """Users
    Returns a JSON where variable 'data' is the list of users.
    """
    index_url = url_for("index", _external=True)
    try:
        db_result = cognito.list_users()
    except Exception as ex:
        db_result = []
        logging.ERROR("Error al listar users: ", str(ex))
    payload = {
        "status": "ok",
        "http_code": 200,
        "data": db_result,
        "links": set_links(),
    }
    response = make_response(payload, headers)
    return response, 200


# @authenticate(token_auth)
@app.route("/leaks/", methods=["GET"])
# @response(schema.Response)


@other_responses({400: "Invalid request."})
def leaks():
    """Leaks
    Returns a JSON where variable 'data' is the list of leaks.
    """
    (filters, sorters, page, size) = get_url_params()
    index_url = url_for("index", _external=True)
    try:
        db_result = db.list_table("leaks", filters, sorters, page, size)
    except Exception as ex:
        db_result = []
        logging.ERROR("Error al listar leaks: ", str(ex))
    payload = {
        "status": "ok",
        "http_code": 200,
        "data": db_result,
        "links": set_links(),
    }
    response = make_response(payload, headers)
    return response, 200


# Show elements
# @authenticate(token_auth)
@app.route("/channels/<int:id>/", methods=["GET"])
# @response(schema.Response)


@other_responses({400: "Invalid request.", 404: "Channel not found."})
def show_channel(id: Annotated[int, "The id of the channel to retrieve."]):
    """Channel

        Returns channel by id.

    Args:
        id (int): Channel identifier

    Returns:
        JSON: Contains the status and code of the request, the data related to the channel and the link to the page index.
    """
    print("datos del canal", id)

    index_url = url_for("index", _external=True)

    db_result = db.show_element("channels", id)
    print(db_result)

    payload = {
        "status": "ok",
        "http_code": 200,
        "data": db_result,
        "links": set_links(),
    }
    response = make_response(payload, headers)
    return response, 200


# @authenticate(token_auth)
@app.route("/organizations/<int:id>", methods=["GET"])
# @response(schema.Response)


@other_responses({400: "Invalid request.", 404: "Organization not found."})
def show_organization(id: Annotated[int, "The id of the organization to retrieve."]):
    """Organization
        Returns organization by id.

    Args:
        id (int): Organization identifier.


    Returns:
        JSON:
        - status of the request
        - http_code of the request
        - data : data related to the organization
        - link : hiperlink to the index page
    """
    index_url = url_for("index", _external=True)

    db_result = db.show_element("organizations", id)
    payload = {
        "status": "ok",
        "http_code": 200,
        "data": db_result,
        "links": set_links(),
    }
    response = make_response(payload, headers)
    return response, 200


# @authenticate(token_auth)
@app.route("/persons/<int:id>", methods=["GET"])
# @response(schema.Response)


@other_responses({400: "Invalid request.", 404: "Person not found."})
def show_person(id: Annotated[int, "The id of the person to retrieve."]):
    """Person
        Returns person by id.

    Args:
        id (int): Person identifier.

    Returns:
        JSON:
        - status of the request
        - http_code of the request
        - data : data related to the person
        - link : hiperlink to the index page
    """
    index_url = url_for("index", _external=True)

    db_result = db.show_element("persons", id)
    payload = {
        "status": "ok",
        "http_code": 200,
        "data": db_result,
        "links": set_links(),
    }
    response = make_response(payload, headers)
    return response, 200


# @authenticate(token_auth)
@app.route("/entities/<string:type>/<int:id>", methods=["GET"])
# @response(schema.Response)
@other_responses({400: "Invalid request.", 404: "Entity not found."})
def show_entity(type, id: Annotated[int, "The id of the entity to retrieve."]):
    """Entity
        Returns entity type by id.

    Args:
        id (int): Entity identifier.


    Returns:
        JSON:
        - status of the request
        - http_code of the request
        - data : data related to the entity
        - link : hiperlink to the index page
    """
    index_url = url_for("index", _external=True)
    if not check_entity_type(type):
        http_code = 400
        payload = {
            "status": "error",
            "http_code": http_code,
            "message": "Entity type don't exists.",
            "links": set_links(),
        }
    else:
        try:
            db_result = db.show_element(type, id)
        except Exception as ex:
            logging.error("Showing element error: ", str(ex))
        http_code = 200
        payload = {
            "status": "ok",
            "http_code": http_code,
            "data": db_result,
            "links": set_links(),
        }
    response = make_response(payload, headers)
    return response, http_code


# @authenticate(token_auth)
@app.route("/discoveries/<int:id>", methods=["GET"])
# @response(schema.Response)


@other_responses({400: "Invalid request.", 404: "Discovery not found."})
def show_discovery(id: Annotated[int, "The id of the discovery to retrieve."]):
    """Discovery
        Returns discovery by id.

    Args:
        id (int): Discovery identifier.


    Returns:
        JSON:
        - status of the request
        - http_code of the request
        - data : data related to the discovery
        - link : hiperlink to the index page
    """
    index_url = url_for("index", _external=True)

    db_result = db.show_element("discoveries", id)
    payload = {
        "status": "ok",
        "http_code": 200,
        "data": db_result,
        "links": set_links(),
    }
    response = make_response(payload, headers)
    return response, 200


# @authenticate(token_auth)
@app.route("/requests/<int:id>", methods=["GET"])
# @response(schema.Response)


@other_responses({400: "Invalid request.", 404: "Request not found."})
def show_request(id: Annotated[int, "The id of the request to retrieve."]):
    """Request
        Returns request by id.

    Args:
        id (int): Request identifier.


    Returns:
        JSON:
        - status of the request
        - http_code of the request
        - data : data related to the request
        - link : hiperlink to the index page
    """
    index_url = url_for("index", _external=True)

    db_result = db.show_element("requests", id)
    payload = {
        "status": "ok",
        "http_code": 200,
        "data": db_result,
        "links": set_links(),
    }
    response = make_response(payload, headers)
    return response, 200


# @authenticate(token_auth)
@app.route("/users/<string:username>", methods=["GET"])
# @response(schema.Response)


@other_responses({400: "Invalid request.", 404: "User not found."})
def show_user(username: Annotated[str, "The username of the user to retrieve."]):
    """User
        Returns user by username.

    Args:
        username (string): User's username.


    Returns:
        JSON:
        - status of the request
        - http_code of the request
        - data : data related to the user
        - link : hiperlink to the index page
    """
    index_url = url_for("index", _external=True)

    db_result = cognito.show_user(username)
    payload = {
        "status": "ok",
        "http_code": 200,
        "data": db_result,
        "links": set_links(),
    }
    response = make_response(payload, headers)
    return response, 200


# @authenticate(token_auth)
@app.route("/leaks/<int:id>", methods=["GET"])
# @response(schema.Response)


@other_responses({400: "Invalid request.", 404: "Leak not found."})
def show_leak(id: Annotated[int, "The id of the leak to retrieve."]):
    """Leak
        Returns leak by id.

    Args:
        id (int): Leak identifier.


    Returns:
        JSON:
        - status of the request
        - http_code of the request
        - data : data related to the leak
        - link : hiperlink to the index page
    """
    index_url = url_for("index", _external=True)

    db_result = db.show_element("leaks", id)
    payload = {
        "status": "ok",
        "http_code": 200,
        "data": db_result,
        "links": set_links(),
    }
    response = make_response(payload, headers)
    return response, 200


# Add element
# @authenticate(token_auth)
@app.route("/channels/add/", methods=["POST"])
# #@body(schema.ChannelSchema)
# @response(schema.Response)
@other_responses({400: "Invalid request."})
def add_channel():
    """Add channel
        Inserts a new channel into the database.
    Returns:
        JSON:
        - status of the request
        - http_code of the request
        - data : data related to the new channel
        - link : hiperlink to the index page
    """
    try:
        body = request.get_json()
        # Decodificar 'data' si es una cadena JSON
        if isinstance(body["data"], str):
            body["data"] = json.loads(body["data"])
    except Exception as e:
        logging.error("Invalid JSON", str(e))
        return jsonify({"error": "Invalid JSON data"}), 400
    index_url = url_for("index", _external=True)

    db_result = db.insert_element("channels", body["data"])
    payload = {
        "status": "ok",
        "http_code": 200,
        "data": db_result,
        "links": set_links(),
    }
    response = make_response(payload, headers)
    return response, 200


# @authenticate(token_auth)
@app.route("/organizations/", methods=["POST"])
##@body(schema.OrganizationSchema)
# @response(schema.Response)


@other_responses({400: "Invalid request."})
def add_organization():
    """Add organization
        Inserts a new organization into the database.

    Returns:
        JSON:
        - status of the request
        - http_code of the request
        - data : data related to the new organization
        - link : hiperlink to the index page
    """
    try:
        body = request.get_json()
    except Exception as e:
        logging.error("Invalid JSON")
        return jsonify({"error": "Invalid JSON data"}), 400
    index_url = url_for("index", _external=True)

    db_result = db.insert_element("organizations", body)
    payload = {
        "status": "ok",
        "http_code": 200,
        "data": db_result,
        "links": set_links(),
    }
    response = make_response(payload, headers)
    return response, 200


# @authenticate(token_auth)
@app.route("/persons/add/", methods=["POST"])
##@body(schema.PersonSchema)
# @response(schema.Response)


@other_responses({400: "Invalid request."})
def add_person():
    """Add person
        Inserts a new person into the database.

    Returns:
        JSON:
        - status of the request
        - http_code of the request
        - data : data related to the new person
        - link : hiperlink to the index page
    """
    try:
        body = request.get_json()
    except Exception as e:
        logging.error("Invalid JSON")
        return jsonify({"error": "Invalid JSON data"}), 400
    index_url = url_for("index", _external=True)

    db_result = db.insert_element("persons", body)
    payload = {
        "status": "ok",
        "http_code": 200,
        "data": db_result,
        "links": set_links(),
    }
    response = make_response(payload, headers)
    return response, 200


# @authenticate(token_auth)
@app.route("/entities/<string:entityType>/", methods=["POST"])
# #@body(schema.EntitySchema)
# @response(schema.Response)
@other_responses({400: "Invalid request."})
def add_entity(entityType):
    """Add entity
        Inserts a new entity into the database.

    Returns:
        JSON:
        - status of the request
        - http_code of the request
        - data : data related to the new entity
        - link : hiperlink to the index page
    """
    index_url = url_for("index", _external=True)

    # Resultado de la petición
    request_result = request.get_json()

    # Obtener "data" de la petición
    request_data = json.loads(request_result.get("data", "{}"))

    # Creación del diccionario "body" (excluyendo el campo "type")
    body = {campo: valor for campo, valor in request_data.items() if campo != "type"}
    try:
        db_result = db.insert_element(entityType, body)
        payload = {
            "status": "ok",
            "http_code": 200,
            "data": db_result,
            "links": set_links(),
        }
    except Exception as ex:
        payload = {
            "status": "error",
            "http_code": 400,
            "message": str(ex),
            "links": set_links(),
        }
        logging.error("Error al añadir la entidad: ", str(ex))

    payload = {
        "status": "ok",
        "http_code": 200,
        "data": db_result,
        "links": set_links(),
    }
    response = make_response(payload, headers)
    return response, 200


# @authenticate(token_auth)
@app.route("/discoveries/", methods=["POST"])
##@body(schema.DiscoverySchema)
# @response(schema.Response)
@other_responses({400: "Invalid request."})
def add_discovery():
    """Add discovery
        Inserts a new discovery into the database.

    Returns:
        JSON:
        - status of the request
        - http_code of the request
        - data : data related to the new discovery
        - link : hiperlink to the index page
    """
    try:
        body = request.get_json()
    except Exception as e:
        logging.error("Invalid JSON")
        return jsonify({"error": "Invalid JSON data"}), 400

    index_url = url_for("index", _external=True)
    db_result = db.insert_element("discoveries", body)
    payload = {
        "status": "ok",
        "http_code": 200,
        "data": db_result,
        "links": set_links(),
    }
    response = make_response(payload, headers)
    return response, 200


### Ruta para las gráficas
@app.route("/donnut/graph/", methods=["GET"])
# #@body(schema.DiscoverySchema)
# @response(schema.Response)
# @other_responses({400: "Invalid request."})
def get_discovery_graph():
    """Show risk's discoveries count
        Inserts a new discovery into the database.

    Returns:
        JSON:
        - status of the request
        - http_code of the request
        - data : data related to the new discovery
        - link : hiperlink to the index page
    """

    index_url = url_for("index", _external=True)
    # db_result = db.list_table("discoveries", filters={"risk":"low"})
    db_result = [
        {"name": "low", "value": 20},
        {"name": "medium", "value": 50},
        {"name": "high", "value": 5},
        {"name": "critical", "value": 78},
    ]
    payload = {
        "status": "ok",
        "http_code": 200,
        "data": db_result,
        "links": set_links(),
    }
    response = make_response(payload, headers)
    return response, 200


### Ruta para las gráficas
@app.route("/graphs/<string:type>/", methods=["GET", "POST"])
# #@body(schema.DiscoverySchema)
# @response(schema.Response)
# @other_responses({400: "Invalid request."})
def get_graph(type):
    """Get the graph data according to its type
        Inserts a new discovery into the database.

    Returns:
        JSON:
        - status of the request
        - http_code of the request
        - data : data related to the graph selected
        - link : hiperlink to the index page
    """
    if not check_graph_type(type):
        http_code = 400
        payload = {
            "status": "error",
            "http_code": http_code,
            "message": "Graph type don't exists.",
            "links": set_links(),
        }
    else:
        index_url = url_for("index", _external=True)

        if type.lower() == "piechart":
            # Senticia SQL o funcion db

            # db_result = db.list_table("discoveries", filters={"risk":"low"})
            db_result = [
                {"name": "low", "value": 20},
                {"name": "medium", "value": 50},
                {"name": "high", "value": 5},
                {"name": "critical", "value": 78},
            ]
        elif type.lower() == "donnutchart":
            db_result = [
                {"name": "VIP", "value": 20},
                {"name": "employee", "value": 50},
                {"name": "No human", "value": 5},
                {"name": "critical", "value": 78},
            ]
        elif type.lower() == "scatterplot":
            if request.method == "GET":
                db_result = [
                    {
                        "data": [
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
                        "dateRange": {
                            "selected": 1,
                            "start": "today",
                            "end": "tomorrow",
                        },
                    }
                ]

            if request.method == "POST":
                post_data = request.get_json()
                print(post_data)
                db_result = post_data
        payload = {
            "status": "ok",
            "http_code": 200,
            "data": db_result,
            "links": set_links(),
        }
        response = make_response(payload, headers)
        return response, 200


# @authenticate(token_auth)
@app.route("/requests/add/", methods=["POST"])
##@body(schema.RequestSchema)
# @response(schema.Response)


@other_responses({400: "Invalid request."})
def add_request():
    """Add request
        Inserts a new request into the database.

    Returns:
        JSON:
        - status of the request
        - http_code of the request
        - data : data related to the new request
        - link : hiperlink to the index page
    """
    try:
        body = request.get_json()
    except Exception as e:
        logging.error("Invalid JSON")
        return jsonify({"error": "Invalid JSON data"}), 400
    index_url = url_for("index", _external=True)

    db_result = db.insert_element("requests", body)
    payload = {
        "status": "ok",
        "http_code": 200,
        "data": db_result,
        "links": set_links(),
    }
    response = make_response(payload, headers)
    return response, 200


# @authenticate(token_auth)
@app.route("/users/", methods=["POST"])
##@body(schema.UserSchema)
# @response(schema.Response)


@other_responses({400: "Invalid request."})
def add_user():
    """Add user
        Inserts a new user into the cognito database.

    Returns:
        JSON:
        - status of the request
        - http_code of the request
        - data : data related to the new user
        - link : hiperlink to the index page
    """
    try:
        body = request.get_json()
    except Exception as e:
        logging.error("Invalid JSON")
        return jsonify({"error": "Invalid JSON data"}), 400
    index_url = url_for("index", _external=True)

    db_result = cognito.insert_user(body)
    payload = {
        "status": "ok",
        "http_code": 200,
        "data": db_result,
        "links": set_links(),
    }
    response = make_response(payload, headers)
    return response, 200


# @authenticate(token_auth)
@app.route("/leaks/", methods=["POST"])
##@body(schema.LeakSchema)
# @response(schema.Response)


@other_responses({400: "Invalid request."})
def add_leak():
    """Add leak
        Inserts a new leak into the database.

    Returns:
        JSON:
        - status of the request
        - http_code of the request
        - data : data related to the new leak
        - link : hiperlink to the index page
    """
    try:
        body = request.get_json()
    except Exception as e:
        logging.error("Invalid JSON")
        return jsonify({"error": "Invalid JSON data"}), 400
    index_url = url_for("index", _external=True)

    db_result = db.insert_element("leaks", body)
    payload = {
        "status": "ok",
        "http_code": 200,
        "data": db_result,
        "links": set_links(),
    }
    response = make_response(payload, headers)
    return response, 200


# Edit element


# @authenticate(token_auth)
@app.route("/channels/<int:id>/", methods=["PUT"])
# #@body(schema.ChannelSchema)
# @response(schema.Response)


@other_responses({400: "Invalid request.", 404: "Channel not found."})
def edit_channel(id: Annotated[int, "The id of the channel to retrieve."]):
    """Edit channel

    Args:
        id (integer): Channel identifier

    Returns:
        JSON:
        - status of the request
        - http_code of the request
        - data : data related to the modified channel
        - link : hiperlink to the index page
    """

    try:
        request_body = request.get_json()
        body = json.loads(request_body.get("data", "{}"))

    except Exception as e:
        logging.error("Invalid JSON", str(e))
        return jsonify({"error": "Invalid JSON data", "error": str(e)}), 400
    index_url = url_for("index", _external=True)

    db_result = db.edit_element("channels", id, body)
    payload = {
        "status": "ok",
        "http_code": 200,
        "data": db_result,
        "links": set_links(),
    }
    response = make_response(payload, headers)
    return response, 200


# @authenticate(token_auth)
@app.route("/organizations/<int:id>", methods=["PUT"])
##@body(schema.OrganizationSchema)
# @response(schema.Response)


@other_responses({400: "Invalid request.", 404: "Organization not found."})
def edit_organization(id: Annotated[int, "The id of the organization to retrieve."]):
    """Edit organization

    Args:
        id (integer): Organization identifier

    Returns:
        JSON:
        - status of the request
        - http_code of the request
        - data : data related to the modified organization
        - link : hiperlink to the index page
    """
    try:
        request_body = request.get_json()
        body = json.loads(request_body.get("data", "{}"))

    except Exception as e:
        logging.error("Invalid JSON")
        return jsonify({"error": "Invalid JSON data"}), 400
    index_url = url_for("index", _external=True)

    db_result = db.edit_element("organizations", id, body)
    payload = {
        "status": "ok",
        "http_code": 200,
        "data": db_result,
        "links": set_links(),
    }
    response = make_response(payload, headers)
    return response, 200


# @authenticate(token_auth)
@app.route("/persons/<int:id>", methods=["PUT"])
##@body(schema.PersonSchema)
# @response(schema.Response)


@other_responses({400: "Invalid request.", 404: "Person not found."})
def edit_person(id: Annotated[int, "The id of the person to retrieve."]):
    """Edit person

    Args:
        id (integer): Person identifier

    Returns:
        JSON:
        - status of the request
        - http_code of the request
        - data : data related to the modified person
        - link : hiperlink to the index page
    """
    try:
        request_body = request.get_json()
        body = json.loads(request_body.get("data", "{}"))
    except Exception as e:
        logging.error("Invalid JSON")
        return jsonify({"error": "Invalid JSON data"}), 400
    index_url = url_for("index", _external=True)

    db_result = db.edit_element("persons", id, body)
    payload = {
        "status": "ok",
        "http_code": 200,
        "data": db_result,
        "links": set_links(),
    }
    response = make_response(payload, headers)
    return response, 200


# @authenticate(token_auth)
@app.route("/entities/<string:type>/<int:id>/", methods=["PUT"])
##@body(schema.EntitySchema)
@other_responses({400: "Invalid request.", 404: "Entity not found."})
def edit_entity(type, id: Annotated[int, "The id of the entity to retrieve."]):
    """Edit entity

    Args:
        id (integer): Entity identifier

    Returns:
        JSON:
        - status of the request
        - http_code of the request
        - data : data related to the modified entity
        - link : hiperlink to the index page
    """
    # Check if type exists
    if not check_entity_type(type):
        http_code = 400
        payload = {
            "status": "error",
            "http_code": http_code,
            "message": "Entity type don't exists.",
            "links": set_links(),
        }
    else:
        try:
            body = request.get_json()
        except Exception as e:
            logging.error("Invalid JSON")
            return jsonify({"error": "Invalid JSON data"}), 400

        index_url = url_for("index", _external=True)

        db_result = db.edit_element("entities", id, body)
        http_code = 200
        payload = {
            "status": "ok",
            "http_code": http_code,
            "data": db_result,
            "links": set_links(),
        }
    response = make_response(payload, headers)
    return response, http_code


# @authenticate(token_auth)
@app.route("/discoveries/<int:id>", methods=["PUT"])
##@body(schema.DiscoverySchema)
# @response(schema.Response)


@other_responses({400: "Invalid request.", 404: "Discovery not found."})
def edit_discovery(id: Annotated[int, "The id of the discovery to retrieve."]):
    """Edit discovery

    Args:
        id (integer): Discovery identifier

    Returns:
        JSON:
        - status of the request
        - http_code of the request
        - data : data related to the modified discovery
        - link : hiperlink to the index page
    """
    try:
        request_body = request.get_json()
        body = json.loads(request_body.get("data", "{}"))
    except Exception as e:
        logging.error("Invalid JSON")
        return jsonify({"error": "Invalid JSON data"}), 400
    index_url = url_for("index", _external=True)

    db_result = db.edit_element("discoveries", id, body)
    payload = {
        "status": "ok",
        "http_code": 200,
        "data": db_result,
        "links": set_links(),
    }
    response = make_response(payload, headers)
    return response, 200


# @authenticate(token_auth)
@app.route("/requests/<int:id>", methods=["PUT"])
#@body(schema.RequestSchema)
# @response(schema.Response)


@other_responses({400: "Invalid request.", 404: "Request not found."})
def edit_request(id: Annotated[int, "The id of the request to retrieve."]):
    """Edit request

    Args:
        id (integer): Request identifier

    Returns:
        JSON:
        - status of the request
        - http_code of the request
        - data : data related to the modified request
        - link : hiperlink to the index page
    """
    try:
        request_body = request.get_json()
        body = json.loads(request_body.get("data", "{}"))
    except Exception as e:
        logging.error("Invalid JSON")
        return jsonify({"error": "Invalid JSON data"}), 400
    index_url = url_for("index", _external=True)

    db_result = db.edit_element("requests", id, body)
    payload = {
        "status": "ok",
        "http_code": 200,
        "data": db_result,
        "links": set_links(),
    }
    response = make_response(payload, headers)
    return response, 200


# @authenticate(token_auth)
@app.route("/users/<string:username>", methods=["PUT"])
#@body(schema.UserSchema)
# @response(schema.Response)


@other_responses({400: "Invalid request.", 404: "User not found."})
def edit_user(username: Annotated[str, "The username of the user to retrieve."]):
    """Edit user

    Args:
        id (integer): User's username

    Returns:
        JSON:
        - status of the request
        - http_code of the request
        - data : data related to the modified user
        - link : hiperlink to the index page
    """
    try:
        body = request.get_json()
    except Exception as e:
        logging.error("Invalid JSON")
        return jsonify({"error": "Invalid JSON data"}), 400
    index_url = url_for("index", _external=True)

    db_result = cognito.edit_user(username, body)
    payload = {
        "status": "ok",
        "http_code": 200,
        "data": db_result,
        "links": set_links(),
    }
    response = make_response(payload, headers)
    return response, 200


# @authenticate(token_auth)
@app.route("/leaks/<int:id>", methods=["PUT"])
#@body(schema.LeakSchema)
# @response(schema.Response)


@other_responses({400: "Invalid request.", 404: "Leak not found."})
def edit_leak(id: Annotated[int, "The id of the leak to retrieve."]):
    """Edit leak

    Args:
        id (integer): Leak identifier

    Returns:
        JSON:
        - status of the request
        - http_code of the request
        - data : data related to the modified leak
        - link : hiperlink to the index page
    """
    try:
        request_body = request.get_json()
        body = json.loads(request_body.get("data", "{}"))
    except Exception as e:
        logging.error("Invalid JSON")
        return jsonify({"error": "Invalid JSON data"}), 400
    index_url = url_for("index", _external=True)

    db_result = db.edit_element("leaks", id, body)
    payload = {
        "status": "ok",
        "http_code": 200,
        "data": db_result,
        "links": set_links(),
    }
    response = make_response(payload, headers)
    return response, 200


# Delete elements
# @authenticate(token_auth)
@app.route("/channels/<int:id>", methods=["DELETE"])
# @response(schema.Response)


@other_responses({400: "Invalid request.", 404: "Channel not found."})
def delete_channel(id: Annotated[int, "The id of the channel to retrieve."]):
    """Delete channel

    Args:
        id (integer): Channel identifier

    Returns:
        JSON:
        - status of the request
        - http_code of the request
        - data (boolean)
        - link : hiperlink to the index page
    """
    index_url = url_for("index", _external=True)

    db_result = db.delete_element("channels", id)
    payload = {
        "status": "ok",
        "http_code": 200,
        "data": db_result,
        "links": set_links(),
    }
    response = make_response(payload, headers)
    return response, 200


# @authenticate(token_auth)
@app.route("/organizations/<int:id>", methods=["DELETE"])
# @response(schema.Response)


@other_responses({400: "Invalid request.", 404: "Organization not found."})
def delete_organization(id: Annotated[int, "The id of the organization to retrieve."]):
    """Delete organization

    Args:
        id (integer): Organization identifier

    Returns:
        JSON:
        - status of the request
        - http_code of the request
        - data (boolean)
        - link : hiperlink to the index page
    """
    index_url = url_for("index", _external=True)

    db_result = db.delete_element("organizations", id)
    payload = {
        "status": "ok",
        "http_code": 200,
        "data": db_result,
        "links": set_links(),
    }
    response = make_response(payload, headers)
    return response, 200


# @authenticate(token_auth)
@app.route("/persons/<int:id>", methods=["DELETE"])
# @response(schema.Response)


@other_responses({400: "Invalid request.", 404: "Person not found."})
def delete_person(id: Annotated[int, "The id of the person to retrieve."]):
    """Delete person

    Args:
        id (integer): Person identifier

    Returns:
        JSON:
        - status of the request
        - http_code of the request
        - data (boolean)
        - link : hiperlink to the index page
    """
    index_url = url_for("index", _external=True)

    db_result = db.delete_element("persons", id)
    payload = {
        "status": "ok",
        "http_code": 200,
        "data": db_result,
        "links": set_links(),
    }
    response = make_response(payload, headers)
    return response, 200


# @authenticate(token_auth)
@app.route("/entities/<string:type>/<int:id>/", methods=["DELETE"])
# @response(schema.Response)


@other_responses({400: "Invalid request.", 404: "Entity not found."})
def delete_entity(type, id: Annotated[int, "The id of the entity to retrieve."]):
    """Delete entity

    Args:
        id (integer): Entity identifier

    Returns:
        JSON:
        - status of the request
        - http_code of the request
        - data (boolean)
        - link : hiperlink to the index page
    """
    if not check_entity_type(type):
        http_code = 400
        payload = {
            "status": "error",
            "http_code": http_code,
            "message": "Entity type don't exists.",
            "links": set_links(),
        }
    else:
        index_url = url_for("index", _external=True)
        http_code = 200
        try:
            db.delete_element(type, id)
        except Exception as ex:
            logging.error("Error deleting element. ", str(ex))
            payload = {
                "status": "error",
                "http_code": http_code,
                "message": str(ex),
                "links": {
                    "index": index_url,
                },
            }
        payload = {
            "status": "ok",
            "http_code": 200,
            "message": "Deleted element.",
            "links": set_links(),
        }
        response = make_response(payload, headers)
    return response, http_code


# @authenticate(token_auth)
@app.route("/discoveries/<int:id>", methods=["DELETE"])
# @response(schema.Response)


@other_responses({400: "Invalid request.", 404: "Discovery not found."})
def delete_discovery(id: Annotated[int, "The id of the discovery to retrieve."]):
    """Delete discovery

    Args:
        id (integer): Discovery identifier

    Returns:
        JSON:
        - status of the request
        - http_code of the request
        - data (boolean)
        - link : hiperlink to the index page
    """
    index_url = url_for("index", _external=True)

    db_result = db.delete_element("discoveries", id)
    payload = {
        "status": "ok",
        "http_code": 200,
        "data": db_result,
        "links": set_links(),
    }
    response = make_response(payload, headers)
    return response, 200


# @authenticate(token_auth)
@app.route("/requests/<int:id>", methods=["DELETE"])
#@body(schema.RequestSchema)
@other_responses({400: "Invalid request.", 404: "Request not found."})
def delete_request(id: Annotated[int, "The id of the request to retrieve."]):
    """Delete request

    Args:
        id (integer): Request identifier

    Returns:
        JSON:
        - status of the request
        - http_code of the request
        - data (boolean)
        - link : hiperlink to the index page
    """
    index_url = url_for("index", _external=True)

    db_result = db.delete_element("requests", id)
    payload = {
        "status": "ok",
        "http_code": 200,
        "data": db_result,
        "links": set_links(),
    }
    response = make_response(payload, headers)
    return response, 200


# @authenticate(token_auth)
@app.route("/users/<string:username>", methods=["DELETE"])
# @response(schema.Response)


@other_responses({400: "Invalid request.", 404: "User not found."})
def delete_user(username: Annotated[str, "The username of the user to retrieve."]):
    """Delete user

    Args:
        username (string): User's username

    Returns:
        JSON:
        - status of the request
        - http_code of the request
        - data (boolean)
        - link : hiperlink to the index page
    """
    index_url = url_for("index", _external=True)

    db_result = cognito.delete_user(username)
    payload = {
        "status": "ok",
        "http_code": 200,
        "data": db_result,
        "links": set_links(),
    }
    response = make_response(payload, headers)
    return response, 200


# @authenticate(token_auth)
@app.route("/leaks/<int:id>", methods=["DELETE"])
# @response(schema.Response)


@other_responses({400: "Invalid request.", 404: "Leak not found."})
def delete_leak(id: Annotated[int, "The id of the leak to retrieve."]):
    """Delete leak

    Args:
        id (integer): Leak identifier

    Returns:
        JSON:
        - status of the request
        - http_code of the request
        - data (boolean)
        - link : hiperlink to the index page
    """
    index_url = url_for("index", _external=True)

    db_result = db.delete_element("leaks", id)
    payload = {
        "status": "ok",
        "http_code": 200,
        "data": db_result,
        "links": set_links(),
    }
    response = make_response(payload, headers)
    return response, 200


# Actions
def failure(status, message, body=None):
    body = body or {}
    return {
        "statusCode": status,
        "body": json.dumps({"success": False, "error": message, **body}),
    }


# COMPROBAR QUE EL ELEMENTO EXISTA
def check_params(element_kind: str, body=None, element_id=None):
    """Metodo que permitira refactorizar los parametros comunes de los metodos POST, PUT y DELETE"""
    if element_kind not in api.API.keys():
        return failure(404, "Invalid element kind")
    if element_id is not None:  # Mostrar editable, añadir, eliminar
        try:
            db.check_exists(element_kind, element_id)

            if element_kind == "users":
                element_id = str(element_id)
            else:
                element_id = int(element_id)
        except ValueError:
            return failure(400, "Value error on id parameter")
    if body is not None:  # Editar, añadir
        if not isinstance(body, dict):
            return failure(400, "Wrong data type")
        # Comprobar que todos los campos del body existan en 'fields'
        if not all(k in api.API[element_kind]["fields"] for k in body.keys()):
            return failure(400, "Wrong data")
        if element_id is None:
            for k in api.API[element_kind]["required_fields"]:
                if k not in body.keys():
                    return failure(400, "Fail: data required")
    return None


def check_types(event, type_action, user):
    # Obtener el elemento del path
    element_kind = event["pathParameters"]["element_kind"]
    # Definir datos del usuario (parametros)
    permission = user["permission"]
    # Comprobar que el usuario tiene permiso para esa acción
    if (
        permission in api.API[element_kind]["permissions"].keys()
        and type_action in api.API[element_kind]["permissions"][permission]
    ):
        # Si hay id ( mostrar, añadir, eliminar)
        return None
    else:
        return failure(403, "Action denied")


# @app.route("/login")
# def login():
#     """Redirige al login.
#     Requiere Username y Password.
#     Permite 'Olvidó contraseña' y 'Registrarse'
#     """
#     login = cognito.login(session, request.args)
#     return redirect(login)


# @app.route("/logout")
# def logout():
#     """Logout route"""

#     session.clear()

#     logout = cognito.logout()
#     return redirect(logout)

class User(flask_login.UserMixin):
    """Standard flask_login UserMixin"""
 
    pass

@app.route("/callback")
def callback():
    usuario = cognito.callback(session, request.args)

    if usuario is not None:
        """Pasamos a la sesion el permiso que obtenemos del usuario"""
        session["group"] = usuario["group"]
        session["element_id"] = usuario["element_id"]
        session["email"] = usuario["email"]
        session["expires"] = usuario["expires"]
        user = User()
        user.id = usuario["username"]
        flask_login.login_user(user, remember=True)
        return redirect(url_for("dashboard"))
    return redirect("/")

# Para probar el registro de usuario con codigo. devolverá al usuario 2
REGISTER_CODE = "12345"

# Para el logeo de usuarios.
users = {
    "aquest": {
        "user_id": 1,
        "username": "aquest",
        "password": "Aquest123_",
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


#@app.route("/login", methods=["GET", "POST"])
#def login():
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


def get_secret_hash(username):
    """
    Generate the secret hash using the username, client ID, and client secret.
    https://docs.aws.amazon.com/cognito/latest/developerguide/signing-up-users-in-your-app.html#cognito-user-pools-computing-secret-hash
    """
    message = username + app.config["COGNITO_CLIENT_ID"]
    key = bytes(app.config["COGNITO_CLIENT_SECRET"], "latin-1")
    msg = bytes(message, "latin-1")
    dig = hmac.new(key, msg, digestmod=hashlib.sha256).digest()
    print()
    return base64.b64encode(dig).decode()
 
 
def decode_jwt(token):
    # Decode JWT: We skip verification for now...
    decoded = jwt.decode(token, options={"verify_signature": False})
    return decoded

@app.route("/login/", methods=["POST"])
def login():
    """
    Login endpoint
    """
 
    username = request.json.get("username")
    password = request.json.get("password")
    secret_hash = get_secret_hash(username)
 
    try:
        print('si')
        # Initiate the authentication process
        auth_response = cognito_client.initiate_auth(
            ClientId=app.config["COGNITO_CLIENT_ID"],
            AuthFlow=app.config["COGNITO_AUTH_FLOW"],
            AuthParameters={
                "USERNAME": username,
                "PASSWORD": password,
                "SECRET_HASH": secret_hash,
            },
        )
        print(auth_response)
        # print(json.dumps(auth_response))
        # If authentication is successful, return the tokens
        if auth_response and "AuthenticationResult" in auth_response:
            # Decodificar el payload del token JWT
            auth = {}
            try:
                # DEfino la variable global como el id_token
 
                decoded = decode_jwt(auth_response["AuthenticationResult"]["IdToken"])
                print("decoded-->", decoded, type(decoded))
               
                # Trying to insert user in db (users) if no exists
                try:
                    db.insert_user(
                        username=decoded["cognito:username"],
                        user_sub=decoded["sub"],
                        email=decoded["email"],
                        token=auth_response["AuthenticationResult"]["IdToken"],
                    )
                    print(
                        " \n ID TOKEN DESDE LOGIN \n ",
                        auth_response["AuthenticationResult"]["IdToken"],
                    )
                except Exception as ee:
                    logging.ERROR("Error al insertar usuario", str(ee))
                    db.update_user_token(
                        username=decoded["cognito:username"],
                        token=auth_response["AuthenticationResult"]["IdToken"],
                    )
                exp_date = decoded["exp"]
                auth = {
                    "sub": decoded["sub"],
                    "username": decoded["cognito:username"],
                    "email": decoded["email"],
                    "token": auth_response["AuthenticationResult"]["IdToken"],
                }
                print(auth)
            except Exception as ex:
                print("Decoding jwt failed.", str(ex))
            try:
                user_info = cognito.show_user(decoded["cognito:username"])
                if "name" in user_info:
                    auth["name"] = user_info["name"]
            except Exception as ex:
                logging.ERROR("Error getting user info", str(ex))
            try:
                user_group = cognito.show_group(decoded["cognito:username"])
                if user_group is not None:
                    auth["groups"] = user_group
 
            except Exception as ex:
                logging.ERROR("Error getting user info", str(ex))
            return (
                jsonify(
                    {
                        "http_code": 200,
                        "security": auth,
                        # 'id_token': auth_response['AuthenticationResult']['IdToken'],  # We want this token...
                        # 'access_token': auth_response['AuthenticationResult']['AccessToken'],  # ...but we don't want this other
                        # 'refresh_token': auth_response['AuthenticationResult']['RefreshToken'],
                        # this is for life span
                    }
                ),
                200,
            )
        else:
            # If authentication fails something happened with credentials and/or the username hash
            return jsonify({"message": "Authentication failed"}), 401
    except ClientError as e:
        # This means AWS is responding with an error because we didn't provide the right credentials
        return jsonify({"message": e.response["Error"]["Message"]}), 400
 


@app.route("/tenants/", methods=["GET", "POST"])
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
 
    print("id del tenant0", id)
    code = 400
    print("************", users.keys())
    try:
        for k in users.keys():
            print("kkkkk-----------------", k)
            u = users[k]
            print("uuuuuuu-----------------", u)
 
            if str(u.get("user_id")) == str(id):
                code = 200
                print(u["tenants"])
                print(jsonify(u["tenants"]), code)
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
        print("data", data)
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
            # Logica de verificar token... no la usamos aqui, ya que esto es solo para prueba
            # Estamos de pruebas de momento que devuelva unos valores sin comprobar mas
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
                        "id": 6,
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


@app.route("/map/", methods=["GET", "POST"])
def get_maps():
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
            if request.method == "GET":
                result = {
                    "security": [],
                    "data": [
                        {
                            "id": 2,
                            "idPosition": 2,
                            "type": "map",
                            "name": "map",
                            "region": 2,
                            "sector": 0,
                            "data_levels": [
                                {
                                    "country_id": 1,
                                    "lat": 40.7128,
                                    "lon": -74.0060,
                                    "sectors": {
                                        0: 10,
                                        1: 2,
                                        2: 3,
                                        3: 4,
                                        4: 5,
                                        5: 3,
                                        6: 1,
                                        7: 33,
                                        8: 1,
                                        9: 10,
                                        10: 0,
                                        11: 5,
                                        12: 23,
                                        13: 1,
                                        14: 23,
                                        15: 3,
                                    },
                                },
                                {
                                    "country_id": 2,
                                    "lat": 34.0522,
                                    "lon": -118.2437,
                                    "sectors": {
                                        0: 8,
                                        1: 4,
                                        2: 2,
                                        3: 6,
                                        4: 7,
                                        5: 3,
                                        6: 1,
                                        7: 33,
                                        8: 1,
                                        9: 10,
                                        10: 0,
                                        11: 5,
                                        12: 23,
                                        13: 1,
                                        14: 23,
                                        15: 3,
                                    },
                                },
                                {
                                    "country_id": 3,
                                    "lat": 51.5074,
                                    "lon": -0.1278,
                                    "sectors": {
                                        0: 5,
                                        1: 3,
                                        2: 8,
                                        3: 1,
                                        4: 4,
                                        5: 3,
                                        6: 1,
                                        7: 33,
                                        8: 1,
                                        9: 10,
                                        10: 0,
                                        11: 5,
                                        12: 23,
                                        13: 1,
                                        14: 23,
                                        15: 3,
                                    },
                                },
                                {
                                    "country_id": 4,
                                    "lat": 48.8566,
                                    "lon": 2.3522,
                                    "sectors": {
                                        0: 7,
                                        1: 50,
                                        2: 40,
                                        3: 30,
                                        4: 20,
                                        5: 3,
                                        6: 1,
                                        7: 33,
                                        8: 1,
                                        9: 10,
                                        10: 0,
                                        11: 5,
                                        12: 23,
                                        13: 1,
                                        14: 23,
                                        15: 3,
                                    },
                                },
                                {
                                    "country_id": 5,
                                    "lat": 52.5200,
                                    "lon": 13.4050,
                                    "sectors": {
                                        0: 6,
                                        1: 1,
                                        2: 9,
                                        3: 5,
                                        4: 8,
                                        5: 3,
                                        6: 1,
                                        7: 33,
                                        8: 1,
                                        9: 10,
                                        10: 0,
                                        11: 5,
                                        12: 23,
                                        13: 1,
                                        14: 23,
                                        15: 3,
                                    },
                                },
                                {
                                    "country_id": 6,
                                    "lat": -33.8688,
                                    "lon": 151.2093,
                                    "sectors": {
                                        0: 3,
                                        1: 7,
                                        2: 1,
                                        3: 8,
                                        4: 6,
                                        5: 3,
                                        6: 1,
                                        7: 33,
                                        8: 1,
                                        9: 10,
                                        10: 0,
                                        11: 5,
                                        12: 23,
                                        13: 1,
                                        14: 23,
                                        15: 3,
                                    },
                                },
                                {
                                    "country_id": 7,
                                    "lat": 35.6895,
                                    "lon": 139.6917,
                                    "sectors": {
                                        0: 9,
                                        1: 2,
                                        2: 5,
                                        3: 4,
                                        4: 10,
                                        5: 3,
                                        6: 1,
                                        7: 33,
                                        8: 1,
                                        9: 10,
                                        10: 0,
                                        11: 5,
                                        12: 23,
                                        13: 1,
                                        14: 23,
                                        15: 3,
                                    },
                                },
                                {
                                    "country_id": 8,
                                    "lat": 37.7749,
                                    "lon": -122.4194,
                                    "sectors": {
                                        0: 4,
                                        1: 6,
                                        2: 3,
                                        3: 9,
                                        4: 1,
                                        5: 3,
                                        6: 1,
                                        7: 33,
                                        8: 1,
                                        9: 10,
                                        10: 0,
                                        11: 5,
                                        12: 23,
                                        13: 1,
                                        14: 23,
                                        15: 3,
                                    },
                                },
                                {
                                    "country_id": 14,
                                    "lat": -22.9068,
                                    "lon": -43.1729,
                                    "sectors": {
                                        0: 1,
                                        1: 9,
                                        2: 6,
                                        3: 2,
                                        4: 3,
                                        5: 3,
                                        6: 1,
                                        7: 33,
                                        8: 1,
                                        9: 10,
                                        10: 0,
                                        11: 5,
                                        12: 23,
                                    },
                                },
                            ],
                        },
                    ],
                    "sectors": [
                        {"name": "Agriculture and livestock", "value": 0},
                        {"name": "Consumer states", "value": 1},
                        {"name": "E-Commerce", "value": 2},
                        {"name": "Shops and establishments", "value": 3},
                        {"name": "Construction", "value": 4},
                        {"name": "Sport and leisure", "value": 5},
                        {"name": "Energy and environment", "value": 6},
                        {"name": "Finance, insurance and real estate", "value": 7},
                        {"name": "International", "value": 8},
                        {"name": "Internet", "value": 9},
                        {"name": "Logistics and transportation", "value": 10},
                        {"name": "Media and marketing", "value": 11},
                        {"name": "Chemicals and raw materials", "value": 12},
                        {"name": "Health and pharmatheutical industry", "value": 13},
                        {"name": "Tourism and hospitality", "value": 14},
                        {"name": "Services", "value": 15},
                        {"name": "Society", "value": 16},
                        {"name": "Technology and Telecommunications", "value": 17},
                    ],
                    "regions": [
                        {"name": "Default", "value": 0},
                        {"name": "Global", "value": 1},
                        {"name": "Europe", "value": 2},
                        {"name": "Asia", "value": 3},
                        {"name": "North America", "value": 4},
                        {"name": "South America", "value": 5},
                        {"name": "Oceania", "value": 6},
                    ],
                }
            elif request.method == "POST":
                post_result = request.get_json()
                dataOptions = post_result.get("dataOptions")
                sector = dataOptions.get("sector")
                region = dataOptions.get("region")
                result = {
                    "security": [],
                    "data": [
                        {
                            "id": 2,
                            "idPosition": 2,
                            "type": "map",
                            "name": "map",
                            "region": region,
                            "sector": sector,
                            "data_levels": [
                                {
                                    "country_id": 1,
                                    "lat": 40.7128,
                                    "lon": -74.0060,
                                    "sectors": {
                                        0: 10,
                                        1: 2,
                                        2: 3,
                                        3: 4,
                                        4: 5,
                                        5: 3,
                                        6: 1,
                                        7: 33,
                                        8: 1,
                                        9: 10,
                                        10: 0,
                                        11: 5,
                                        12: 23,
                                        13: 1,
                                        14: 23,
                                        15: 3,
                                    },
                                },
                                {
                                    "country_id": 2,
                                    "lat": 34.0522,
                                    "lon": -118.2437,
                                    "sectors": {
                                        0: 8,
                                        1: 4,
                                        2: 2,
                                        3: 6,
                                        4: 7,
                                        5: 3,
                                        6: 1,
                                        7: 33,
                                        8: 1,
                                        9: 10,
                                        10: 0,
                                        11: 5,
                                        12: 23,
                                        13: 1,
                                        14: 23,
                                        15: 3,
                                    },
                                },
                                {
                                    "country_id": 3,
                                    "lat": 51.5074,
                                    "lon": -0.1278,
                                    "sectors": {
                                        0: 5,
                                        1: 3,
                                        2: 8,
                                        3: 1,
                                        4: 4,
                                        5: 3,
                                        6: 1,
                                        7: 33,
                                        8: 1,
                                        9: 10,
                                        10: 0,
                                        11: 5,
                                        12: 23,
                                        13: 1,
                                        14: 23,
                                        15: 3,
                                    },
                                },
                                {
                                    "country_id": 4,
                                    "lat": 48.8566,
                                    "lon": 2.3522,
                                    "sectors": {
                                        0: 7,
                                        1: 50,
                                        2: 40,
                                        3: 30,
                                        4: 20,
                                        5: 3,
                                        6: 1,
                                        7: 33,
                                        8: 1,
                                        9: 10,
                                        10: 0,
                                        11: 5,
                                        12: 23,
                                        13: 1,
                                        14: 23,
                                        15: 3,
                                    },
                                },
                                {
                                    "country_id": 5,
                                    "lat": 52.5200,
                                    "lon": 13.4050,
                                    "sectors": {
                                        0: 6,
                                        1: 1,
                                        2: 9,
                                        3: 5,
                                        4: 8,
                                        5: 3,
                                        6: 1,
                                        7: 33,
                                        8: 1,
                                        9: 10,
                                        10: 0,
                                        11: 5,
                                        12: 23,
                                        13: 1,
                                        14: 23,
                                        15: 3,
                                    },
                                },
                                {
                                    "country_id": 6,
                                    "lat": -33.8688,
                                    "lon": 151.2093,
                                    "sectors": {
                                        0: 3,
                                        1: 7,
                                        2: 1,
                                        3: 8,
                                        4: 6,
                                        5: 3,
                                        6: 1,
                                        7: 33,
                                        8: 1,
                                        9: 10,
                                        10: 0,
                                        11: 5,
                                        12: 23,
                                        13: 1,
                                        14: 23,
                                        15: 3,
                                    },
                                },
                                {
                                    "country_id": 7,
                                    "lat": 35.6895,
                                    "lon": 139.6917,
                                    "sectors": {
                                        0: 9,
                                        1: 2,
                                        2: 5,
                                        3: 4,
                                        4: 10,
                                        5: 3,
                                        6: 1,
                                        7: 33,
                                        8: 1,
                                        9: 10,
                                        10: 0,
                                        11: 5,
                                        12: 23,
                                        13: 1,
                                        14: 23,
                                        15: 3,
                                    },
                                },
                                {
                                    "country_id": 8,
                                    "lat": 37.7749,
                                    "lon": -122.4194,
                                    "sectors": {
                                        0: 4,
                                        1: 6,
                                        2: 3,
                                        3: 9,
                                        4: 1,
                                        5: 3,
                                        6: 1,
                                        7: 33,
                                        8: 1,
                                        9: 10,
                                        10: 0,
                                        11: 5,
                                        12: 23,
                                        13: 1,
                                        14: 23,
                                        15: 3,
                                    },
                                },
                                {
                                    "country_id": 14,
                                    "lat": -22.9068,
                                    "lon": -43.1729,
                                    "sectors": {
                                        0: 1,
                                        1: 9,
                                        2: 6,
                                        3: 2,
                                        4: 3,
                                        5: 3,
                                        6: 1,
                                        7: 33,
                                        8: 1,
                                        9: 10,
                                        10: 0,
                                        11: 5,
                                        12: 23,
                                    },
                                },
                            ],
                        },
                    ],
                    "sectors": [
                        {"name": 0, "value": 0},
                        {"name": 1, "value": 1},
                        {"name": 2, "value": 2},
                        {"name": 3, "value": 2},
                        {"name": 4, "value": 4},
                        {"name": 5, "value": 5},
                        {"name": 6, "value": 6},
                        {"name": 7, "value": 7},
                        {"name": 8, "value": 8},
                        {"name": 9, "value": 9},
                        {"name": 10, "value": 10},
                        {"name": 11, "value": 11},
                        {"name": 13, "value": 12},
                        {"name": 14, "value": 13},
                        {"name": 15, "value": 14},
                        {"name": "Services", "value": 15},
                        {"name": "Society", "value": 16},
                        {"name": "Technology and Telecommunications", "value": 17},
                    ],
                    "regions": [
                        {"name": "Default", "value": 0},
                        {"name": "Global", "value": 1},
                        {"name": "Europe", "value": 2},
                        {"name": "Asia", "value": 3},
                        {"name": "North America", "value": 4},
                        {"name": "South America", "value": 5},
                        {"name": "Oceania", "value": 6},
                    ],
                }

                print(sector, region)
                print("result", post_result)
            return jsonify(result), 200
        else:
            print("Falta token de autenticacion")
            return jsonify({"http_request": {"status": "error", "code": 500}})


from json.decoder import JSONDecodeError

## Configuración
from json.decoder import JSONDecodeError

## Configuración
@app.route("/settings/<string:token>/", methods=["DELETE"])
def delete_userSettings(token):
    # Coger los datos de las credenciales
    authorization_header = request.headers.get("Authorization")
    directory = os.path.dirname(__file__)
 
    if authorization_header:
        # Separamos el token del Bearer
        token = (
            authorization_header.split(" ")[1]
            if "Bearer" in authorization_header
            else None
        )
 
    if token:
        try:
            db.delete_settings_user(token)
            return (
                jsonify(
                    {
                        "status": "success",
                        "message": "Settings del usuario eliminados correctamente",
                    }
                ),
                200,
            )
 
        except Exception as ex:
            logging.error("Error al resetear los settings del usuario: ", str(ex))
            return jsonify({"http_request": {"status": "error", "code": 500}})
 
 
@app.route("/settings/<string:token>/", methods=["GET"])
def get_userSettings(token):
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
        # Logica de verificar token... no la usamos aqui, ya que esto es solo para prueba
        # Estamos de pruebas de momento que devuelva unos valores sin comprobar más
        # Fichero de configuración por defecto
        try:
            settings_user = db.get_settings_user(token)
            # Check if settings_user is None (no settings for the user)
            if settings_user is None:
                # Return default settings directly
                default_settings = get_default_settings()
                return jsonify(default_settings), 200
 
            # Attempt to load as JSON only if settings_user is a string
            if isinstance(settings_user, str):
                settings_data = json.loads(settings_user)
            else:
                settings_data = settings_user
 
            return jsonify(settings_data), 200
        except JSONDecodeError:
            # Handle the case when settings_user is not a valid JSON
            logging.error("Error decoding JSON for settings user")
            return jsonify({"http_request": {"status": "error", "code": 500}})
    else:
        print("Falta token de autenticación")
        return jsonify({"http_request": {"status": "error", "code": 500}})
 
 
@app.route("/settings/<string:token>/", methods=["POST"])
def add_user_settings(token):
    # Coger los datos de las credenciales
    print(request.headers.get("Authorization"))
    authorization_header = request.headers.get("Authorization")
 
    # Carpeta donde se van a guardar las imágenes subidas
    imgs_path = "C:/Users/ebbarragan/Documents/Karont3/settingsImg"
 
    if authorization_header:
        # Separamos el token del Bearer
        header_token = (
            authorization_header.split(" ")[1]
            if "Bearer" in authorization_header
            else None
        )
 
    if token:
        try:
            data = request.get_json()
            # Coger la imagen (base 64)
            img_base64 = data.get("display", {}).get("logo", "")
            if img_base64 and img_base64 != "src/static/images/ewalaSombrero.png":
                # Extraer los datos codificados en base64 y decodificar
                image_data = img_base64.split(",")[1]
                binary_data = base64.b64decode(image_data)
 
                # Crear una imagen a partir de los datos binarios
                image = Image.open(BytesIO(binary_data))
 
                # Guardar la imagen en el directorio
                image.save("{}/{}.png".format(imgs_path, token))
            else:
                data["display"]["logo"] = "src/static/images/ewalaSombrero.png"
            # Actualizar la db
            db.update_settings_user(token, data)
 
            return (
                jsonify(
                    {"message": "Configuración del usuario actualizada correctamente"}
                ),
                200,
            )
        except Exception as ex:
            logging.error("Error al añadir la configuracion del usuario", str(ex))
            return jsonify({"error": "Error al procesar la solicitud"}), 500
    else:
        return jsonify({"error": "Token de autorización no válido"}), 401
 
 
@app.route("/settings/<string:token>/counters/", methods=["GET"])
def get_userSettings_counters(token):
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
        # Intento obtener los settings del usuario con token
        try:
            settings_user = db.get_settings_user(token)
            if settings_user is None:
                # Si no hay datos del usuario, cargar la configuración predeterminada
                settings_user = get_default_settings()
 
            counters = settings_user.get("display", {}).get("counters", {})
            true_counters = [key for key, value in counters.items() if value]
            elements_count = {}
            print(true_counters)
            for c in true_counters:
                n = db.count_elements(c)
                elements_count[c] = n
            print(elements_count)
            return jsonify(elements_count), 200
 
        except Exception as ex:
            logging.error("Error con settings user", str(ex))
            # Si ocurre algún error, también cargar la configuración predeterminada
            default_settings = get_default_settings()
            return jsonify(default_settings), 200
    else:
        print("Falta token de autenticacion")
        return jsonify({"http_request": {"status": "error", "code": 500}})
 
 
def get_default_settings():
    # Obtiene la ruta al directorio actual del script
    directory = os.path.dirname(__file__)
 
    # Ruta relativa al archivo JSON desde el directorio del script
    settings_file_path = os.path.join(directory, "../defaultSettings.json")
 
    try:
        with open(settings_file_path, "r") as file:
            default_settings = json.load(file)
        return default_settings
    except FileNotFoundError:
        print(f"El archivo '{settings_file_path}' no fue encontrado.")
        return None
    except json.JSONDecodeError as ex:
        print(f"Error al decodificar el archivo JSON: {ex}")
        return None

print(get_default_settings())
@app.route("/leaks/", methods=["GET", "POST"])
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
        name = request.args.get("name")
        domain = request.args.get("domain")
        data_bytes = request.args.get("data_bytes")
        # Puedes seguir obteniendo otros campos del formulario de la misma manera

        # Realizar alguna lógica con los datos obtenidos
        result = {
            "message": "get",
            "name": name,
            "domain": domain,
            "data_bytes": data_bytes
            # Agrega más campos según sea necesario
        }
        print(result)
        return jsonify(result)

    elif request.method == "POST":
        try:
            data = request.get_json()
            print("Received data:", data)
            # Aquí procesa y almacena los datos en tu base de datos
            # Retorna una respuesta exitosa si todo va bien
            return jsonify({"message": "post success"})
        except Exception as ex:
            print("Error:", str(ex))
            # Retorna una respuesta de error en caso de excepción
            return jsonify({"error": "Invalid JSON format"}), 400


"""      
@app.route("/channels", methods=["GET"])
def list_channels():
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

        print('listado de canales')
        return jsonify('holi soy get channel')
    
"""


def get_next_element(element):
    element_map = {
        "channels": "organizations",
        "organizations": "persons",
        "persons": "entities",
        "entities": "discoveries",
        "discoveries": "leaks",
    }
    return element_map.get(element.lower())


@app.route("/networkmap/<string:element>/<int:id>", methods=["GET", "POST"])
def get_networkmap(element, id):
    print(element, id)
    a = db.show_all(element, id)
    if request.method == "GET":
        data = {
            "security": [],
            "data": {
                "data": [
                    {
                        "nodeId": 1,
                        "name": "Channel 1",
                        "category": "Channel",
                        "symbol": "channelPath",
                        "draggable": True,
                    },
                    {
                        "nodeId": 2,
                        "name": "Organization 1",
                        "category": "Organization",
                        "symbol": "organizationPath",
                        "draggable": True,
                    },
                    {
                        "nodeId": 3,
                        "name": "Entity 1",
                        "category": "Entity",
                        "symbol": "entityPath",
                        "draggable": True,
                    },
                    {
                        "nodeId": 4,
                        "name": "Discovery 1",
                        "category": "Discovery",
                        "symbol": "discoveryPath",
                        "draggable": True,
                    },
                    {
                        "nodeId": 5,
                        "name": "Leak 1",
                        "category": "Leak",
                        "symbol": "leakPath",
                        "draggable": True,
                    },
                ],
                "links": [
                    {
                        "source": ("Channel 1",),
                        "target": "Organization 1",
                        "value": "192.168.1.1",
                        "width": 3,
                        "color": "brown",
                        "bridge": True,
                    },
                    {
                        "source": ("Organization 1",),
                        "target": "Entity 1",
                        "width": 3,
                        "color": "brown",
                        "bridge": True,
                    },
                    {
                        "source": ("Organization 2",),
                        "target": "Entity 1",
                        "width": 3,
                        "color": "brown",
                        "bridge": True,
                    },
                    {
                        "source": ("Entity 1",),
                        "target": "Discovery 1",
                        "value": "192.168.1.3",
                        "width": 3,
                        "color": "brown",
                        "bridge": True,
                    },
                    {
                        "source": ("Discovery 1",),
                        "target": "Leak 1",
                        "value": "192.168.1.4",
                        "width": 3,
                        "color": "brown",
                        "bridge": True,
                    },
                ],
                "categories": [
                    {"name": "Channel"},
                    {"name": "Organization"},
                    {"name": "Entity"},
                    {"name": "Discovery"},
                    {"name": "Leak"},
                ],
                "breadPath": [{"nodeId": 1, "name": "Channel 1"}],
            },
        }

        print("---------------------", jsonify(data))
        return jsonify(data)
    elif request.method == "POST":
        data = {
            "security": [],
            "data": {
                "data": [
                    {
                        "nodeId": 1,
                        "name": "Channel 1",
                        "category": "Channel",
                        "symbol": "channelPath",
                        "draggable": True,
                    },
                    {
                        "nodeId": 2,
                        "name": "Organization 1",
                        "category": "Organization",
                        "symbol": "organizationPath",
                        "draggable": True,
                    },
                    {
                        "nodeId": 3,
                        "name": "Entity 1",
                        "category": "Entity",
                        "symbol": "entityPath",
                        "draggable": True,
                    },
                    {
                        "nodeId": 4,
                        "name": "Discovery 1",
                        "category": "Discovery",
                        "symbol": "discoveryPath",
                        "draggable": True,
                    },
                    {
                        "nodeId": 5,
                        "name": "Leak 1",
                        "category": "Leak",
                        "symbol": "leakPath",
                        "draggable": True,
                    },
                ],
                "links": [
                    {
                        "source": ("Channel 1",),
                        "target": "Organization 1",
                        "value": "192.168.1.1",
                        "width": 3,
                        "color": "brown",
                        "bridge": True,
                    },
                    {
                        "source": ("Organization 1",),
                        "target": "Entity 1",
                        "width": 3,
                        "color": "brown",
                        "bridge": True,
                    },
                    {
                        "source": ("Organization 2",),
                        "target": "Entity 1",
                        "width": 3,
                        "color": "brown",
                        "bridge": True,
                    },
                    {
                        "source": ("Entity 1",),
                        "target": "Discovery 1",
                        "value": "192.168.1.3",
                        "width": 3,
                        "color": "brown",
                        "bridge": True,
                    },
                    {
                        "source": ("Discovery 1",),
                        "target": "Leak 1",
                        "value": "192.168.1.4",
                        "width": 3,
                        "color": "brown",
                        "bridge": True,
                    },
                ],
                "categories": [
                    {"name": "Channel"},
                    {"name": "Organization"},
                    {"name": "Entity"},
                    {"name": "Discovery"},
                    {"name": "Leak"},
                ],
                "breadPath": [{"nodeId": 2, "name": "Organization 1"}],
            },
        }
        print("data networkmap post", data)
        return jsonify(data)


@app.route("/networkmap/<string:element>/", methods=["POST"])
def add_networkmap(element, id):
    data = {
        "security": [],
        "data": {
            "data": [
                {
                    "nodeId": 1,
                    "name": "Channel 1",
                    "category": "Channel",
                    "symbol": "channelPath",
                    "draggable": True,
                },
                {
                    "nodeId": 2,
                    "name": "Organization 1",
                    "category": "Organization",
                    "symbol": "organizationPath",
                    "draggable": True,
                },
                {
                    "nodeId": 3,
                    "name": "Entity 1",
                    "category": "Entity",
                    "symbol": "entityPath",
                    "draggable": True,
                },
                {
                    "nodeId": 4,
                    "name": "Discovery 1",
                    "category": "Discovery",
                    "symbol": "discoveryPath",
                    "draggable": True,
                },
                {
                    "nodeId": 5,
                    "name": "Leak 1",
                    "category": "Leak",
                    "symbol": "leakPath",
                    "draggable": True,
                },
            ],
            "links": [
                {
                    "source": ("Channel 1",),
                    "target": "Organization 1",
                    "value": "192.168.1.1",
                    "width": 3,
                    "color": "brown",
                    "bridge": True,
                },
                {
                    "source": ("Organization 1",),
                    "target": "Entity 1",
                    "width": 3,
                    "color": "brown",
                    "bridge": True,
                },
                {
                    "source": ("Organization 2",),
                    "target": "Entity 1",
                    "width": 3,
                    "color": "brown",
                    "bridge": True,
                },
                {
                    "source": ("Entity 1",),
                    "target": "Discovery 1",
                    "value": "192.168.1.3",
                    "width": 3,
                    "color": "brown",
                    "bridge": True,
                },
                {
                    "source": ("Discovery 1",),
                    "target": "Leak 1",
                    "value": "192.168.1.4",
                    "width": 3,
                    "color": "brown",
                    "bridge": True,
                },
            ],
            "categories": [
                {"name": "Channel"},
                {"name": "Organization"},
                {"name": "Entity"},
                {"name": "Discovery"},
                {"name": "Leak"},
            ],
            "breadPath": [{"nodeId": 2, "name": "Organization 1"}],
        },
    }
    print("data networkmap post", data)
    return jsonify(data)


def check_entity_type(type):
    """Checks if entity type exists"""
    print(type)
    if type.lower() in [
        "addresses",
        "alias",
        "documents",
        "emails",
        "numbers",
        "domains",
    ]:
        logging.info("Entity type exists.")
        return True


def check_graph_type(type):
    """Checks if graph type exists"""
    print(type)
    if type.lower() in ["piechart", "donnutchart", "scatterplot"]:
        logging.info("Graph type exists.")
        return True


if __name__ == "__main__":
    app.run(debug=True, port=9999)
