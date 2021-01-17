import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    Unique,
} from "typeorm";
import { Answer, Question } from "./Question";
import { User } from "./User";

@Entity()
@Unique(["user", "question"])
export class Guess {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Question, (question) => question.id)
    question: Question;

    @ManyToOne(() => User, (user) => user.id)
    user: User;

    @Column()
    guess: Answer;

    @CreateDateColumn()
    createdAt: Date;
}
