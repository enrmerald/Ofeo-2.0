import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [loginRoute, setLoginRoute] = useState(null)
  const navigate = useNavigate();


  // Redirige al usuario a la página de prueba
  try {
    RequestServer("http://localhost:5000/login/", "GET", {
      'security': {
        'token': '123456'
      }
    }, (loadedData) => {
      console.log(loadedData, typeof (loadedData));
      setLoginRoute(loadedData)


    })
  }
  catch (error) {
    console.error("Error fetching data:", error);

  }

  if (loginRoute !== null) {
    return window.location.href = `${loginRoute}`
  }


}

export default Login;
