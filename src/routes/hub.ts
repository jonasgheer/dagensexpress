import express = require("express");

const router = express.Router();

type QuizState = NothingHere | ShowingQuestion | ShowingGuesses | ShowingAnswer;

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

/**
 * Get state of todays quiz round
 */
router.get("/");

router.get("/guess", (req, res) => {
    const alternative = req.query.alternative;
});
