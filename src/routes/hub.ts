import { Request } from "express";
import express = require("express");
import passport = require("passport");
import { getRepository } from "typeorm";
import { Token } from "../../common/types";
import { Question, QuestionState } from "../entity/Question";
import { User } from "../entity/User";
import * as dayjs from "dayjs";
import { wss } from "..";

const router = express.Router();

export type QuizState =
    | NothingHere
    | ShowingQuestion
    | ShowingGuesses
    | ShowingAnswer;

interface NothingHere {
    type: "nothingHere";
}

interface ShowingQuestion {
    type: "showingQuestion";
}

interface ShowingGuesses {
    type: "showingGuesses";
}

interface ShowingAnswer {
    type: "showingAnswer";
}

function isAdmin(req: Request): boolean {
    if (!req.user) return false;
    return (req.user as User).isAdmin === true;
}

const authenticate = passport.authenticate("jwt", { session: false });


/**
 * Get state of todays quiz round
 */
router.get("/", authenticate, async (req, res) => {
    const question = await getRepository(Question).findOne({
        where: { askDate: dayjs().format("DD-MM-YYYY") },
    });
    if (!question) {
        res.json({
            type: "nothingHere",
        } as NothingHere);
        return;
    }
    res.header("Cache-control", "no-cache");
    switch (question.state) {
        case "inactive":
            res.json({
                type: "nothingHere",
            } as NothingHere);
            return;
        case "showingQuestion":
            res.json({
                type: "showingQuestion",
            } as ShowingQuestion);
            return;
        case "showingGuesses":
            res.json({
                type: "showingGuesses",
            } as ShowingGuesses);
            return;
        case "showingAnswer":
            res.json({
                type: "showingAnswer",
            } as ShowingAnswer);
            return;
    }
});

router.get("/guess", authenticate, async (req, res) => {
    const alternative = req.query.alternative;

    const question = await getRepository(Question).findOne();
});

router.get("/today", authenticate, async (req, res) => {
    if (!isAdmin(req)) {
        res.sendStatus(401);
    }

    console.log(req.query);
    const questionState = req.query.questionState as QuestionState;
    console.log(questionState);

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

    await getRepository(Question).update(question.id, {
        state: questionState,
    });
    wss.broadcast(Date.now());

    res.sendStatus(200);
});

export default router;
