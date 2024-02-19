import { UseUser } from "../auth/UserAuth";
export const Devices = () => {

     
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
        <div className="container">
            <h1>Devices</h1>
        </div>
      );
    };
