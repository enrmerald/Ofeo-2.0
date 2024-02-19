import { React, useState, useEffect, useCallback } from "react";
import { Card } from "./Card";
import PieChart from "./PieChart";
import { use } from "echarts";
/* Componente para representar  los KPI 
  Parámetros:
  - idComp: identificador del componente
  - value: valor del kpi (contador)
  - title: título identificador del kpi
  - type: tipo de kpi a representar (card/pie)
  - type_name: nombre exacto del tipo (piechart, donnutchart)
  - color: color asignado a cada elemento kpi (utilizado en la cabecera)
  - icon: icono asignador a cada elemento kpi
  */


function KPIChart({ token = "123456" }) {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const desktopMode = windowWidth >= 599;
  const [selectedCounters, setSelectedCounters] = useState([])
  const [data, setData] = useState(null)

  const creds = {
    'security': {
      'token': token || localStorage.token
    }
  };

  const handleResize = useCallback(() => {
    setWindowWidth(window.innerWidth);
  }, []);

  // Obtengo los datos 
  useEffect(() => {
    RequestServer(`http://localhost:5000/settings/${token}/counters/`, "GET", creds, (loadedData) => {
      setData(loadedData)
      setSelectedCounters(Object.keys(loadedData));

    })
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [handleResize]);

  // Función para obtener el color e icono según el título del contador
  function getColorAndIcon(counterTitle) {
    switch (counterTitle.toLowerCase()) {
      case "channels":
        return { color: "#00c79f", icon: "fa-solid fa-sitemap" };
      case "organizations":
        return { color: "#30B1AE", icon: "fa-solid fa-briefcase" };
      case "persons":
        return { color: "#4A7F90", icon: "fa-solid fa-users" };
      case "entities":
        return { color: "#576681", icon: "fa-solid fa-eye" };
      case "discoveries":
        return { color: "#644D72", icon: "fa-solid fa-magnifying-glass" };
      default:
        return { color: "", icon: "" };
    }
  }

  return (
    <>
      {selectedCounters.map((counter) => (
        <a key={counter} href={`${counter}/`}> {/* Enlace al elemento */}
          <Card
            size="count-chart"
            idComp={`count-chart`}
            title={counter}
            header=" "
            body={<>{data[counter]}</>}
            color={getColorAndIcon(counter).color}
            icon={getColorAndIcon(counter).icon}
          />
        </a>
      ))}
    </>
  );
  
}


export default KPIChart;