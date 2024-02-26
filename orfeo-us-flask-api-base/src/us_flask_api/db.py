import datetime

import psycopg
import us_flask_api.config as config
import logging

APP_URL = config.DevelopmentConfig.APP_URL

text_condition = "strpos(upper(unaccent({})), upper(unaccent(%s))) > 0"


# Función para generar los filtros de fecha
def generate_date_filters(element_kind):
    same_date = "{} = TO_TIMESTAMP(%s, 'YYYY-MM-DD')"
    before_date = "{} < TO_TIMESTAMP(%s, 'YYYY-MM-DD')"
    after_date = "{} > TO_TIMESTAMP(%s, 'YYYY-MM-DD')"

    filters = {
        "same_created": same_date.format(f"{element_kind}.created"),
        "before_created": before_date.format(f"{element_kind}.created"),
        "after_created": after_date.format(f"{element_kind}.created"),
        "same_modified": same_date.format(f"{element_kind}.modified"),
        "before_modified": before_date.format(f"{element_kind}.modified"),
        "after_modified": after_date.format(f"{element_kind}.modified"),
    }
    return filters

# Diccionario de condiciones para los filtros
cond_inner = {
    "channels": {
        "channel_id": " channels.id = %s",
        "name": text_condition.format("channels.name"),
        "refcode": "upper(channels.refcode) = UPPER(%s)",
        "email": text_condition.format("channels.email"),
        "phonenum": text_condition.format("channels.phonenum"),
        **generate_date_filters("channels"),
    },
    "organizations": {
        "channel_id": " fk_channel_id = %s",
        "address_id": " fk_address = %s",
        "email_id": " fk_email = %s",
        "ip_id": " fk_ip = %s",
        "organization_id": " organizations.id=%s",
        "name": text_condition.format("organizations.name"),
        "refcode": " organizations.refcode = UPPER(%s)",
        "phonenum": text_condition.format("organizations.phonenum"),
        "active": " organizations.active = %s",
        "city" : "(select addresses.city from addresses where addresses.id = organizations.fk_address)"
        **generate_date_filters("organizations")
    },
    "addresses": {
        "addresses_id": " addresses.id = %s",
        "address" : text_condition.format("addresses.address"),
        "postal_code" : "addresses.postal_code =%s",
        "city" : text_condition.format("addresses.city"),
        "country" : text_condition.format("addresses.country")
    },
    "emails": {
        "emails_id": " emails.id = %s",
        "email" : text_condition.format("emails.email"),
        "content" : text_condition.format("emails.content"),
        **generate_date_filters("emails")
    },
    "discovery_risk": {
        "discovery_risk_id" : " discovery_risk.id = %s",
        "name" : text_condition.format("dicovery_risk.name")
    },
    "request_priority": {
        "request_priority_id" : " request_priority.id = %s",
        "name" : text_condition.format("request.priority.name")
    },
    "request_status" : {
        "request_status_id" : " request_status.id = %s",
        "name" : text_condition.format("request_status.name")
    },
    "iplookup": {
        "iplookup_id" : " iplookup.id = %s",
        "country" : text_condition.format("iplookup.country"),
        "organization" : text_condition.format("iplookup.organiztion"),
        "isp" : text_condition.format("iplookup.isp"),
        "asn" : text_condition.format("iplookup.asn")
    },
    "whois" : {
        "whois_id" : " whois.id = %s",
        "data_domain" : text_condition.format("whois.data_domain"),
        "owner" : text_condition.format("whois.owner"),
        "dns_info" : text_condition.format("dns.info")
    },
    "https": {
        "https_id": " https.id = %s",
        "jarm_fingerprint": text_condition.format("https.jarm_fingerprint"),
        "certificate_version": "https.certificate_version = %s",
        "serial_number": text_condition.format("https.serial_number"),
        "thumbprint": text_condition.format("https.thumbprint"),
        "signature_algorithm": text_condition.format("https.signature_algorithm"),
        "issuer_country": text_condition.format("https.issuer_country"),
        "validity_not_before": "{} >= TO_TIMESTAMP(%s, 'YYYY-MM-DD HH24:MI:SS')".format("https.validity_not_before"),
        "validity_not_after": "{} <= TO_TIMESTAMP(%s, 'YYYY-MM-DD HH24:MI:SS')".format("https.validity_not_after"),
        "subject_common_name": text_condition.format("https.subject_common_name"),
        "public_key_algorithm": text_condition.format("https.public_key_algorithm"),
        "public_key_modulus": text_condition.format("https.public_key_modulus"),
        "public_key_exponent": text_condition.format("https.public_key_exponent"),
        "x509v3_authority_key_id": text_condition.format("https.x509v3_authority_key_id"),
        "x509v3_subject_key_id": text_condition.format("https.x509v3_subject_key_id"),
        "x509v3_subject_alt_name": text_condition.format("https.x509v3_subject_alt_name"),
        "x509v3_key_usage": text_condition.format("https.x509v3_key_usage"),
        "x509v3_extended_key_usage": text_condition.format("https.x509v3_extended_key_usage"),
        "x509v3_crl_distribution_points": text_condition.format("https.x509v3_crl_distribution_points"),
        "x509v3_certification_policies": text_condition.format("https.x509v3_certification_policies"),
        "authority_information_access": text_condition.format("https.authority_information_access"),
        "x509v3_basic_constraints": text_condition.format("https.x509v3_basic_constraints"),
        "signature_algorithm_final": text_condition.format("https.signature_algorithm_final"),
        "signature": text_condition.format("https.signature"),
    },
    "dns": {
        "dns_id" : " dns.id = %s",
        "record_type" : text_condition.format("dns.record_type"),
        "ttl" : text_condition.format("dns.ttl"),
        "valor" : text_condition.format("dns.valor"),
        **generate_date_filters("dns")
    },
    "ports": {
        "ports_id" : " ports.id = %s",
        "number" : " ports.number = %s",
        "protocol" : text_condition.format("ports.protocol"),
        "state" : text_condition.format("ports.state"),
        "service" : text_condition.format("ports.service")
    },
    "ips" : {
        "id": " ips.id = %s",
        "ip": " ips.ip = %s",
        "verdict": " ips.verdict = %s",
        "indicator": " ips.indicator = %s",
        "external_sources": text_condition.format("ips.external_sources"),
        "fk_domain_id": " ips.fk_domain_id = %s",
        "fk_iplookup": " ips.fk_iplookup = %s",
        **generate_date_filters("ips")
    },
    "domains": {
        "id": " domains.id = %s",
        "name": text_condition.format("domains.name"),
        "fk_dns_id": " domains.fk_dns_id = %s",
        "fk_https": " domains.fk_https = %s",
        "fk_organization_id": " domains.fk_organization_id = %s",
        "fk_whois_id": " domains.fk_whois_id = %s",
        **generate_date_filters("domains")
    },
   "ip_ports": {
        "ip_ports_id": "ip_ports.id = %s",
        "fk_ip_id": "ip_ports.fk_ip_id = %s",
        "fk_ports_id": "ip_ports.fk_ports_id = %s",
    },
    "domain_ports": {
        "domain_ports_id": "domain_ports.id = %s",
        "fk_domain_id": "domain_ports.fk_domain_id = %s",
        "fk_ports_id": "domain_ports.fk_ports_id = %s",
    },
    "subdomains": {
        "subdomain_id": "subdomains.id = %s",
        "name_subdomain": text_condition.format("subdomains.name_subdomain"),
        "detections": "subdomains.detections = %s",
        "fk_domain_id": "subdomains.fk_domain_id = %s",
        "fk_ip_id": "subdomains.fk_ip_id = %s",
    },
    "discoveries": {
        "channel_id": " (select organization.fk_channel_id from organizations where discoveries.fk_organization = organizations.id) =%s",
        "discovery_id": "discoveries.id = %s",
        "title": text_condition.format("discoveries.title"),
        "description": text_condition.format("discoveries.description"),
        "risk": "(select discovery_risk.name from discovery_risk where discovery_risk.id = discoveries.fk_risk_id) = %s",
        "organization_id": "discoveries.fk_organization_id = %s",
        **generate_date_filters("discoveries"),
    },
    "requests": {
        "channel_id": " (select organization.fk_channel_id from organizations where discoveries.fk_organization = organizations.id) =%s",
        "organization_id": " (select organizations.id from organizations where discoveries.fk_organization_id = organizations.id) =%s",
        "discovery_id": "discovery_id = %s",
        "request_id": " request.id = %s",
        "description": text_condition.format("requests.description"),
        "response": "strpos(upper(unaccent(requests.response)), upper(unaccent(%s))) > 0",
        "status": "(select request_status.name from request_status where request_status.id = requests.fk_request_status) = %s",
        "priority": "(select request_priority.name from request_priority where request_priority.id = requests.fk_request_priority) = %s",
        **generate_date_filters("requests"),
    }
}

