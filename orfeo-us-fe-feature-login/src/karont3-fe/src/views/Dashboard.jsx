import { UseUser } from '../auth/UserAuth';
import { useState, useEffect } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import Table from './Atoms/Table';
export function Dashboard() {
    const { element, subpage } = useParams();

    const { isAuthenticated, isTenantAuthenticated } = UseUser();

    if (!isAuthenticated) {
        return <Navigate replace to="/login" />;
    }

    if (!isTenantAuthenticated) {
        return <Navigate replace to="/tenants" />;
    }

    const [data, setData] = useState([]);

    const { tenantId } = UseUser();
    const creds = {
        'security': {
            'token': 123456 || localStorage.token_tenant,
        },
    };
    let loadRoute;
    let displayElement;

    /* Si hay subpágina (alias, documents, numbers), el elemento es "entities"*/
    if (subpage) {
        loadRoute = `http://localhost:5000/entities/${subpage}/`;
        displayElement = "entities"
    } else {
        loadRoute = `http://localhost:5000/${element}/`;
        displayElement = element
    }

    useEffect(() => {
        // Realizar la solicitud solo cuando el componente se monta
        const response = RequestServer(loadRoute, "GET", creds, (loadedData) => {
            setData(loadedData.data);
        });
        if (response) {
            console.log(response)
        }
        else {
            console.log("error")
        }
    }, [displayElement, subpage]);

    return (
        <>
            <div className="dashboardList">
                <h1>{displayElement && displayElement.toUpperCase()} {subpage && subpage.toUpperCase()} LIST</h1>
                <div className="tableDiv">
                    {subpage ?
                        <Table route={loadRoute} credentials={creds} elementName={displayElement} subpage={subpage} actions add />
                        :
                        <Table route={loadRoute} credentials={creds} elementName={displayElement} actions add />

                    }
                </div>
            </div>
        </>
    );
}
