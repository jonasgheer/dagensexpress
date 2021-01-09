import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

type Answer = 1 | 2 | 3 | 4;

export type QuestionState =
    | "inactive"
    | "showingQuestion"
    | "showingGuesses"
    | "showingAnswer"
    | "finished";

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
    alternatives: { 1: string; 2: string; 3: string; 4: string };

    @Column({ default: "inactive" })
    state: QuestionState;
}
