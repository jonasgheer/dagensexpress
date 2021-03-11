import * as cors from "cors";
import * as express from "express";
import * as http from "http";
import * as jwt from "jsonwebtoken";
import * as passport from "passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import * as path from "path";
import "reflect-metadata";
import { Server } from "socket.io";
import { createConnection, getRepository } from "typeorm";
import { Token } from "../common/types";
import { User } from "./entity/User";
import admin from "./routes/admin";
import hub from "./routes/hub";
import login from "./routes/login";
import { fillDatabaseWithTestData } from "./testdata";
import * as morgan from "morgan";
import * as fs from "fs";

export let io: Server;

type userId = number;

export let onlineUsers = new Map<
    userId,
    { timestamp: number; userId: userId; userName: string }
>();

const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: String(process.env.JWT_SECRET),
};

if (process.env.JWT_SECRET == null) {
    throw new Error("jwt secret is not set");
}

createConnection()
    .then(async (connection) => {
        passport.use(
            new Strategy(options, (jwtPayload, done) => {
                connection.manager
                    .findOne(User, { where: { id: jwtPayload.sub } })
                    .then((user) => {
                        if (user) {
                            return done(null, user);
                        } else {
                            return done(null, false);
                        }
                    })
                    .catch((err) => done(err, false));
            })
        );

        const app = express();
        const httpServer = http.createServer(app);
        io = new Server(httpServer);
        const accessLogStream = fs.createWriteStream(
            path.join(__dirname, "..", "logs/access.log"),
            { flags: "a" }
        );

        app.use(
            morgan(
                process.env.NODE_ENV === "development" ? "dev" : "combined",
                { stream: accessLogStream }
            )
        );
        app.use(express.json());
        app.use(express.urlencoded({ extended: true }));
        app.use(cors());
        app.use(passport.initialize());

        if (process.env.NODE_ENV === "development") {
            console.info("JWT_SECRET:", String(process.env.JWT_SECRET));
            await fillDatabaseWithTestData(connection);
            app.use(
                express.static(path.join(__dirname, "../../client/public"))
            );
            app.use(
                express.static(
                    path.join(__dirname, "../../client/public/build")
                )
            );
        }

        app.use(express.static(path.join(__dirname, "..", "public")));

        app.use("/login", login);
        app.use("/hub", hub);
        app.use("/admin", admin);

        app.get(
            "/user/color",
            passport.authenticate("jwt", { session: false }),
            async (_, res) => {
                const users = await getRepository(User).find({
                    select: ["username", "color"],
                });
                res.json(
                    users.reduce(
                        (obj, user) => ({
                            ...obj,
                            [user.username]: user.color,
                        }),
                        {}
                    )
                );
            }
        );

        app.get("/hello", (_, res) => {
            res.send("hello");
        });

        io.on("connection", (socket) => {
            socket.emit("message", "Hello, Client!");

            socket.on("ping", (userId: number, userName: string) => {
                if (!onlineUsers.has(userId)) {
                    onlineUsers.set(userId, {
                        timestamp: Date.now(),
                        userId,
                        userName,
                    });
                }
                onlineUsers.set(userId, {
                    timestamp: Date.now(),
                    userId,
                    userName,
                });
            });

            socket.on("token", (token: string) => {
                const decoded = jwt.decode(token.split(" ")[1]) as Token;
                if (decoded.adm) {
                    socket.join("admins");
                }
            });
        });

        httpServer.listen(3000);
        console.log(
            "Express server has started on port 3000. Open http://localhost:3000 to see results"
        );
    })
    .catch((error) => console.log(error));
