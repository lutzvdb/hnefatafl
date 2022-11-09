import { useMongoDBApp } from '../hooks/useMongoDBClientside'
import { BSON, Credentials as MDBCredentials } from "realm-web";

export const useMultiplayerListener = async (onlineGameId: string|null, updateCallback: Function) => {
    if(!onlineGameId) return 
    const MongoDBApp = useMongoDBApp()
    
    if (!MongoDBApp) return
    
    if (MongoDBApp && !MongoDBApp.currentUser) {
        const anonymousUser = MDBCredentials.anonymous()
        await MongoDBApp.logIn(anonymousUser)
    }

    if (MongoDBApp.currentUser) {
        const mongo = MongoDBApp.currentUser.mongoClient("mongodb-atlas")
        const gameColl = mongo.db("hnefatafl").collection("game")
        
        const changeStream = gameColl.watch({
            filter: {
                operationType: "update",
                "fullDocument._id": new BSON.ObjectId(onlineGameId)
            }
        });
        
        for await (const change of changeStream) {
            if(change.operationType != "update") break 

            const { documentKey, fullDocument } = change;
            updateCallback(fullDocument)
        }
    }
}