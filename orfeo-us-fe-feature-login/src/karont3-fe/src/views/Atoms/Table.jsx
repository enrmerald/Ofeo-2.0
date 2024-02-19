import React, { useEffect, useState, useRef } from "react";
import CheckSwitch from "./CheckSwitch";
import { redirect } from "react-router-dom";
import { Modal } from "react-bootstrap";
const Table = ({
    idComp = "tableComp",
    route,
    credentials,
    elementName,
    updateData = null,
    newColumns = [],
    actions = null,
    add = null
}) => {
    const [tableData, setTableData] = useState(null);
    const [chkbx, setChkbx] = useState([]);
    const [reactTable, setReactTable] = useState(null);
    {/* Modal */ }
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedElementName, setSelectedElementName] = useState(null);
    const [rowSelected, setRowSelected] = useState(null)
    const [selectedID, setSelectedID] = useState(null)
    // Resto del código de tu componente Table

    // Función para abrir el modal
    const openModal = (rowData) => {
        setIsModalOpen(true);
        setSelectedElementName(rowData.name);

    };

    // Función para cerrar el modal
    const closeModal = () => {
        setSelectedElementName(null); // Limpiar el elementId cuando se cierra el modal
        setIsModalOpen(false);
    };



    if (updateData == null && tableData == null) {
        RequestServer(route, "GET", credentials, (loadedData) => {
            setTableData(loadedData.data);
        });
    }

    const deleteElement = () => {
        RequestServer(`http://localhost:5000/${elementName}/${selectedID}`, "DELETE", credentials, (loadedData) => {
            console.log(loadedData.data);

        });

    }
    let tabulatorTable = null; // Eliminado para pruebas y pasado en common.js primera linea

    // Necesitare un diccionario para que los nombres que se muestren no sean los mismos de la base de datos
    const dicFields = {

        channel_id: "Channel",
        id: "Id",
        refcode: 'Ref. Code',
        name: "Name",
        email: "Email",
        phonenum: "Phone",
        address: "Address",
        postal_code: "Postal Code",
        city: "City",
        domain: "Domain",
        active: "Status",
        dns: "DNS",
        /* PErson */
        fullname: "Full Name",
        firstname: "First Name",
        surname: "Surname",
        identification_number: "Ref. Number",
        alias: "Alias",


        // Reglas

        tenant_id: "ID Tenant",
    };

    // Variable global que servira para activar/ desactivar todo refrescando una sola vez
    var checks_seleccionados_individuales = true;

    // Metodo para actualizar en el localstorage el estado de las columnas y permanezca en las recargas de la pagina
    // la configuracion de visibilidad creada
    function updateColumnVisibilityConfig() {
        var visibilityMap = {};
        reactTable.getColumns().forEach(function (column) {

            visibilityMap[column.getField()] = column.isVisible();
        });
        //localStorage.setItem("columnVisibilityConfig_"+ titulo, JSON.stringify(visibilityMap));
        // SendTableData(table);
    }

    let lstChecboxes = [];

    function generateColumnCheckboxes(table) {
        if (chkbx.length !== 0) {
            let newCheckboxes = [];
            table.getColumns().forEach(function (column) {

                // Creamos los elementos para el selector
                newCheckboxes.push({
                    id: column.getField(),
                    title: column.getDefinition().title,
                    state: column.isVisible(),
                });
            });

            // Utilizamos el callback en setChkbx para asegurarnos de que estamos trabajando con el estado más reciente
            setChkbx((prevCheckboxes) => newCheckboxes);
            return;
        }

        document.querySelector("#dropdownMenuButtonTable").innerText =
            "Select columns visibility";
        var columnMenu = document.querySelector("#dd-column-views");
        columnMenu.innerHTML = "";
        columnMenu.classList.add("mx-auto");
        columnMenu.classList.add("my-2");

        // Creamos los botones que seleccionaran todo o nada
        var btn_sel_all = document.createElement("button");
        btn_sel_all.innerText = "Select All";
        btn_sel_all.classList.add("neotec-btn-selec-col");
        var btn_sel_nothing = document.createElement("button");
        btn_sel_nothing.innerText = "Select nothing";
        btn_sel_nothing.classList.add("neotec-btn-selec-col");

        // Creamos un div para ponerlos mejor
        var div_btns = document.createElement("div");

        div_btns.appendChild(btn_sel_all);
        div_btns.appendChild(btn_sel_nothing);

        // Lo agregamos al DOM
        columnMenu.appendChild(div_btns);
        columnMenu.appendChild(document.createElement("hr"));

        // Creamos cada columna real de la tabla
        table.getColumns().forEach(function (column) {
            // Creamos los elementos para el selector
            lstChecboxes.push({
                id: column.getField(),
                title: column.getDefinition().title,
                state: column.isVisible(),
            });

            // Para que funcione con el componente de checkbox
            setChkbx(lstChecboxes);
        });

        // Ya que tenemos dada la funcionalidad a los checkboxes, podemos dar evento a los botones de
        // todo o nada
        btn_sel_all.addEventListener("click", function () {
            // Selecciono todos los chechboxes para activarlos
            checks_seleccionados_individuales = false;
            let checkboxes = columnMenu.querySelectorAll("input[type='checkbox']");
            checkboxes.forEach(function (checkbox) {
                if (!checkbox.checked) checkbox.click();
                checkbox.checked = true;
            });
            updateColumnVisibilityConfig();
            // Ponemos a false el checkbox global para todas las columnas
            checks_seleccionados_individuales = true;
        });

        // Para el boton de ocultar todas las columnas
        btn_sel_nothing.addEventListener("click", function () {
            // Selecciono todos los checkpoxes para desactivarlos
            checks_seleccionados_individuales = false;
            let checkboxes = columnMenu.querySelectorAll("input[type='checkbox']");
            checkboxes.forEach(function (checkbox) {
                if (checkbox.checked) checkbox.click();
                checkbox.checked = false;
            });
            checks_seleccionados_individuales = true;
            // Actualizo los datos de la tabla. Dentro de esta funcion se llama al servidor
            updateColumnVisibilityConfig();
            table.redraw();

            // Envio los datos al servidor para que sepa que visibilidad debe tener la tabla
            //SendTableData(table);
        });
    }
    // Creamos la tabla de Tabulator
    const crearTabla = () => {
        const tableDom = document.querySelector("#" + idComp);
        tabulatorTable = new Tabulator(tableDom, {
            data: tableData,
            layout: "fitColumns",
            layoutColumnsOnNewData: true,
            responsiveLayout: "hide", // hide rows that no longer fit
            pagination: true,
            paginationMode: "remote",
            ajaxURL: route,
            page: 1,
            //ajaxParams: credentials, // Los envia en los parametros, pero no como autenticacion bearer
            ajaxParams: { Authorization: credentials.security.token }, // Los envia en los parametros, pero no como autenticacion bearer
            // Para poder enviar los credenciales como Bearer

            // Para la generacion de columnas automatica:
            ajaxResponse: function (url, params, response) {
                var columnas = [];
                for (var key in response.data[0]) {
                    if (key !== "created" && key !== "modified") { // Ocultar columnas Created y Modified

                        columnas.push({
                            /*title: key,*/
                            title: key in dicFields ? dicFields[key] : key,

                            field: key,
                            headerFilter: "input"
                        });
                    }

                }
                /* Si se pasa el parámetro actions, se crea la columna Actions con los tres botones view/edit/delete*/
                if (actions)
                    /* Añadir columna Actions */
                    columnas.push({
                        title: 'Actions',
                        field: 'actions',
                        formatter: function (cell, formatterParams, onRendered) {
                            const rowData = cell.getRow().getData();
                            let elementId;
                            if (elementName.toLowerCase() === 'users') {
                                elementId = rowData.username; 
                            } else{
                                elementId = rowData.id; 

                            }
                            setSelectedID(elementId)
                            setRowSelected(rowData)
                            return `<div class="actions-btn-group">
                                <a href="/${elementName}/${elementId}/view" type="button"><i class="bi bi-eye"></i></a>
                                <a href="/${elementName}/${elementId}/edit/" type="button"><i class="bi bi-pencil-square"></i></a>
                                <a type="button" class="btn btn-primary deleteButton" data-bs-toggle="modal" data-bs-target="#deleteModal"onclick="{() =>openModal(rowData)}">
                                <i class="bi bi-trash"></i>
                              </a>                               
                              </div>`;
                        },
                    })

                // Actualizar las columnas en la tabla
                tabulatorTable.setColumns(columnas);
                // Generamos los checkboxes de visibilidad de columnas
                generateColumnCheckboxes(tabulatorTable);
                // Devolver los datos para que se muestren en la tabla
                return response;
            },
            paginationSize: 10,
            paginationInitialPage: 0,
        });
        // Cargo las columnasuna vez se ha creado la tabla con los datos, para poder hacer la seleccion de ver/ocultar.
        tabulatorTable.on("renderComplete", function () {
            console.log("Entro en el renderComplete");
            console.log("Tam", newColumns.length);
        });

        // Cargo las columnasuna vez se ha creado la tabla con los datos, para poder hacer la seleccion de ver/ocultar.
        tabulatorTable.on("tableBuilt", function () {
            console.log("Entro en el table built");
            // Preparo para poder ocultar las columnas que deseemos ocultar
            generateColumnCheckboxes(tabulatorTable);
        });
        setReactTable(tabulatorTable);
    };

    useEffect(() => {
        try {
            crearTabla();
        } catch (error) {
            console.log("Error en la carga de la tabla: ", error);
        }
    }, [updateData]);

    const chkFunction = (chkState, name) => {
        if (reactTable) {
            reactTable.getColumns().forEach(function (column) {
                if (column.getDefinition().field == name) {
                    if (chkState) {
                        column.show();
                    } else {
                        column.hide();
                    }
                }
            });
        }
        updateColumnVisibilityConfig();
        // Ponemos a false el checkbox global para todas las columnas
        checks_seleccionados_individuales = true;
    };

    // Añade esta función para evitar que se cierre el dropdown al hacer clic en los checkboxes
    const preventDropdownClose = (event) => {
        event.stopPropagation();
    };

    return (
        <div id="ewala-tabla" className="ewala-container w-100 ewala-table">
            {/* <h2 className="component-title table-title">Table connections</h2> */}
            <div className="p-2">
                <div className="white-background">
                    <div className="dropdown">
                        <button
                            className="dropdown-toggle"
                            type="button"
                            id="dropdownMenuButtonTable"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                        >
                            Select columns to view or hide
                        </button>
                        {/* Si se pasa el parámetro add, se añade el botón para añadir elementos */}
                        {add ? <a type="button"
                            className="btn"
                            id="addElement"
                            href={`/${elementName}/add/`}
                        >
                            Add
                        </a> : ""}

                        <div
                            id="dd-column-views"
                            className="dropdown-menu m-2"
                            aria-labelledby="dropdownMenuButton1"
                            onClick={preventDropdownClose}
                        >
                            {chkbx.map((e, index) => (
                                <CheckSwitch
                                    key={e.title + index}
                                    name={e.title}
                                    text={e.title}
                                    idComp={e.id}
                                    onCheckBoxChange={(event) => chkFunction(event, e.id)}
                                    state={e.state}
                                ></CheckSwitch>
                            ))}
                        </div>
                    </div>
                    {/* Modal de confirmación */}
                    <div className="modal fade" id="deleteModal" tabindex="-9999" aria-labelledby="#deleteModalLabel" aria-hidden="true">
                        <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h1 className="modal-title fs-5" id="deleteModalLabel">Delete element</h1>
                                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                </div>
                                <div className="modal-body">
                                    Confirm the deletion of the {selectedElementName} element?
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                                    <button type="button" className="btn btn-primary" onClick={deleteElement}>Delete</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* */}
                </div>
                <div className="shadow" id={idComp}></div>
            </div>
        </div>
    );
};

export default Table;
