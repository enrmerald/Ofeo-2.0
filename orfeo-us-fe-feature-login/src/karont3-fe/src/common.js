/* Script for common functions on the app */

// Function to use the modal
function ShowModal(title = null, body = null, footer = null) {
    const modal = new bootstrap.Modal(document.getElementById('modal'), {
        keyboard: true, // Esto permite cerrar el modal al presionar la tecla Esc
        backdrop: 'static', // Esto impide que se cierre el modal al hacer clic fuera del mismo
        focus: true // Esto permite que el enfoque vuelva al botón que abrió el modal al cerrarlo
    });

    // Coloca el título, el cuerpo y el pie del modal si se proporcionan
    const modalTitle = document.querySelector('.modal-title');
    const modalBody = document.querySelector('.modal-body');
    const modalFooter = document.querySelector('.modal-footer');

    if (title) {
        modalTitle.textContent = title;
    }
    if (body) {
        modalBody.textContent = body;
    }
    if (footer) {
        modalFooter.textContent = footer;
    }

    // Muestra el modal
    modal.show();
}

function ErrorModalMessage(text) {
    ShowModal("Error detected", text, null)
}

function InfoModalMessage(text) {
    ShowModal("Information", text, null)
}

/* Method designed to send data to the server to get data */
async function RequestServer(route, method="POST", postData="", functionToUse) {
    // Prepare the header of the request
    const headers = {
        'Content-Type': 'application/json',
      };
      
      // If token exists it must be ib headers auth as bearer token
      if (postData && postData.security && postData.security.token) {
        headers['Authorization'] = `Bearer ${postData.security.token}`;
        console.log('entra')
      }
   
      // Create a dictionary with the method and the headers
      const requestOptions = {
        method: method,
        headers: headers,
      };
 
      // Check the request method
      if (method.toUpperCase() === "POST") {
        requestOptions.body = JSON.stringify(postData);
      }
 
      // Get the query result
    const result = await fetch(route, requestOptions)
    .then(responseServer => {
          if (responseServer.ok) {
            console.log('entra')
              // Parsea el cuerpo de la respuesta como JSON y devuelve una promesa
              return responseServer;
          } else {
            console.log('entra')
              // Si la respuesta tiene un código de error
              throw new Error('Request error');
          }
      })
      .then(jsondata=>{
          return jsondata.json()
      })
      .then(jsonConverted => {
        functionToUse(jsonConverted);
      })
      .catch(e=>{
          console.log(e)
          return;
      });
 
      return result;
}
 

function applyColors() {
    const lightColors_JSON = localStorage.getItem("userLightColors");
    const darkColors_JSON = localStorage.getItem("userDarkColors");
    const theme = localStorage.getItem("data-theme");

    if (!lightColors_JSON || !darkColors_JSON || !theme) {
        console.error('Missing localStorage data');
        return;
    }

    let userColors = '';

    if (theme === 'dark') {
        userColors = JSON.parse(darkColors_JSON);
    } else {
        userColors = JSON.parse(lightColors_JSON);
    }

    Object.keys(userColors).forEach((colorLabel) => {
        const colorValue = userColors[colorLabel];
        document.documentElement.style.setProperty(`--${colorLabel}`, colorValue);
    });
}