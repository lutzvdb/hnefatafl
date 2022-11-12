import { NextApiRequest, NextApiResponse } from "next"
import { stonesByName } from '../../lib/initialSetup'
import clientPromise from "../../lib/mongodb";

export default async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        if (!checkInput(req.body)) {
            res.status(500).json({})
        }

        const newGame = {
            host: req.body.host,
            hostTeam: req.body.team,
            game: req.body.game,
            timeInitiated: new Date(),
            latestActive: new Date()
        }

        const client = await clientPromise;
        const db = client.db("hnefatafl");

        const dbResponse = await db
            .collection("game")
            .insertOne(newGame)
        if (dbResponse.acknowledged == false) res.json({ status: "error" })

        res.json({ status: "ok", id: dbResponse.insertedId })
    } catch (e) {
        console.error(e);
    }
}

// See if JSON request is valid
const checkInput = (body: any) => {
    // legit host name?
    if (typeof body.host !== "string") return (false)
    if (body.host.length == 0) return (false)
    if (body.host.length >= 10) return (false)

    // legit team choice?
    if (typeof body.team !== "number") return (false)
    if (!(body.team == 1 || body.team == 2)) return (false)

    // legit game type?
    if (typeof body.game !== "string") return (false)
    if (!stonesByName.map(s => s.name)
        .includes(body.game)) return (false)

    return (true)
}