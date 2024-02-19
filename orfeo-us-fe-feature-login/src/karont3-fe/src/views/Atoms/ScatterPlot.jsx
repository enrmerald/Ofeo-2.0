import React, { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import DropdownButton from './DropdownButton';
import DatePicker from './DatePicker';

const ScatterPlot = ({ title = "", legend_position = "right", width = "100%", height = "100%", colors = ["#7E1B54", "#67446C", "#536A84", "#00a7a3", "#3F909C", "#2BB6B4", "#21C9C0"], label }) => {
  const creds = {
    'security': {
      'token': 123456 || localStorage.token
    }
  };

  // Estado de los datos
  const [data, setData] = useState({}); // Estado inicial de los datos
  const [desktopMode, setDesktopMode] = useState(true); // Estado modo desktop/mobile
  const [customDateRange, setCustomDateRange] = useState(false); // Estado de los datepicker ( calendario )
  const [selectedDateId, setSelectedDateId] = useState(0); // Indice del elemento seleccionado
  const [selectedDate, setSelectedDate] = useState([]);

  // Estado de las fechas personalizadas
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  const chartRef = useRef(null);

  // Ruta para las peticiones
  const loadRoute = "http://localhost:5000/graphs/scatterplot/";

  // Opciones dropdown fecha
  const dateDropdown = [
    { text: "Last 7 days", onClick: () => handleDateClick(0) },
    { text: "Today", onClick: () => handleDateClick(1) },
    { text: "Month", onClick: () => handleDateClick(2) },
    { text: "Year", onClick: () => handleDateClick(3) },
    { text: "Custom", onClick: () => handleDateClick(4) },
  ];

  // Manejo del cambio de opcion (dropdown)
  const handleDateClick = (option) => {
    setSelectedDateId(option);
    const today = new Date();
    setEndDate(today.toISOString())

    switch (option) {

      // Last 7 days (Last week)
      case 0:
        const lastWeek = new Date(today);
        lastWeek.setDate(today.getDate() - 7);
        setStartDate(lastWeek.toISOString())
        break;

      // Today
      case 1:
        setStartDate(today.toISOString())
        break;

      // Month
      case 2:
        const lastMonth = new Date(today);
        lastMonth.setMonth(today.getMonth() - 1);
        setStartDate(lastMonth.toISOString())
        break;

      // Year
      case 3:
        const lastYear = new Date(today);
        lastYear.setFullYear(today.getFullYear() - 1);
        setStartDate(lastYear.toISOString())
        break;

      // Custom
      case 4:
        // Mostrar los date pickers cuando se selecciona "Custom"
        setCustomDateRange(true);
        // Definir start y end en "today" para mostrar por defecto el dia de hoy en los date-picker
        setStartDate(today);
        setEndDate(today);
        break;

      default:
        break;
    };
    // Para las opciones que no son "Custom"
    if (option !== 4) {
      const credsCopy = { ...creds };
      credsCopy["dateRange"] = { "selected": option, "start": startDate.toISOString(), "end": endDate.toISOString() };

      RequestServer(loadRoute, "POST", credsCopy, (loadedData) => {
        console.log(loadedData.data);
      });
    }
  };

  // Manejo del submit del botón Custom (Done)
  const handleCustomSubmit = () => {

    setCustomDateRange(false);
    const credsCopy = { ...creds };
    credsCopy["dateRange"] = { "selected": selectedDateId, "start": startDate.toISOString(), "end": endDate.toISOString() };

    RequestServer(loadRoute, "POST", credsCopy, (loadedData) => {
      console.log(loadedData.data);
    });
  };

  useEffect(() => {
    // Lógica para cargar los datos iniciales
    RequestServer(loadRoute, "GET", creds, (loadedData) => {
      // Definición de los datos
      setData(loadedData.data[0].data);
      // DEfinición de la opción seleccionada
      const selectedDateId = loadedData.data[0].dateRange.selected || 1;
      setSelectedDateId(selectedDateId);
    });
  }, []);

  // Definición de la gráfica
  useEffect(() => {
    const theme = localStorage.getItem("data-theme")
    let textColor = ''
    if (theme == 'light') {
      textColor = 'black'
    } else {
      textColor = 'white'
    }
    // Lógica para el gráfico y redimensionamiento
    if (chartRef.current && data.length > 0) {
      const chart = echarts.init(chartRef.current);
      // Category values - Array
      const categories = [...new Set(data.map(item => item.category))];
      // Date values -- Array
      const dates = [...new Set(data.map(item => item.date))];
      // Definición inicial de colores
      const colorMap = {};

      // Para el caso de descubrimientos (low, medium, high, critical), definimos los colores por defecto
      categories.forEach((category, index) => {
        switch (category) {
          case 'critical':
            colorMap[category.toLowerCase()] = "#67446C";
            break;
          case 'high':
            colorMap[category.toLowerCase()] = "#7E1B54";
            break;
          case 'medium':
            colorMap[category.toLowerCase()] = "#536A84";
            break;
          case 'low':
            colorMap[category.toLowerCase()] = "#00a7a3";
            break;
          default:
            colorMap[category.toLowerCase()] = colors[index] || '#000';
            break;
        }
      });

      // Obtener los datos (series) según las categorias
      const series = categories.map(category => ({
        name: category,
        data: data.filter(item => item.category === category).map(item => [item.date, category, item.value]),
        type: 'scatter',
        symbolSize: val => desktopMode ? val[2] * 1.25 : val[2] / 2,
        color: colorMap[category.toLowerCase()] || '#000',
      }));

      // Chart option
      const option = {
        // Title
        title: {
          text: title,
          textStyle: {
            fontSize: 20,
            color: textColor
          }
        },
        legend: {
          show: desktopMode,
          data: categories,
          itemGap: 5,
          left: legend_position,
          textStyle: {
            color: textColor
          }
        },
        tooltip: desktopMode ? {
          show: true,
          position: 'top',
          formatter: params => {
            const value = params.value[2];
            return `${value} ${label} <span class="math-inline">${params.value[0]}</span> (${params.value[1]})`;
          },
        } : { show: false },
        grid: {
          left: 2,
          height: desktopMode ? '55%' : '80%',
          bottom: desktopMode ? 35 : 15,
          right: 10,
          containLabel: true,
        },
        xAxis: {
          type: 'time',
          data: dates,
          offset: desktopMode ? 12 : 0,
          boundaryGap: ['10%', '10%'],
          splitLine: {
            show: true,
          },
          axisLine: {
            show: false,
          },
          axisLabel: {
            show: true,
            formatter: desktopMode
              ? {
                year: '{yearStyle|{yyyy}}\n{monthStyle|{MMM}}',
                month: '{monthStyle|{MM}}',
              }
              : {
                year: '{yearStyle|{yy}}\n{monthStyle|{MM}}',
              },
            fontSize: '10px',
          },
        },
        yAxis: {
          type: 'category',
          data: categories,
          axisLine: {
            show: false,
          },
          axisLabel: {
            margin: desktopMode ? 10 : 10,
            verticalAlign: 'middle'
          },
          axisTick: { alignWithLabel: true }
        },
        // Data
        series: series,
        textStyle: {
          fontSize: 13,
          fontFamily: 'Space Mono',
          align: "center",
          color: textColor,
        },
        dataZoom: {
          show: true,
          realtime: true,
          bottom: 0,
          fillerColor: '#421c3350',
          borderColor: '#21c9c0',
          moveHandleSize: 0,
          handleSize: '50%',
          height: desktopMode ? '20px' : '15px'
        },
      };

      chart.setOption(option);

      const handleResize = () => {
        chart.resize()
      };

      handleResize(); // Llama a handleResize al principio para establecer el estado inicial correctamente
      window.addEventListener("resize", handleResize);
      return () => {
        chart.dispose();
      };

    }
  }, [data, colors, selectedDateId]);

  return (<>
    <div className="d-flex" ref={chartRef} style={{ width: width, height: height }} />
    <div className="date-picker d-flex col-10 m-2">
      <DropdownButton text={dateDropdown[selectedDateId].text}
        orientation="horizontal" id_dd="date-range" options={dateDropdown} className="mr-5" onSelect={(selectedOption) => handleDateClick(selectedOption)}
      />
      {/* CUSTOM */}
      {selectedDateId === 4 ?
        <div className="datePickers d-flex m-2" id="datePicker-group">
          <DatePicker
            id="start"
            label="Start"
            disabled={!customDateRange}
            selectedDate={startDate}
            onDateChange={(date) => setStartDate(date)}
          />

          <DatePicker
            id="end"
            label="End"
            disabled={!customDateRange}
            selectedDate={endDate}
            onDateChange={(date) => setEndDate(date)}
          />
          <button type="submit" onClick={handleCustomSubmit}>Done</button>
        </div> : <></>}

    </div>
  </>)
};

export default ScatterPlot;
