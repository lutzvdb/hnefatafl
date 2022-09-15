import Board from '../components/board'
import { useEffect, useState } from 'react'
import { isValidMove } from '../lib/moveValidity'
import { defaultStones } from '../lib/initialSetup'
import { Stone } from '../lib/stone'
import { moveStone } from '../lib/path'
import { checkBeating } from '../lib/beating'

export default function Game(props: {
    setBgColor: Function
}) {
    const [selectedStone, setSelectedStone] = useState<Stone | null>(null)
    const [visibleStones, setVisibleStones] = useState(defaultStones)
    const [actualStones, setActualStones] = useState(defaultStones)
    const [validPathInSelection, setValidPathInSelection] = useState(false)
    const [whichTeamIsOn, setWhichTeamIsOn] = useState(2)
    const [winnerTeam, setWinnerTeam] = useState<number | null>(null)

    const myteam = [1, 2]

    const restartGame = () => {
        setSelectedStone(null)
        setVisibleStones(defaultStones)
        setActualStones(defaultStones)
        setValidPathInSelection(false)
        setWhichTeamIsOn(2)
        setWinnerTeam(null)
    }

    const handleWin = (whichTeam: number) => {
        setWinnerTeam(whichTeam)
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

            var newStones = moveStone(actualStones, selectedStone, clickedStone)
            const afterBeating = checkBeating(newStones, whichTeamIsOn, clickedStone)
            if (afterBeating === 2) {
                // team 2 (red) won - they beat the king!
                handleWin(2)
            } else if (Array.isArray(afterBeating)) {
                newStones = afterBeating
            }

            setActualStones(newStones)
            setVisibleStones(newStones)
            setValidPathInSelection(false)
            setSelectedStone(null)

            if (selectedStone.value == 3 &&
                (
                    (clickedStone.row == 0 && clickedStone.col == 0) ||
                    (clickedStone.row == 0 && clickedStone.col == newStones.length - 1) ||
                    (clickedStone.row == newStones.length - 1 && clickedStone.col == 0) ||
                    (clickedStone.row == newStones.length - 1 && clickedStone.col == newStones.length - 1)
                )
            ) {
                handleWin(1)
                return
            }

            // next player is up!
            setWhichTeamIsOn(whichTeamIsOn == 1 ? 2 : 1)
        } else {
            if (!clickedStone.value || clickedStone.value <= 0) return
            if (whichTeamIsOn == clickedStone.value ||
                (whichTeamIsOn == 1 && clickedStone.value == 3)) {
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

    useEffect(() => {
        if (whichTeamIsOn == 1) props.setBgColor(" bg-emerald-50")
        if (whichTeamIsOn == 2) props.setBgColor(" bg-rose-50")
    }, [whichTeamIsOn])

    return (
        <>
            <div className="grid place-content-center mt-5">
                <div className="aspect-square  
              p-3 md:p-5 lg:p-5 xl:p-5 2xl:p-5
      " style={{
                        width: '100vh',
                        maxWidth: 'min(100vw, 800px)'
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
                        Team {winnerTeam == 2 ? 'RED' : 'GREEN'} has won!
                    </p>
                    <p className="my-20">
                        <a href="#" onClick={restartGame}>Restart game</a>
                    </p>
                </div>
            </div>
        </>
    )
}