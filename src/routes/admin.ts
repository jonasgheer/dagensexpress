import * as express from "express";
import { Request, Response } from "express";
import * as passport from "passport";
import { getRepository, getConnection } from "typeorm";
import { onlineUsers } from "..";
import { NewQuestion } from "../../common/types";
import { Question } from "../entity/Question";
import { Subject } from "../entity/Subject";
import { User } from "../entity/User";

export function isAdmin(req: Request): boolean {
    if (!req.user) return false;
    return (req.user as User).isAdmin;
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
        if (!isAdmin(req)) {
            res.sendStatus(401);
        }
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

router.put("/question/:id", authenticate, async (req, res) => {
    if (!isAdmin(req)) {
        res.sendStatus(401);
    }
    const question = await getRepository(Question).findOne({
        where: { id: req.params.id },
    });
    if (!question || question?.state !== "inactive") {
        res.sendStatus(400);
        return;
    }
    const subject = await getRepository(Subject).findOne({
        where: { id: req.body.subjectId },
    });

    const editedQuestion = {
        subject: subject,
        text: req.body.text,
        alternatives: req.body.alternatives,
        answer: req.body.answer,
        askDate: req.body.askDate,
    };

    await getRepository(Question).update(req.params.id, editedQuestion);

    res.status(201).send(editedQuestion);
});

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

router.get("/online-users", authenticate, async (req, res) => {
    if (!isAdmin(req)) {
        res.sendStatus(401);
    }
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

router.get("/users", authenticate, async (req, res) => {
    if (!isAdmin(req)) {
        res.sendStatus(401);
    }
    const users = await getRepository(User).find({
        select: ["id", "username", "isAdmin"],
    });
    return res.send(users);
});

router.post("/user", authenticate, async (req, res) => {
    if (!isAdmin(req)) {
        res.sendStatus(401);
    }

    await getRepository(User).insert({
        username: req.body.username,
        password: req.body.password,
        color: req.body.color,
    });

    return res.sendStatus(201);
});

const numberOfGuessesQuery = `with guesses as (select count(*) as numGuesses, username
                                               from guess
                                                        join question on guess.questionId = question.id
                                                        join user on user.id = guess.userId
                                               where askDate > date (?1)
                              group by username),
                                  correct as (
                              select count (*) as numCorrect, username
                              from guess
                                  join question
                              on guess.questionId = question.id
                                  join user on user.id = guess.userId
                              where guess.guess = question.answer
                                and askDate
                                  > date (?1)
                              group by username)
select numGuesses, numCorrect, round((100.0 * numCorrect / numGuesses), 1) as ratio, guesses.username
from guesses
         join correct on guesses.username = correct.username`;

router.post("/stats/:since", authenticate, async (req, res) => {
    if (!isAdmin(req)) {
        res.sendStatus(401);
    }

    const stats = await getConnection().query(numberOfGuessesQuery, [
        req.params.since,
    ]);

    const count = await getRepository(Question)
        .createQueryBuilder("question")
        .where("(state = 'finished' or state = 'showingAnswer')")
        .andWhere("askDate > :since")
        .setParameters({ since: req.params.since })
        .getCount();

    return res.json({
        stats,
        since: req.params.since,
        numQuestions: count,
    });
});

export default router;
