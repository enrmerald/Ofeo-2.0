import React, { useState, useRef, useEffect } from "react";
import Button from "./Button";
import "../../static/css/Dropdown.css"
import DropdownContainer from "./DropdownContainer";
/* Componente botón Dropdown
  parámetros:
  - id_dd: identificador del botón
  - options: listado de opciones a mostrar en el desplegable
  - text: texto o etiqeuta del botón
  - child: listado de elementos hijos.
  - large: parámetro apra auto ajustarse al ancho del padre
  - transparent: define si el boton es transparente o tiene fondo (si está es true)
  - onlyborder: muestra únicamente el borde
  - user: define si el usuario está o no logeado (por defecto no)
  - fontColor: color de fuente, por defecto negro
  - config: define si el botón es tipo 'configuración' o no
  - orientation: tipo de orientacion (por defecto vertical)
   */
const DropdownButton = ({
  id_dd = "dropdownButton",
  options = [],
  text = "",
  child = [],
  large = null,
  collapsed = true,
  transparent = null,
  onlyborder,
  user = null,
  fontColor = "black",
  config = null,
  orientation = "vertical",
}) => {

  const dropdownRef = useRef(null);

  const cambiarClase = () => {
    if (dropdownRef.current) {
      dropdownRef.current.classList.toggle("active");
      dropdownRef.current.classList.toggle("inactive");
    }
  }

  
  return (
    <div
      className={`dropdown ${large ? "large-item" : ""} ${
        orientation === "horizontal" ? `${id_dd} horizontal-dropdown` : ""
      }`}
    >
      {user ? (
        <Button text="Usuario" topbarButton userButton toggle />
      ) : config ? (
        <Button text="Usuario" topbarButton configButton toggle />
      ) : (
        <button
          className={`btn btn-secondary dropdown-toggle  ${
            large ? " flex1" : ""
          } ${transparent ? " dropdown-search" : ""} ${
            onlyborder ? " onlyborder" : ""
          }  ${user ? "dropdown-button-like" : ""}`}
          type="button"
          id={id_dd}
          data-bs-toggle="dropdown"
          aria-expanded="false"
          style={{ color: fontColor }}
          onClick={cambiarClase}
        >
          {text}
        </button>
      )}
      <ul ref={dropdownRef} className="inactive btn-secundary btn">
      {/* Renderiza el contenedor del menú */}
        {child.length > 0 ? (
          child.map((item, index) => (

            <li key={`${id_dd}-${index}`}>
              <button className="item-button" onClick={cambiarClase}>
                {item.name}
              </button>
            </li>
          ))
        ) : (
          // Si no hay opciones, renderiza elementos de relleno
          <>
            <li>...</li>
            <li>...</li>
            <li>...</li>
            <li>...</li>
          </>
        )}
      </ul>
    </div>
  );
};
export default DropdownButton;
