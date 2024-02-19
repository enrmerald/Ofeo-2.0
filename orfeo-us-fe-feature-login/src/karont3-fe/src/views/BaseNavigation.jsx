import { UseUser } from '../auth/UserAuth'
import Topbar from './TopBar.jsx'
import SideBar from './SideBar.jsx';
import { useEffect, useState } from 'react';


export const BaseNavigation = ({ history, children }) => {
    // Extraemos los datos de autenticación
    const { isAuthenticated, isTenantAuthenticated, token } = UseUser()

    // Estado para los links que se enviarán al sidebar
    const [links, setLinks] = useState(null)

    // Credenciales para enviar al servidor de cara a extraer los datos usando el token
    const creds = {
        'security': {
            'token': token || '1234'
        }
    }

    // Creo una funcion para exportar a la funcion de pedir datos al servidor
    function getLinks(dataReceived) {
        setLinks(dataReceived.links);
    }
    useEffect(() => {
        RequestServer(`http://localhost:5000/settings/${token}/`, "GET", creds, (loadedData) => {
            const colors = loadedData.display.colors;
            if (colors) {
                const lightColorsObject = {};
                const darkColorsObject = {};

                // Recorre cada propiedad en colors y guarda los colores correspondientes
                Object.keys(colors).forEach((colorLabel) => {
                    const lightColor = colors[colorLabel][0];
                    const darkColor = colors[colorLabel][1];

                    lightColorsObject[colorLabel] = lightColor;
                    darkColorsObject[colorLabel] = darkColor;
                });

                // Guarda en localStorage
                localStorage.setItem("userLightColors", JSON.stringify(lightColorsObject));
                localStorage.setItem("userDarkColors", JSON.stringify(darkColorsObject));
            }
        })
        applyColors();
    }, [])

    // Utilizamos useEffect para realizar la peticion de datos al servidor.
    // UTilizamos la funcion creada en common.js que necesita una ruta, el método,
    // los datos a enviar (credenciales) y la funcion que se ejecute al conseguir
    // extraer los datos
    useEffect(() => {
        RequestServer('http://localhost:5000/navigation', "POST", creds, getLinks)
    }, [])

    // Devolvemos los datos del componente
    return (
        <>
          {!isAuthenticated ? (
            <div>
              {children}
            </div>
          ) : !isTenantAuthenticated ? (
            <>
              <Topbar nosearch />
              <SideBar nosideitems notenantchange />
              <div className='bg-transparent d-flex justify-content-center w-100'>
                {children}
              </div>
            </>
          ) : (
            <>
              <Topbar />
              <SideBar links={links} history={history} />
              <div className='contentPage'>
                {children}
              </div>
            </>
          )}
        </>
    );
    
}
