import * as React from "react";
import { useQuery, useQueryClient } from "react-query";
import { AdminQuizState, nextQuestionState } from "../../../common/types";
import { Alternative } from "../Alternative";
import { ax } from "../App";
import { UserCard } from "../UserCard";
import { Grid, Stepper } from "@mantine/core";

function stepperValue(questionState?: AdminQuizState["type"]) {
    if (!questionState || questionState === "nothingHere") return 0;

    const questionStateMap = {
        inactive: 1,
        showingQuestion: 2,
        showingGuesses: 3,
        showingAnswer: 4,
        finished: 5,
    };

    return questionStateMap[questionState];
}

export function AdminHome() {
    const [hideAnswer, setHideAnswer] = React.useState(true);
    const { error, isLoading, data } = useQuery("adminQuizState", () =>
        ax.get<AdminQuizState>("/hub/admin").then((res) => res.data)
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
                                answer={
                                    !hideAnswer && Number(n) === data.answer
                                }
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
                                answer={
                                    !hideAnswer && Number(n) === data.answer
                                }
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
                                        !hideAnswer && Number(n) === data.answer
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
                                        Number(n) === data.answer && !hideAnswer
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

    if (data?.type === "nothingHere") {
        mainContent = (
            <div>
                <p>Fant ingen spørsmål for i dag</p>
            </div>
        );
    }

    if (data?.type === "finished") {
        mainContent = (
            <div>
                <p>Dagensspørsmål er over for i dag</p>
            </div>
        );
    }

    return (
        <div className="adminhome-main">
            <Grid>
                <Grid.Col span={4}>
                    <button
                        className={"progress btn"}
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
                                            localStorage.getItem("jwt") ??
                                            "okey",
                                    },
                                }
                            ).then(() =>
                                queryClient.invalidateQueries("adminQuizState")
                            );
                        }}
                        disabled={
                            data?.type === "nothingHere" ||
                            data?.type === "finished"
                        }
                    >
                        Gå videre
                    </button>
                    <Stepper
                        active={stepperValue(data?.type)}
                        orientation={"vertical"}
                    >
                        <Stepper.Step label={"Inaktiv"} />
                        <Stepper.Step label={"Viser spørsmål"} />
                        <Stepper.Step label={"Viser gjetninger"} />
                        <Stepper.Step label={"Viser svaret"} />
                        <Stepper.Step label={"Ferdig"} />
                    </Stepper>
                </Grid.Col>
                <Grid.Col className="adminhome-main-center" span={4}>
                    <main>{mainContent}</main>
                </Grid.Col>
                <Grid.Col span={4} className={"adminhome-main-right"}>
                    <label className="hide-toggle">
                        Skjul svar
                        <input
                            type="checkbox"
                            checked={hideAnswer}
                            onChange={() => setHideAnswer((p) => !p)}
                        />
                    </label>
                    {onlineUsers && (
                        <div className="online-users">
                            {onlineUsers.map(
                                (user: {
                                    userId: number;
                                    userName: string;
                                }) => (
                                    <p key={user.userId}>{user.userName}</p>
                                )
                            )}
                        </div>
                    )}
                </Grid.Col>
            </Grid>
        </div>
    );
}
