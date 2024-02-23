import { useRef } from "react";
import "../../static/css/newdropdown.css";
import DropdownButton from "./DropdownButton";

export const NewDropdown = ({ text, child, options }) => {
  const refChild = useRef();
  console.log("NewDropDown ", child);

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
                    options={item.elements.map((element) => ({
                      text: element.name,
                      onClick: () => handleSelected(element, index),
                    }))}
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
