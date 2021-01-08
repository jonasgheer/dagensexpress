import * as express from "express";
import { Request, Response } from "express";
import { sign } from "jsonwebtoken";
import * as passport from "passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import * as path from "path";
import "reflect-metadata";
import { createConnection, getRepository } from "typeorm";
import { Token } from "../common/types";
import { User } from "./entity/User";
import { Routes } from "./routes";

const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: String(process.env.SECRET),
};

createConnection()
    .then(async (connection) => {
        const app = express();

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

        app.use(express.json());
        app.use(express.urlencoded({ extended: true }));
        app.use(passport.initialize());

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

        Routes.forEach((route) => {
            (app as any)[route.method](
                route.route,
                (req: Request, res: Response, next: Function) => {
                    const result = new (route.controller as any)()[
                        route.action
                    ](req, res, next);
                    if (result instanceof Promise) {
                        result.then((result) =>
                            result !== null && result !== undefined
                                ? res.send(result)
                                : undefined
                        );
                    } else if (result !== null && result !== undefined) {
                        res.json(result);
                    }
                }
            );
        });

        app.get("/login", (_, res) => {
            res.sendFile(path.join(__dirname + "public/login.html"));
        });

        app.post("/login", async (req, res) => {
            const user = await getRepository(User).findOne({
                where: { username: req.body.username },
            });

            if (!user) {
                res.status(401).json({
                    success: false,
                    msg: "could not find user",
                });
                return;
            }

            if (user.password !== req.body.password) {
                res.redirect("/login");
            }

            const token = sign(
                {
                    sub: user.id,
                    adm: user.isAdmin,
                    iat: Date.now(),
                    unm: user.username,
                } as Token,
                String(process.env.SECRET),
                {
                    expiresIn: Math.floor(Date.now() / 1000) + 60 * 60,
                }
            );

            res.status(200).json({
                success: true,
                token: "Bearer " + token,
            });
        });

        app.get(
            "/hello",
            passport.authenticate("jwt", { session: false }),
            (req, res) => {
                res.status(200).json({ success: true, msg: "You are in!" });
            }
        );

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
