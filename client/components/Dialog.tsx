import CloseRoundedIcon from "@material-ui/icons/CloseRounded";
import * as React from "react";

export function Dialog({
    isOpen,
    onClose,
    children,
    className,
}: {
    isOpen: boolean;
    onClose: () => void;
    children: JSX.Element | JSX.Element[];
    className?: string;
}) {
    return (
        <div
            className={`dialog ${className}`}
            style={{ display: isOpen ? "flex" : "none" }}
        >
            <div>
                <div className="dialog-header">
                    <button
                        autoFocus={true}
                        onClick={onClose}
                        className="close"
                    >
                        <CloseRoundedIcon />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}
