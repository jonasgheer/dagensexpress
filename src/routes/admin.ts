import * as express from "express";
import { Request, Response } from "express";
import * as passport from "passport";
import { getRepository } from "typeorm";
import { onlineUsers } from "..";
import { NewQuestion } from "../../common/types";
import { Question } from "../entity/Question";
import { Subject } from "../entity/Subject";
import { User } from "../entity/User";

export function isAdmin(req: Request): boolean {
    if (!req.user) return false;
    return (req.user as User).isAdmin === true;
}

export const authenticate = passport.authenticate("jwt", { session: false });

const router = express.Router();

/**
 * get the next 4 weeks worth of questions (including today)
 */
router.get(
    "/question",
    authenticate,
    async (req, res: Response<Question[]>) => {
        if (!isAdmin(req)) {
            res.sendStatus(401);
        }
        const questions = await getRepository(Question)
            .createQueryBuilder("question")
            .leftJoinAndSelect("question.subject", "subject")
            .where("askDate between date('now') and date('now', '+1 month')")
            .getMany();

        res.send(questions);
    }
);

router.post(
    "/question",
    authenticate,
    async (req: Request<{}, {}, NewQuestion>, res) => {
        const subject = await getRepository(Subject).findOne({
            where: { id: req.body.subjectId },
        });
        const newQuestion = {
            subject,
            text: req.body.text,
            alternatives: req.body.alternatives,
            answer: req.body.answer,
            askDate: req.body.askDate,
        };

        await getRepository(Question).insert(newQuestion);
        res.status(201).send(newQuestion);
    }
);

router.post("/subject", authenticate, async (req, res) => {
    if (!isAdmin(req)) {
        res.sendStatus(401);
    }

    await getRepository(Subject).insert({
        text: req.body.subject,
    });

    res.sendStatus(201);
});

router.get("/subject", authenticate, async (req, res: Response<Subject[]>) => {
    if (!isAdmin(req)) {
        res.sendStatus(401);
    }

    const subjects = await getRepository(Subject).find();
    res.send(subjects);
});

router.get("/online-users", authenticate, async (_, res) => {
    const users: { userId: number; userName: string }[] = [];
    onlineUsers.forEach(({ timestamp, userName, userId }) => {
        if (Date.now() - timestamp > 6000) {
            onlineUsers.delete(Number(userId));
        } else {
            users.push({ userId, userName });
        }
    });

    return res.send(users);
});

export default router;
