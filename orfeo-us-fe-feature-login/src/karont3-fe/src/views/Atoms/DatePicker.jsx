import React, { useState } from "react";
/*Elemento para la selección de fecha (calendario)
    parámetros:
    - id: identificador del elemento
    - selectedDate: fecha seleccionada (por defecto) 
    - onChange:
    - label: etiqueta asociada al calendario
    - disabled: atributo para activar o desactivar la selección de fecha
    - setSelectedDate:    
    
*/
const DatePicker = ({ id = "", selectedDate, onDateChange, label = "", disabled = "", setSelectedDate }) => {
    // Inicia el estado de la fecha con la fecah seleccionada (por defecto es la fecha de hoy)
    const initialDate = selectedDate ? new Date(selectedDate) : new Date();
    const [startDate, setStartDate] = useState(initialDate.toISOString().split('T')[0]);

    // Función para cuando se cambia la fecha 
    const handleDateChange = (date) => {
        const formattedDate = new Date(date).toISOString().split('T')[0]; // Convierte a formato aaaa-mm-dd
        setStartDate(formattedDate); // Actualiza el estado con la fecha formateada
        // Modifica el valor seleccionado al clicar en un nuevo valor
        if (setSelectedDate) {
            setSelectedDate(formattedDate);
        }

        if (onDateChange) {
            onDateChange(formattedDate);
        }
    };

    return (
        <div className="datepicker-container">
            <label htmlFor={id + "-datePicker"}>{label}</label>
            <input
                id={id + "-datePicker"}
                disabled={disabled}
                type="date"
                value={startDate}
                onChange={(e) => handleDateChange(e.target.value)}
            />
        </div>
    );
};

export default DatePicker;
