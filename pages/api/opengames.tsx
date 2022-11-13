import { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "../../lib/mongodb";
import addMinutes from "date-fns/addMinutes";

export default async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const client = await clientPromise;
        const db = client.db("hnefatafl");

        const dbResponse = await db
            .collection("game")
            .find({ 
                latestActive: { $gte: addMinutes(new Date(), -1) }, 
                opponent: { $exists: false }
            })
            .limit(10)
            .toArray();

        res.json(dbResponse);
    } catch (e) {
        console.error(e);
    }
};