# Diccionario para pasar de id a nombre
cond_extra = {
    "organizations": {
        "channel": "(select channels.name from channels where channels.id = organizations.fk_channel_id)",
        "address": "(select addresses.city from addresses where addresses.id = organizations.fk_address)",
        "email": "(select emails.email from emails where emails.id = organizations.fk_email)",
    },
    "discoveries": {
        "risk": "(select discovery_risk.name from discovery_risk where discovery_risk.id = discoveries.risk_id)"
    },
    "requests": {
        "status": "(select request_status.name from request_status where request_status.id = requests.status_id)",
        "priority": "(select request_priority.name from request_priority where request_priority.id = requests.priority_id)",
    },
    "domains": {
        "dns": "(select dns.valor from dns where dns.id = domains.fk_dns_id)",
        "https": "(select https.subject_common_name from https where https.id = domains.fk_https)",
        "organization": "(select organizations.name from organizations where organizations.id = domains.fk_organization_id)",
        "whois": "(select whois.owner from whois where whois.id = domains.fk_whois_id)",
    },
    "ips": {
        "domain": "(select domains.name from domains where domains.id = ips.fk_domain_id)",
        "iplookup": "(select iplookup.country from iplookup where iplookup.id = ips.fk_iplookup)"
    },
    "https": {
        "issuer": "(select https.issuer_country from https where https.id = domains.fk_https)",
        "validity": "(select to_char(https.validity_not_before, 'YYYY-MM-DD') || ' to ' || to_char(https.validity_not_after, 'YYYY-MM-DD') from https where https.id = domains.fk_https)"
    }    
}

