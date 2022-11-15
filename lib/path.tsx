import { Stone } from "./stone";

export function getPath(from: Stone, to: Stone) {
    var intersectingCells: Stone[]
    if (to.col == from.col) {
        // row is changing
        const stepLength = Math.abs(to.row - from.row)
        const direction = to.row > from.row ? +1 : -1
        intersectingCells = Array.from({ length: stepLength }, (x, i) => i).map(
            i => {
                return ({
                    row: from.row + (i + 1) * direction,
                    col: to.col
                })
            }
        )
    } else {
        // col is changing
        const stepLength = Math.abs(to.col - from.col)
        const direction = to.col > from.col ? +1 : -1
        intersectingCells = Array.from({ length: stepLength }, (x, i) => i).map(
            i => {
                return ({
                    row: to.row,
                    col: from.col + (i + 1) * direction
                })
            }
        )
    }

    return intersectingCells;
}

// creates a true deep copy for a 2D array
function getTrueCopyFor2DArray(arr: any[]) {
    var len = arr.length
    var copy = new Array(len)
    for (var i=0; i<len; ++i) copy[i] = arr[i].slice(0)
    
    return(copy)
}

export function getStonesAfterMovement(stones: number[][], from: Stone, to: Stone) {
    if (from.value === undefined) return (stones)
    const stonesNew: number[][] = getTrueCopyFor2DArray(stones)
    stonesNew[from.row][from.col] = 0
    stonesNew[to.row][to.col] = from.value

    return (stonesNew)
}