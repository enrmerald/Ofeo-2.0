import { useState } from 'react';
import { useEffect } from 'react';
import KpiChart from './KPIChart'
import PieChart from './PieChart';
import DonnutChart from './DonnutChart';
import { Card } from './Card';
export const KpiSet = ({ idTenant = 1, token = "1234", position = "", type, idComp, checked=[] }) => {
    // Definición de las credenciales
    const creds = {
        'security': {
            'token': token || localStorage.token
        }
    };

    const [data, setData] = useState([])


    const usarKpis = (kpiData) => {
        setData(kpiData.data)
    }

    useEffect(() => {
        // Obtener datos del servidor: route
        // necesitamos cargar los datos del swervidor, cogiendo las credenciales que nos pasa la ruta sup -> dashboard
        RequestServer('http://localhost:5000/kpis', "GET", creds, usarKpis)

    }, [])


    return (<>
        {
            data.map((item, index) => {
                return (<>{
                    item.idPosition == position ?
                        <>
                            {item.value ?
                                <KpiChart type={item.type} type_name={item.type_name} key={index} idComp={item.name} value={parseInt(item.value)} title={item.name} checked={checked}></KpiChart> :
                                <>{
                                    item.type_name == 'pie' ?
                                        <>
                                            <Card idComp="alertGrapah" body={
                                                <PieChart id="PieChart" title="User's Profile" subtext="User profile" data={item.data_levels} more_info href="employees" width="100%" height="250%" />
                                            } />
                                        </>
                                        :
                                        <>
                                            <Card idComp="profileGraph" body={
                                                <DonnutChart id="DonnutChart" title="Alert Level" centerLabel="true" width="100%" height="250%" description="Alert level" data={item.data_levels} />
                                            }
                                            />
                                        </>
                                }</>}</>
                        : ""

                }</>)
            }
            )
        }
    </>
    )

}
