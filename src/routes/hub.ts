import * as dayjs from "dayjs";
import * as express from "express";
import { Response } from "express";
import { getRepository } from "typeorm";
import { io } from "..";
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
import { authenticate, isAdmin } from "./admin";

const router = express.Router();

/**
 * Get state of todays quiz round
 */
router.get("/", authenticate, async (req, res: Response<QuizState>) => {
    const question = await getRepository(Question).findOne({
        where: { askDate: dayjs().format("YYYY-MM-DD") },
    });

    if (!question) {
        res.json({
            type: "nothingHere",
        } as NothingHere);
        return;
    }

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

/**
 *  Get this weeks subject
 */
router.get("/subject", authenticate, async (req, res: Response<string>) => {
    const question = await getRepository(Question).findOne({
        relations: ["subject"],
        where: { askDate: dayjs().format("YYYY-MM-DD") },
    });
    if (!question) {
        return res.send("*supervanskelig tema*");
    }
    if (isAdmin(req)) {
        return res.send(question.subject.text);
    }
    if (question.state === "inactive") {
        return res.send("*supervanskelig tema*");
    }
    res.send(question.subject.text);
});

router.get(
    "/admin",
    authenticate,
    async (req, res: Response<AdminQuizState>) => {
        if (!isAdmin(req)) {
            res.sendStatus(401);
        }
        const question = await getRepository(Question).findOne({
            where: { askDate: dayjs().format("YYYY-MM-DD") },
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
                    alternatives: question.alternatives,
                    text: question.text,
                    answer: question.answer,
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
        where: { askDate: dayjs().format("YYYY-MM-DD") },
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

    io.to("admins").emit("invalidate", "adminQuizState");

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
        where: { askDate: dayjs().format("YYYY-MM-DD") },
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

    io.emit("invalidate", "quizState");
    if (nextState === "showingQuestion") io.emit("invalidate", "subject");

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
