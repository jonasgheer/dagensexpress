import dayjs from "dayjs";
import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { Question } from "../../../src/entity/Question";
import { Subject } from "../../../src/entity/Subject";
import { ax } from "../App";
import { Dialog } from "../Dialog";
import { QuestionDialog } from "./QuestionDialog";

export function Dashboard() {
    const [subjectDialogOpen, setSubjectDialogOpen] = React.useState(false);
    const [questionDialogOpen, setQuestionDialogOpen] = React.useState(false);
    const [questionDialogMode, setQuestionDialogMode] = React.useState<
        "add" | "edit"
    >("add");
    const [selectedQuestion, setSelectedQuestion] = React.useState<
        Question | undefined
    >();
    const [questionAskDate, setQuestionAskDate] = React.useState("");

    const [subjectText, setSubjectText] = React.useState("");

    const queryClient = useQueryClient();

    const subjectMutation = useMutation(
        (subject: { subject: string }) => ax.post("/admin/subject", subject),
        {
            onSuccess: ({ data }) => {
                queryClient.setQueryData<{ subject: string }[]>(
                    "subjects",
                    (old) => [...(old ?? []), data]
                );
            },
        }
    );

    const { data: subjects, isLoading: loadingSubjects } = useQuery(
        "subjects",
        async () => {
            const { data } = await ax.get<Subject[]>("/admin/subject");
            return data;
        }
    );

    const { data, isLoading } = useQuery("questions", () =>
        ax.get<Question[]>("/admin/question").then((res) => res.data)
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
                    className="btn"
                    onClick={() => {
                        subjectMutation.mutate({ subject: subjectText });
                        setSubjectDialogOpen(false);
                        setSubjectText("");
                    }}
                >
                    Lagre
                </button>
            </Dialog>
            {questionDialogOpen && (
                <QuestionDialog
                    mode={questionDialogMode}
                    question={selectedQuestion}
                    subjects={subjects!}
                    questionAskDate={questionAskDate}
                    isOpen={questionDialogOpen}
                    onClose={() => setQuestionDialogOpen(false)}
                />
            )}
            <button className="btn" onClick={() => setSubjectDialogOpen(true)}>
                Legg til tema
            </button>
            <div className="questions-list">
                <p>Tid</p>
                <p>Spørsmål</p>
                <p>Tema</p>
                <p>Action</p>
                {questions.map((question) => {
                    const match = data?.find(
                        (q) => q.askDate === question.date.format("YYYY-MM-DD")
                    );
                    if (match) {
                        return (
                            <QuestionItem
                                key={match.id}
                                question={match}
                                onEdit={() => {
                                    setQuestionDialogMode("edit");
                                    setSelectedQuestion(match);
                                    setQuestionDialogOpen(true);
                                    setQuestionAskDate(
                                        question.date.format("YYYY-MM-DD")
                                    );
                                }}
                            />
                        );
                    } else {
                        return (
                            <NewQuestionItem
                                date={question.date}
                                key={question.date.toString()}
                                onAdd={() => {
                                    setQuestionDialogMode("add");
                                    setSelectedQuestion(undefined);
                                    setQuestionDialogOpen(true);
                                    setQuestionAskDate(
                                        question.date.format("YYYY-MM-DD")
                                    );
                                }}
                            />
                        );
                    }
                })}
            </div>
        </div>
    );
}

function NewQuestionItem({
    date,
    onAdd,
}: {
    date: dayjs.Dayjs;
    onAdd(): void;
}) {
    return (
        <>
            <p>{date.format("YYYY-MM-DD")}</p>
            <button className="questions-add btn" onClick={onAdd}>
                Add
            </button>
        </>
    );
}

function QuestionItem({
    question,
    onEdit,
}: {
    question: Question;
    onEdit(): void;
}) {
    return (
        <>
            <p>{question.askDate}</p>
            <p>{question.text}</p>
            <p>{question.subject.text}</p>
            <button
                className="questions-add btn"
                onClick={onEdit}
                disabled={question.state !== "inactive"}
            >
                Edit
            </button>
        </>
    );
}
