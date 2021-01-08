import * as express from "express";
import * as passport from "passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import * as path from "path";
import "reflect-metadata";
import { createConnection } from "typeorm";
import { User } from "./entity/User";
import login from "./routes/login";

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
        app.use(express.static(path.join(__dirname, "public")));

        switch (process.env.NODE_ENV) {
            case "production":
                app.use(express.static(path.join(__dirname, "public")));
                break;
            case "development":
                app.use(express.static(path.join(__dirname, "../client/dist")));
                break;
            default:
                throw new Error("please specify environment");
        }

        app.use("/login", login);

        app.listen(3000);

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

        console.log(
            "Express server has started on port 3000. Open http://localhost:3000/users to see results"
        );
    })
    .catch((error) => console.log(error));
