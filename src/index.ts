import * as express from "express";
import { Request, Response } from "express";
import * as fs from "fs";
import { sign } from "jsonwebtoken";
import * as passport from "passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import * as path from "path";
import "reflect-metadata";
import { createConnection, getRepository } from "typeorm";
import { User } from "./entity/User";
import { Routes } from "./routes";

const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: fs.readFileSync(
        path.join(__dirname, "..", "id_rsa.pub"),
        "utf-8"
    ),
    algorithms: ["RS256"],
};

createConnection()
    .then(async (connection) => {
        passport.use(
            new Strategy(options, async (jwtPayload, done) => {
                let user: User | undefined;
                try {
                    user = await connection.manager.findOne(User, {
                        where: { id: jwtPayload.id },
                    });
                } catch (err) {
                    return done(err, false);
                }
                if (user) {
                    return done(null, user);
                } else {
                    return done(null, false);
                }
            })
        );

        const app = express();
        app.use(express.json());
        app.use(express.urlencoded({ extended: true }));
        app.use(passport.initialize());

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

        app.get("/login", (req, res) => {
            res.sendFile(path.join(__dirname + "/public/login.html"));
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

            const expiresIn = "3m";
            const token = sign(
                { sub: user.id, adm: user.isAdmin, iat: Date.now() },
                fs.readFileSync(path.join(__dirname, "..", "id_rsa")),
                { expiresIn, algorithm: "RS256" }
            );

            res.status(200).json({
                success: true,
                token: "Bearer " + token,
                expiresIn,
            });
        });

        app.get(
            "/hello",
            passport.authenticate("jwt", { session: false }),
            (req, res) => {
                res.status(200).json({ success: true, msg: "You are in!" });
            }
        );

        // setup express app here
        // ...

        // start express server
        app.listen(3000);

        // insert new users for test
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
