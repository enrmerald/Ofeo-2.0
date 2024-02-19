import React from 'react';

const ColorPicker = ({ label, value, onChange }) => (
  <div className="form-color">
    {getColorsName[label] ? (
      <>
        <label htmlFor={label}>{getColorsName[label]}</label>
        <div className="form-input-wrapper">
          <div className="form-input-fill" data-color={value} style={{ color: value }}></div>
          <input className="form-color-input" type="color" onChange={(e) => onChange(e, label)} defaultValue={value} name={label} id={label} />
        </div>
      </>
    ) : <></>}
  </div>
);
const getColorsName = {
  "text-color": "Text Color",
  "back-color": "Back Color",
  "highlight-color": "Highlight Color"
}

export default function ColorPickerList({ colors, onChange }) {
  const filteredColors = colors.filter(color => getColorsName[color.label]);

  return (
    <div>
      {filteredColors.map((color) => (
        <ColorPicker key={color.label} label={color.label} value={color.value} onChange={onChange} />
      ))}
    </div>
  );
}
