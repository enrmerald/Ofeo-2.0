import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
/* Gráfica de dispersión
   parámetros:
   - data: datos a representar
   - title: título de la gráfica, por defecto vacío
   - legend: leyenda de los datos a utilizar (formato lista) -> a partir de la leyenda,
       se filtran los datos y se crea una serie para cada dato de la leyenda
   - start: fecha de inicio (fecha más antigua)
   - end: fecha de fin (fecha más actual)
   - width: ancho de la gráfica
   - height: alto de la gráfica 
   - colors: listado de colores. Por defecto tiene valores asignados (el primer valor 
        es el más intenso(más crítico), y el último es el menos intenso (menos crítico))
   */

const BubblePlot = ({ data, title = "", legend = [], start, end, width, height, colors = ['#893448', '#d95850', '#eb8146', '#ffb248','#f2d643', '#ebdba4' ] }) => {
  const chartRef = useRef(null);
  useEffect(() => {
    if (chartRef.current) {
      const chart = echarts.init(chartRef.current);

      // Función para agrupar los datos
      const groupedData = data.reduce((acc, entry) => {
        const key = entry.date + entry.risk;
        const fechaString = entry.date; // Obtiene la fecha directamente (type String)
        const fechaObjeto = new Date(fechaString); // Convierte la fecha a Date
        const fechaTimestamp = fechaObjeto.getTime(); // Convertir la fecha a timestamp
        acc[key] = acc[key] || { name: entry.risk, value: [fechaTimestamp, 0] };
        acc[key].value[1] += entry.discoveries;
        return acc;
      }, {});

      const seriesData = Object.values(groupedData);

      // Asignar color a cada elemento de la leyenda
      const colorMap = {};
      // Para cada elemento de la leyenda, asigna un color(por índice)
      legend.forEach((legendItem, index) => {
        colorMap[legendItem.toLowerCase()] = colors[index] || '#000'
      })

      //Para cada valor dentro de la leyenda, crear la serie
      const series = legend.map((legendItem) => ({
        // El nombre del elemento de la leyenda
        name: legendItem,
        // Los datos de la serie son los datos filtrados por el nombre del elemento leyenda
        data: seriesData.filter((entry) => entry.name.toLowerCase() === legendItem.toLowerCase()),
        // Tipo siempre scatter
        type: 'scatter',
        // Color asignado al valor de la leyenda
        color: colorMap[legendItem.toLowerCase()] || '#000',
        symbolSize: val => val[1] * 2
      }))
      const option = {
        // Título
        title: {
          text: title,
          left: '5%',
          top: '3%',
        },
        tooltip: {
          position: 'top',
          formatter: params =>
            `${params.value[2]} discoveries on ${params.value[0]} (${params.value[1]})`,
        },
        // Legenda
        legend: {
          data: legend,
          top: '3%',
          right: '5%',
        },

        // Eje X - muestra tiempo
        xAxis: {
          type: 'time',
          splitLine: {
            show: false,
          },
        },

        // Eje Y - muestra los valores
        yAxis: {
          type: 'value',
        },

        // Por tantos datos como hayan definidos en la leyenda (legend), se crea una serie de datos
        series: series,

        // Control del eje X (tiempo), de tipo slid
        dataZoom: [{
          id: 'dataZoomX',
          type: 'slider',
          xAxisIndex: 0,
          filterMode: 'filter',
        }],
      };

      chart.setOption(option);

      return () => {
        chart.dispose();
      };
    }
  }, [data, start, end]);
  return <div ref={chartRef} style={{ width: width, height: height }} />;
};

export default BubblePlot;
