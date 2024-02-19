import React, { useState } from "react";

export const SwitchButton = ({ id = "", left = "", right = "" }) => {
  // Obtén el tema actual almacenado en localStorage
  const savedTheme = localStorage.getItem('data-theme');
  // Inicializa el estado del switch con el tema actual
  const [isChecked, setIsChecked] = useState(savedTheme === 'dark');

  /* Maneja el cambio de tema cuando se activa/desactiva el switch */
  const toggleOption = () => {
    const theme = isChecked ? "light" : "dark"; // Cambia el tema
    localStorage.setItem('data-theme', theme); // Almacena el nuevo tema en localStorage
    setIsChecked(!isChecked); // Actualiza el estado del switch

  };

  return (
    <div className={`${id}-switch-container`} style={{ display: "flex", alignItems: "center" }}>
      <span className={`${id}-switch-label`} style={{ marginRight: "10px" }}>
        {left}
      </span>
      <div className="form-check form-switch">
        <input
          className="form-check-input"
          type="checkbox"
          role="switch"
          id={`${id}Switch`}
          onChange={toggleOption}
          checked={isChecked}
        />
        <label className="form-check-label" htmlFor={`${id}Switch`}></label>
      </div>
      <span className={`${id}-switch-label`} style={{ marginLeft: "10px" }}>
        {right}
      </span>
    </div>
  );
};
