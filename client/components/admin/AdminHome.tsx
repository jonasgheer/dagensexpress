import * as React from "react";

export function AdminHome() {
    return (
        <main>
            <button
                onClick={() =>
                    fetch("/hub/today?questionState=showingQuestion", {
                        headers: {
                            Authorization:
                                localStorage.getItem("jwt") ?? "okey",
                        },
                    })
                }
            >
                Start today
            </button>
        </main>
    );
}
