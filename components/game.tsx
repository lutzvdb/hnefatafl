import Board from '../components/board'
import Menu from '../components/menu'
import { useEffect, useState } from 'react'
import { isValidMove } from '../lib/moveValidity'
import { defaultStones } from '../lib/initialSetup'
import { Stone } from '../lib/stone'
import { getStonesAfterMovement } from '../lib/path'
import { checkBeating, isKingInCorner } from '../lib/beating'
import { saveGameToLocalStroage, loadGameFromLocalStroage, savedGame } from '../lib/savegame'
import { AIGetNextMove } from '../lib/ai/move'
import { useMultiplayerListener } from '../hooks/useMultiplayerListener'

import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { BSON } from 'realm-web'

export default function Game(props: {
    setBgColor: Function
}) {
    const isDev = process.env.NODE_ENV === 'development'
    const [selectedStone, setSelectedStone] = useState<Stone | null>(null)
    const [visibleStones, setVisibleStones] = useState(defaultStones)
    const [actualStones, setActualStones] = useState(defaultStones)
    const [initialStones, setInitialStones] = useState(defaultStones)
    const [validPathInSelection, setValidPathInSelection] = useState(false)
    const [whichTeamIsOn, setWhichTeamIsOn] = useState(2)
    const [winnerTeam, setWinnerTeam] = useState<number | null>(null)
    const [snackbarIsOpen, setSnackbarIsOpen] = useState(false)
    const [snackbarMessage, setSnackbarMessage] = useState('')
    const [myteam, setMyTeam] = useState([2])
    const [AImatch, setAImatch] = useState(true) // playing against the computer?
    // onlineGameId: if not null, we're playing online and contains game ID in online DB
    const [onlineGameId, setOnlineGameId] = useState<string | null>(null)
    const [opponentName, setOpponentName] = useState<string | null>(null)
    const [showThinkingIndicator, setShowThinkingIndicator] = useState(false)
    const [showMenu, setShowMenu] = useState(isDev ? true : true)
    const [latestMultiplayerUpdate, setLatestMultiplayerUpdate] = useState<any | null>(null)

    const handleSnackbarClose = () => {
        setSnackbarIsOpen(false)
    }

    const saveGame = (gameName: string) => {
        saveGameToLocalStroage(gameName, actualStones, whichTeamIsOn)

        setShowMenu(false)
        setSnackbarMessage('Game saved as "' + gameName + '"!')
        setSnackbarIsOpen(true)
    }

    const loadGame = (gameName: string) => {
        const newgame: savedGame | undefined = loadGameFromLocalStroage(gameName)
        if (newgame === undefined) return

        setActualStones(newgame.stones)
        setInitialStones(newgame.stones)
        setVisibleStones(newgame.stones)
        setWhichTeamIsOn(newgame.whichTeamIsOn)
        setShowMenu(false)
        setSnackbarMessage('Game "' + gameName + '" loaded!')
        setSnackbarIsOpen(true)
        setShowThinkingIndicator(false)
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
        if (!isRestart) setInitialStones(stones)
        setValidPathInSelection(false)
        setWinnerTeam(null)
        setShowThinkingIndicator(false)
        setWhichTeamIsOn(2)

        if (isAIgame && myTeam == 1) {
            // AI starts!
            generateAImove(stones, 2)
        }

        if (gameId !== null && myTeam == 1) {
            // online opponent starts!
            setShowThinkingIndicator(true)
        }

        if (gameId) {
            setOnlineGameId(gameId)
        }
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
    }

    const handleOpponent = (opponent: string) => {
        // see if a new opponent joined
        if (opponentName === "" && (opponent.length > 0)) {
            console.log('Opponent joined')
            // yeah, someone joined!
            if(myteam[0] === 2) setShowThinkingIndicator(false)
            setWhichTeamIsOn(2) // red begins
            setOpponentName(opponent)
        }
    }

    // hook to handle updates from DB
    useEffect(() => {
        if(!latestMultiplayerUpdate) return 
        const update = latestMultiplayerUpdate

        // we were streamed an update from mongoDB!
        if (!update) return
        if (!onlineGameId) return

        // check to see if it is our ID! We may be subscribed to old games...
        const myId = new BSON.ObjectId(onlineGameId)
        if (update._id.id.toString() !== myId.id.toString()) return

        // all good!
        if (update.moves) handleMultiplayerMove(update.moves)
        if (update.opponent) handleOpponent(update.opponent)
    }, [latestMultiplayerUpdate])

    useEffect(() => {
        if (!onlineGameId) return
        // start listening for opponent moves
        useMultiplayerListener(onlineGameId, (update: any) => setLatestMultiplayerUpdate(update))
    }, [onlineGameId])

    useEffect(() => {
        if (onlineGameId === null) return
        if (opponentName === "") {
            // looks like we started a game and are waiting on an opponent... set thinking indicator
            console.log('Waiting for opponent...')
            setShowThinkingIndicator(true)
            setWhichTeamIsOn(-1)
        }
    }, [opponentName])

    const handleWin = (whichTeam: number) => {
        setWinnerTeam(whichTeam)
    }

    const sendMoveToServer = (from: Stone, to: Stone) => {
        // we did a move.. send our move to the server so the opponent can see it
        if (!onlineGameId) return

        fetch('/api/move', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                gameId: onlineGameId,
                movingTeam: myteam[0],
                fromRow: from.row,
                fromCol: from.col,
                toRow: to.row,
                toCol: to.col
            })
        })
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
            sendMoveToServer(from, to)
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

        if (isKingInCorner(newStones)) {
            handleWin(1)
        }

        // next player is up!
        setWhichTeamIsOn(whichTeamIsOn == 1 ? 2 : 1)
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

    return (
        <>
            <Snackbar
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                open={snackbarIsOpen}
                autoHideDuration={2000}
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
                setOpponentName={setOpponentName}
            />
            <div className={`text-6xl lg:text-8xl xl:text-8xl 2xl:text-8xl text-center p-5
                            bg-gradient-to-b from-white ` + (whichTeamIsOn == 1 ? 'bg-emerald-50' : 'bg-rose-50')} >
                <a href="#" onClick={() => setShowMenu(true)}>
                    hnefatafl
                </a>
                {opponentName !== null ?
                    <div className="mt-4 text-base" style={{ fontFamily: 'Roboto Mono' }}>
                        {opponentName.length == 0 ? 'Warte auf Gegner...' :
                            <>
                                Online-Spiel gegen {opponentName}
                            </>}
                    </div>
                    : ''}
            </div>
            <div className={"grid place-content-center mt-5 duration-200 " + (showThinkingIndicator ? ' opacity-50' : '')}>
                <div className="aspect-square p-3" style={{
                    width: '100vh',
                    maxWidth: 'min(100vw, 650px)'
                }}>
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
        </>
    )
}

