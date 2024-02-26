import { useRef } from "react";
import "../../static/css/newdropdown.css";
import DropdownButton from "./DropdownButton";

export const NewDropdown = ({ text, child, options }) => {
 
  const refChild = useRef();

  const handleSelected = (url, index) => {
    setSelectedItem(index);
    //history.push(url.url)
    window.location.replace(`${url.url}`);
    //return <Navigate replace to={`${url.url}`} />;
  };

  const urlPath = window.location.href;

  const cambiarClase = () => {
    if (refChild.current) {
      refChild.current.classList.toggle("active");
      refChild.current.classList.toggle("inactive");
    }
  };

  return (
    <div>
      <div className="contenedorDrops">
          <button className="btn-secundary btn" onClick={cambiarClase}>{text}</button>
          <div ref={refChild} className="inactive">
            {child.map((item, index) => (
              <li key={`ndd-${index}`}>
                {item.type === "newdropdown" ? (
                  <NewDropdown
                    text={item.name}
                    child={item.elements}
                    options={item.elements.map((element) => ({
                      text: element.name,
                      onClick: () => handleSelected(element, index),
                    }))}
                  />
                ) : item.type === "dropdown" ? (
                  <DropdownButton
                    text={item.name}
                    child={item.elements}
                    active={item.url === urlPath}
                    options= {options}
                  />
                ) : (
                  <></>
                )}
              </li>
            ))}
          </div>
      </div>
    </div>
  );
};
