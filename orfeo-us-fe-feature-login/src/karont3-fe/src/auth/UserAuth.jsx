import React, { createContext, useContext, useState } from 'react'
 
// Creamos el contexto del usuario
// Lo usaremos como componente que agrupara a los componentes que necesiten usar sus valores
const UserContext = createContext()
 
// Exportamos en una constante el contexto, para poder obtener los datos en los componentes hijos
export const UseUser = () => {
  return useContext(UserContext)
}
 
// Componente en si, para renderizar. Incluye los estados, y sus setters
export const UserAuth = ({ children }) => {
  // Para dar estados de usuario
  const [user, setUser] = useState(localStorage.getItem("username"));
  const [UserId, setUserId] = useState(localStorage.getItem("user_id"))
  const [isAuthenticated, setIsAuthenticated] = useState(localStorage.hasOwnProperty("token"));
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user_group, setUserGroup] = useState(localStorage.getItem("groups"))
 
  // Obtener el tema por defecto del usuario (del sistema)
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  // Guarda el tema por defecto en el localStorage
  if (!localStorage.getItem("data-theme")) { localStorage.setItem('data-theme', systemTheme); }
 
  // Para dar estados de tenant
  const [tenant, setTenant] = useState(null);
  const [isTenantAuthenticated, setTenantAuthenticated] = useState(localStorage.hasOwnProperty("tenant"));
 
  // Para logear al usuario
  const login = (username, user_id, _token,user_group) => {
    console.log('grupo login', token)
    // Damos las variables locales
    localStorage.setItem('user_id', user_id)
    localStorage.setItem('username', username)
    localStorage.setItem('token', _token)
    localStorage.setItem('user_group',user_group)
    if (!_token){
      console.log('no token')
    }
    // Establecemos los estados del componente
    setUserId(user_id || 1)
    setUser(username )
    setToken(_token )
    setUserGroup(user_group)
    setIsAuthenticated(true)
  };
 
  // Para deslogear al usuario
  const logout = () => {
    // Eliminamos los datos del tema y colores
    localStorage.removeItem("data-theme")
    localStorage.removeItem("userLightColors")
    localStorage.removeItem("userDarkColors")
    // Eliminamos las variables de usuario
    localStorage.removeItem('username')
    localStorage.removeItem('token')
    localStorage.removeItem('user_id')
    localStorage.removeItem("user_group")
    setUserId(null)
    setUser(null)
    setToken(null)
    setIsAuthenticated(false);
    try {
      RequestServer("http://localhost:5000/logout/", "GET", {
        'security': {
          'token': token
        }
      }, (logoutRoute => { console.log(logoutRoute) }))
      // return window.location.href = '/login'
    }
    catch (error) {
      console.log("Error logout")
    }
    // Por si tenemos datos de tenant
    logoutTenant()
  };
 
  // Para dar la informacion del tentant seleccionado
  const loginTenant = (tenantData) => {
    // Damos las variables locales
    localStorage.setItem('tenant', tenantData)
    // Damos los estados de autenticacion
    setTenant(tenantData)
    setTenantAuthenticated(true)
  }
 
  // Para limpiar la info del tenant y deslogearlo de tenant (no de usuario)
  const logoutTenant = () => {
    localStorage.removeItem('tenant')
    setTenant(null);
    setTenantAuthenticated(false)
  }
 
  // Devolvemos el contexto agrupando los valores que necesitamos para trabajar con el contexto
  // Con estos valores, agruparemos en su interior los elementos con los que vamos
  // a trabajar
  // NECESITAMOS PASARLE EN EL VALUE TODAS LAS VARIABLES O ESTADOS QUE NECESITEMOS EN LOS HIJOS
  return (
    <UserContext.Provider value={{ user, UserId, tenant, login, logout, loginTenant, logoutTenant, isAuthenticated, isTenantAuthenticated, token, setTenant , user_group}} >
      {children}
    </UserContext.Provider>
  )
}