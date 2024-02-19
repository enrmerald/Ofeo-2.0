import React from 'react';
import { useNavigate } from 'react-router-dom';

const Button = ({ text = "",classname= "btn" , classId="",topbarButton, alertButton, alertButtonFill, helpButton, userButton, configButton, dateButton, searchButton, pdfButton, toggle, url = "" }) => {
  const navigate = useNavigate();

  let buttonClass = topbarButton ? "topbarButton" : classname;

  // Damos clase especial si es un icono
  if (userButton || alertButton || alertButtonFill || helpButton || configButton || searchButton || pdfButton) buttonClass = " topBarIco";

  const alertIcoEmpty = <i className="bi bi-bell"></i>
  const alertIcoFill = <i className="bi bi-bell-fill"></i>
  const userIco = <i className="bi bi-person-circle"></i>
  const helpIco = <i className="bi bi-question-circle"></i>
  const configIco = <i className="bi bi-gear-fill"></i>
  const dateIco = <i class="bi bi-calendar-check"></i>
  const searchIco = <i class="bi bi-search"></i>
  const pdfIco = <i class="bi bi-download"></i>

  let icoButton = null
  let description = null
  if (alertButton) {icoButton = alertIcoEmpty,description = "Alert"}
  else if (alertButtonFill) {icoButton = alertIcoFill, description = "Alert"}
  else if (userButton) {icoButton = userIco, description = "User Account"}
  else if (helpButton) {icoButton = helpIco,description = "Help"}
  else if (configButton) {icoButton = configIco, description = "Settings"}
  else if (dateButton) {icoButton = dateIco, description = "Date Selector"}
  else if (searchButton) {icoButton = searchIco, description = "Search Bar"}
  else if (pdfButton) {icoButton = pdfIco, description = "Download report"}
  const handleClick = () => {
    // Si se proporciona la prop 'url', utiliza useNavigate para cambiar la URL
    if (url) {
      navigate(`/${url}`);
    }
  };

  return <button id={classId} className={buttonClass} title={description} onClick={handleClick} type={toggle ? "button" : "submit"}
    data-bs-toggle={toggle ? "dropdown" : ""} aria-expanded="false">{icoButton ? icoButton : text} </button>;
};

export default Button;
