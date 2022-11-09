import { useState } from "react"
import MultiplayerOpenGames from "./MultiplayerOpenGames"
import { stonesByName } from '../lib/initialSetup'

export default function MultiplayerMenu(props: {
    startOnlineGame: Function
}) {
    const [hostName, setHostName] = useState('')
    const [showMainMenu, setShowMainMenu] = useState(true)
    const [showNewOrJoin, setShowNewOrJoin] = useState(false)
    const [showGameSelector, setShowGameSelector] = useState(false)
    const [myTeam, setMyTeam] = useState(0)

    const createOnlineGame = async (game: any) => {
        if (game.name.length == 0) return
        if (hostName.length == 0) return

        const ret = await fetch('/api/newgame', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                host: hostName,
                team: myTeam,
                game: game.name
            })
        })

        if(!ret) return 
        const retJSON = await ret.json()
        if(!retJSON.id) return 

        setShowMainMenu(false)
        setShowNewOrJoin(true)
        setShowGameSelector(false)

        // start game locally
        props.startOnlineGame(retJSON.id, game.stones, myTeam, "")
    }

    const step2 = () => {
        setShowMainMenu(false)
        setShowNewOrJoin(true)
    }

    const step3 = (selectedTeam: number) => {
        setMyTeam(selectedTeam)
        setShowNewOrJoin(false)
        setShowGameSelector(true)
    }

    return (
        <div>
            {/* Entry point */}
            <div className={showMainMenu ? '' : 'hidden'}>
                <div>
                    Select a name...
                </div>
                <div>
                    <input className={"input "} value={hostName} onChange={(e) => setHostName(e.target.value)} />
                </div>
                <div>
                    <a href="#" className={hostName.length > 0 ? '' : 'hidden'} onClick={() => step2()}>OK</a><br /><br />
                </div>
            </div>
            <div className={showNewOrJoin ? '' : 'hidden'}>
                <div>
                    <a key="createred" href="#" onClick={() => step3(2)}>Create a new game as red</a><br />
                    <a key="creategreen" href="#" onClick={() => step3(1)}>Create a new game as green</a>
                </div>
                <div className="my-4">
                    Open games:
                    <MultiplayerOpenGames myName={hostName} startOnlineGame={props.startOnlineGame} />
                </div>
                <div>
                    <a href="#" onClick={() => { setShowNewOrJoin(false); setShowMainMenu(true) }}>Back to name selection</a>
                </div>
            </div>
            <div className={showGameSelector ? '' : 'hidden'}>
                <div>
                    Choose a game type:
                </div>
                <div>
                    {stonesByName.map(s => 
                        <a key={s.name} href="#" onClick={() => createOnlineGame(s)}>
                            - {s.formalName}
                            <br />
                        </a>
                    )}
                    <br />
                </div>
                <div>
                    <a href="#" onClick={() => { setShowNewOrJoin(true); setShowGameSelector(false) }}>Back to join/create</a>
                </div>
            </div>

        </div >
    )
}