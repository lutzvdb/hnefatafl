import { useEffect, useState } from "react"
import MultiplayerOpenGames from "./MultiplayerOpenGames"
import { stonesByName } from '../lib/initialSetup'
import MenuSection from "./MenuSection"

export default function MultiplayerMenu(props: {
    startOnlineGame: Function,
    closeMenu: Function,
    isVisible: boolean
}) {

    const [hostName, setHostName] = useState('')
    const [showMainMenu, setShowMainMenu] = useState(true)
    const [showNewOrJoin, setShowNewOrJoin] = useState(false)
    const [showGameSelector, setShowGameSelector] = useState(false)
    const [myTeam, setMyTeam] = useState(0)

    useEffect(() => {
        const storedName = localStorage.getItem('myName')
        if (!storedName) return

        // name already defined and saved, directly show option to join
        if (hostName == '') setHostName(storedName)
        setShowMainMenu(false)
        setShowNewOrJoin(true)
    }, [])

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

        if (!ret) return
        const retJSON = await ret.json()
        if (!retJSON.id) return

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

    const changeHostName = (name: string) => {
        setHostName(name);
        localStorage.setItem('myName', name)
    }

    return (
        <div>
            {/* Name selection */}
            <div className={showMainMenu ? '' : 'hidden'}>
                <MenuSection title="Select a name">
                    <div>
                        <input className={"input "} value={hostName} onChange={(e) => changeHostName(e.target.value)} />
                        <div className={hostName.length >= 10 ? 'text-red-700 font-bold' : 'hidden'}>Name ist zu lang!</div>
                    </div>
                    <div>
                        <a href="#" className={(hostName.length > 0 && hostName.length < 10) ? '' : 'hidden'} onClick={() => step2()}>OK</a><br /><br />
                    </div>
                </MenuSection>
                <a href="#" onClick={() => { props.closeMenu() }}>
                    Back to main menu
                </a>
            </div>

            {/* Create or join game */}
            <div className={showNewOrJoin ? '' : 'hidden'}>
                <MenuSection title="Create a new game">
                    <a key="createred" href="#" onClick={() => step3(2)}>...as red</a><br />
                    <a key="creategreen" href="#" onClick={() => step3(1)}>...as green</a>
                </MenuSection>
                <MenuSection title="Join an open game">
                    <MultiplayerOpenGames isVisible={props.isVisible} myName={hostName} startOnlineGame={props.startOnlineGame} />
                </MenuSection>
                <div>
                    <br />
                    <a href="#" onClick={() => { setShowNewOrJoin(false); setShowMainMenu(true) }}>Change your name ({hostName})</a>
                </div>
                <a href="#" onClick={() => { props.closeMenu() }}>
                    Back to main menu
                </a>
            </div>
            <div className={showGameSelector ? '' : 'hidden'}>
                <MenuSection title="Choose a game type">
                    {stonesByName.map(s =>
                        <a key={s.name} href="#" onClick={() => createOnlineGame(s)}>
                            - {s.formalName}
                            <br />
                        </a>
                    )}
                </MenuSection>
                <br />
                <div>
                    <a href="#" onClick={() => { setShowNewOrJoin(true); setShowGameSelector(false) }}>Back...</a>
                </div>
            </div>

        </div >
    )
}