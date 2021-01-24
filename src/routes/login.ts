import * as express from "express";
import { sign } from "jsonwebtoken";
import { getRepository, Like } from "typeorm";
import { Token } from "../../common/types";
import { User } from "../entity/User";

const router = express.Router();

router.post("/", async (req, res) => {
    const user = await getRepository(User).findOne({
        where: { username: Like(req.body.username) },
    });

    if (!user) {
        res.sendStatus(401);
        return;
    }

    if (user.password !== req.body.password) {
        res.sendStatus(401);
    }

    const token = sign(
        {
            sub: user.id,
            adm: user.isAdmin,
            iat: Math.floor(Date.now() / 1000),
            unm: user.username,
        } as Token,
        String(process.env.JWT_SECRET),
        {
            expiresIn: "6.5 d",
        }
    );

    res.status(200).json({
        success: true,
        token: "Bearer " + token,
    });
});

export default router;
