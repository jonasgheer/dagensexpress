import { useMutation } from "react-query";
import { ax } from "../App";
import { useRef } from "react";
import React from "react";
import { useNavigate } from "react-router-dom";

export function StatsChooseDate() {
    const inputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    const { mutate } = useMutation(
        () =>
            ax.post(
                `/admin/stats/${
                    inputRef?.current?.valueAsDate?.toISOString().split("T")[0]
                }`
            ),
        {
            onSuccess: (data) => {
                navigate("/stats/results", { state: data.data });
            },
        }
    );

    return (
        <div className={"stats-choose-date"}>
            <input ref={inputRef} type={"date"} />
            <button
                onClick={() => {
                    mutate();
                }}
                className={"btn"}
            >
                Ok
            </button>
        </div>
    );
}
