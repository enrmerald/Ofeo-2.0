import { Navigate } from 'react-router-dom';
import { UseUser } from '../auth/UserAuth';
import { Card } from './Atoms/Card';
import DonnutChart from './Atoms/DonnutChart.jsx';
import PieChart from './Atoms/PieChart.jsx';
import ScatterPlot from './Atoms/ScatterPlot.jsx';
import CardContainer from './Atoms/Card_Container.jsx';
import KPIChart from './Atoms/KPIChart.jsx';
import MapSet from './Atoms/MapSet';
/* Pantalla Principal (Dashboard) Karont3 */

/* Top-dashboard - bloque kpi y bloque graph
    - kpi: incluye cuatro cards con los kpi
    - graph: incluye 
        (izq). un card de descubrimientos y una gráfica de alerta por perfiles de usuario
        (dcha). gráfico de nivel de alerta
*/
/* Center-dashboard - bloque mapa y bloque scatterplot */
export function Overview() {

    // Obtenemos desde el contexto del componente de Authenticacion los datos que podemos necesitar:
    const { isAuthenticated, isTenantAuthenticated } = UseUser();
    console.log(isAuthenticated)
    // Si NO estamos autenticados nos vamos al login de usuario
    if (!isAuthenticated) {
        return <Navigate replace to="/login" />;
    }
    // SI no estamos autenticados con tenant, nos vamos al login de tenant
    if (!isTenantAuthenticated) {
        return <Navigate replace to="/tenants" />;
    }

    // Renderizamos el dashboard
    return (
        <>
            <div className="dashboard-container">
                {/* Apartado superior */}
                <div className="count-dashboard">
                    <CardContainer title="counters" size="col-12" body={<>
                        <div className="counter-container">
                            <KPIChart></KPIChart>
                        </div>
                    </>}>
                    </CardContainer>
                </div>
                <div className="top-dashboard">
                    <CardContainer title="kpis" subtitle='datos kpis' size="col-12" body={<>
                        {/* Apartado kpi-gráficas */}
                        <div className="kpi-graphs">

                            <Card idComp="profileGraph" body={
                                <DonnutChart id="DonnutChart" title="Alert Level" centerLabel="true" width="100%" height="250%" description="Alert level" />
                            }
                            />
                            <Card idComp="alertGraph" body={
                                <PieChart id="PieChart" title="User's Profile" subtext="User profile" more_info href="employees" width="100%" height="250%" />
                            } />

                        </div>
                    </>}></CardContainer>
                </div>
                {/* Apartado central */}
                <div className="center-dashboard">
                    <CardContainer title='ScatterPlot' size="col-12" body={
                        <>
                            <ScatterPlot width="100%" height="150%" label="discoveries on"></ScatterPlot>
                            {/*<GraphSet position="1" type="scatterplot" height="150%" width="100%"></GraphSet>*/}
                        </>}
                    />
                    <MapSet ></MapSet>
                </div>
            </div>
        </>
    )
}