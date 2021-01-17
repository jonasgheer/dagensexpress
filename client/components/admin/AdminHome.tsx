import * as React from "react";
import useFetch from "use-http";
import { AdminQuizState, nextQuestionState } from "../../../common/types";
import { Alternative } from "../Alternative";
import { UserCard } from "../UserCard";
import { Dashboard } from "./Dashboard";

export function AdminHome({ refresh, jwt }: { refresh: number; jwt: string }) {
    const [page, setPage] = React.useState<"home" | "dashboard">("home");
    const { get, error, loading, data } = useFetch<AdminQuizState>(
        "/hub/admin"
    );

    React.useEffect(() => {
        get();
    }, [refresh]);

    let mainContent: JSX.Element | null = null;

    if (loading) {
        return <div>loading</div>;
    }

    if (error) {
        return <p>noe gikk galt</p>;
    }

    if (page === "dashboard") {
        return <Dashboard onGoBack={() => setPage("home")} />;
    }

    if (data?.type === "nothingHere") {
        return (
            <div>
                <h1 className="italic">*trommevirvel*</h1>
            </div>
        );
    }

    if (data?.type === "inactive") {
        mainContent = (
            <div className="question">
                <h1>{data.text}</h1>
                <div className="alternatives">
                    {Object.entries(data.alternatives).map(([n, text]) => {
                        return (
                            <Alternative
                                key={n}
                                text={text}
                                answer={Number(n) === data.answer}
                            />
                        );
                    })}
                </div>
            </div>
        );
    }

    if (data?.type === "showingQuestion") {
        mainContent = (
            <div className="question">
                <h1>{data.text}</h1>
                <div className="alternatives">
                    {Object.entries(data.alternatives).map(([n, text]) => {
                        return (
                            <Alternative
                                key={n}
                                text={text}
                                answer={Number(n) === data.answer}
                            />
                        );
                    })}
                </div>
                <div>
                    {Object.entries(data.guesses).map(([username, nr]) => (
                        <div key={nr}>
                            {username} - {nr}
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (data?.type === "showingGuesses") {
        mainContent = (
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
                                            ? "answer-sneak-peek"
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

    if (data?.type === "showingAnswer") {
        mainContent = (
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

    return (
        <div>
            <button onClick={() => setPage("dashboard")}>Til dashboard</button>
            <button
                onClick={() => {
                    if (!data) return;
                    if (data.type === "nothingHere") {
                        return;
                    }
                    fetch(
                        `/hub/today?questionState=${
                            nextQuestionState[data.type]
                        }`,
                        {
                            headers: {
                                Authorization:
                                    localStorage.getItem("jwt") ?? "okey",
                            },
                        }
                    );
                }}
            >
                Gå videre
            </button>
            <p>{data?.type}</p>
            <main>{mainContent}</main>
        </div>
    );
}
