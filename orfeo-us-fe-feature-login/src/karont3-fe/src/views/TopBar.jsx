import React, { useState, useEffect } from 'react';
import Logo from './Atoms/Logo';
import Button from './Atoms/Button';
import { SearchBar } from './Atoms/SearchBar';
import EwalaImg from '../static/images/ewalaSombrero.png';
import DropdownButton from './Atoms/DropdownButton';
import { UseUser } from '../auth/UserAuth';
/* Componente barra de navegación superior 
  Parámetros:
  - companyName: nombre de la empresa. Se muestra al lado del logo
  - ico: logo de la emrpesa
  - nosearch: NO LO SE
  - nouser: comprueba que haya usuario. Si no lo hay, no muestra los botones.

*/
const Topbar = ({ token = '123456', companyName = "", ico = EwalaImg, nosearch = null, nouser = null }) => {
  const creds = {
    'security': {
      'token': token || localStorage.token_tenant
    }
  };
  const { logout } = UseUser();
  // Estado para obtener el ancho de la ventana
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [logo, setLogo] = useState('')
  // Botón desplegable de la barra lateral (SideBar)
  const ToggleButton = ({ onClick }) => {
    return (
      <button className="topBarIco toggle-sidebar-button" onClick={onClick}>
        <i className="bi bi-list"></i>
      </button>
    );
  };

  useEffect(() => {
    // Llamada al servidor para obtener el logo

    RequestServer(`http://localhost:5000/settings/${token}/`, "GET", creds, (loadedData) => {
      setLogo(loadedData.display.logo)
    })
    // Manejador del ancho de la ventana (modo desktop/mobile)
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const showSearchBar = windowWidth >= 768;
  console.log('logo', logo)
  return (
    <div className="topbar">
      <div className="topbarDiv">
        {nouser ? "" : <ToggleButton />}
        <a href="/" ><Logo ico={logo} /></a>
        <h3 className='m-3'>{companyName}</h3>
      </div>

      {/* Condición  para mostrar la barra lateral cuando está en modo desktop*/}
      {/* {showSearchBar && !nosearch ? (
        <SearchBar transparent />
      ) : (
        <></>
      )} */}

      <div className="topbarDiv">
        {/* Si no hay usuario logueado, solo se meustra el botón de ayuda */}
        {nouser ? (
          <>
            <Button text="Ayuda" topbarButton helpButton onClick={() => { alert("Pressed help button") }} />
          </>
        ) : (
          <>
            {/* Si el usuario está loguedao, se muestran botonones de búsqueda*, configuración, alerta, ayuda y usuario */}
            {/* Cuando está en modo mobile (no muestra la barra de búsqueda), sino que muestra el botón */}
            {/* {!showSearchBar ? <Button search searchButton onClick={() => { alert("Search what you want") }}></Button> : <></>} */}
            {/* <Button text='Download report' pdfButton url="settings"></Button> */}
            <Button config configButton url="settings"></Button>
            <Button text="Alerta" topbarButton alertButton onClick={() => { alert("Pressed alert button") }} />
            <Button text="Ayuda" topbarButton helpButton onClick={() => { alert("Pressed help button") }} />
            <DropdownButton user options={[{ id: "topbar1", text: "Logout User", onClick: logout }]} />
          </>
        )}
      </div>
    </div>
  );
};

export default Topbar;
