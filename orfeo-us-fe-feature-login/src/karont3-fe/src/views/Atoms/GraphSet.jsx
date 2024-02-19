import { useState } from 'react';
import { useEffect } from 'react';
import ScatterPlot from './ScatterPlot';

/* Función para representar gráficas obteniendo datos desde ruta /graphs/scatter 
    Params:
    - idTenant: identificador del tenant logueado
    - token: token identificador del usuario logueado
    - type: tipo de gráfica (hasta ahora scatterplot)
    - title: título de la gráfica


*/
export const GraphSet = ({ idTenant = 1, token = "1234", type, title, width, height, startDate, endDate }) => {
    const creds = {
        'security': {
            'token': token || localStorage.token
        }
    };

    // Estado de los datos
    const [data, setData] = useState([]);
    // Function to get data and define it in state
    const getGraphs = (graphData) => {
        setData(graphData.data);
    };

    useEffect(() => {
        //  Obtener los datos del servidor
        RequestServer('http://localhost:5000/graphs/scatterplot', 'GET', creds, getGraphs);

    }, []);

    // DEvuelve la gráfica scatterplot
    return (
        <>
            {data.map((item, index) => {
                console.log('dataaa', data);
                return (
                    <>
                        {item.type === type ? (
                            <ScatterPlot
                                title={title}
                                data={item.data_levels}
                                width={width}
                                height={height}
                                label="discoveries on"
                                startDate="2023-01-01"
                                endDate="2023-10-01"
                            />
                        ) : (
                            ""
                        )}
                    </>
                );
            })}
        </>
    );
};

export default GraphSet;
