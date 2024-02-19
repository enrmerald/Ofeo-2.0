import { useState } from 'react';
import { useEffect } from 'react';
import MapComponent from './MapComponent';
import { Card } from './Card';
import DropdownButton from './DropdownButton';
import CardContainer from './Card_Container';
/* Función para obtener todos los datos de la ruta /graphs/map e insertarlos en el mapa  */

export const MapSet = () => {
    // Definición de las credenciales
    const creds = {
        'security': {
            'token': 132465 || localStorage.token
        }
    };
    const loadRoute = "http://localhost:5000/map/"
    /* ESTADOS */
    // Estado de los datos
    const [data, setData] = useState([])

    // Definir estado por defecto para el sector seleccionado
    const [selectedSector, setSelectedSector] = useState(0);

    // Definir estado 'Default' por defecto para la region 
    const [selectedRegion, setSelectedRegion] = useState(0)

    /* DROPDOWNS */
    // Definición de las opciones del DropdownButton "Sectors"
    const sectorsDropdownMap = [
        { text: "Agriculture and livestock", onClick: () => handleSectorClick(0) },
        { text: "Consumer states", onClick: () => handleSectorClick(1) },
        { text: "E-Commerce", onClick: () => handleSectorClick(2) },
        { text: "Shops and establishments", onClick: () => handleSectorClick(3) },
        { text: "Construction", onClick: () => handleSectorClick(4) },
        { text: "Sport and leisure", onClick: () => handleSectorClick(5) },
        { text: "Energy and environment", onClick: () => handleSectorClick(6) },
        { text: "Finance, insurance and real estate", onClick: () => handleSectorClick(7) },
        { text: "International", onClick: () => handleSectorClick(8) },
        { text: "Internet", onClick: () => handleSectorClick(9) },
        { text: "Logistics and transportation", onClick: () => handleSectorClick(10) },
        { text: "Media and marketing", onClick: () => handleSectorClick(11) },
        { text: "Metallurgy and electronics", onClick: () => handleSectorClick(12) },
        { text: "Chemicals and raw materials", onClick: () => handleSectorClick(13) },
        { text: "Health and pharmatheutical industry", onClick: () => handleSectorClick(14) },
        { text: "Tourism and hospitality", onClick: () => handleSectorClick(15) },
        { text: "Services", onClick: () => handleSectorClick(16) },
        { text: "Society", onClick: () => handleSectorClick(17) },
        { text: "Technology and Telecommunications", onClick: () => handleSectorClick(18) },

    ];

    // Definición de las opciones del DropdownButton "Regions"
    const regionsDropdownMap = [
        { text: "Default", onClick: () => handleRegionClick(0) },
        { text: "Global", onClick: () => handleRegionClick(1) },
        { text: "Europe", onClick: () => handleRegionClick(2) },
        { text: "Asia", onClick: () => handleRegionClick(3) },
        { text: "North America", onClick: () => handleRegionClick(4) },
        { text: "South America", onClick: () => handleRegionClick(5) },
        { text: "Oceania", onClick: () => handleRegionClick(6) },
    ];

    // Manejo click DropdownButton "Sectores"
    const handleSectorClick = (option) => {
        setSelectedSector(option);
        sendPostRequest();

    };

    // Manejo click DropdownButton "Regiones"
    const handleRegionClick = (option) => {
        // Lógica para manejar el clic en la opción de la Región
        setSelectedRegion(option);
        sendPostRequest();

    };

    // Funcion para obtener los datos y definirlos en el estado
    const getGraphs = (graphData) => {

        // Obtengo los datos de la ruta
        setData(graphData.data)
        const dataSet = graphData.data
        const options = []
        // Para cada dato (data_levels) dentro de los datos (pasados por GET) se crea un punto
        dataSet.forEach((item, index) => {
            item.data_levels.forEach((data_level) => {
                const marker = {
                    lat: data_level.lat,
                    lon: data_level.lon,
                    sectors: data_level.sectors || {}
                }
                options.push(marker)
            })
        });
        // Establecer valores iniciales basados en el primer elemento de data
        if (graphData.data.length > 0) {
            const initialSector = graphData.data[0].sector;
            const initialRegion = graphData.data[0].region;
            setSelectedSector(initialSector);
            setSelectedRegion(initialRegion);
        }

        return { options: [] }; // Puedes ajustar esto según tus necesidades
    };
    const sendPostRequest = () => {
        creds["dataOptions"] = { "sector": selectedSector, "region": selectedRegion }


        // Realiza la solicitud POST a /map con los datos actualizados
        RequestServer(loadRoute, "POST", creds, (loadedData) => {
            console.log(loadedData.data);
        });
    };
    useEffect(() => {
        // Obtener datos del servidor: route /graphs/map
        RequestServer(loadRoute, "GET", creds, getGraphs)

    }, [])

    return (<>
        {
            <CardContainer idComp="map" title="Mapa con Leaflet" size="col-12" body={
                <div className='map-section'>
                    <MapComponent data={data} regionSelected={selectedRegion} sectorSelected={selectedSector} sectors={sectorsDropdownMap} />
                </div>
            } footer={<div className='map-buttons d-flex m-2'>
                <DropdownButton text="Sectors" orientation="horizontal" id_dd="map-sectors" options={sectorsDropdownMap} />
                <DropdownButton text="Region" orientation="horizontal" id_dd="map-region" options={regionsDropdownMap} />

            </div>}>
            </CardContainer>
        }</>
    );
};
export default MapSet;