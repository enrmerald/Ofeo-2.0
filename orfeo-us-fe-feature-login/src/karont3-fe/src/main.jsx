import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './index.css'
import { UserAuth } from './auth/UserAuth'
import { LoginUser } from './views/LoginUser'
import { LoginTenant } from './views/LoginTenant'
import { BaseNavigation } from './views/BaseNavigation.jsx'
import { Overview } from './views/Overview.jsx'
import { Config } from './views/Config.jsx'
import { Dashboard } from './views/Dashboard.jsx'
import { Dashboard_add } from './views/Dashboard_add.jsx'
import { Dashboard_view } from './views/Dashboard_view.jsx'
import Index from './views/Index.jsx'
const companyName = 'Karont3';
 
// Preparamos las rutas donde tendremos que dirigirnos
const routeLogin = "http://localhost:5000/login/";                   // Para enviar los datos de login de usuario + contraseña
const routeRegister = "http://localhost:5000/register";             // Para enviar el codigo de registro
const routeTenantOptions = "http://localhost:5000/tenants/";        // Para enviar el usuario logeado y cargar sus tenants. Se le agregara el id de usuario
const routeTenant = "http://localhost:5000/tenants/";         // Para enviar la seleccion de tenant y logearse con el. Se le agregara el id de usuario y el id de tenant
const routeConfig = "http://localhost:5000/config/;"
const routeChannels = "http://localhost:5000/channels"
const routeOrganizations = "http://localhost:5000/organizations"
const routeEmployees = "http://localhost:5000/employees"
const routeEntities = "http://localhost:5000/entities"
const routeDiscoveries = "http://localhost:5000/discoveries"
const routeLeaks = "http://localhost:5000/leaks"
const routeDash = "http://localhost:5000/dashboard"
 
 
 
 
 
/* Creamos la renderizacion de los elementos del router, pero como hijos
del UserAuth, lo que quiere decir, que pueden acceder a su CONTEXTO.
TODO COMPONENTE QUE ESTE DENTRO DE OTRO, ESTA EN EL CONTEXTO DEL PADRE
En este caso, las rutas a las que nos redirige el RouterProvider, están en
el contexto del componente AuthProvider
*/
 
// Para rutas que no existan
const NotFound = () => <div><h1 style={{ color: "black" }}>404 Not Found that page</h1></div>
 
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
 
    <UserAuth>
      <BrowserRouter>
        <Routes>
          <Route path="/index" element={<BaseNavigation> <Index></Index></BaseNavigation>} />
          <Route path="/login/" element={ <LoginUser company={companyName} routeLogin={routeLogin} routeRegister={routeRegister} />} />
          <Route path="/tenants" element={<LoginTenant company={companyName} routeTenantOptions={routeTenantOptions} routeTenant={routeTenant} />} />
          <Route path="/" element={<BaseNavigation><Overview /> </BaseNavigation>} />
          <Route path="/settings/" element={<BaseNavigation> <Config onLogoChange={(newLogo) => setLogo(newLogo)} /> </BaseNavigation>}></Route>
          {/* Rutas para todos los elementos excepto entidades */}
          <Route path="/:element/" element={<BaseNavigation> <Dashboard /> </BaseNavigation>} />
          <Route path="/:element/add/" element={<BaseNavigation> <Dashboard_add type="add" /> </BaseNavigation>} />
          <Route path="/:element/:id/view/" element={<BaseNavigation> <Dashboard_view /> </BaseNavigation>} />
          <Route path="/:element/:id/edit/" element={<BaseNavigation> <Dashboard_add type="edit" /> </BaseNavigation>} />
          <Route path="/:element/:id/delete/" element={<BaseNavigation> <Dashboard_view /> </BaseNavigation>} />
          {/* Rutas para las entidades (tienen subpágina) */}
          <Route path="/entities/:subpage/" element={<BaseNavigation> <Dashboard /> </BaseNavigation>} />
          <Route path="/entities/:subpage/add/" element={<BaseNavigation> <Dashboard_add type={"add"} /> </BaseNavigation>} />
 
          <Route path="/entities/:subpage/:id/view/" element={<BaseNavigation> <Dashboard_view /> </BaseNavigation>} />
          <Route path="/entities/:subpage/:id/edit/" element={<BaseNavigation> <Dashboard_add type={"edit"} /> </BaseNavigation>} />
          <Route path="/entities/:subpage/:id/delete/" element={<BaseNavigation> <Dashboard_view /> </BaseNavigation>} />
          {/* */}
          <Route path="*" element={<BaseNavigation> <Config /> </BaseNavigation>} />
        </Routes>
      </BrowserRouter>
    </UserAuth>
  </React.StrictMode>
)