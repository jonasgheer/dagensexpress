import * as React from "react";
import useFetch from "use-http";
import { QuizState } from "../../../common/types";
import { Alternative, AlternativeState } from "../Alternative";
import { UserCard } from "../UserCard";

export function UserHome({ refresh }: { refresh: number }) {
    const { get, loading, data } = useFetch<QuizState>("/hub", [refresh]);

    async function submitGuess(alternative: number) {
        await get(`/guess/${alternative}`);
    }

    if (loading) {
        return <div>loading...</div>;
    }

    if (data?.type === "nothingHere") {
        return (
            <div>
                <h1 className="italic">*trommevirvel*</h1>
            </div>
        );
    }

    if (data?.type === "showingQuestion") {
        return (
            <div className="question">
                <h1>{data.text}</h1>
                <div className="alternatives">
                    {Object.entries(data.alternatives).map(([n, text]) => {
                        let state: AlternativeState = "disabled";
                        if (Number(n) === data.haveGuessed) {
                            state = "selected";
                        } else if (!data.haveGuessed) {
                            state = "normal";
                        }
                        return (
                            <Alternative
                                key={n}
                                text={text}
                                state={state}
                                onSubmit={() => submitGuess(Number(n))}
                            />
                        );
                    })}
                </div>
            </div>
        );
    }

    if (data?.type === "showingGuesses") {
        return (
            <div className="question">
                <h1>{data.text}</h1>
                <div className="alternatives-flat">
                    {Object.entries(data.alternatives).map(([n, text]) => {
                        return (
                            <div key={n}>
                                {Object.entries(data.guesses)
                                    .filter(([_, nr]) => nr === Number(n))
                                    .map(([username, nr]) => (
                                        <UserCard
                                            key={nr}
                                            username={username}
                                        />
                                    ))}

                                <div className="alternative" key={n}>
                                    {text}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    if (data?.type === "showingAnswer") {
        return (
            <div className="question">
                <h1>{data.text}</h1>
                <div className="alternatives-flat">
                    {Object.entries(data.alternatives).map(([n, text]) => {
                        return (
                            <div key={n}>
                                {Object.entries(data.guesses)
                                    .filter(([_, nr]) => nr === Number(n))
                                    .map(([username, nr]) => (
                                        <UserCard
                                            key={nr}
                                            username={username}
                                        />
                                    ))}

                                <div
                                    className={`alternative ${
                                        Number(n) === data.answer
                                            ? "answer"
                                            : ""
                                    }`}
                                    key={n}
                                >
                                    {text}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }
    return <p>{data?.type}</p>;
}
