import React, { useState, useRef, useEffect } from "react";
import '../../static/css/Dropdown.css'
import Button from "./Button";
import DropdownButton from "./DropdownButton";

const DropdownContainer = ({
    id_dd = "dropdownContainer",
    options = [],
    text = "",
    child = [],
    large = null,
    transparent = null,
    onlyborder,
    user = null,
    fontColor = "black",
    config = null,
    orientation = "vertical",
  }) => {

    const listado = useRef(null)

    const [isDropdownVisible, setDropdownVisible] = useState(false);
    const dropdowncontRef = useRef(null);
  
    const handleDropdownButtonClick = (event) => {
        // Evita que el clic del botón se propague hacia arriba
        event.stopPropagation();
      };
    
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
    }, [dropdownRef, setDropdownVisible]);
  
    const toggleDropdown = () => {
      setDropdownVisible(!isDropdownVisible);
    };
  
    return (

        <div
        className={`dropdown ${large ? "large-item" : ""} ${
          orientation === "horizontal" ? `${id_dd} horizontal-dropdown` : ""
        }`}
        ref={dropdownRef}
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
            onClick={()=> {
                listado.current.classList.toggle('activo')
                listado.current.classList.toggle('inactivo')

            }}
          >
            {text}
          </button>
        )}
        
            <ul
            className={`dropdown-menu ${isDropdownVisible ? "show" : ""} ${
            orientation === "horizontal" ? "horizontal-menu" : ""
            }`}
            aria-labelledby={id_dd}
            >
                {child.map((item, index) => (
                    item.type === "dropdown" ? (
                        <DropdownContainer
                            key={`${id_dd}-${index}`}
                            transparent
                            isDropdownVisible
                            text={item.name}
                            child={item.elements}
                        />
                    ) : (
                        <DropdownButton
                            key={`${id_dd}-${index}`}
                            transparent
                            isDropdownVisible
                            text={item.name}
                            child={item.elements || null}
                            onClick={item.onClicks}
                        />
                    )
                ))}
            </ul>
        </div>
    );
};

export default DropdownContainer