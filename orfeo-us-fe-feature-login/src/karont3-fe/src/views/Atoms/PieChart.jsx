import React, { useEffect, useRef, useState } from "react";
import * as echarts from "echarts";
import { UseUser } from "../../auth/UserAuth";
/* Gráfica tipo tarta
  parámetros:
  - data: Dict {value: num, data: str}
  - title: Graph title
  - subtext: Label description
  - width: Chart width
  - height: Chart height
  - description: Label description
  - legend_orient: Legend orientation ("horizontal"/"vertical") - default horizontal
  - legend_position: Legend position ("bottom"/"top") - default bottom
  - legend_type: Legend type (desplegable "scroll"/ plana "plain") - default plain
  - center_label: Central label (emphasis) del dato - default true
  - colors: Color list html - default blue-purple (defined in json)
  // - more_info: booleano para saber si se quiere mostrar o no el botón de más info
  // - href: enlace al que redirige el botón de más información
  */

const PieChart = ({
  id = "",
  _data,
  title,
  subtext,
  width,
  height,
  legend_type = "plain",
  legend_position = "bottom",
  colors = ["#7E1B54", "#67446C", "#536A84", "#00a7a3", "#3F909C", "#2BB6B4", "#21C9C0"],
  more_info,
  href,
}) => {
  const chartRef = useRef(null);

  const [data, setData] = useState([])
  const { tenantId } = UseUser()
  const creds = {
    'security': {
      'token': tenantId || localStorage.token_tenant
    }
  };
  // Estado del tamaño de ventana
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const desktopMode = windowWidth >= 768;
  useEffect(() => {
    // Change text style according theme
    const theme = localStorage.getItem("data-theme")
    let textColor = ''
    if (theme == 'light') {
      textColor = 'black'
    } else {
      textColor = 'white'
    }

    // if data is not obtained by parameter, get data from the server
    if (!_data && data.length == 0) {
      try {
        const loadRoute = "http://localhost:5000/graphs/piechart/";
        RequestServer(loadRoute, "GET", creds, (loadedData) => {
          setData(loadedData.data);
        })
      }
      catch (error) {
        console.log("Error loading data: ", error)
      }
    }

    // If data parameter, set data parameter
    if (_data && data.length == 0) {
      setData(_data)
    }
    if (chartRef.current) {
      const chart = echarts.init(chartRef.current);

      /* Graph settings */
      const option = {
        // Title
        title: {
          text: title,
          left: "center",
          textStyle: {
            // Title style
            fontSize: 20,
            fontFamily: "Space Mono",
            align: "center",
            color: textColor
          },
        },
        // Tooltip (mouse hover)
        tooltip: desktopMode ? {
          className: `{tooltip-${id}}`,
          trigger: "item",
          textStyle: {
            fontFamily: "Space Mono",
          },
          enterable: true,
          renderMode: "html", // Contents html code
          formatter: function (params) {
            let tooltipContent = `${params.seriesName}<br />${params.marker}  ${params.name}: ${params.value}`;
            // If parameter "more_info", show button
            if (more_info) {
              tooltipContent += `<br /><button class="tooltip-button" onclick="window.location.href='/${href}'">More info</button>`;
            }
            return tooltipContent;
          },
          transitionDuration: 2,
          hideDelay: 200,
        } : {},

        legend: desktopMode ? {
          // DESKTOP VERSION
          enterable: true,
          renderMode: "html",
          orient: "vertical",
          type: legend_type,
          x: "right",
          y: legend_position,
          padding: 0,
          bottom: 20,
          textStyle: {
            // legend text style
            fontSize: 12,
            fontFamily: "Space Mono",
            color: textColor,
            align: "center",

          },
          itemGap: 10,
          pageTextStyle: {
            // Scroll style
            fontFamily: "Space Mono",
          }
        } : {
          // MOBILE VERSION
          enterable: true,
          orient: "horizontal", // Orientación
          type: 'plain',
          padding: 0,
          x: "center",
          y: "bottom",
          itemGap: 5,
          bottom: 20,
          textStyle: {
            // legend text style
            fontSize: 11,
            fontFamily: "Space Mono",
            color: textColor

          },
          padding: 0,
          pageTextStyle: {
            // Scroll style
            fontFamily: "Space Mono",
          },
          // Format to show value in mobile version
          formatter: function (name) {
            const item = data.find((item) => item.name === name);
            if (item && item.value !== undefined) {
              return `${name}: ${item.value} `;

            } else {
              return `${name}`;
            }
          },
        },
        // Data format
        series: [
          {
            name: subtext,
            type: "pie",
            radius: "60%",
            data,
            // Labels (arrow)
            label: { show: false },
            labelLine: { show: false },
            color: colors,
            height: '90%',
            itemStyle: {
              borderRadius: 10,
              borderColor: "#fff",
              borderWidth: 1,

            },
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

    // Limpia el gráfico cuando el componente se desmonta
  }, [data, title, subtext]);

  return <div ref={chartRef} style={{ width: width, height: height }} />;
};

export default PieChart;
