import { Alternatives, Answer, QuestionState } from "../src/entity/Question";

export interface Token {
    sub: number;
    adm: boolean;
    iat: number;
    exp: number;
    unm: string;
    col: string;
}

export type QuizState =
    | NothingHere
    | ShowingQuestion
    | ShowingGuesses
    | ShowingAnswer;

export type AdminQuizState =
    | NothingHere
    | AdminQuizInactive
    | AdminShowingQuestion
    | AdminShowingGuesses
    | ShowingAnswer
    | AdminShowingFinished;

export interface NothingHere {
    type: "nothingHere";
}

export interface ShowingQuestion {
    type: "showingQuestion";
    text: string;
    alternatives: Alternatives;
    haveGuessed: Answer | false;
}

export interface ShowingGuesses {
    type: "showingGuesses";
    text: string;
    alternatives: Alternatives;
    guesses: Guesses;
}

export interface ShowingAnswer {
    type: "showingAnswer";
    text: string;
    alternatives: Alternatives;
    guesses: Guesses;
    answer: Answer;
}

export interface AdminQuizInactive {
    type: "inactive";
}

export interface AdminShowingQuestion {
    type: "showingQuestion";
    text: string;
    answer: Answer;
    alternatives: Alternatives;
    guesses: Guesses;
}

export interface AdminShowingGuesses {
    type: "showingGuesses";
    text: string;
    answer: Answer;
    alternatives: Alternatives;
    guesses: Guesses;
}

export interface AdminShowingFinished {
    type: "finished";
}

export const nextQuestionState: Record<QuestionState, QuestionState> = {
    inactive: "showingQuestion",
    showingQuestion: "showingGuesses",
    showingGuesses: "showingAnswer",
    showingAnswer: "finished",
    finished: "finished",
};

export interface Guesses {
    [key: string]: Answer;
}
