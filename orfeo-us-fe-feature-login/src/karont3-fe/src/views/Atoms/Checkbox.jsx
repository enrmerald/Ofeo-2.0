import React, { useState } from "react";

export const Checkbox = ({ labels = [], onUpdate }) => {
  const [checkedItems, setCheckedItems] = useState(() => {
    // Inicializa el estado con un objeto basado en los labels y sus valores por defecto
    const initialCheckedItems = labels.reduce((acc, label) => {
      acc[label.id] = label.selected || false;
      return acc;
    }, {});
    return initialCheckedItems;
  });

  const handleCheckboxChange = (event, labelId) => {
    const updatedCheckedItems = {
      ...checkedItems,
      [labelId]: event.target.checked,
    };
    setCheckedItems(updatedCheckedItems);

    // Llama a la función onUpdate del componente principal con las etiquetas actualizadas
    const updatedLabels = labels.map((label) => ({
      ...label,
      selected: updatedCheckedItems[label.id] || false,
    }));
    onUpdate(updatedLabels);
  };
  return (
    <div>
      {labels.map((label) => (
        console.log(checkedItems[label]), console.log(label),

        <div key={label.id} className="custom-checkbox-container">

          <input
            type="checkbox"
            className="custom-checkbox"
            id={label.id}
            checked={checkedItems[label.id] || false}
            onChange={(e) => handleCheckboxChange(e, label.id)}
          />
          <label htmlFor={label.id}>{label.name}</label>
        </div>
      ))}
    </div>
  );
};