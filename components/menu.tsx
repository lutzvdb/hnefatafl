
import { useEffect, useState } from 'react'
import { getAllSavedGames } from '../lib/savegame'
import MultiplayerMenu from './MultiplayerMenu'
import { stonesByName } from '../lib/initialSetup'

import TextField from '@mui/material/TextField';
import MenuSection from './MenuSection';

const fontName = 'Raleway'

export default function Menu(props: {
    restartGame: Function,
    showMenu: boolean,
    setShowMenu: Function,
    saveGame: Function,
    loadGame: Function
    setOpponentName: Function
}) {
    const [showSaveGameInput, setShowSaveGameInput] = useState(false)
    const [showLoadGame, setShowLoadGame] = useState(false)
    const [showRestart, setShowRestart] = useState(false)
    const [showMainMenu, setShowMainMenu] = useState(true)
    const [showMultiplayer, setShowMultiplayer] = useState(false)
    const [allSavedGames, setAllSavedGames] = useState<string[] | null>(null)
    const [newGameName, setNewGameName] = useState('')
    const [aiGame, setAIgame] = useState(false);
    const [myTeam, setMyTeam] = useState(1)

    useEffect(() => {
        setAllSavedGames(getAllSavedGames())
    }, [showMainMenu])

    const newGame = (stones: number[][]) => {
        // reset menu for next opening
        setShowRestart(false)
        setShowMainMenu(true);

        // start game
        props.restartGame(stones, aiGame, myTeam, false, null)
        props.setShowMenu(false)
        props.setOpponentName(null)
    }

    const startOnlineGame = async (gameId: string, stones: number[][], myTeam: number, opponentName: string) => {
        // reset menu for next opening
        setShowMainMenu(true);
        setShowMultiplayer(false);

        console.log('Starting online game ' + gameId)

        // start game
        props.setOpponentName(opponentName)
        props.setShowMenu(false)
        props.restartGame(stones, false, myTeam, false, gameId)
    }

    return (
        <>
            <div className={
                (props.showMenu ? '' : 'hidden ') +
                `
            bg-gray-200
            bg-opacity-20
            fixed top-0 right-0 left-0 bottom-0
            w-screen h-screen
            backdrop-blur-md
            z-50 
            `}
            >
                <div className="grid place-content-center w-full h-full text-6xl text-center rounded-2xl">
                    <div className="bg-white p-10 rounded-3xl bg-opacity-50">
                        <div className="text-6xl lg:text-8xl xl:text-8xl 2xl:text-8xl text-center pb-5" >
                            hnefatafl
                        </div>
                        <div className="border-t border-gray-300 w-full mb-5" ></div>
                        <div className={"text-base lg:text-lg text-left"} style={{ fontFamily: fontName }}>
                            {/* Save games */}
                            <div className={showSaveGameInput ? '' : 'hidden'}>
                                <MenuSection title="Save your game locally">
                                    <div>
                                        <TextField
                                            label="Choose a game name"
                                            variant="standard"
                                            inputProps={{ style: { fontFamily: fontName } }}
                                            InputLabelProps={{ style: { fontFamily: fontName } }}
                                            onChange={(e) => setNewGameName(e.target.value)}
                                            className="mb-5"
                                        />
                                    </div>
                                    <div>
                                        <a href="#" onClick={() => { setShowSaveGameInput(false); setShowMainMenu(true); props.saveGame(newGameName) }}>
                                            Save!
                                        </a>
                                    </div>
                                </MenuSection><br />
                                <a href="#" onClick={() => { setShowSaveGameInput(false); setShowMainMenu(true); }}>
                                    Back...
                                </a>
                            </div>

                            {/* Load games */}
                            <div className={showLoadGame ? '' : 'hidden'}>
                                <MenuSection title="Choose a game to load:">
                                    <ul>
                                        {allSavedGames === null ? <li key="nogames"><i>No games saved.</i></li> :
                                            allSavedGames.map((g, i) =>
                                                i <= 9 ?
                                                    <li key={g}>
                                                        <i>
                                                            {i + 1}.&nbsp;
                                                            <a href="#" onClick={() => {
                                                                setShowLoadGame(false);
                                                                setShowMainMenu(true);
                                                                props.loadGame(g)
                                                            }}
                                                            >
                                                                {g}
                                                            </a>
                                                        </i>
                                                        <br />
                                                    </li>
                                                    : ''
                                            )
                                        }
                                    </ul>
                                </MenuSection>
                                <br />
                                <a href="#" onClick={() => { setShowLoadGame(false); setShowMainMenu(true); }}>
                                    Back...
                                </a>
                            </div>

                            {/* Restart game  */}
                            <div className={showRestart ? '' : 'hidden'}>
                                <MenuSection title="Choose a game type">
                                    {stonesByName.map(s =>
                                        <a key={s.name} href="#" onClick={() => newGame(s.stones)}>
                                            - {s.formalName}<br />
                                        </a>
                                    )}
                                </MenuSection>
                                <br />
                                <a href="#" onClick={() => { setShowRestart(false); setShowMainMenu(true); }}>
                                    Back...
                                </a>
                            </div>

                            {/* Multiplayer menu */}
                            <div className={showMultiplayer ? '' : 'hidden'}>
                                <MultiplayerMenu closeMenu={() => {setShowMultiplayer(false); setShowMainMenu(true);}} startOnlineGame={startOnlineGame} />
                            </div>

                            {/* Main menu */}
                            <div className={showMainMenu ? '' : 'hidden'}>
                                <MenuSection title="Start a new game">
                                    <a href="#" onClick={() => { setAIgame(false); setShowRestart(!showRestart); setShowMainMenu(false) }}>
                                        Play both teams locally
                                    </a><br />
                                    <a href="#" onClick={() => { setShowMultiplayer(true); setShowMainMenu(false) }}>
                                        Play online
                                    </a><br />
                                    <div className="">
                                        Play against a (stupid) AI
                                    </div>
                                    <a href="#" onClick={() => { setMyTeam(2); setAIgame(true); setShowRestart(!showRestart); setShowMainMenu(false) }}>
                                        ...as red
                                    </a><br />
                                    <a href="#" onClick={() => { setMyTeam(1); setAIgame(true); setShowRestart(!showRestart); setShowMainMenu(false) }}>
                                        ...as green
                                    </a>
                                </MenuSection>
                                <MenuSection title="Load/save games">
                                    <a href="#" onClick={() => { setShowSaveGameInput(true); setShowMainMenu(false) }}>
                                        Save Game
                                    </a><br />
                                    <a href="#" onClick={() => { setShowLoadGame(true); setShowMainMenu(false) }}>
                                        Load Game
                                    </a>
                                </MenuSection>

                                <div className="font-bold mt-4">
                                    <a href="#" onClick={() => props.setShowMenu(false)}>
                                        Close Menu
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-gray-300 w-full my-5" ></div>
                        <div className="text-sm" style={{ fontFamily: 'Raleway' }}>
                            <a href="https://www.thisislutz.com">
                                coded by lvdb
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}