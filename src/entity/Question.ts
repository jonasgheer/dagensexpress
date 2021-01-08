import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

type Answer = 1 | 2 | 3 | 4;

@Entity()
export class Question {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    text: string;

    @Column("date")
    askDate: Date;

    @Column()
    active: boolean;

    @Column()
    answer: Answer;

    @Column("simple-json")
    alternatives: { 1: string; 2: string; 3: string; 4: string };
}
