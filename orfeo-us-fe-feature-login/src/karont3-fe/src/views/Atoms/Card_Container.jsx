import React from 'react';
import Card from 'react-bootstrap/Card';

function CardContainer({ idComp = "", title, subtitle = "", body = "", color = "red", size = "", header, footer }) {
  // Determina si se proporciona el tamaño personalizado
  const customSize = size === 'col-12';

  // Define los estilos basados en el tamaño proporcionado
  const estilo = customSize
    ? { width: "100%", marginBottom: "20px", border: "1px solid #005c50" }
    : { marginBottom: "10px", border: "1px solid #005c50" };

  return (
    <Card className={`${idComp}-card ${size}`} style={estilo}>
      {header ? <Card.Header>{header}</Card.Header> : null}
      <Card.Body>
        <Card.Title className="Container-Card-Title" style={{ textAlign: "justify", fontFamily: 'SpaceMonoBold', textTransform: 'uppercase' }}>
          {title}
        </Card.Title>
        <Card.Subtitle className="Container-Card-Subtitle m-2 ">{subtitle}</Card.Subtitle>
        <Card.Text className={`${idComp}-text`}>
          {body}
        </Card.Text>
      </Card.Body>
      {footer ? <Card.Footer>{footer}</Card.Footer> : null}
    </Card>
  );
}

export default CardContainer;
