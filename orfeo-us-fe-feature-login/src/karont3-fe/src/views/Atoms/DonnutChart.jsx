import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import * as echarts from "echarts";
import { UseUser } from "../../auth/UserAuth";
/* Piechart graph
  params:
    - data: Dict {value: num, data: str}
    - title: Graph title
    - description: Label description
    - legend_orient: Legend orientation ("horizontal"/"vertical") - default horizontal
    - legend_position: Legend position ("bottom"/"top") - default bottom
    - legend_type: Legend type (desplegable "scroll"/ plana "plain") - default plain
    - center_label: Central label (emphasis) del dato - default true
    - colors: Color list html - default blue-purple (defined in json)
    - width: Chart width
    - height: Chart height
*/

const DonnutChart = ({ _data, url, title = "", description = "", legend_orient = "horizontal", legend_position = "bottom", legend_type = "plain",
  center_label = true, colors = ["#7E1B54", "#67446C", "#536A84", "#00a7a3", "#3F909C", "#2BB6B4", "#21C9C0"]
  , width, height, more_info, href }) => {
  const chartRef = useRef(null);
  // Convertir el valor de la etiqueta center_label (str) a boolean
  if (center_label == "false") {
    center_label = false;
  }
  // Estado del tamaño de ventana
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const desktopMode = windowWidth >= 768;

  const [data, setData] = useState([])
  const { tenantId } = UseUser()

  const creds = {
    'security': {
      'token': tenantId || localStorage.token_tenant
    }
  };
  useEffect(() => {

    // Change text style according theme
    const theme = localStorage.getItem("data-theme")
    let textColor = ''
    if (theme == 'light') {
      textColor = 'black'
    } else {
      textColor = 'white'
    }

    if (!_data && data.length == 0) {
      try {
        /* Obtengo los datos de la ruta */
        const loadRoute = "http://localhost:5000/graphs/donnutchart/";
        RequestServer(loadRoute, "GET", creds, (loadedData) => {
          setData(loadedData.data);
        })
      }
      catch (error) {
        console.log("Error al cargar los datos: ", error)
      }
    }

    // Si hemos recibido los datos por parametro los establecemos
    if (_data && data.length == 0) {
      setData(_data)
    }

    if (chartRef.current) {
      const chart = echarts.init(chartRef.current);

      // Configuración de la gráfica
      const option = {
        // Título
        title: {
          text: title,
          left: 'center',
          textStyle: {  // Estilo del título
            fontSize: 20,
            fontFamily: 'Space Mono', align: "center",
            color: textColor
          }
        },
        // Tooltip (mouse hover)
        tooltip: desktopMode ? {
          trigger: "item",
          //triggerOn: 'click' // 
          textStyle: {
            fontFamily: 'Space Mono',
          },
          formatter: function (params) {
            let tooltipContent = ` ${params.seriesName}<br /> ${params.marker} ${params.name}: ${params.value}`;
            if (more_info) {
              tooltipContent += `<br /><button class="tooltip-button" onclick="window.location.href='/${href}'">More info</button>`;
            }
            return tooltipContent;
          },
        } : {},
        // Leyenda
        legend: desktopMode ? {
          type: legend_type,
          orient: "vertical", // Orientación
          x: "right", // Posición en la parte derecha
          y: legend_position,
          padding: 0,
          bottom: 20,
          textStyle: { // Estilo leyenda
            fontSize: 12,
            fontFamily: 'Space Mono',
            align: "center",
            color: textColor
          },
          itemGap: 10,
          pageTextStyle: { // Estilo scroll
            fontFamily: 'Space Mono'
          },

        } : {
          // VERSION MOVIL
          enterable: true,
          type: 'plain',
          orient: "horizontal", // Orientación
          x: "center", // Posición en la parte derecha
          y: "bottom",
          padding: 0,
          bottom: 20,
          textStyle: { // Estilo leyenda
            fontSize: 11,
            fontFamily: 'Space Mono',
            align: "center",
            color: textColor

          },
          itemGap: 5,
          pageTextStyle: { // Estilo scroll
            fontFamily: 'Space Mono'
          },
          formatter: function (name) {
            const item = data.find((item) => item.name === name);
            if (item && item.value !== undefined) {
              return `${name}: ${item.value} `;

            } else {
              return `${name}`;
            }
          },
        },
        // Data definition
        series: [
          {
            name: description,
            type: "pie",
            radius: ["30%", "60%"],
            avoidLabelOverlap: false,
            color: colors,

            // Data style
            itemStyle: {
              borderRadius: 10,
              borderColor: "#fff",
              borderWidth: 1,

            },
            // Label (arrow) style
            label: {
              show: false,
              position: "center",
            },
            // Central label style
            emphasis: {
              label: {
                show: center_label,
                fontSize: "10%",
                fontWeight: "bold",
                color: textColor
              },
            },
            data: data,
            height: '90%'

          },
        ],
      };

      // Apply options
      chart.setOption(option);
      // Resize chart
      const handleResize = () => {
        chart.resize()
      };

      handleResize(); // Llama a handleResize al principio para establecer el estado inicial correctamente
      window.addEventListener("resize", handleResize);
      return () => {
        chart.dispose();
      };
    }
  }, [data]);

  return <div ref={chartRef} style={{ width: width, height: height }} />;
};

DonnutChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default DonnutChart;