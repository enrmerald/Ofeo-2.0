import React, { useRef, useEffect, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";

/* Funciones para el funcionamiento del mapa */
/*******************************************************************/

/* Definir los datos filtrados por Sector*/

const filterDataSector = (data, sectorSelected) => {
  return data.flatMap((entry) => {
    const { country_id, lat, lon, data_levels } = entry;
    // Mapear sobre los data_levels en lugar de data
    return data_levels.map((data_level) => {
      const { lat, lon, sectors } = data_level;
      return {
        country_id,
        lat,
        lon,
        dataSector: sectors && sectors[sectorSelected] !== undefined ? sectors[sectorSelected] : 0,
      };
    });
  });
};

/* Función para obtener las coordenadas y zoom de cada región */
// Al clicar en cada opción del Dropdown Regions, se cambia la región seleccionada, modificando las coordenadas y el zoom
function getRegionCoordinate(regionSelected) {
  switch (regionSelected) {
    case 1:
      return { lat: 0, lng: 0, zoom: 1.75 };
    case 2:
      return { lat: 7.1881, lng: 21.0938, zoom: 4 };
    case 3:
      return { lat: 45.1305, lng: -100.0000, zoom: 4 };
    case 4:
      return { lat: -14.2350, lng: -54.6157, zoom: 4 };
    case 5:
      return { lat: 54.5260, lng: 15.2551, zoom: 4 };
    case 6:
      return { lat: -25.2744, lng: 133.7751, zoom: 4 };
    case 7:
      return { lat: 34.0522, lng: 112.4611, zoom: 4 };
    case 0:
    /* Por defecto España */
    default:
      return { lat: 40.4637, lng: -3.7492, zoom: 6 };
  }

}
/*******************************************************************/

/* Definición del componente de Mapa
    Parámetros:
      - data : los propios datos
      - sectorSelected: valor del dropdownButton (Sectors) seleccionado
      - regionSelected : valor del dropdownButton (Regions) seleccionado
*/

export default function MapComponent({ data, sectorSelected, regionSelected }) {
  const mapContainer = useRef(null);
  const map = useRef(null);

  // Estado para el zoom 
  const [zoom, setZoom] = useState(1.75)

  // Definición de las capas Overlay vacías
  const bubbleLayer = useRef(L.layerGroup());
  const heatLayer = useRef(L.layerGroup());

  // Estado para almacenar los colores de los sectores
  const [sectorColors, setSectorColors] = useState({});

  /* Funciones para la definición de colores por sector */
  // Obtener lista con todos los tipos de sectores a partir de los datos (data)
  const getSectors = (data) => {
    const allSectors = data.flatMap((entry) =>
      entry.data_levels.flatMap((data_level) => Object.keys(data_level.sectors))
    );
    return Array.from(new Set(allSectors));
  };

  // Definir colores por defecto y asignarlos a cada valor único de los sectores
  const assignColors = (sectors) => {
    const colors =["#7E1B54", "#67446C", "#536A84", "#00a7a3", "#3F909C", "#2BB6B4", "#21C9C0"];
    const sectorColorMap = {};
    sectors.forEach((sector, index) => {
      sectorColorMap[sector] = colors[index % colors.length];
    });
    setSectorColors(sectorColorMap);  // Actualizar el estado de SectorColors
  };


  
  useEffect(() => {
    // Obtener lista de valores únicos de los sectores y asignar colores
    const allSectors = getSectors(data);
    assignColors(allSectors);

    // Obtener coordenadas y zoom para cada región
    const regionCoordinates = getRegionCoordinate(regionSelected);

    // Si hay mapa, definir su zoom y coordenadas (según la región)
    if (!map.current) {
      map.current = L.map(mapContainer.current, {
        zoomControl: true,
        minZoom: 1.75
      }).setView([regionCoordinates.lat, regionCoordinates.lng], regionCoordinates.zoom);

      /* Definición grupo de capas Base */
      const baseLayers = L.layerGroup();
      // Capa base clara
      const basicLayer = L.tileLayer(
        "https://api.maptiler.com/maps/basic-v2/{z}/{x}/{y}.png?key=5p1qVEXj7BtAcAXl3RLr",
        {
          attribution: '&copy; <a href="https://www.maptiler.com/">MapTiler</a> contributors',
        }
      );
      baseLayers.addLayer(basicLayer);

      // Capa base oscura (por defecto)
      const darkLayer = L.tileLayer(
        "https://api.maptiler.com/maps/basic-v2-dark/{z}/{x}/{y}.png?key=5p1qVEXj7BtAcAXl3RLr",
        {
          attribution: '&copy; <a href="https://www.maptiler.com/">MapTiler</a> contributors',
        }
      );
      darkLayer.addTo(map.current); // Añadida a la vista


      // Capa 'Mapa de calor' por defecto 
      heatLayer.current = L.layerGroup().addTo(map.current);


      /* Controlador de capas */
      // Control de capas base 
      const baseControl = {
        "Basic Style": basicLayer,
        "Dark Style": darkLayer,
      };
      // Definción del grupo de capas Overlay
      const overlayControl = {
        "Bubble": bubbleLayer.current,
        "Heat": heatLayer.current,
      };
      // Control de capas: capas base, capas overlay (control colapsado)
      L.control.layers(baseControl, overlayControl, { collapsed: true }).addTo(
        map.current
      );

      map.current.on("zoomend", () => {
        setZoom(map.current.getZoom());
      });
    }

    // Limpiar las capas overlay
    bubbleLayer.current.clearLayers();
    heatLayer.current.clearLayers();

    // Si hay datos:
    if (data && data.length > 0) {
      // Filtrar datos por el sector seleccionado
      const filteredData = filterDataSector(data, sectorSelected);
      // Para cada elemento de los datos
      filteredData.forEach((item) => {
        // Definir el item
        const { lat, lon, dataSector } = item;
        // Creación puntos  (número de descubrimientos)
        const marker = L.marker([lat, lon], {
          icon: L.divIcon({
            className: "data-marker",
            iconSize: [3, 9],
            iconAnchor: [2, 9],
            html: `<p class="map-marker-label">${dataSector}<p>`,
          }),
        });

        // Marcadores para ambas capas overlay
        heatLayer.current.addLayer(marker);

        // Definición del círculo (para cada elemento de los datos) 
        // Muestra el círculo y el texto
        const circle = L.circle([lat, lon], {

          radius: dataSector * 25000,
          color: sectorColors[sectorSelected],
          fillColor: sectorColors[sectorSelected],
          fillOpacity: 0.5,
        }, {
          icon: L.divIcon({
            className: "data-marker",
            iconSize: [3, 9],
            iconAnchor: [2, 9],
            html: `<p class="map-marker-label">${dataSector}<p>`,
          })
        });
        bubbleLayer.current.addLayer(circle);
        bubbleLayer.current.addLayer(marker);


        // Definición punto de calor para cada uno de los elementos de los datos
        const heatData = [[lat, lon, dataSector]];
        heatLayer.current.addLayer(
          L.heatLayer(heatData, {
            radius: dataSector  ,
            scaleRadius: true,
            blur: 10,
            minOpacity: 0.9,
            gradient: {
              0: "white",
              0.2: "cyan",
              0.4: "lime",
              0.6: "yellow",
              0.8: "orange",
              1.0: "red",
            },
          })
        );
      });

      // Añadir el código para cambiar la vista del mapa según la región seleccionada
      const regionCoordinate = getRegionCoordinate(regionSelected);
      map.current.setView([regionCoordinate.lat, regionCoordinate.lng], regionCoordinate.zoom);
    }
  }, [regionSelected, data, getRegionCoordinate.lat, getRegionCoordinate.lng, getRegionCoordinate.zoom, sectorSelected]);
  return (
    <div className="map-wrap">
      <div ref={mapContainer} className="map" />
    </div>
  );
}