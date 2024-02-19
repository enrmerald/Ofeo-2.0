import { UseUser } from '../auth/UserAuth.jsx'
import { Navigate, useParams } from 'react-router-dom';
import Form from './Atoms/Form.jsx';
import { useState } from 'react';
/* Dashboard para añadir elementos - Formulario */

export function Dashboard_add({ type }) {
    const { element, subpage, id } = useParams()
    const creds = {
        'security': {
            'token': 123456 || localStorage.token
        }
    };
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

    return (
        <>
            <div className="formForm ">
                <Form element={element} type={type}></Form>
            </div></>
    )
}