import * as React from "react";
import { useState } from "react";
import { Dialog } from "./Dialog";

export type AlternativeState = "normal" | "selected" | "disabled";

export function Alternative({
    text,
    onSubmit,
    state = "normal",
    answer = false,
}: {
    text: string;
    onSubmit?: () => void;
    state?: AlternativeState;
    answer?: boolean;
}) {
    const [dialogIsOpen, setDialogIsOpen] = useState(false);

    return (
        <>
            <Dialog
                isOpen={dialogIsOpen}
                onClose={() => setDialogIsOpen(false)}
            >
                <h1>Er du sikker?</h1>
                <button onClick={onSubmit}>
                    Aldri vært så sikker i mitt liv!
                </button>
            </Dialog>
            <button
                className={`alternative ${state} ${
                    answer ? "answer-sneak-peek" : ""
                }`}
                disabled={state !== "normal"}
                onClick={(e) => {
                    state === "normal" && onSubmit && setDialogIsOpen(true);
                }}
            >
                {text}
            </button>
        </>
    );
}
