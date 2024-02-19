import React from "react";

const CustomModal = ({ title, onClose, onSave, children }) => {
  return (
    <div className="modal fade" id="exampleModal" tabIndex="-9999" aria-labelledby="exampleModalLabel" aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h1 className="modal-title fs-5" id="exampleModalLabel">{title}</h1>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            {children}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" onClick={onClose}>Close</button>
            <button type="button" className="btn btn-primary" onClick={onSave}>Save changes</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomModal;
