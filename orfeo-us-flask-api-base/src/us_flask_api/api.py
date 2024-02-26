API = {
    "channels": {
        "fields": ["id", "refcode", "name", "email", "phonenum", "created", "modified"],
        "required_fields": ["refcode", "name"],
        "permissions": {
            "admin": ["list", "add_delete", "show_edit"],
            "channel": ["show_edit"],
        },
        "permission_code": {"admin": "admin", "channel": "channel_id"},
        "filters": [
            "refcode",
            "name",
            "email",
            "phonenum",
            "same_created",
            "before_created",
            "after_created",
            "same_modified",
            "before_modified",
            "after_modified",
        ],
        "editable": {"channel": ["email", "phonenum"]},
    },
    "organizations": {
        "fields": [
            "id",
            "channel_id",
            "refcode",
            "name",
            "email",
            "phonenum",
            "active",
            "created",
            "modified",
        ],
        "required_fields": ["channel_id", "refcode", "name"],
        "filters": [
            "channel_id",
            "refcode",
            "name",
            "email",
            "phonenum",
            "active",
            "same_created",
            "before_created",
            "after_created",
            "same_modified",
            "before_modified",
            "after_modified",
        ],
        "permissions": {
            "admin": ["list", "add_delete", "show_edit"],
            "channel": ["list", "add_delete", "show_edit"],
            "organization": ["show_edit"],
        },
        "permission_code": {"admin": "admin", "channel": "channel_id"},
        "editable": {
            "channel": ["organization_id", "name", "active"],
            "organization": ["email", "phonenum"],
        },
    },
    "persons": {
        "fields": [
            "id",
            "organization_id",
            "refcode",
            "name",
            "email",
            "phonenum",
            "created",
            "modified",
        ],
        "required_fields": ["organization_id", "refcode", "name"],
        "filters": [
            "channel_id",
            "organization_id",
            "refcode",
            "name",
            "email",
            "phonenum",
            "same_created",
            "before_created",
            "after_created",
            "same_modified",
            "before_modified",
            "after_modified",
        ],
        "permissions": {
            "admin": ["list", "add_delete", "show_edit"],
            "channel": ["list", "add_delete", "show_edit"],
            "organization": ["list", "add_delete", "show_edit"],
            "person": ["show_edit"],
        },
        "permission_code": {
            "admin": "admin",
            "channel": "channel_id",
            "organization": "organization_id",
            "person": "person_id",
        },
        "editable": {
            "organization": ["organization_id", "name"],
            "person": ["email", "phonenum"],
        },
    },
    "entities": {
        "fields": [
            "id",
            "person_id",
            "name",
            "value",
            "kind",
            "description",
            "created",
            "modified",
        ],
        "required_fields": ["person_id", "name", "value", "kind"],
        "filters": [
            "channel_id",
            "organization_id",
            "person_id",
            "name",
            "kind",
            "description",
            "same_created",
            "before_created",
            "after_created",
            "same_modified",
            "before_modified",
            "after_modified",
        ],
        "permissions": {
            "admin": ["list", "add_delete", "show_edit"],
            "channel": ["list", "add_delete", "show_edit"],
            "organization": ["list", "add_delete", "show_edit"],
            "person": ["list", "add_delete", "show_edit"],
        },
        "permission_code": {
            "admin": "admin",
            "channel": "channel_id",
            "organization": "organization_id",
            "person": "person_id",
        },
        "editable": {
            "person": ["person_id", "name", "value", "kind_id", "description"]
        },
    },
    "discoveries": {
        "fields": [
            "id",
            "entity_id",
            "title",
            "risk",
            "description",
            "leak_date",
            "created",
            "modified",
        ],
        "required_fields": ["entity_id", "title", "risk"],
        "filters": [
            "channel_id",
            "organization_id",
            "person_id",
            "entity_id",
            "kind",
            "risk",
            "description",
            "same_created",
            "before_created",
            "after_created",
            "same_modified",
            "before_modified",
            "after_modified",
        ],
        "permissions": {
            "admin": ["list", "add_delete", "show_edit"],
            "channel": ["list", "show_edit"],
            "organization": ["list", "show_edit"],
            "person": ["list", "show_edit"],
        },
        "permission_code": {
            "admin": "admin",
            "channel": "channel_id",
            "organization": "organization_id",
            "person": "person_id",
        },
        "editable": {},
    },
    "requests": {
        "fields": [
            "id",
            "discovery_id",
            "status",
            "priority",
            "description",
            "response",
            "created",
            "modified",
        ],
        "required_fields": ["discovery_id", "status", "priority"],
        "filters": [
            "channel_id",
            "organization_id",
            "person_id",
            "entity_id",
            "discovery_id",
            "kind",
            "risk",
            "status",
            "priority",
            "description",
            "response",
            "same_created",
            "before_created",
            "after_created",
            "same_modified",
            "before_modified",
            "after_modified",
        ],
        "permissions": {
            "admin": ["list", "add_delete", "show_edit"],
            "channel": ["list", "add_delete", "show_edit"],
            "organization": ["list", "add_delete", "show_edit"],
            "person": ["list", "add_delete", "show_edit"],
        },
        "permission_code": {
            "admin": "admin",
            "channel": "channel_id",
            "organization": "organization_id",
            "person": "person_id",
        },
        "editable": {"person": ["priority", "description"]},
    },
    ## Entitades (Alias, addresses, documents, numbers)
    #### ALIAS
    "alias": {
        "fields": [
            "id",
            "title",
            "created",
            "modified",
            "content",
        ],
        "required_fields": ["title"],
        "filters": [  # Revisar
            "channel_id",
            "organization_id",
            "person_id",
            "title",
            "same_created",
            "before_created",
            "after_created",
            "same_modified",
            "before_modified",
            "after_modified",
        ],
        "permissions": {
            "admin": ["list", "add_delete", "show_edit"],
            "channel": ["list", "show_edit"],
            "organization": ["list", "show_edit"],
            "person": ["list", "show_edit"],
        },
        "permission_code": {
            "admin": "admin",
            "channel": "channel_id",
            "organization": "organization_id",
            "person": "person_id",
        },
        "editable": {"person": ["title"]},
    },
    #### ADDRESSES
    "addresses": {
        "fields": [
            "id",
            "address",
            "postal_code",
            "city",
            "country",
            "created",
            "modified",
            "content",
        ],
        "required_fields": ["address", "postal_code", "city", "country"],
        "filters": [  # Revisar
            "channel_id",
            "organization_id",
            "person_id",
            "address",
            "postal_code",
            "city",
            "country",
            "same_created",
            "before_created",
            "after_created",
            "same_modified",
            "before_modified",
            "after_modified",
        ],
        "permissions": {
            "admin": ["list", "add_delete", "show_edit"],
            "channel": ["list", "show_edit"],
            "organization": ["list", "show_edit"],
            "person": ["list", "show_edit"],
        },
        "permission_code": {
            "admin": "admin",
            "channel": "channel_id",
            "organization": "organization_id",
            "person": "person_id",
        },
        "editable": {"person": ["address", "postal_code", "city", "country"]},
    },
    "emails": {
        "fields": [
            "id",
            "email",
            "created",
            "modified",
            "content",
        ],
        "required_fields": ["email"],
        "filters": [  # Revisar
            "channel_id",
            "organization_id",
            "person_id",
            "email",
            "same_created",
            "before_created",
            "after_created",
            "same_modified",
            "before_modified",
            "after_modified",
        ],
        "permissions": {
            "admin": ["list", "add_delete", "show_edit"],
            "channel": ["list", "show_edit"],
            "organization": ["list", "show_edit"],
            "person": ["list", "show_edit"],
        },
        "permission_code": {
            "admin": "admin",
            "channel": "channel_id",
            "organization": "organization_id",
            "person": "person_id",
        },
        "editable": {"person": ["email"]},
    },
}
