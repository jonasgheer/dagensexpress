import * as express from "express";
import { Request, Response } from "express";
import * as passport from "passport";
import { getRepository } from "typeorm";
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
        await getRepository(Question).insert({
            subject,
            text: req.body.text,
            alternatives: req.body.alternatives,
            answer: req.body.answer,
            askDate: req.body.askDate,
        });
        res.sendStatus(201);
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

export default router;
