import React from "react";
import { useLocation } from "react-router-dom";

interface StatsState {
    numQuestions: number;
    since: string;
    stats: Array<{
        numCorrect: number;
        numGuesses: number;
        ratio: number;
        username: string;
    }>;
}

export function Stats() {
    const location = useLocation();
    const state = location.state as StatsState;

    return (
        <>
            <h1>
                {state.numQuestions} spørsmål har blitt stilt siden{" "}
                {state.since}
            </h1>
            <div className={"users"}>
                <div>Spiller</div>
                <div>Gjettninger</div>
                <div>Antall korrekt</div>
                <div>Ratio korrekt</div>
                {state.stats.map((s) => (
                    <div className={"user-row"} key={s.username}>
                        <div>{s.username}</div>
                        <div>{s.numGuesses}</div>
                        <div>{s.numCorrect}</div>
                        <div>{s.ratio}</div>
                    </div>
                ))}
            </div>
        </>
    );
}
