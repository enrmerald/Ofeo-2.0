import React from "react";
import { useState } from "react";

const CheckSwitch = ({ idComp, _key, text, name, onCheckBoxChange, state }) => {
    const [isChecked, setChecked] = useState(state);

    const handleCheckBoxChange = () => {
        setChecked(!isChecked); // Cambia el estado del checkbox
        if (onCheckBoxChange) {
            onCheckBoxChange(!isChecked); // Llama a la función proporcionada por la prop
        }
    };

    return (
        <>
            <label key={_key} className="mycheckbox ms-2">
                <input type="checkbox" name={name} id={idComp} checked={isChecked} onChange={handleCheckBoxChange} ></input>
                <span className="chkCanvas"></span>
                <span>{text}</span>
            </label>

        </>
    )
}

export default CheckSwitch;