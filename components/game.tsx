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
    const [selectedStone, setSelectedStone] = useState<Stone|null>(null)
    const [visibleStones, setVisibleStones] = useState(defaultStones)
    const [actualStones, setActualStones] = useState(defaultStones)
    const [validPathInSelection, setValidPathInSelection] = useState(false)
    const [whichTeamIsOn, setWhichTeamIsOn] = useState(2)

    const myteam = [1, 2]

    const handleStoneClicked = (clickedStone: Stone) => {
        if(selectedStone) {
            // we already selected a stone 
            // ergo we're trying to move

            const path = isValidMove(actualStones, selectedStone, clickedStone)
            if(path === false) { // invalid move!
                setSelectedStone(null)
                return 
            }

            var newStones = moveStone(actualStones, selectedStone, clickedStone)
            newStones = checkBeating(newStones, clickedStone)
            
            setActualStones(newStones)
            setVisibleStones(newStones)
            setValidPathInSelection(false)
            setSelectedStone(null)
            setWhichTeamIsOn(whichTeamIsOn == 1 ? 2 : 1)
        } else {
            if(!clickedStone.value || clickedStone.value <= 0) return
            if(whichTeamIsOn == clickedStone.value ||
                (whichTeamIsOn == 1 && clickedStone.value == 3)) {
                // we selected which stone we want to move
                setSelectedStone(clickedStone)
            }
        }
    }

    const handleMouseOver = (stone: Stone) => {
        if(selectedStone) {
            // we're considering a move!
            const path = isValidMove(actualStones, selectedStone, stone)

            // generate new stone-layout
            // force deep copy
            var tmpStones = actualStones.map(
                r => r.map(i => i)
            )
            if(path !== false) {
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
        if(whichTeamIsOn == 1) props.setBgColor(" bg-emerald-50")
        if(whichTeamIsOn == 2) props.setBgColor(" bg-rose-50")
    }, [whichTeamIsOn])

    return (
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

    )
}