# Diccionario para pasar de nombre a id
cond_id = {
    "entities": {
        "kind": (
            "kind_id",
            "(select entity_kinds.id from entity_kinds where entity_kinds.name = %s)",
        )
    },
    "discoveries": {
        "risk": (
            "risk_id",
            "(select discovery_risk.id from discovery_risk where discovery_risk.name = %s)",
        )
    },
    "requests": {
        "status": (
            "status_id",
            "(select request_status.id from request_status where request_status.name =%s)",
        ),
        "priority": (
            "priority_id",
            "(select request_priority.id from request_priority where request_priotity.name = %s)",
        ),
    }
}

# Conexión a la base de datos
def connect_db(func):
    """Conexión a la base de datos."""

    def wrapper(*args, **kwargs):
        conn = psycopg.connect(
            host=config.Config.DB_HOST,
            user=config.Config.DB_USER,
            password=config.Config.DB_PASS,
            dbname=config.Config.DB_NAME,
        )
        try:
            result = func(conn, *args, **kwargs)
            conn.commit()
        finally:
            conn.close()
        return result

    return wrapper


# Listar datos
@connect_db
def list_table(conn, table, filters, sorters, page, size) -> tuple[list, int]:
    """Funcion para listar los elementos de una tabla dependiendo del filtro del permiso
    params: table: El nombre de la tabla a extraer informacion
    params: fields: Los campos que vamos a pasar a la consulta sql
    params: table_filter: El campo que usaremos para filtrar la informacion (channel_id, etc)
    params: sorters: Un listado de cadenas con un formato tipo ['c.id asc', 'c.name desc']
    params: page: La pagina de la que vamos a sacar la información
    params: size: El tamaño de elementos que tiene cada página
    returns: Devuelve una tupla de datos con el listado de los datos extraidos, y con el
                total de elementos que tiene la tabla para ese filtro"""
    result = []

    # Preparamos un diccionario generico que nos permitirá obtener el codigo para la clausula where,
    # meidante una clave que estará formada por una tupla de (tabla,  filtro)
    where_str = ""  # Definición inicial
    print('soy la table', table)
    if filters and table in cond_inner:
        where_clauses = [
            cond_inner[table][filter_key]
            for filter_key in filters.keys()
            if filter_key in cond_inner[table]
        ]
        if where_clauses:
            where_str = " WHERE " + " AND ".join(where_clauses)

    # Resto del código...

    # Preparamos los sorters en el caso de tener parametros de ordenacion
    sorters_sql = ""
    if len(sorters) > 0:
        sorters_sql = " ORDER BY " + ", ".join(
            [" ".join(pair) for sorter in sorters for pair in sorter.items()]
        )
    # Añadimos los campos extra (si hay)
    select_fields = ["*"]
    if table in cond_extra:
        for extra, value in cond_extra[table].items():
            select_fields.append(value + " as " + extra)
    select = ", ".join(select_fields)
    # Con todos los datos ya podemos crear la consulta sql y obtener los datos necesarios
    sql = "SELECT {}  FROM {}   {} {} OFFSET {} LIMIT {};".format(
        select, table, where_str, sorters_sql, page * size, size
    )
    print("SQL Query:", sql, "with values:", tuple(filters.values()))

    cursor = conn.cursor()
    cursor.execute(sql, (tuple(filters.values())))

    column_names = [d[0] for d in cursor.description]
    if cursor is not None:
        for data in cursor:
            dic = {}

            for i in range(len(data)):
                dic[column_names[i]] = data[i]
            result.append(dic)

    return result

