import CloseRoundedIcon from "@material-ui/icons/CloseRounded";
import * as React from "react";
import ReactDOM from "react-dom";
import { ModalContext } from "./App";

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
    const [modalDiv, setModalDiv] = React.useState<HTMLElement | null>();
    const modalState = React.useContext(ModalContext);

    React.useEffect(() => {
        setModalDiv(document.getElementById("modal"));

        if (isOpen) {
            modalState?.setIsOpen(true);
        } else {
            modalState?.setIsOpen(false);
        }
    }, [isOpen]);

    if (!modalDiv || !isOpen) {
        return null;
    }

    return ReactDOM.createPortal(
        <div className={`dialog ${className}`}>
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
        </div>,
        modalDiv
    );
}
