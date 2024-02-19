import React, { useState, useRef, useEffect } from "react";
import Button from "./Button";
/* Componente botón Dropdown
  parámetros:
  - id_dd: identificador del botón
  - options: listado de opciones a mostrar en el desplegable
  - text: texto o etiqeuta del botón
  - large: parámetro apra auto ajustarse al ancho del padre
  - transparent: define si el boton es transparente o tiene fondo (si está es true)
  - onlyborder: muestra únicamente el borde
  - user: define si el usuario está o no logeado (por defecto no)
  - fontColor: color de fuente, por defecto negro
  - config: define si el botón es tipo 'configuración' o no
  - orientation: tipo de orientacion (por defecto vertical)
   */
const DropdownButton = ({ id_dd = "dropdownButton", options = [], text = "", large = null, collapsed = true,
  transparent = null, onlyborder, user = null, fontColor = "black",
  config = null, orientation = "vertical" }) => {
  // Define el estado del dropdown - por defecto NO es visible
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const dropdownRef = useRef(null);
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownVisible(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const toggleDropdown = () => {
    setDropdownVisible(!isDropdownVisible);
  };

  return (
    <div className={`dropdown ${large ? "large-item" : ""} ${orientation === "horizontal" ? `${id_dd} horizontal-dropdown` : ""}`} ref={dropdownRef}>
      {user ? (
        <Button text="Usuario" topbarButton userButton toggle />
      ) : config ? (
        <Button text="Usuario" topbarButton configButton toggle />
      ) : (
        <button
          className={`btn btn-secondary dropdown-toggle  ${large ? " flex1" : ""} ${transparent ? " dropdown-search" : ""} ${onlyborder ? " onlyborder" : ""}  ${user ? "dropdown-button-like" : ""}`}
          type="button"
          id={id_dd}
          data-bs-toggle="dropdown"
          aria-expanded="false"
          style={{ color: fontColor }}
          onClick={toggleDropdown}
        >
          {text}
        </button>
      )}

      <ul className={`dropdown-menu ${isDropdownVisible ? "show" : ""} ${orientation === "horizontal" ? "horizontal-menu" : ""}`} aria-labelledby={id_dd}>
        {options.length > 0 ? (
          options.map((item, index) => (

            <li key={`${id_dd}-${index}`}>
              <button className="item-button" onClick={item.onClick}>
                {item.text}
              </button>
            </li>
          ))
        ) : (
          <li>...</li>
        )}
      </ul>
    </div>
  );
};
export default DropdownButton;
