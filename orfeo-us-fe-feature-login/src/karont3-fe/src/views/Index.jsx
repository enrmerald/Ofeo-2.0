import React, { useState } from "react";
import { redirect, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Navigate } from "react-router-dom";

const Index = () => {
  const [loginRoute, setLoginRoute] = useState("");
  const navigate = useNavigate();

  const redirectToLogin = () => {
    navigate("/login/");
  };

  return (
    <>
      <div className="imgIndex">
        <img src="/src/static/images/ewala_orfeo.png" alt="" />
      </div>
      <div className="btnIndex">
        {/* Llama a redirectToLogin cuando se hace clic en el botón */}
        <button onClick={redirectToLogin}>Login</button>
      </div>
    </>
  );
};

export default Index;
