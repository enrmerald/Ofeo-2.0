import React, { useState } from "react";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";

/* Componente para las diferentes pestañas
    Parámetros:
    - tabs: lista de diccionarios - formato: [{title: "Titulo", content: "Contenido", img: identificador icono fontAwesome]
    - id: identificador del bloque de pestañas (para identificar el className)
     
*/

export const DataTab = ({ tabs = [], id = "" }) => {
  return (
    /*Bloque contenedor */
    <Tabs className={`${id} tabDiv`}>
      {/* Lista de elemenos (tabs) */}
      <TabList className={`${id} tabList`}>
        {tabs.map((tab, index) => (
          <Tab className={`${id} tabItem`} key={index}>
            <i className={`fa-solid ${tab.img}`}></i>
            {tab.title}
          </Tab>
        ))}
      </TabList>
      {/* Panel para cada pestaña (texto) */}
      {tabs.map((tab, index) => (
        <TabPanel key={index} className={`${tab.id} tabPanel `}>
          <h2>{tab.title}</h2>
          <div className={`${tab.title}Div`}>
            {/* Verifica si tab.content es un array antes de intentar mapearlo */}
            {Array.isArray(tab.content)
              ? tab.content.map((contentElement, contentIndex) => (
                <div className="contentDiv" key={contentIndex}>{contentElement}</div>
              ))
              : tab.content}
          </div>
        </TabPanel>
      ))}
    </Tabs>
  );
};
