import * as express from "express";
import { unlinkSync } from "fs";
import * as http from "http";
import * as passport from "passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import * as path from "path";
import "reflect-metadata";
import { createConnection } from "typeorm";
import { server } from "websocket";
import { User } from "./entity/User";
import login from "./routes/login";
import { fillDatabaseWithTestData } from "./testdata";

export let wss: server;

const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: String(process.env.SECRET),
};

createConnection()
    .then(async (connection) => {
        passport.use(
            new Strategy(options, (jwtPayload, done) => {
                console.log(jwtPayload);
                connection.manager
                    .findOne(User, { where: { id: jwtPayload.sub } })
                    .then((user) => {
                        console.log(user);
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
        app.use(express.json());
        app.use(express.urlencoded({ extended: true }));
        app.use(passport.initialize());

        if (process.env.NODE_ENV === "development") {
            await fillDatabaseWithTestData(connection);
            app.use(express.static(path.join(__dirname, "../client/dist")));
        }

        app.use("/login", login);

        app.listen(3000);

        const httpServer = http.createServer();
        httpServer.listen(8080, () => console.log("server listening on 8080"));

        wss = new server({
            httpServer: httpServer,
            autoAcceptConnections: process.env.NODE_ENV === "development",
        });

        setTimeout(() => {
            wss.broadcast(Date.now());
        }, 5000);

        console.log(
            "Express server has started on port 3000. Open http://localhost:3000/users to see results"
        );
    })
    .catch((error) => console.log(error));
