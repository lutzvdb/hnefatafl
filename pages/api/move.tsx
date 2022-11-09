import { ObjectId } from "mongodb";
import { NextApiRequest, NextApiResponse } from "next"
import clientPromise from "../../lib/mongodb";

export default async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        if (!checkInput(req.body)) {
            res.status(500).json({})
        }

        const newMove = {
            fromRow: req.body.fromRow,
            fromCol: req.body.fromCol,
            toRow: req.body.toRow,
            toCol: req.body.toCol,
            movingTeam: req.body.movingTeam,
            moveTime: new Date()
        }

        const client = await clientPromise;
        const db = client.db("hnefatafl");

        const dbResponse = await db
            .collection("game")
            .updateOne({ _id: new ObjectId(req.body.gameId) }, {
                $push: {
                    moves: newMove
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

    if (typeof body.fromRow !== "number") return (false)
    if (typeof body.toRow !== "number") return (false)
    if (typeof body.fromCol !== "number") return (false)
    if (typeof body.toCol !== "number") return (false)
    if (typeof body.movingTeam !== "number") return (false)

    return (true)
}