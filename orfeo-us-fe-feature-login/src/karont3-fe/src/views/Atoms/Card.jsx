import React from "react";

export const Card = ({ imageBody, title = null, body = "", icon = "", header = null, footer, size, idComp, color }) => {
    return (
        <div className={`card  ${size ? size : "col-3"}`}>

            {imageBody ? <div>
                <img src={imageBody} className="card-img-top imgalt" alt="Image Title" />
            </div>
                : <></>}
            {header ? <div className="card-header" style={{ backgroundColor: color }}>{header}</div> : ""}
            <div className="card-body" id={idComp}>
                <h5 className="card-title align-items-center">
                    {title && <><span className="col title">{title}</span><br></br></>}
                    {icon && <i className={`col-auto icon ${icon}`}></i>}
                </h5>
                <div className="card-text">{body}</div>
            </div>
            {footer ? (
                <div className="footer">
                    {footer}
                </div>
            ) : ""}
        </div>
    );
};
