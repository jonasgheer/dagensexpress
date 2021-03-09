import * as React from "react";
import { useQuery, useQueryClient } from "react-query";
import { AdminQuizState, nextQuestionState } from "../../../common/types";
import { Alternative } from "../Alternative";
import { ax } from "../App";
import { UserCard } from "../UserCard";
import { Dashboard } from "./Dashboard";

export function AdminHome() {
    const [page, setPage] = React.useState<"home" | "dashboard">("home");
    const { error, isLoading, data } = useQuery<AdminQuizState>(
        "adminQuizState",
        () => ax.get("/hub/admin").then((res) => res.data)
    );
    const queryClient = useQueryClient();

    const { data: onlineUsers } = useQuery(
        "onlineUsers",
        () => ax.get("/admin/online-users").then((res) => res.data),
        { refetchInterval: 5000 }
    );

    let mainContent: JSX.Element | null = null;

    if (isLoading) {
        return <div>loading</div>;
    }

    if (error) {
        return <p>noe gikk galt</p>;
    }

    if (page === "dashboard") {
        return <Dashboard onGoBack={() => setPage("home")} />;
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
                    ).then(() =>
                        queryClient.invalidateQueries("adminQuizState")
                    );
                }}
            >
                Gå videre
            </button>
            <p>{data?.type}</p>
            <main>{mainContent}</main>
            {onlineUsers &&
                onlineUsers.map(
                    (user: { userId: number; userName: string }) => (
                        <p key={user.userId}>{user.userName}</p>
                    )
                )}
        </div>
    );
}
