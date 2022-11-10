import { useEffect, useState } from "react"
import { getApp } from "realm-web";
import { Credentials as MDBCredentials } from "realm-web";
import { BSON } from "realm-web";

export default function MultiplayerListener(props: {
    onlineGameId: string | null,
    handleUpdate: Function
}) {
    const [MongoDBApp, setMongoDBApp] = useState<any | null>(null)

    // first run 
    useEffect(() => {
        if (MongoDBApp !== null) return 
        if (process.env.NEXT_PUBLIC_APP_ID) setMongoDBApp(getApp(process.env.NEXT_PUBLIC_APP_ID))
    }, [])

    // after app create
    useEffect(() => {
        if (!MongoDBApp) return
        if (!MongoDBApp.currentUser) {
            const anonymousUser = MDBCredentials.anonymous()
            MongoDBApp.logIn(anonymousUser)
        }

        if (MongoDBApp.currentUser && props.onlineGameId) {
            initiateChangeStream()
        }
    }, [MongoDBApp, props.onlineGameId])

    const initiateChangeStream = async () => {
        if (!props.onlineGameId) return

        const mongo = MongoDBApp.currentUser.mongoClient("mongodb-atlas")
        const gameColl = mongo.db("hnefatafl").collection("game")

        const changeStream = gameColl.watch({
            filter: {
                operationType: "update",
                "fullDocument._id": new BSON.ObjectId(props.onlineGameId)
            }
        });

        console.log('Initialized ChangeStream')

        const myId = new BSON.ObjectId(props.onlineGameId)

        for await (const change of changeStream) {
            if (change.operationType != "update") break

            const { documentKey, fullDocument } = change;
            // check to see if it is our ID! We may be subscribed to old games...
            if (fullDocument._id.id.toString() !== myId.id.toString()) return

            props.handleUpdate(fullDocument)
        }
    }

    return <></>
}