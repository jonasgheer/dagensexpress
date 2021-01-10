import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

export type Answer = 1 | 2 | 3 | 4;

export type QuestionState =
    | "inactive"
    | "showingQuestion"
    | "showingGuesses"
    | "showingAnswer"
    | "finished";

export interface Alternatives {
    1: string;
    2: string;
    3: string;
    4: string;
}

@Entity()
export class Question {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    text: string;

    @Column()
    askDate: string;

    @Column()
    answer: Answer;

    @Column("simple-json")
    alternatives: Alternatives;

    @Column({ default: "inactive" })
    state: QuestionState;
}
