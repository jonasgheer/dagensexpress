import { Answer, Question } from "../../../src/entity/Question";
import { Dialog } from "../Dialog";
import * as React from "react";
import { Subject } from "../../../src/entity/Subject";
import { useMutation, useQueryClient } from "react-query";
import { ax } from "../App";
import { Radio, RadioGroup } from "@mantine/core";

type NewQuestion = Omit<Question, "state" | "id" | "subject"> & {
    subjectId: number;
};

export function QuestionDialog({
    questionAskDate,
    isOpen,
    question,
    onClose,
    subjects,
    mode,
}: {
    questionAskDate: string;
    isOpen: boolean;
    question?: Question;
    onClose(): void;
    subjects: Subject[];
    mode: "add" | "edit";
}) {
    const queryClient = useQueryClient();

    const [questionText, setQuestionText] = React.useState(
        question?.text ?? ""
    );
    const [questionAlternative1, setQuestionAlternative1] = React.useState(
        question?.alternatives["1"] ?? ""
    );
    const [questionAlternative2, setQuestionAlternative2] = React.useState(
        question?.alternatives["2"] ?? ""
    );
    const [questionAlternative3, setQuestionAlternative3] = React.useState(
        question?.alternatives["3"] ?? ""
    );
    const [questionAlternative4, setQuestionAlternative4] = React.useState(
        question?.alternatives["4"] ?? ""
    );
    const [questionAnswer, setQuestionAnswer] = React.useState<string>(
        question?.answer.toString() ?? "1"
    );
    const [questionSubject, setQuestionSubject] = React.useState<number>(
        question?.subject.id ?? subjects[subjects.length - 1].id
    );

    const { mutate: postQuestion } = useMutation(
        (question: NewQuestion) =>
            ax.post<Question>("/admin/question", question),
        {
            onSuccess: () => {
                queryClient.invalidateQueries("questions");
                queryClient.invalidateQueries("adminQuizState");
            },
        }
    );

    const { mutate: putQuestion } = useMutation(
        (data: { questionId: number; question: NewQuestion }) =>
            ax.put<Question>(
                `/admin/question/${data.questionId}`,
                data.question
            ),
        {
            onSuccess: () => {
                queryClient.invalidateQueries("questions");
                queryClient.invalidateQueries("adminQuizState");
            },
        }
    );

    function handleSubmit() {
        const q = {
            text: questionText,
            askDate: questionAskDate,
            answer: Number(questionAnswer) as Answer,
            alternatives: {
                1: questionAlternative1,
                2: questionAlternative2,
                3: questionAlternative3,
                4: questionAlternative4,
            },
            subjectId: questionSubject,
        };

        if (mode === "add") {
            postQuestion(q);
        } else {
            if (!question?.id) {
                return;
            }
            putQuestion({ questionId: question.id, question: q });
        }

        onClose();
    }

    return (
        <Dialog
            isOpen={isOpen}
            onClose={() => onClose()}
            className="add-question"
        >
            <h1>{mode === "add" ? "Legg til " : "Endre "} spørsmål</h1>
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
                        setQuestionSubject(parseInt(e.target.value));
                    }}
                >
                    {subjects?.map((subject) => (
                        <option key={subject.id} value={subject.id}>
                            {subject.text}
                        </option>
                    ))}
                </select>
            </label>
            <label>
                Alt1
                <input
                    type="text"
                    value={questionAlternative1}
                    onChange={(e) => setQuestionAlternative1(e.target.value)}
                />
            </label>
            <label>
                Alt2
                <input
                    type="text"
                    value={questionAlternative2}
                    onChange={(e) => setQuestionAlternative2(e.target.value)}
                />
            </label>
            <label>
                Alt3
                <input
                    type="text"
                    value={questionAlternative3}
                    onChange={(e) => setQuestionAlternative3(e.target.value)}
                />
            </label>
            <label>
                Alt4
                <input
                    type="text"
                    value={questionAlternative4}
                    onChange={(e) => setQuestionAlternative4(e.target.value)}
                />
            </label>
            <RadioGroup
                value={questionAnswer}
                onChange={setQuestionAnswer}
                label="Velg riktig svaralternativ"
            >
                <Radio value="1" label="Alt1" />
                <Radio value="2" label="Alt2" />
                <Radio value="3" label="Alt3" />
                <Radio value="4" label="Alt4" />
            </RadioGroup>
            <button className="btn" onClick={handleSubmit}>
                Lagre
            </button>
        </Dialog>
    );
}
