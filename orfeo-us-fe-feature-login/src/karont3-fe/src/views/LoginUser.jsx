import imgLogoEwala from "../static/images/ewalaSombrero.png";
import { useState, useEffect } from "react";
import { UseUser } from "../auth/UserAuth";
import { Navigate, json } from "react-router-dom";
export function LoginUser({ company = "Ewala", routeLogin = 'http://localhost:5000/login/', routeRegister = 'http://localhost:5000/register' }) {
    const [password, setPassword] = useState('');
    const [register, setRegister] = useState('');
    const [userSettings, setUserSettings] = useState([]);
    const [username, setUsername] = useState('')
    const { login, isAuthenticated } = UseUser();
 
    useEffect(() => {
 
 
        // applyUserColors();
    }, []);
    // SI estamos ya autenticados nos vamos al login de tenants
    if (isAuthenticated) {
        // Obtener el tema por defecto del usuario (del sistema)
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        // Guarda el tema por defecto en el localStorage
        if (!localStorage.getItem("data-theme")) { localStorage.setItem('data-theme', systemTheme); }
 
        // Obtener la configuracion del usuario desde el servidor
        const response = RequestServer(`http://localhost:5000/settings/${localStorage.getItem("token")}/`, "GET", {
            security: {
                token: localStorage.token,
            },
        }, (loadedData) => {
            setUserSettings(loadedData);
            // Colors -- {label:color} for light/dark theme
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
                //applyUserColors();
 
            } else {
                console.error('Error al acceder a las propiedades de colors:', colors);
            }
            if (!response) {
                console.log("No hay respuesta");
            }
 
            // Graph colors  -- array of colors
            const graphColors = loadedData.display.graph_colors;
            if (graphColors) {
                localStorage.setItem("graphColors", JSON.stringify(graphColors))
 
            } else {
                console.error('Error al acceder a las propiedades de colors:', colors);
            }
            if (!response) {
                console.log("Graph Colors not found");
            }
        });
        return <Navigate replace to="/tenants/" />;
    }
 
    // Creamos la llamada para comprobar si el formulario es correcto
    const submitLoginForm = async (event) => {
        event.preventDefault();
 
        // Comprobamos que hay datos en los campos de email y password
        if ((event.target.elements.email.value.length) == 0 || (event.target.elements.pass.value.length) == 0) {
            InfoModalMessage("Please, fill the username and password fields before send the information")
            return;
        }
 
        try {
            const response = await fetch(routeLogin, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(
                    {
 
                        "username": username,
                        "password": password,
                        "tenant_id": "",
                        "token": "",
                        "user_group": ""
                    }
 
                ), // Si la clave es igual que el valor, permite el paso directo
            });
            console.log(response)
 
            if (response) {
                // Parsea el cuerpo de la respuesta como JSON y devuelve una promesa
                console.log('parsea la respuesta')
                const jsonData = await response.json();
                setUsername(jsonData.security['username'])
                const user_id = "1"
                const token = jsonData.security['token']
                const user_group = jsonData.security['groups']
 
               
                //const { username, user_id, token } = jsonData.security;
                login(username, user_id, token, user_group);
            } else {
                // Si la respuesta tiene un código de error
                throw new Error('Error en la solicitud del login');
            }
        }
        catch (error) {
            ErrorModalMessage("Error detected: " + error.toString())
            return;
        }
    };
 
    // Creamos la llamada para el caso de registro por codigo
    const licenseForm = (e) => {
        // Hacemos una consulta al servidor para ver si el codigo es correcto
        try {
            const response = fetch(routeRegister, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(
                    {
                        "security": {
                            "username": username,
                            "password": password,
                            "tenant_id": "",
                            "token": "",
                            "register": register
                        },
                        "data": {
                            "settings": {}
                        }
                    }
                ) // Si la clave es igual que el valor, permite el paso directo
            }).then((responseServer) => {
                if (responseServer.ok) {
                    // Parsea el cuerpo de la respuesta como JSON y devuelve una promesa
                    return responseServer.json();
                } else {
                    // Si la respuesta tiene un código de error
                    throw new Error('Error en la solicitud del login');
                }
            }).then((jsondata) => {
                // AL LLEGAR AQUI EL PROCESO HA SIDO REALIZADO CON EXITO                              
                // Llamamos a la funcion login, de AuthProvider para dar la autenticacion
                login(jsondata.security.username, jsondata.security.user_id, jsondata.security.token);
 
            }).catch((e) => {
                ErrorModalMessage("Error detected: " + e.Error)
                return;
            });
        }
        catch (error) {
            console.log(error);
        };
    };
 
    // Si estamos autenticados navegamos a la ruta de tenant
    if (isAuthenticated) {
 
 
 
        return <Navigate replace to="/tenant" />;
    }
 
    // Si no estamos autenticados, devolvemos el formulario de login y registro
    return (
        <div className="ewala-form-container">
            <div className="login-form">
                <form id="loginForm" name="loginForm" onSubmit={submitLoginForm}>
                    <div className="login-form-head">
                        <div className="img-login-form">
                            <img src={imgLogoEwala}></img>
                        </div>
                        <div className="title-login-form">
                            <h1>Orfeo</h1>
                            <h2 className="ewala-title-text">User Authentication</h2>
                        </div>
                    </div>
                    <div className="ewala-form-body">
 
                        <h5 className="ewala-label">Username</h5>
                        <input id="ewala-form-email" name="email" className="ewala-form-control"
                            onChange={(e) => setUsername(e.target.value)} value={username}></input>
 
                        <h5 className="ewala-label">Password</h5>
                        <input id="ewala-form-pass" name="pass" type="password" className="ewala-form-control"
                            onChange={(p) => setPassword(p.target.value)} value={password}></input>
                    </div>
                    <input type="submit" value="Submit" className="ewala-button-submit margin-top" />
                </form>
                <div className="ewala-form-footer">
                    <p id="registerText" className="ewala-license-text" onClick={() => {
                        document.querySelector('#registerForm').classList.remove("d-none")
                        document.querySelector('#registerText').classList.add("d-none")
                    }}>If you already had a license, fill it here to register!</p>
                    <div>
                        <form id="registerForm" className="ewala-license d-none" onSubmit={licenseForm} onChange={(r) => setRegister(r.target.value)}>
                            <input className="ewala-license-input"></input>
                            <input type="submit" className="ewala-button-register" value="Register" />
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}