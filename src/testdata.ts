import * as dayjs from "dayjs";
import { Connection } from "typeorm";
import { Question } from "./entity/Question";
import { User } from "./entity/User";

export async function fillDatabaseWithTestData(connection: Connection) {
    console.info("inserting test data...");
    const user2 = connection.manager.create(User, {
        username: "user2",
        password: "user2",
        color: "blue.500",
    });
    const user1 = connection.manager.create(User, {
        username: "user1",
        password: "user1",
        color: "red.500",
    });
    await connection.manager.save(user1);
    await connection.manager.save(user2);
    await connection.manager.save(
        connection.manager.create(User, {
            username: "admin",
            password: "admin",
            isAdmin: true,
            color: "green.500",
        })
    );
    const question = connection.manager.create(Question, {
        text: "What is your favourite colour?",
        answer: 3,
        alternatives: { 1: "Green", 2: "Red", 3: "Blue", 4: "Orange" },
        askDate: dayjs().format("DD-MM-YYYY"),
    });
    await connection.manager.save(question);
    // await connection.manager.save(
    //     connection.manager.create(Guess, {
    //         guess: 2,
    //         question,
    //         user,
    //     })
    // );
}
