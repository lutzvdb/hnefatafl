import { Stone } from "./stone";

export function getPath(from: Stone, to: Stone) {
    var intersectingCells: Stone[]
    if(to.col == from.col) {
        // row is changing
        const stepLength = Math.abs(to.row - from.row)
        const direction = to.row > from.row ? +1 : -1
        intersectingCells = Array.from({length: stepLength}, (x, i) => i).map(
            i => { return({
                row: from.row + (i + 1) * direction, 
                col: to.col
            })}
        )
    } else {
        // col is changing
        const stepLength = Math.abs(to.col - from.col)
        const direction = to.col > from.col ? +1 : -1
        intersectingCells = Array.from({length: stepLength}, (x, i) => i).map(
            i => { return({
                row: to.row, 
                col: from.col + (i + 1) * direction
            })}
        )
    }

    return intersectingCells;
}

export function moveStone(stones: number[][], from: Stone, to: Stone) {
    const newStones = stones.map(
        (row, rid) => row.map(
            (col, cid) => {
                if(!from.value) return(0) // just for type deduction
                if(rid == from.row && cid == from.col) return(0)
                if(rid == to.row && cid == to.col) return(from.value)
                return(col)
            }
        )
    )

    return(newStones)
}