import React from 'react'
import { Link } from 'react-router-dom'

export const SidebarItem = ({icon = "bi bi-circle", text="...", link="#", active, keyItem, onClick=()=>{console.log("Hi!")}}) => {
    return (
        <li key={`SidebarItem-${keyItem}`} className={`nav-item sidebar-item ${active ? 'active' : ''}`} onClick={onClick}>
            <div><i className={icon} ></i></div>
            <span className='ms-4'>{text}</span>     
        </li>   
    )
}