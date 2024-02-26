import React, { useState } from "react";
import { SidebarItem } from "./Atoms/SidebarItem";
import DropdownButton from './Atoms/DropdownButton';
import DropdownContainer from './Atoms/DropdownContainer';
import { UseUser } from "../auth/UserAuth";
import { NewDropdown } from "./Atoms/NewDropDown";

/* Barra lateral de navegación
  parámetros:
    - nosideitems: parametro para que solo cargue el dropdown de cambiar tenant
    - notenanchange: para que no cargue ( muestre) el dropdown del tenant
    - links: listado de diccionario de links {'name': nombre, 'url': url, 'tag':tagName || null}
*/
const SideBar = ({ nosideitems, notenantchange, links = [] }) => {
  /*Valores por defecto (mockup) */
  const noLinks = [
    { text: "...", active: true },
    { text: "...", active: true },
    { text: "...", active: true },
    { text: "...", active: true },
  ];

  const [selectedItem, setSelectedItem] = useState(1);

  // Cargamos de la autenticacion la funcion de deslogear tenant
  const { logoutTenant } = UseUser();

  // Para activar/seleccionar el link pinchado. Solo es visual aun
  const handleSelected = (url, index) => {
    setSelectedItem(index);
    //history.push(url.url)
    window.location.replace(`${url.url}`);
    //return <Navigate replace to={`${url.url}`} />;
  };

  /* PARA PRUEBAS Y QUE SE VEA LA FUNCIONALIDAD */
  const urlPath = window.location.href;
  if (links) {
    links.forEach((linkItem) => {
    })
  }

  return (
    <>
      {/* Contenedor del sidebar */}
      <aside className="sidebarPage">
        {/* Listado de enlaces */}
        {!nosideitems ? (
          <ul className="navbar-nav">
            {/*Si hay links: lista de links */}
            {links ? (
              // Por cada elemento (linkGroup)
              links.map((item, index) => (
                <li key={`nv_li-${index}`}>
                  {/* si no hay 'elements', muestra un sidebaritem normal  */}
                  {!item.elements ? (
                    <SidebarItem
                      text={item.name}
                      active={item.url === urlPath}
                      onClick={() => handleSelected(item, index)} />
                  ) : (// Si hay 'elements' crea un Dropdown con el nombre del link (Grupo)
                  item.type === "newdropdown" ? (
                    <NewDropdown
                      text={item.name}
                      child={item.elements}
                      options={item.elements.map((element) => ({
                        text: element.name,
                        onClick: () => handleSelected(element, index),
                      }))}
                    />
                  ) : (
                    <DropdownButton
                      text={item.name}
                      active={item.url === urlPath}
                      child={item.elements}
                      options={item.elements.map((element) => ({
                        text: element.name,
                        onClick: () => handleSelected(element, index),
                      }))}
                    />
                  )
                )}

                </li>))
            ) : (
              // Cuando aún no han cargado los datos o no hay datos
              // lista de {...}
              noLinks.map((item, index) => (
                <SidebarItem
                  key={index}
                  text={item.name}
                  //active={item.active || selectedItem == index }
                  active={item.active}
                  onClick={() => handleSelected(item, index)}
                />
              ))

            )}
            <hr />
          </ul>
        ) : (
          <div></div>
        )}

        {!notenantchange ? (
          <div>
            <DropdownButton
              fontColor="white"
              transparent
              text="Change tenant"
              large
              options={[
                {
                  text: "Select tenant",
                  link: "/tenants/",
                  onClick: logoutTenant,
                },
              ]}
            />
          </div>
        ) : (
          <></>
        )}
      </aside>
    </>
  );
};

export default SideBar;