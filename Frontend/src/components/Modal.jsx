import React from 'react';

const Modal = ({ id, title, children, footer, size = '' }) => {
    return (
        <div className="modal fade" id={id} tabIndex="-1" aria-hidden="true">
            <div className={`modal-dialog modal-dialog-centered ${size}`}>
                <div className="modal-content border-0 shadow-lg rounded-4">
                    <div className="modal-header border-0 pb-0 pt-4 px-4">
                        <h5 className="modal-title fw-bold">{title}</h5>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body p-4">
                        {children}
                    </div>
                    {footer && (
                        <div className="modal-footer border-0 pt-0 pb-4 px-4">
                            {footer}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Modal;
