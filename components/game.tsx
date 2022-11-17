import Board from '../components/board'
import Menu from '../components/menu'
import { useEffect, useState } from 'react'
import { isValidMove } from '../lib/moveValidity'
import { brandubh, defaultStones } from '../lib/initialSetup'
import { Stone } from '../lib/stone'
import { getStonesAfterMovement } from '../lib/path'
import { checkBeating, isKingInCorner } from '../lib/beating'
import { saveGameToLocalStroage, loadGameFromLocalStroage, savedGame } from '../lib/savegame'
import { AIGetNextMove } from '../lib/ai/move'

import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import MultiplayerListener from './MultiplayerListener'
import { sendMoveToServer, updateLatestActive } from '../lib/multiplayer'
import { Tutorial } from './tutorial'
import { Megrim as TitleFont, Raleway } from '@next/font/google'

const titleFont = TitleFont({ subsets: ['latin'], weight: '400' })
const mainFont = Raleway({ subsets: ['latin'] })

export default function Game(props: {
    setBgColor: Function,
    setTitleAppendix: Function
}) {
    const isDev = process.env.NODE_ENV === 'development'
    const [takenPiecesRed, setTakenPiecesRed] = useState(0)
    const [takenPiecesGreen, setTakenPiecesGreen] = useState(0)
    const [showTutorial, setShowTutorial] = useState(false)
    const [updateLatestActiveTimer, setUpdateLatestActiveTimer] = useState<any | null>(null)
    const [selectedStone, setSelectedStone] = useState<Stone | null>(null)
    const [visibleStones, setVisibleStones] = useState(defaultStones)
    const [actualStones, setActualStones] = useState(defaultStones)
    const [initialStones, setInitialStones] = useState(defaultStones)
    const [validPathInSelection, setValidPathInSelection] = useState(false)
    const [whichTeamIsOn, setWhichTeamIsOn] = useState(2)
    const [winnerTeam, setWinnerTeam] = useState<number | null>(null)
    const [snackbarIsOpen, setSnackbarIsOpen] = useState(false)
    const [snackbarMessage, setSnackbarMessage] = useState('')
    const [myteam, setMyTeam] = useState([1,2])
    const [AImatch, setAImatch] = useState(false) // playing against the computer?
    // onlineGameId: if not null, we're playing online and contains game ID in online DB
    const [onlineGameId, setOnlineGameId] = useState<string | null>(null)
    const [opponentName, setOpponentName] = useState<string | null>(null)
    const [showThinkingIndicator, setShowThinkingIndicator] = useState(false)
    const [showMenu, setShowMenu] = useState(isDev ? false : true)
    const [latestMultiplayerUpdate, setLatestMultiplayerUpdate] = useState<any | null>(null)

    const handleSnackbarClose = () => {
        setSnackbarIsOpen(false)
    }

    const showSnackbar = (text: string) => {
        setSnackbarMessage(text)
        setSnackbarIsOpen(true)
    }

    const saveGame = (gameName: string) => {
        saveGameToLocalStroage(gameName, actualStones, whichTeamIsOn)
        showSnackbar('Game saved as "' + gameName + '"!')
        setShowMenu(false)
    }

    const loadGame = (gameName: string) => {
        const newgame: savedGame | undefined = loadGameFromLocalStroage(gameName)
        if (newgame === undefined) return

        setActualStones(newgame.stones)
        setInitialStones(newgame.stones)
        setVisibleStones(newgame.stones)
        setWhichTeamIsOn(newgame.whichTeamIsOn)
        setShowMenu(false)
        showSnackbar('Game "' + gameName + '" loaded!')
        setShowThinkingIndicator(false)
        setOpponentName(null)
        setOnlineGameId(null)
    }

    const restartGame = async (
        stones: number[][],
        isAIgame: boolean,
        myTeam: number,
        isRestart: boolean,
        gameId: string | null
    ) => {
        setAImatch(isAIgame)
        if (isAIgame || gameId !== null) {
            setMyTeam([myTeam])
        } else {
            // we're playing locally, were allowed to move both teams
            setMyTeam([1, 2])
        }
        setSelectedStone(null)
        setActualStones(stones)
        setVisibleStones(stones)
        setInitialStones(stones)
        setValidPathInSelection(false)
        setWinnerTeam(null)
        setShowThinkingIndicator(false)
        props.setBgColor(" bg-rose-50")
        setWhichTeamIsOn(2)
        setTakenPiecesGreen(0)
        setTakenPiecesRed(0)

        if (isAIgame && myTeam == 1) {
            // AI starts!
            generateAImove(stones, 2)
        }

        if (gameId !== null && myTeam == 1) {
            // online opponent starts!
            setShowThinkingIndicator(true)
        }

        if (gameId === null) setOpponentName(null)
        setOnlineGameId(gameId)
    }

    const handleMultiplayerMove = (moves: any) => {
        // we received a move from DB... 
        const latestMove = moves[moves.length - 1]

        if (latestMove.movingTeam == myteam[0]) return // we received our own move

        // ok, the opponent moved!
        const fromStone: Stone = { row: latestMove.fromRow, col: latestMove.fromCol, value: actualStones[latestMove.fromRow][latestMove.fromCol] }
        const toStone: Stone = { row: latestMove.toRow, col: latestMove.toCol, value: actualStones[latestMove.toRow][latestMove.toCol] }
        // safety check: is move legal?

        if (!isValidMove(actualStones, fromStone, toStone)) return
        console.log('I received a valid move from the opponent and am moving the stone.')
        moveStone(actualStones, fromStone, toStone)

        // notify user
        props.setTitleAppendix("// you're up!")
        var snd = new Audio("/msg.wav");
        snd.play();
    }

    const handleOpponent = (opponent: string) => {
        // see if a new opponent joined
        if (opponentName === "" && (opponent.length > 0)) {
            // yeah, someone joined!
            console.log('Opponent joined')
            showSnackbar(opponent + ' joined the game!')
            if (myteam[0] === 2) setShowThinkingIndicator(false)
            setWhichTeamIsOn(2) // red begins
            setOpponentName(opponent)
        }
    }

    // hook to handle updates from DB that were streamed
    useEffect(() => {
        if (!latestMultiplayerUpdate || !onlineGameId) return

        // all good!
        if (latestMultiplayerUpdate.moves) handleMultiplayerMove(latestMultiplayerUpdate.moves)
        if (latestMultiplayerUpdate.opponent) handleOpponent(latestMultiplayerUpdate.opponent)
    }, [latestMultiplayerUpdate])

    useEffect(() => {
        if (onlineGameId === null) return
        if (opponentName === "") {
            // looks like we started a game and are waiting on an opponent... set thinking indicator
            console.log('Waiting for opponent...')
            setShowThinkingIndicator(true)
            setWhichTeamIsOn(-1)

            const i = setInterval(() => {
                // let the outside know we're still here every 30sec
                updateLatestActive(onlineGameId)
            }, 1 * 1000)
            setUpdateLatestActiveTimer(i)
        } else {
            // someone has joined
            clearInterval(updateLatestActiveTimer)
        }
    }, [opponentName])

    const handleWin = (whichTeam: number) => {
        setWinnerTeam(whichTeam)
    }

    const moveStone = (stones: number[][], from: Stone, to: Stone) => {
        var newStones = getStonesAfterMovement(stones, from, to)

        const afterBeating = checkBeating(newStones, whichTeamIsOn, to)
        if (afterBeating === 2) {
            // team 2 (red) won - they beat the king!
            handleWin(2)
        } else if (Array.isArray(afterBeating)) {
            newStones = afterBeating
        }

        if (onlineGameId && (whichTeamIsOn == myteam[0])) {
            console.log('Sending my move to the server...')
            props.setTitleAppendix("")
            sendMoveToServer(onlineGameId, myteam, from, to)
            setShowThinkingIndicator(true)
        }

        if (onlineGameId && (whichTeamIsOn != myteam[0])) {
            // opponent made a move!
            setShowThinkingIndicator(false)
        }

        setActualStones(newStones)
        setVisibleStones(newStones)
        setValidPathInSelection(false)
        setSelectedStone(null)

        const originalRedPieces = initialStones.map(r => r.filter(i => i == 2).length).reduce((a, b) => a + b)
        const redPiecesInGame = newStones.map(r => r.filter(i => i == 2).length).reduce((a, b) => a + b)
        setTakenPiecesRed(originalRedPieces - redPiecesInGame)
        const originalGreenPieces = initialStones.map(r => r.filter(i => i == 1).length).reduce((a, b) => a + b)
        const greenPiecesInGame = newStones.map(r => r.filter(i => i == 1).length).reduce((a, b) => a + b)
        setTakenPiecesGreen(originalGreenPieces - greenPiecesInGame)

        if (isKingInCorner(newStones)) {
            handleWin(1)
        } else {
            // next player is up!
            setWhichTeamIsOn(whichTeamIsOn == 1 ? 2 : 1)
        }
    }

    const handleStoneClicked = (clickedStone: Stone) => {
        if (selectedStone) {
            // we already selected a stone 
            // ergo we're trying to move

            const path = isValidMove(actualStones, selectedStone, clickedStone)
            if (path === false) { // invalid move!
                setSelectedStone(null)
                return
            }

            moveStone(actualStones, selectedStone, clickedStone)
        } else {
            // we clicked a stone in order to move it!
            if (!clickedStone.value || clickedStone.value <= 0) return
            if (whichTeamIsOn == clickedStone.value ||
                (whichTeamIsOn == 1 && clickedStone.value == 3)) {
                // check if the stone is ours...
                if (
                    (
                        !myteam.includes(2) && (clickedStone.value == 2)
                    )
                    ||
                    (
                        !myteam.includes(1) && (clickedStone.value == 1 || clickedStone.value == 3)
                    )
                ) return // illegally selected stone

                // we selected which stone we want to move
                setSelectedStone(clickedStone)
            }
        }
    }

    const handleMouseOver = (stone: Stone) => {
        if (selectedStone) {
            // we're considering a move!
            const path = isValidMove(actualStones, selectedStone, stone)

            // generate new stone-layout
            // force deep copy
            var tmpStones = actualStones.map(
                r => r.map(i => i)
            )
            if (path !== false) {
                // update stones:
                // set mouseover stones to -1
                // to highlight them
                path.map(s => {
                    tmpStones[s.row][s.col] = -1
                })
                // also, signify that it's a valid path so
                // mouseover css class is correct in <Board>
                setValidPathInSelection(true)
            } else {
                setValidPathInSelection(false)
            }

            setVisibleStones(tmpStones)
        }
    }

    const generateAImove = (stones: number[][], curTeam: number) => {
        setShowThinkingIndicator(true)
        // small timeout to allow for finishing of rendering
        setTimeout(() => {
            const aiMove = AIGetNextMove(stones, curTeam)
            if (aiMove === false) {
                // AI gave up!
                handleWin(myteam[0])
            } else if (typeof (aiMove) != "boolean") {
                moveStone(stones, aiMove.from, aiMove.to)
                setShowThinkingIndicator(false)
            }
        }, 200)
    }

    // listen to change in who player is on
    useEffect(() => {
        if (winnerTeam !== null) return // if the game is already over, no need to do anything
        if (whichTeamIsOn == 1) props.setBgColor(" bg-emerald-50")
        if (whichTeamIsOn == 2) props.setBgColor(" bg-rose-50")

        // if it's an AI match, generate next AI move
        if (AImatch && !myteam.includes(whichTeamIsOn)) {
            generateAImove(actualStones, whichTeamIsOn)
        }
    }, [whichTeamIsOn])

    const startTutorial = () => {
        setShowTutorial(true)
        setMyTeam([-1])
    }

    const finishTutorial = () => {
        setShowTutorial(false)
        // start a basic game after tutorial
        restartGame(brandubh, false, 2, false, null)
    }

    return (
        <div className={"h-screen w-screen " + mainFont.className}>
            <MultiplayerListener onlineGameId={onlineGameId} handleUpdate={setLatestMultiplayerUpdate} />
            <Snackbar
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                open={snackbarIsOpen}
                autoHideDuration={3000}
                onClose={handleSnackbarClose}
            >
                <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
            <Menu
                showMenu={showMenu}
                setShowMenu={setShowMenu}
                restartGame={restartGame}
                saveGame={(gameName: string) => saveGame(gameName)}
                loadGame={(gameName: string) => loadGame(gameName)}
                startTutorial={startTutorial}
                setOpponentName={setOpponentName}
            />
            <div className="flex h-full flex-col">
                <div className="shrink">
                    <div className={showTutorial ? '' : 'hidden'}>
                        <Tutorial setStones={setVisibleStones} finishTutorial={finishTutorial} />
                    </div>
                    <div className={`h-44 text-6xl lg:text-8xl text-center p-5
                                bg-gradient-to-b from-white ` + (whichTeamIsOn == 1 ? 'bg-emerald-50' : 'bg-rose-50')} >
                        <a href="#" onClick={() => setShowMenu(true)} className={'text-gray-600 drop-shadow-lg ' + titleFont.className}>
                            hnefatafl
                        </a>
                        <div className="mt-4 text-base">
                            Taken pieces: Red {takenPiecesRed}, Green {takenPiecesGreen}
                            {opponentName !== null ?
                                (
                                    opponentName.length == 0 ? ' // Waiting for opponent...' :
                                        <>
                                            &nbsp;// Online game against {opponentName}
                                        </>
                                )
                                : ''}
                        </div>
                    </div>
                </div>
                <div className="grow">
                    <div className={"grid w-full h-full justify-center duration-500 " +
                        (showThinkingIndicator ? ' opacity-50' : '') + 
                        (showTutorial ? 'mt-14' : '')}>
                        <div 
                            className="aspect-square p-3" 
                            style={{
                                width: '100vh',
                                maxWidth: 'min(100vw, 600px)'
                            }}
                        >
                            <Board
                                stones={visibleStones}
                                myteam={myteam}
                                handleStoneClicked={handleStoneClicked}
                                handleMouseOver={handleMouseOver}
                                validPathInSelection={validPathInSelection}
                                selectedStone={selectedStone}
                                whichTeamIsOn={whichTeamIsOn}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div className={
                (winnerTeam ? '' : 'hidden ') +
                `
                bg-gray-200
                bg-opacity-20
                fixed top-0 right-0 left-0 bottom-0
                w-screen h-screen
                backdrop-blur-lg
                z-50 
                `}>
                <div className="grid place-content-center h-full w-full text-6xl text-center">
                    <p>
                        {winnerTeam == 2 ? 'RED' : 'GREEN'} has won!
                    </p>
                    <p className="my-20">
                        <a href="#" onClick={() => restartGame(initialStones, AImatch, myteam[0], true, null)}>Restart game</a>
                    </p>
                </div>
            </div>
        </div>
    )
}

