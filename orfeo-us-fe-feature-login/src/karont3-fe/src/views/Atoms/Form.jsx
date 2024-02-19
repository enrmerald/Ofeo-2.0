import React, { useEffect, useState } from 'react';
import { Link, redirect, useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
/* Elemento formulario:
    Obtiene los parámetros element y subpage de la ruta.
    Incluye botones:
        - Cancel: volver hacia atrás
        - Submit: enviar y volver a la página del elemento.
        - Add another: envía los datos pero abre un nuevo formulario para el mismo elemento.

    Para los elementos diferentes a "entitites", se meustran sus datos y se realiza POST a /element/;
    Para los elementos "entitites", mediante el selector (type) se define el identificador del tipo de elemento, y 
        mediante este, se obtienen (switch) los campos para cada entidad, definiendo además la "subpage", utilizada en las rutas.
*/
const Form = (type) => {
    let { element, subpage, id } = useParams()
    const creds = {
        'security': {
            'token': 123456 || localStorage.token
        }
    };


    const [formData, setFormData] = useState({}); // Datos obtenidos del formulario
    const [formCount, setFormCount] = useState(1); // Contador de formularios
    const [selectedOption, setSelectedOption] = useState(1); // Tipo de entidad seleccionada
    const [additionalFields, setAdditionalFields] = useState(getEntitiesById(selectedOption)); // Campos de cada entidad
    const [options, setOptions] = useState([])
    const elementFields = getFieldsForElement(element); // Obtener los campos

    const navigate = useNavigate();
    let submitRoute;

    // Manejar la funcion de cambio de tipo de entidad (select)
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
        if (name === 'type') {
            const selectedOptionID = parseInt(value);
            setSelectedOption(selectedOptionID);
            const entityFields = getEntitiesById(selectedOptionID);
        }
    };

    // Manejo de la función enviar
    const handleSubmit = async (e) => {
        e.preventDefault();
        // Definir formulario en blanco
        setFormData({});
        // Para todos los elementos que no sean entidades
        if (element != "entities") {
            setSelectedOption(null);
            subpage = null;
            submitRoute = `http://localhost:5000/${element.toLowerCase()}/`;
            // Para los elementos entidades
        } else {
            submitRoute = `http://localhost:5000/entities/${subpage}/`;
        }

        try {
            // Añadir los datos al diccionario creds
            creds.data = JSON.stringify(formData);

            // Petición para enviar los datos
            RequestServer(submitRoute, "POST", creds, (loadedData) => {
                setFormData(loadedData.data);
                console.log('loaded data', loadedData)
            });

            // Redirección para elementos entidades
            if (subpage) {
                navigate(`/${element.toLowerCase()}/${subpage}`);
                // Redirección para elementos diferentes de entidades
            } else {
                navigate(`/${element.toLowerCase()}`);
            }
        } catch (error) {
            console.error('Error al enviar los datos', error);
        }
    };

    // Manejo de la funcion editar (enviar datos editados)
    let submitEditRoute;
    // Manejo de la función enviar
    const handleEdit = async (e) => {
        e.preventDefault();
        // Para todos los elementos que no sean entidades
        if (element !== "entities") {
            setSelectedOption(null);
            subpage = null;
            submitEditRoute = `http://localhost:5000/${element.toLowerCase()}/${id}/`;
            // Para los elementos entidades
        } else {
            submitEditRoute = `http://localhost:5000/entities/${subpage}/${id}/`;
        }

        try {
            // Añadir los datos al diccionario creds
            creds.data = JSON.stringify(formData);
            // Petición para enviar los datos
            RequestServer(submitEditRoute, "PUT", creds, (loadedData) => {
                setFormData(loadedData.data);

            });

            // Redirección para elementos entidades
            if (subpage) {
                navigate(`/${element.toLowerCase()}/${subpage}/`);
                // Redirección para elementos diferentes de entidades
            } else {
                navigate(`/${element.toLowerCase()}/`);
            }
        } catch (error) {
            console.error('Error al enviar los datos', error);
        }
    };

    // Manejo función crear otro (enviar y iniciar otro formulario)
    const handleAddOther = async () => {
        setFormData({});

        if (element !== "entities") {
            setSelectedOption(null);
            subpage = null;
            submitRoute = `http://localhost:5000/${element.toLowerCase()}/`;

        } else {
            submitRoute = `http://localhost:5000/entities/${subpage}/`;

        }
        try {
            creds.data = JSON.stringify(formData);
            // Envío de datos
            RequestServer(submitRoute, "POST", creds, (loadedData) => {
                setFormData(loadedData.data);
            });
            // Contador de formularios
            setFormCount((prevCount) => prevCount + 1);
            window.location.reload();
        } catch (error) {
            console.error('Error al enviar los datos', error);
        }
    };

    useEffect(() => {
        if (type.type == "edit") {
            RequestServer(`http://localhost:5000/${element}/${id}`, "GET", creds, (loadedData) => {
                setFormData(loadedData.data)
            });
        }
    }, [formCount]);

    useEffect(() => {
        // Update additional fields whenever selectedOption changes
        if (element.toLowerCase() === 'entities') {
            const entityFields = getEntitiesById(selectedOption);
            setAdditionalFields(entityFields);
        }
    }, [selectedOption, element]);

    /* Switch  para obtener los campos según tipo de elemento:
        - Para las entidades (hay subpage), se define únicamente el "Type" y a partir de este, llama a "getEntitiesById"
    */
    function getFieldsForElement(element) {
        switch (element.toLowerCase()) {
            case 'channels':
                return [
                    { label: "Ref. Code", name: 'refcode', type: 'text', required: true },
                    { label: "Name", name: 'name', type: 'text', required: true },
                    { label: "Email", name: 'email', type: 'text', required: true },
                    { label: "Phone Number", name: 'phonenum', type: 'text', required: true },
                ];
            case 'organizations':
                return [
                    { label: "Channel", name: 'channel', type: 'select',options:[], required: true },
                    { label: "Ref. Code", name: 'refcode', type: 'text', required: true },
                    { label: "Name", name: 'name', type: 'text', required: true },
                    { label: "Email", name: 'email', type: 'text', required: true },
                    { label: "Phone Number", name: 'phonenum', type: 'text', required: true },
                    { label: "Address", name: 'address', type: 'text', required: true },
                    { label: "Postal Code", name: 'postal_code', type: 'text', required: true },
                    { label: "City", name: 'city', type: 'text', required: true },
                    { label: "Domain", name: 'domain', type: 'text', required: true },
                    { label: "Status", name: 'active', type: 'boolean' },
                ];
            case 'persons':
                return [
                    { label: "Fullname", name: 'fullname', type: 'text', required: true },
                    { label: "Firstname", name: 'firstname', type: 'text', required: true },
                    { label: "Surname", name: 'surname', type: 'text', required: true },
                    { label: "Identification number", name: 'identification_number', type: 'text', required: true },
                    { label: "Email", name: 'email', type: 'text', required: true },
                    {
                        label: "Level", name: 'level', type: 'select', required: true, options: [
                            { "id": 1, "name": "unprivileged user" },
                            { "id": 2, "name": "reduced user access to confidential information" },
                            { "id": 3, "name": "user broad access to confidential information" },
                            { "id": 4, "name": "intermediate control" },
                            { "id": 5, "name": "department director" },
                            { "id": 6, "name": "IT service administrator" },
                            { "id": 7, "name": "global administrative" },
                            { "id": 8, "name": "vip - manager" },
                            { "id": 9, "name": "corporate non-human" }]
                    },
                    { label: "Address", name: 'address', type: 'text', required: true },
                    { label: "Postal Code", name: 'postal_code', type: 'text', required: true },
                    { label: "City", name: 'city', type: 'text', required: true },
                    { label: "Alias", name: 'alias', type: 'text', required: true },
                    { label: "Phone Number", name: 'phonenum', type: 'text', required: true },
                ];
            case 'entities':

                return [
                    {
                        label: "Type", name: 'type', type: 'select', options: [
                            { "id": 1, "name": "Address" },
                            { "id": 2, "name": "Alias" },
                            { "id": 3, "name": "Dns" },
                            { "id": 4, "name": "Document" },
                            { "id": 5, "name": "Domain" },
                            { "id": 6, "name": "Email" },
                            { "id": 7, "name": "Numbers" }

                        ], required: true
                    }
                ]

            case 'leaks':
                return [
                    { label: "Name", name: 'name', type: 'text', required: true },
                    { label: "Domain", name: 'domain', type: 'text', required: true },
                    { label: "Data bytes", name: 'data_bytes', type: 'number', required: true },
                    { label: "Content", name: 'content', type: 'text', required: true },
                    { label: "Comments", name: 'comments', type: 'textarea', required: true, maxLength: 200, placeholder: 'Explain the leak' },
                    {
                        label: "Sector", name: 'sector', type: 'select', options: [
                            { "id": 1, "name": "Sector 1" },
                            { "id": 2, "name": "Sector 2" },
                            { "id": 3, "name": "Sector 3" }],
                        required: true
                    },
                    {
                        label: "Source", name: 'source', type: 'select', options: [
                            { "id": 1, "name": "Source 1" },
                            { "id": 2, "name": "Source 2" },
                            { "id": 3, "name": "Source 3" }],
                        required: true
                    },
                    { label: "Location", name: 'location', type: 'text', required: true },
                    {
                        label: "Entity", name: 'entity', type: 'select', options: [
                            { "id": 1, "name": "Entity 1" },
                            { "id": 2, "name": "Entity 2" },
                            { "id": 3, "name": "entity 3" }],
                        required: true
                    },
                ];
            case 'requests':
                return [
                    { label: "Discovery", name: 'discovery', type: 'text' },
                    {
                        label: "Status", name: 'status', type: 'select', options: [
                            { "id": 1, "name": "Entity 1" },
                            { "id": 2, "name": "Entity 2" },
                            { "id": 3, "name": "entity 3" }], required: true
                    },
                    {
                        label: "Priority", name: 'priority', type: 'select', options: [
                            { "id": 1, "name": "Entity 1" },
                            { "id": 2, "name": "Entity 2" },
                            { "id": 3, "name": "entity 3" }], required: true
                    },
                    { label: "Description", name: 'description', type: 'text' },
                    { label: "Response", name: 'response', type: 'text' },
                ];
            case "users":
                return [
                    { label: "Username", name: "username", type: "text" },
                    { label: "Name", name: "name", type: "text" },
                    { label: "Email", name: "email", type: "text" },
                    {
                        label: "Group", name: "group", type: "select", options: [
                            { "id": 1, "name": "Admin" },
                            { "id": 2, "name": "Channel" },
                            { "id": 3, "name": "Organization" },
                            { "id": 4, "name": "Employee" }
                        ]
                    },
                    {
                        label: "Asigned", name: "element_id", type: "select", options: [
                            { "id": 1, "name": "Channel 1" },
                            { "id": 2, "name": "Channel 2" },
                            { "id": 3, "name": "Channel 3" },
                            { "id": 4, "name": "Channel 3" }



                        ]
                    }
                ]
            default:
                return [];
        }
    }

    // Switch para cada opcion de tipo de entidad según su id (depende de la opción seleccionada en el input "Type")
    function getEntitiesById(selectedOptionID) {
        switch (selectedOptionID) {
            /* ADDRESS*/
            case 1:
                subpage = "addressess";
                return [
                    { label: "Asigned to", name: 'person_name', type: 'select', required: true, options: [] },
                    { label: "Address", name: 'address', type: 'text', required: true },
                    { label: "Postal code", name: 'postal_code', type: 'text', required: true },
                    { label: "City", name: 'city', type: 'text', required: true },
                    { label: "Country", name: 'country', type: 'text', required: true },
                    { label: "Content", name: 'content', type: 'text', required: true },
                ];
            /* ALIAS */
            case 2:
                subpage = "alias";
                return [
                    { label: "Asigned to", name: 'person_name', type: 'select', required: true, options: [] },
                    { label: "Title", name: 'title', type: 'text', required: true },
                    { label: "Content", name: 'content', type: 'text', required: true },
                ];
            /* DNS */
            case 3:
                subpage = "dns";
                return [
                    { label: "Asigned to", name: 'person_name', type: 'select', required: true, options: [] },
                    { label: "FQDN", name: 'fqdn', type: 'text', required: true },
                    { label: "Content", name: 'content', type: 'text', required: true },
                ];
            /* Document */
            case 4:
                subpage = "documents";
                return [
                    { label: "Asigned to", name: 'person_name', type: 'select', required: true, options: [] },
                    { label: "Title", name: 'title', type: 'text', required: true },
                    { label: "Url", name: 'url', type: 'text', required: true },
                    { label: "Meta-data", name: 'metadata', type: 'text', required: true },
                    { label: "Content", name: 'content', type: 'text', required: true },
                ];
            /* Domain */
            case 5:
                subpage = "domains";
                return [
                    { label: "Asigned to", name: 'person_name', type: 'select', required: true, options: [] },
                    { label: "Name", name: 'name', type: 'text', required: true },
                    { label: "Who is Info", name: 'whhois_info', type: 'text', required: true },
                    { label: "Content", name: 'content', type: 'text', required: true },
                ];
            /* Email */
            case 6:
                subpage = "emails";
                return [
                    { label: "Asigned to", name: 'person_name', type: 'select', required: true, options: [] },
                    { label: "Email", name: 'email', type: 'text', required: true },
                    { label: "Content", name: 'content', type: 'text', required: true },
                ];
            /* Numbers */
            case 7:
                subpage = "numbers";
                return [
                    { label: "Asigned to", name: 'person_name', type: 'select', required: true, options: [] },
                    { label: "Phone number", name: 'phone_number', type: 'text', required: true },
                    { label: "Content", name: 'content', type: 'text', required: true },
                ];
        }
    }

    return (
        <>
            {[...Array(formCount)].map((_, index) => (
                <form key={index} onSubmit={handleSubmit} className='form-leaks'>
                    <div className="formTitle"><h5 > Add {element}</h5></div>

                    {elementFields.map((field) => (
                        <div key={field.name}>
                            <label>{(field.label).toUpperCase()}:</label>
                            {/* Render fields based on type */}
                            {field.type === 'textarea' ? (
                                <textarea
                                    name={field.name}
                                    value={formData[field.name] || ''}
                                    onChange={handleChange}
                                    maxLength={field.maxLength}
                                    placeholder={field.placeholder}
                                />
                            ) : field.type === 'select' ? (
                                <select
                                    name={field.name}
                                    value={formData[field.name] || ''}
                                    onChange={handleChange}
                                    required={field.required}
                                >
                                    {field.options.map((option) => (
                                        <option key={option.id} value={option.id}>
                                            {option.name}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    type={field.type}
                                    name={field.name}
                                    value={formData[field.name] || ''}
                                    onChange={handleChange}
                                    required={field.required}
                                />
                            )}
                        </div>
                    ))}

                    {/* Conditionally render additional fields for "entities" */}
                    {element.toLowerCase() === 'entities' && additionalFields.map((field) => (
                        <div key={field.name}>
                            <label>{(field.label).toUpperCase()}:</label>
                            {/* Render different input types based on the field type */}
                            {field.type === 'textarea' ? (
                                <textarea
                                    name={field.name}
                                    value={formData[field.name] || ''}
                                    onChange={handleChange}
                                    maxLength={field.maxLength}
                                    placeholder={field.placeholder}
                                />
                            ) : field.type === 'select' ? (
                                <select
                                    name={field.name}
                                    value={formData[field.name] || ''}
                                    onChange={handleChange}
                                    required={field.required}
                                >
                                    {field.options.map((option) => (
                                        <option key={option.id} value={option.id}>
                                            {option.name}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    type={field.type}
                                    name={field.name}
                                    value={formData[field.name] || ''}
                                    onChange={handleChange}
                                    required={field.required}
                                />
                            )}
                        </div>
                    ))}

                    <div className="formLeaks btn-group">
                        <Link to={`/${element.toLowerCase()}`}>
                            <button type="button" className='formCancel'>Cancel</button>
                        </Link>
                        {type == "add" ? (<>
                            <button type="submit" onClick={handleSubmit}>Submit</button>
                            <button type='button' onClick={handleAddOther}>Add other</button>
                        </>) :
                            (<>
                                <button type="submit" onClick={handleEdit}>Save changes</button>
                            </>)}

                    </div>
                </form>
            ))}
        </>
    );
};

export default Form;