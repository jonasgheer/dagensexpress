import * as dayjs from "dayjs";
import { Connection } from "typeorm";
import { Question } from "./entity/Question";
import { User } from "./entity/User";

export async function fillDatabaseWithTestData(connection: Connection) {
    console.info("inserting test data...");
    await connection.manager.save(
        connection.manager.create(User, {
            username: "user",
            password: "user",
        })
    );
    await connection.manager.save(
        connection.manager.create(User, {
            username: "admin",
            password: "admin",
            isAdmin: true,
        })
    );
    await connection.manager.save(
        connection.manager.create(Question, {
            text: "What is your favourite colour?",
            answer: 3,
            alternatives: { 1: "Green", 2: "Red", 3: "Blue", 4: "Orange" },
            askDate: dayjs().format("DD-MM-YYYY"),
        })
    );
}
