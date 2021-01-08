import express = require("express");
import { sign } from "jsonwebtoken";
import { getRepository } from "typeorm";
import { Token } from "../../common/types";
import { User } from "../entity/User";

const router = express.Router();

router.post("/", async (req, res) => {
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

export default router;