# Insertar datos
@connect_db
def insert_element(conn, table: str, element: dict):
    """Metodo generico que insertara datos en la tabla que se pida.
    Los campos son la clave en data, y los valores los elementos-
    params: table: El nombre de la tabla, que sera el elemento
    element: diccionario con los campos y los valores a insertar en la tabla
    returns: Devuelve un diccionario con el state, el elemento insertado y las filas afectadas
    """
    fields = list(element.keys())
    values = list(element.values())
    fields_sql = []
    values_sql = []
    # Comprobar los campos del body
    for f in fields:
        # Campo_id, valor (texto) = tupla del diccionario cond_id
        # si la tabla no existe cojo el dict vacio, entonces el valor por defecto
        field_sql, value_sql = cond_id.get(table, {}).get(f, (f, "%s"))
        fields_sql.append(field_sql)
        values_sql.append(value_sql)
    str_fields = ", ".join(fields_sql)
    str_values = ", ".join(values_sql)
    select_fields = ["*"]
    if table in cond_extra:
        for extra, value in cond_extra[table].items():
            select_fields.append(value + " as " + extra)
    select = ", ".join(select_fields)
    # Añadimos los campos extra (si hay)
    try:
        sql = f"INSERT INTO {table}({str_fields}) VALUES ({str_values} ) RETURNING {select};"
        # Compruebo si los datos de tipo fecha estan en formato entero para transformalo a datetime
        for i in range(len(fields)):
            if (fields[i] == "created" or fields[i] == "modified") and isinstance(
                values[i], int
            ):
                values[i] = datetime.datetime.fromtimestamp(values[i])

        # Realizamos el insert y recogemos el valor en un diccionario
        cursor = conn.cursor()
        cursor.execute(sql, tuple(values))
        result = cursor.fetchone()

        column_names = [d[0] for d in cursor.description]
        dic = {}
        for i in range(len(result)):
            dic[column_names[i]] = result[i]
        return dic
    except Exception as ex:
        logging.error("Error adding element: ", str(ex))
        return False

# Añadir leak_kind
@connect_db
def insert_leak_kind(conn, element: dict):
    """Insertar dentro de la tabla Leak kinds los kinds relacionados con el leak añadido"""
    fields = list(element.keys())
    values = list(element.values())
    list_fields = []
    list_values = []
    try:
        for f in fields:
            field_sql, value_sql = cond_id["leak_kinds"].get(f, (f, "%s"))
            list_fields.append(field_sql)
            list_values.append(value_sql)

        str_fields = ", ".join(list_fields)
        str_values = ", ".join(list_values)
        sql = f"INSERT INTO leak_kinds ({str_fields}) VALUES ({str_values})"

        cursor = conn.cursor()
        cursor.execute(sql, tuple(values))
    except Exception as ex:
        logging.error(f"Error adding leak_kind: ", str(ex))

# Editar elemento
@connect_db
def edit_element(conn, table: str, id_element: int, element: dict):
    """metodo generico para editar un elemento de una tabla.
    params: conn. El cursor que realizara los cambios en la base de datos
    table: la tabla a editar
    element: los datos que necesitamos cambiar
    returns: Devuelve un diccionario con el status, el elemento editado o un mensaje de error si falla la operacion
    y las filas afectadas"""
    fields = [key for key in element]
    values = [v for k, v in element.items()]
    list_fields = []
    list_values = []

    for f in fields:
        field_sql, value_sql = cond_id.get(table, {}).get(f, (f, "%s"))
        list_fields.append(field_sql)
        list_values.append(value_sql)

    str_fields = ", ".join(list_fields)
    str_values = ", ".join(list_values)

    select_fields = ["*"]
    if table in cond_extra:
        for extra, value in cond_extra[table].items():
            select_fields.append(value + " as " + extra)
    select = ", ".join(select_fields)

    values.append(id_element)
    sql1 = f"UPDATE {table} SET ({str_fields}) = ({str_values}) WHERE id=%s RETURNING {select};"
    # Realizamos el update
    cursor = conn.cursor()
    cursor.execute(sql1, tuple(values))
    result = cursor.fetchone()
    column_names = [d[0] for d in cursor.description]
    dic = {}
    for i in range(len(result)):
        dic[column_names[i]] = result[i]
    return dic

