import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { QuizState } from "../../../common/types";
import { Answer } from "../../../src/entity/Question";
import { Alternative, AlternativeState } from "../Alternative";
import { ax } from "../App";
import { UserCard } from "../UserCard";

export function UserHome() {
    const queryClient = useQueryClient();
    const { isLoading, data } = useQuery<QuizState>("quizState", () =>
        ax.get("/hub").then((res) => res.data)
    );

    const { mutate } = useMutation(
        (alternative: number) => ax.get(`/hub/guess/${alternative}`),
        {
            onMutate: async (alternative: Answer) => {
                await queryClient.cancelQueries("quizState");
                const prevState = queryClient.getQueryData<QuizState>(
                    "quizState"
                );
                queryClient.setQueryData("quizState", {
                    ...prevState,
                    haveGuessed: alternative,
                });
            },
            onSettled: () => queryClient.invalidateQueries("quizState"),
        }
    );

    async function submitGuess(alternative: number) {
        await mutate(alternative as Answer);
    }

    if (isLoading) {
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
    return null;
}
