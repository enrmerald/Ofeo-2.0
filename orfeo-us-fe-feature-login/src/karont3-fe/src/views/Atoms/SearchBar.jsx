import { React, useState } from 'react';
import DropdownButton from './DropdownButton';
/* Barra superior de búsqueda
    parámetros:
    - elements: listado de los elementos
    - ico: iconos
*/
export const SearchBar = ({ elements, ico }) => {

    return (
        <div className='searchBar'>
            <DropdownButton id_dd='dd_search' transparent text="All"/>
            <div>
                <i className="bi bi-search m-2"></i>
            </div>
        </div>
    )
}