# Mostrar elemento
@connect_db
def show_element(conn, table: str, id: int):
    """Método para mostrar un único elemento según su id.
    Requiere: nombre de la tabla,prefijo, campos de la tabla, identificador del elemento
    Devuelve: diccionario de datos del elemento
    """
    select_fields = ["*"]
    if table in cond_extra:
        for extra, value in cond_extra[table].items():
            select_fields.append(value + " as " + extra)
    select = ", ".join(select_fields)

    sql = f"SELECT {select} FROM {table} WHERE id=%s"
    print('show element', sql)
    cursor = conn.cursor()
    cursor.execute(sql, (id,))
    data = cursor.fetchone()
    column_names = [d[0] for d in cursor.description]
    result_dict = {}
    if data is None:
        return None

    for i in range(len(data)):
        result_dict[column_names[i]] = data[i]
    return result_dict

# Eliminar elemento
@connect_db
def delete_element(conn, table: str, id: int):
    if table == "leak_kinds":
        sql = f"DELETE FROM {table} WHERE leak_id=%s"
    else:
        sql = f"DELETE FROM {table} WHERE id=%s"
    cursor = conn.cursor()
    cursor.execute(sql, (id,))
    return bool(cursor.rowcount)

# Comprobar el element_id del usuario y del elemento
@connect_db
def check_element_permission(
    conn, table: str, id: int, permission: str, id_permission: int
):
    tipo = permission + "_id"
    if tipo not in cond_inner[table]:
        return False
    where = cond_inner[table][tipo]
    sql = f"SELECT 1 FROM {table} WHERE id =%s AND {where} "
    cursor = conn.cursor()
    cursor.execute(
        sql,
        (
            id,
            id_permission,
        ),
    )
    return bool(cursor.rowcount)

# Comprobar que exista un elemento
@connect_db
def get_settings_user(conn, token="123456"):
    sql = "SELECT settings FROM user_settings WHERE user_token = %s"
    cursor = conn.cursor()
    cursor.execute(sql, (token,))

    data = cursor.fetchone()

    # Verificar si se obtuvo algún dato
    if data:
        print(data)
        settings_data = data[0]  # Obtener el valor de la columna 'settings'
        return settings_data
    else:
        return None


@connect_db
def update_settings_user(conn, token, data):
    settings_json = json.dumps(data)

    sql = "UPDATE user_settings SET settings = %s WHERE user_token = %s"
    cursor = conn.cursor()
    cursor.execute(
        sql,
        (settings_json, token)
    )
    return bool(cursor.rowcount)

@connect_db
def delete_settings_user(conn, token):

    sql = "UPDATE user_settings SET settings = NULL WHERE user_token = %s"
    cursor = conn.cursor()
    cursor.execute(
        sql,
        (token,)
    )
    return bool(cursor.rowcount)

@connect_db
def count_elements(conn, table):
    sql = f"SELECT COUNT(*) FROM {table}"
    cursor = conn.cursor()
    cursor.execute(sql)
    count = cursor.fetchone()[0]
    return count

@connect_db
def get_settings_user(conn, token="123456"):
    sql = "SELECT settings FROM user_settings WHERE user_token = %s"
    cursor = conn.cursor()
    cursor.execute(sql, (token,))
 
    data = cursor.fetchone()
 
    # Verificar si se obtuvo algún dato
    if data:
        settings_data = data[0]  # Obtener el valor de la columna 'settings'
        return settings_data
    else:
        return None
 
 
@connect_db
def update_settings_user(conn, token, data):
    settings_json = json.dumps(data)
 
    sql = "UPDATE user_settings SET settings = %s WHERE user_token = %s"
    cursor = conn.cursor()
    cursor.execute(sql, (settings_json, token))
    return bool(cursor.rowcount)