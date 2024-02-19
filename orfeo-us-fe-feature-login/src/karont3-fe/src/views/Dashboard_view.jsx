import { useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { UseUser } from '../auth/UserAuth.jsx';
import CardContainer from './Atoms/Card_Container.jsx';
import NetworkGraph from './Atoms/NetworkGraph.jsx';
import Table from './Atoms/Table.jsx';

/* Dashboard view - Show selected element */

export function Dashboard_view() {
    const { element, id, subpage } = useParams();

    // Obtenemos desde el contexto del componente de Authenticacion los datos que podemos necesitar:
    const { isAuthenticated, isTenantAuthenticated } = UseUser();
    // Si NO estamos autenticados nos vamos al login de usuario
    if (!isAuthenticated) {
        return <Navigate replace to="/login" />;
    }
    // SI no estamos autenticados con tenant, nos vamos al login de tenant
    if (!isTenantAuthenticated) {
        return <Navigate replace to="/tenants" />;
    }
    const creds = {
        'security': {
            'token': 123456 || localStorage.token_tenant,
        },
    };
    /* States  */
    const [infoData, setInfoData] = useState([]);   // InfoCard data
    const [nodeData, setNodeData] = useState(element)
    const getNextElement = (element) => {
        /* Function to get next element type given actual element 
            params: actual element
            returns: next element name in lower case
        */
        const elementMap = {
            "channels": "organizations",
            "organizations": "persons",
            "persons": "entities",
            "entities": "discoveries",
            "discoveries": "leaks"
        };
        return elementMap[element.toLowerCase()];
    };

    /* Routes */
    let infoRoute;
    let plotRoute = `http://localhost:5000/networkmap/${element}/${id}`; // Get networkmap

    if (subpage) {
        infoRoute = `http://localhost:5000/entities/${subpage}/${id}`
    } else {
        infoRoute = `http://localhost:5000/${element}/${id}`
    }
    const nextElementRoute = `http://localhost:5000/${getNextElement(element)}/`; // Next element route

    useEffect(() => {
        // Get info data
        RequestServer(infoRoute, "GET", creds, (loadedData) => {
            setInfoData(loadedData.data);
        });

    }, []);

    const expandGraph = () => {
        /* Function for the buttons onClick method - modifiy style of infoCard and graphCard */
        // Select "infoCard" and "graphCard"
        const infoCard = document.getElementsByClassName("dataInfo-card")[0];
        const graphCard = document.getElementsByClassName("graphInfo-card")[0];

        // Verify is infoCard is visible - hide infoCard
        if (infoCard.style.display !== "none") {
            infoCard.style.display = "none"; // If graphCard is expanded, infoCard is hide
            infoCard.classList.remove("col-4");
            graphCard.style.width = "100%";
            graphCard.style.position = "flex";
            graphCard.classList.remove("col-8");
        } else {
            // Show initial cards
            infoCard.classList.add("col-4");
            infoCard.style.display = "flex";
            graphCard.style.width = "65%";
            graphCard.classList.add("col-8");
        }
    }

    return (
        <>
            <div className="view-container">
                <div className="info-container">
                    {/* DATA INFO CARD */}
                    <CardContainer className={`dataInfo-card`} idComp="dataInfo" header={<><h5>Info</h5></>} size="col-4" body={
                        <div className="info-data">
                            {Object.keys(infoData).map((key) => (

                                key !== 'id' && key !== 'content' ?
                                    <p key={key}>
                                        <strong>{key}:</strong> {infoData[key]}
                                    </p> : null
                            ))}
                        </div>
                    }></CardContainer>
                    {/* GRAPH INFO CARD */}
                    <CardContainer idComp="graphInfo" className={`graphInfo-card`} header={<><div className="graph-title " >
                        <h5>Networkmap</h5>
                    </div>
                        <button onClick={expandGraph}><i class="bi bi-arrows-angle-expand"></i></button>
                    </>} size="col-8" body={<>
                        {element !== 'users' ? <NetworkGraph idComp="network-map"
                            key={`networkmap1`}
                            credentials={creds}
                            route={plotRoute}
                            height="500px"
                            width="100%"
                        /> : <></>}

                    </>}></CardContainer>
                </div>
                {/* NEXT ELEMENT TABLE */}
                {element !== 'users' ? <div className="table-container">
                    <CardContainer title="Table" size="col-12" body={
                        <>
                            <Table route={nextElementRoute} credentials={creds} elementName={getNextElement(element)} add />
                        </>}>
                    </CardContainer>
                </div> : <></>}
            </div>
        </>
    )
}