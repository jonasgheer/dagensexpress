import * as dayjs from "dayjs";
import * as express from "express";
import { Request, Response } from "express";
import * as passport from "passport";
import { getRepository } from "typeorm";
import { wss } from "..";
import {
    AdminQuizState,
    Guesses,
    nextQuestionState,
    NothingHere,
    QuizState,
    ShowingQuestion,
} from "../../common/types";
import { Guess } from "../entity/Guess";
import { Answer, Question, QuestionState } from "../entity/Question";
import { User } from "../entity/User";

const router = express.Router();

function isAdmin(req: Request): boolean {
    if (!req.user) return false;
    return (req.user as User).isAdmin === true;
}

const authenticate = passport.authenticate("jwt", { session: false });

/**
 * Get state of todays quiz round
 */
router.get("/", authenticate, async (req, res: Response<QuizState>) => {
    const question = await getRepository(Question).findOne({
        where: { askDate: dayjs().format("DD-MM-YYYY") },
    });

    if (!question) {
        res.json({
            type: "nothingHere",
        } as NothingHere);
        return;
    }

    // res.header("Cache-control", "no-cache");

    if (question.state === "inactive" || question.state === "finished") {
        res.json({
            type: "nothingHere",
        });
        return;
    }

    switch (question.state) {
        case "showingQuestion": {
            const haveGuessed = await getRepository(Guess).findOne({
                select: ["guess"],
                where: {
                    user: (req.user as User).id,
                    question: { id: question.id },
                },
            });

            res.json({
                type: "showingQuestion",
                alternatives: question.alternatives,
                text: question.text,
                haveGuessed: !haveGuessed ? false : haveGuessed.guess,
            });
            return;
        }
        case "showingGuesses": {
            const guesses = await getRepository(Guess).find({
                relations: ["user"],
                where: { question },
            });
            res.json({
                type: "showingGuesses",
                alternatives: question.alternatives,
                text: question.text,
                guesses: guesses.length === 0 ? {} : toGuesses(guesses),
            });
            return;
        }
        case "showingAnswer": {
            const guesses = await getRepository(Guess).find({
                relations: ["user"],
                where: { question },
            });
            res.json({
                type: "showingAnswer",
                alternatives: question.alternatives,
                text: question.text,
                answer: question.answer,
                guesses: guesses.length === 0 ? {} : toGuesses(guesses),
            });
            return;
        }
    }
});

router.get(
    "/admin",
    authenticate,
    async (req, res: Response<AdminQuizState>) => {
        if (!isAdmin(req)) {
            res.sendStatus(401);
        }
        const question = await getRepository(Question).findOne({
            where: { askDate: dayjs().format("DD-MM-YYYY") },
        });
        if (!question) {
            res.json({
                type: "nothingHere",
            } as NothingHere);
            return;
        }

        switch (question.state) {
            case "inactive":
                res.json({
                    type: "inactive",
                });
                break;
            case "showingQuestion": {
                const guesses = await getRepository(Guess).find({
                    relations: ["user"],
                    where: { question },
                });
                res.json({
                    type: "showingQuestion",
                    alternatives: question.alternatives,
                    answer: question.answer,
                    text: question.text,
                    guesses: guesses.length === 0 ? {} : toGuesses(guesses),
                });
                break;
            }
            case "showingGuesses": {
                const guesses = await getRepository(Guess).find({
                    relations: ["user"],
                    where: { question },
                });
                res.json({
                    type: "showingGuesses",
                    alternatives: question.alternatives,
                    text: question.text,
                    answer: question.answer,
                    guesses: guesses.length === 0 ? {} : toGuesses(guesses),
                });
                break;
            }
            case "showingAnswer": {
                const guesses = await getRepository(Guess).find({
                    relations: ["user"],
                    where: { question },
                });
                res.json({
                    type: "showingAnswer",
                    alternatives: question.alternatives,
                    text: question.text,
                    answer: question.answer,
                    guesses: guesses.length === 0 ? {} : toGuesses(guesses),
                });
                break;
            }
            case "finished":
                res.json({ type: "finished" });
        }
    }
);

router.get("/guess/:alternative", authenticate, async (req, res) => {
    const alternative = Number(req.params.alternative);
    const question = await getRepository(Question).findOne({
        where: { askDate: dayjs().format("DD-MM-YYYY") },
    });

    if (!question) {
        res.sendStatus(500);
        return;
    }

    const user = await getRepository(User).findOneOrFail({
        where: { id: (req.user as User).id },
    });

    await getRepository(Guess).save({
        user,
        guess: alternative as Answer,
        question: question,
    });

    //wss.broadcast(Date.now()); // only for admins

    res.json({
        type: "showingQuestion",
        text: question.text,
        haveGuessed: alternative,
        alternatives: question.alternatives,
    } as ShowingQuestion);
});

router.get("/today", authenticate, async (req, res) => {
    if (!isAdmin(req)) {
        res.sendStatus(401);
    }

    const questionState = req.query.questionState as QuestionState;

    const question = await getRepository(Question).findOne({
        where: { askDate: dayjs().format("DD-MM-YYYY") },
    });

    if (!question) {
        res.json({
            success: false,
            msg: "No question for today is specified",
        });
        return;
    }

    const nextState = nextQuestionState[question.state];

    if (nextState !== questionState) {
        res.status(400).send("invalid state transition");
    }

    await getRepository(Question).update(question.id, {
        state: questionState,
    });

    wss.broadcast(Date.now());

    res.sendStatus(200);
});

function toGuesses(guesses: Guess[]): Guesses {
    const result: Guesses = {};
    for (let guess of guesses) {
        result[guess.user.username] = guess.guess;
    }
    return result;
}
export default router;
