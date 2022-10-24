import { tablut, hnefatafl, brandubh, ardri, tawlbwrdd, aleaEvangelii } from '../lib/initialSetup'
import { useEffect, useState } from 'react'
import { getAllSavedGames } from '../lib/savegame'

import TextField from '@mui/material/TextField';

export default function Menu(props: {
    restartGame: Function,
    showMenu: boolean,
    setShowMenu: Function,
    saveGame: Function,
    loadGame: Function
}) {
    const [showSaveGameInput, setShowSaveGameInput] = useState(false)
    const [showLoadGame, setShowLoadGame] = useState(false)
    const [showRestart, setShowRestart] = useState(false)
    const [showMainMenu, setShowMainMenu] = useState(true)
    const [allSavedGames, setAllSavedGames] = useState<string[] | null>(null)
    const [newGameName, setNewGameName] = useState('')
    const [aiGame, setAIgame] = useState(false);
    const [myTeam, setMyTeam] = useState(1)

    useEffect(() => {
        setAllSavedGames(getAllSavedGames())
    }, [showMainMenu])

    const newGame = (stones: number[][]) => {
        setShowRestart(false)
        setShowMainMenu(true);
        props.restartGame(stones, aiGame, myTeam)
        props.setShowMenu(false)
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

                        {/* Save games */}
                        <div className={(showSaveGameInput ? '' : 'hidden') +
                            ' pl-5 text-lg lg:text-2xl xl:text-2xl 2xl:text-2xl text-left'}
                            style={{ fontFamily: 'Roboto Mono' }}
                        >
                            <TextField
                                label="Choose a game name"
                                variant="standard"
                                inputProps={{ style: { fontFamily: 'Roboto Mono' } }}
                                InputLabelProps={{ style: { fontFamily: 'Roboto Mono' } }}
                                onChange={(e) => setNewGameName(e.target.value)}
                                className="mb-5"
                            />
                            <br />
                            <a href="#" onClick={() => { setShowSaveGameInput(false); setShowMainMenu(true); props.saveGame(newGameName) }}>
                                Save!
                            </a>
                            <br /><br />
                            <a href="#" onClick={() => { setShowSaveGameInput(false); setShowMainMenu(true); }}>
                                Back...
                            </a>
                        </div>

                        {/* Load games */}
                        <div className={(showLoadGame ? '' : 'hidden') +
                            ' pl-5 text-lg lg:text-2xl xl:text-2xl 2xl:text-2xl text-left'}
                            style={{ fontFamily: 'Roboto Mono' }}
                        >
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
                            <br />
                            <a href="#" onClick={() => { setShowLoadGame(false); setShowMainMenu(true); }}>
                                Back...
                            </a>
                        </div>

                        {/* Restart game  */}
                        <div className={(showRestart ? '' : 'hidden') +
                            ' pl-5 text-lg lg:text-2xl xl:text-2xl 2xl:text-2xl text-left'}
                            style={{ fontFamily: 'Roboto Mono' }}
                        >
                            <a href="#" onClick={() => newGame(brandubh)}>
                                - Brandubh (7x7)
                            </a><br />
                            <a href="#" onClick={() => newGame(ardri)}>
                                - Ard Ri (7x7)
                            </a><br />
                            <a href="#" onClick={() => newGame(tablut)}>
                                - Tablut (9x9)
                            </a><br />
                            <a href="#" onClick={() => newGame(hnefatafl)}>
                                - Hnefatafl (11x11)
                            </a><br />
                            <a href="#" onClick={() => newGame(tawlbwrdd)}>
                                - Tawlbwrdd (11x11)
                            </a><br />
                            <a href="#" onClick={() => newGame(aleaEvangelii)}>
                                - Alea Evangelii (19x19)
                            </a>
                            <br /><br />
                            <a href="#" onClick={() => { setShowRestart(false); setShowMainMenu(true); }}>
                                Back...
                            </a>
                        </div>

                        {/* Main menu */}
                        <div className={showMainMenu ? '' : 'hidden'}>
                            <div className="pl-5 text-lg lg:text-2xl xl:text-2xl 2xl:text-2xl text-left" style={{ fontFamily: 'Roboto Mono' }}>
                                <a href="#" onClick={() => { setAIgame(false); setShowRestart(!showRestart); setShowMainMenu(false) }}>
                                    Play against a friend
                                </a><br />
                                <a href="#" onClick={() => { setMyTeam(2); setAIgame(true); setShowRestart(!showRestart); setShowMainMenu(false) }}>
                                    Play against AI as red
                                </a><br />
                                <a href="#" onClick={() => { setMyTeam(1); setAIgame(true); setShowRestart(!showRestart); setShowMainMenu(false) }}>
                                    Play against AI as green
                                </a><br />
                                <a href="#" onClick={() => { setShowSaveGameInput(true); setShowMainMenu(false) }}>
                                    Save Game
                                </a><br />
                                <a href="#" onClick={() => { setShowLoadGame(true); setShowMainMenu(false) }}>
                                    Load Game
                                </a><br />
                                <a href="#" onClick={() => props.setShowMenu(false)}>
                                    Close Menu
                                </a>
                            </div>
                        </div>

                        <div className="border-t border-gray-300 w-full my-5" ></div>
                        <div className="text-sm" style={{ fontFamily: 'Roboto Mono' }}>
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