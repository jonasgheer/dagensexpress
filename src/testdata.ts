import * as dayjs from "dayjs";
import { Connection } from "typeorm";
import { Question } from "./entity/Question";
import { Subject } from "./entity/Subject";
import { User } from "./entity/User";

export async function fillDatabaseWithTestData(connection: Connection) {
    console.info("inserting test data...");
    const user2 = connection.manager.create(User, {
        username: "user2",
        password: "user2",
        color: "blue",
    });
    const user1 = connection.manager.create(User, {
        username: "user1",
        password: "user1",
        color: "red",
    });
    await connection.manager.save(user1);
    await connection.manager.save(user2);
    await connection.manager.save(
        connection.manager.create(User, {
            username: "admin",
            password: "admin",
            isAdmin: true,
            color: "green",
        })
    );
    const subject = connection.manager.create(Subject, {
        text: "Monty Python",
    });
    await connection.manager.save(subject);
    const question1 = connection.manager.create(Question, {
        text: "What is your favourite colour?",
        answer: 3,
        alternatives: { 1: "Green", 2: "Red", 3: "Blue", 4: "Orange" },
        askDate: dayjs().format("YYYY-MM-DD"),
        subject,
    });
    const question2 = connection.manager.create(Question, {
        text: "When did 'Monty Python and the Holy Grail' come out?",
        answer: 1,
        alternatives: { 1: "1975", 2: "1979", 3: "1980", 4: "1988" },
        askDate: dayjs().add(1, "day").format("YYYY-MM-DD"),
        subject,
    });
    await connection.manager.save(question1);
    await connection.manager.save(question2);
}
