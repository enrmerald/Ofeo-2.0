import imgLogoEwala from "../static/images/ewalaSombrero.png";
import '../static/css/ewala_css.css';
import { useEffect, useState } from "react";
import { UseUser } from '../auth/UserAuth'
import { Navigate } from 'react-router-dom'
 
// Funcion del componente que cargara sus datos y renderizara el componente
export  function LoginTenant({company="Ewala", tenantRoute,
    routeTenantOptions, routeTenant, logo=imgLogoEwala}){
   
    // Obtenemos desde el contexto del componente de Authenticacion los datos que podemos necesitar:
    const {isAuthenticated, isTenantAuthenticated, token, logout, loginTenant, user, UserId, logoutTenant,user_group} = UseUser();
        console.log('UUU', UseUser())
 
    // Si no estamos autenticados, navegamos al login
    if(!isAuthenticated){
        return <Navigate replace to="/login/" />
    }
   
    // Si estamos autenticados y tenemos datos de tenant, vamos al dashboard
    if(isAuthenticated && isTenantAuthenticated){
        return <Navigate replace to="/" />
    }
   
    const [tenantOptions, setTenantOptions ] = useState([])             // Se usara para los valores (options) que contenga el select. Sera un listado de diccionarios
    //const [selectedTenantOption, selectTenantOption ] = useState(-1)   // Se usara para la seleccion del tenant seleccionado. Sera un id del tenant seleccionado
    let selectedTenantOption = tenantOptions.length > 0 ? tenantOptions[0].value :  null
 
   
    // Si no tenemos los datos cargados en el selector de tenant, debemos llamar a la api para consultarlos. Nos protegemos con un try/catch
    try{
        // Usaremos useEffect con un segundo parámetro ( [] justo antes del cierre de useEffect) para que no este constantemente haciendo peticiones, y se detenga
        // cuando tenga un valor
        useEffect(()=> {
            const dataRoute = routeTenantOptions + UserId
            fetch(dataRoute)
                .then(response => response.json())
                .then(data => {                      
                    // Creo una variable para almacenar los datos que necesitamos para rellenar las opciones (lo establezco cuando tengamos todos los valores)
                    let tempOptions = [];
                    for(var index in data){
                        tempOptions.push( { 'name': data[index]['tenant_company'], 'value': data[index]['tenant_id']} )
                    }
                    // Ya tenemos rellenado el array de datos que necesitamos en las opciones, asi que ya podemos pasarlo
                    setTenantOptions(tempOptions)
                })
                .catch(error => {
                    ErrorModalMessage(error)
                    return;
                })
        }, []);
    }catch(error){
        ErrorModalMessage(e)
        return;
    }
 
    // Para manejar el cambio de estado del selector. Se invoca al cambiar el estado, no en el envio
    const handleOptionChange = (event) => {
        selectedTenantOption = event.target.value
        //selectTenantOption(event.target.value);
    }
    console.log('u123',  user)
    // Metodo para enviar los datos de tenant seleccionado al servidor
    const submitTenantForm =  async (event) => {
        event.preventDefault();
        try {
          const endpoint = routeTenant + UserId + "/" + selectedTenantOption;
          console.log(endpoint)
          await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(
                {
                    "security": {
                      "user_id": UserId,
                      "username": user,
                      "password": "",
                      "tenant_id": selectedTenantOption,
                      "token": token,
                      "group":user_group
                    },
                    "data": {
                      "settings": {
                      }
                    }
                  }
                )
          })
          .then(responseServer => {
                if (responseServer.ok) {
                    // Parsea el cuerpo de la respuesta como JSON y devuelve una promesa
                    return responseServer;
                } else {
                    // Si la respuesta tiene un código de error
                    throw new Error('Error en la solicitud de tenant');
                }
            })
            .then(jsondata=>{
                // Recupero de UserAuth la funcion loginTenant para establecerle los datos de tenant
                return jsondata.json()
 
            })
            .then(json=> {
                loginTenant(json['security']['tenant_id'])
            })
            .catch(e=>{
                alert(e)
                return;
            });
        }
        catch (error) {
            alert(e)
            return;
        }
    };
 
    return (
        <div className="ewala-form-container">
            <div className="login-form">
                <form id="loginForm" name="loginForm" onSubmit={submitTenantForm}>
                    <div className="login-form-head">
                        <div className="img-login-form">
                            <img src={logo}></img>
                        </div>
                        <div className="title-login-form">            
                            <h1>{company}</h1>
                            <h2 className="ewala-title-text">Tenant Authentication</h2>
                        </div>                
                    </div>
                    <div className="ewala-form-body">
                       
                        <h5 className="ewala-label">Tenant</h5>
                        <select className="ewala-form-control" id="ewala-select-tenant"  onChange={handleOptionChange}>
                            {tenantOptions.map((option, index) => (
                                <option key={index} value={option.value}>
                                    {option.name}
                                </option>
                            ))}    
                        </select>
                    </div>
                    <div className="ewala-form-footer-tenant d-flex justify-content-right">
                        <input type="submit" value="Submit" className="ewala-button-submit"/>
                    </div>
                </form>
            </div>
    </div>
    )
}