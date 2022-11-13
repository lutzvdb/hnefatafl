// Updates game.latestActive in database so other know we're still looking!

import { ObjectId } from "mongodb";
import { NextApiRequest, NextApiResponse } from "next"
import clientPromise from "../../lib/mongodb";

export default async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        if (!checkInput(req.body)) {
            res.status(500).json({})
        }

        const client = await clientPromise;
        const db = client.db("hnefatafl");

        const dbResponse = await db
            .collection("game")
            .updateOne({ _id: new ObjectId(req.body.gameId) }, {
                $set: {
                    latestActive: new Date()
                }
            })

        res.json({ status: "ok" })
    } catch (e) {
        console.error(e);
    }
}

// See if JSON request is valid
const checkInput = (body: any) => {
    // legit host name?
    if (typeof body.gameId !== "string") return (false)
    if (body.gameId.length != 24) return (false)

    return (true)
}