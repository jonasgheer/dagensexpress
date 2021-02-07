import axios from "axios";
import dayjs from "dayjs";
import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import useFetch from "use-http";
import { Answer, Question } from "../../../src/entity/Question";
import { Subject } from "../../../src/entity/Subject";
import { Dialog } from "../Dialog";
export function Dashboard({ onGoBack }: { onGoBack: () => void }) {
    const [subjectDialogOpen, setSubjectDialogOpen] = React.useState(false);
    const [questionDialogOpen, setQuestionDialogOpen] = React.useState(false);

    const [questionText, setQuestionText] = React.useState("");
    const [questionAlternative1, setQuestionAlternative1] = React.useState("");
    const [questionAlternative2, setQuestionAlternative2] = React.useState("");
    const [questionAlternative3, setQuestionAlternative3] = React.useState("");
    const [questionAlternative4, setQuestionAlternative4] = React.useState("");
    const [questionAnswer, setQuestionAnswer] = React.useState<number>(1);
    const [questionSubject, setQuestionSubject] = React.useState<number>();
    const [questionAskDate, setQuestionAskDate] = React.useState("");

    const [subjectText, setSubjectText] = React.useState("");

    const queryClient = useQueryClient();

    const { post: postSubject } = useFetch<{ subject: string }>(
        "/admin/subject"
    );
    // const { post: postQuestion } = useFetch("/admin/question");

    const { mutate: postQuestion } = useMutation(
        (question: Question) =>
            axios.post<Question>("/admin/question", question),
        {
            onSuccess: ({ data }) => {
                queryClient.setQueryData<Question[]>("questions", (old) => [
                    ...(old ?? []),
                    data,
                ]);
            },
        }
    );

    const { data: subjects, isLoading: loadingSubjects } = useQuery(
        "subjects",
        async () => {
            const { data } = await axios.get<Subject[]>("/admin/subject");
            if (data && data.length > 0) {
                setQuestionSubject(data[0].id);
            }
            return data;
        }
    );

    const { data, isLoading } = useQuery("questions", () =>
        axios.get<Question[]>("/admin/question").then((res) => res.data)
    );

    let questions = [];
    for (let i = 0; i < 30; i++) {
        questions.push({
            date: dayjs().add(i, "days"),
        });
    }

    questions = questions.filter(
        (question) =>
            !(
                dayjs(question.date).day() === 0 ||
                dayjs(question.date).day() === 6
            )
    );

    if (isLoading || loadingSubjects) {
        return <p>loading...</p>;
    }

    return (
        <div>
            <Dialog
                isOpen={subjectDialogOpen}
                onClose={() => setSubjectDialogOpen(false)}
                className="add-subject"
            >
                <h1>Legg til tema</h1>
                <input
                    type="text"
                    value={subjectText}
                    onChange={(e) => setSubjectText(e.target.value)}
                />
                <button
                    onClick={() => {
                        postSubject({ subject: subjectText });
                        setSubjectDialogOpen(false);
                    }}
                >
                    Send
                </button>
            </Dialog>
            <Dialog
                isOpen={questionDialogOpen}
                onClose={() => setQuestionDialogOpen(false)}
                className="add-question"
            >
                <h1>Legg til spørsmål</h1>
                <label>
                    Spørsmål
                    <textarea
                        value={questionText}
                        onChange={(e) => setQuestionText(e.target.value)}
                    />
                </label>
                <label>
                    Tema
                    <select
                        value={questionSubject}
                        onChange={(e) => {
                            console.log(e.target.value);
                            setQuestionSubject(parseInt(e.target.value));
                        }}
                    >
                        {subjects?.map((subject) => (
                            <option value={subject.id}>{subject.text}</option>
                        ))}
                    </select>
                </label>
                <label>
                    Alt1
                    <input
                        type="text"
                        value={questionAlternative1}
                        onChange={(e) =>
                            setQuestionAlternative1(e.target.value)
                        }
                    />
                </label>
                <label>
                    Alt2
                    <input
                        type="text"
                        value={questionAlternative2}
                        onChange={(e) =>
                            setQuestionAlternative2(e.target.value)
                        }
                    />
                </label>
                <label>
                    Alt3
                    <input
                        type="text"
                        value={questionAlternative3}
                        onChange={(e) =>
                            setQuestionAlternative3(e.target.value)
                        }
                    />
                </label>
                <label>
                    Alt4
                    <input
                        type="text"
                        value={questionAlternative4}
                        onChange={(e) =>
                            setQuestionAlternative4(e.target.value)
                        }
                    />
                </label>
                <label>
                    Svar (nr)
                    <input
                        type="number"
                        value={questionAnswer}
                        onChange={(e) =>
                            setQuestionAnswer(parseInt(e.target.value))
                        }
                    />
                </label>
                <button
                    onClick={() => {
                        postQuestion({
                            text: questionText,
                            askDate: questionAskDate,
                            answer: questionAnswer as Answer,
                            alternatives: {
                                1: questionAlternative1,
                                2: questionAlternative2,
                                3: questionAlternative3,
                                4: questionAlternative4,
                            },
                            // @ts-ignore
                            subjectId: questionSubject,
                        });
                        setQuestionDialogOpen(false);
                    }}
                >
                    Send
                </button>
            </Dialog>
            <button onClick={() => setSubjectDialogOpen(true)}>
                Legg til tema
            </button>
            <button onClick={onGoBack}>Tilbake</button>
            <div className="questions-list">
                <p>Tid</p>
                <p>Spørsmål</p>
                <p>Alternativer</p>
                <p>Svar</p>
                <p>Tema</p>
                {questions.map((question) => {
                    const match = data?.find(
                        (q) => q.askDate === question.date.format("YYYY-MM-DD")
                    );
                    if (match) {
                        return <QuestionItem question={match} />;
                    } else {
                        return (
                            <>
                                <p>{question.date.format("YYYY-MM-DD")}</p>
                                <button
                                    className="questions-add"
                                    onClick={() => {
                                        setQuestionDialogOpen(true);
                                        setQuestionAskDate(
                                            question.date.format("YYYY-MM-DD")
                                        );
                                    }}
                                >
                                    add
                                </button>
                            </>
                        );
                    }
                })}
            </div>
        </div>
    );
}

function QuestionItem({ question }: { question: Question }) {
    return (
        <>
            <p>{question.askDate}</p>
            <p>{question.text}</p>
            <p>{JSON.stringify(question.alternatives)}</p>
            <p>{question.answer}</p>
            <p>{question.subject.text}</p>
        </>
    );
}
