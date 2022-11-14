import { Stone } from './stone'

export function isKingInCorner(stones: number[][]) {
    const kingPos: Stone = getKingPos(stones)
    if (
        (kingPos.row == 0 && kingPos.col == 0) ||
        (kingPos.row == 0 && kingPos.col == stones.length - 1) ||
        (kingPos.row == stones.length - 1 && kingPos.col == 0) ||
        (kingPos.row == stones.length - 1 && kingPos.col == stones.length - 1)
    ) {
        // king has won!
        return (true)
    } else {
        return (false)
    }
}

export function checkBeating(stones: number[][], whichTeamIsOn: number, newStone: Stone) {
    const kingPos: Stone = getKingPos(stones)

    if(isKingInCorner(stones)) return(1)
    
    var afterBeating: number[][] | number
    afterBeating = checkSimpleBeating(stones, whichTeamIsOn, newStone)
    afterBeating = checkBeatingWithCorner(stones, whichTeamIsOn, newStone)
    afterBeating = checkBeatingWithEmptyThrone(stones, whichTeamIsOn, newStone)
    if (whichTeamIsOn == 2) afterBeating = checkKingNew(afterBeating, kingPos)

    return (afterBeating)
}

export function getKingPos(stones: number[][]) {
    var kingPos: Stone = { row: -1, col: -1 } // Default

    stones.map((r, rid) => r.map((i, cid) => {
        if (i == 3) kingPos = { row: rid, col: cid }
    }))

    return (kingPos)
}

// if the king is surrounded by 3 sides and the throne, he's done
function checkKingThreeSidesAndThrone(stones: number[][] | number, kingPos: Stone) {
    if (!Array.isArray(stones)) return (stones) // already beaten
    
    // above throne
    if (kingPos.row == (stones.length - 1) / 2 - 1 &&
        kingPos.col == (stones.length - 1) / 2 &&
        stones[kingPos.row - 1][kingPos.col] == 2 &&
        stones[kingPos.row][kingPos.col - 1] == 2 &&
        stones[kingPos.row][kingPos.col + 1] == 2) {
        return (2) // team 2 has won!
    }

    // below throne
    if (kingPos.row == (stones.length - 1) / 2 + 1 &&
        kingPos.col == (stones.length - 1) / 2 &&
        stones[kingPos.row + 1][kingPos.col] == 2 &&
        stones[kingPos.row][kingPos.col - 1] == 2 &&
        stones[kingPos.row][kingPos.col + 1] == 2) {
        return (2) // team 2 has won!
    }

    // left of throne
    if (kingPos.col == (stones.length - 1) / 2 - 1 &&
        kingPos.row == (stones.length - 1) / 2 &&
        stones[kingPos.row - 1][kingPos.col] == 2 &&
        stones[kingPos.row + 1][kingPos.col] == 2 &&
        stones[kingPos.row][kingPos.col - 1] == 2) {
        return (2) // team 2 has won!
    }

    // right of throne
    if (kingPos.col == (stones.length - 1) / 2 + 1 &&
        kingPos.row == (stones.length - 1) / 2 &&
        stones[kingPos.row - 1][kingPos.col] == 2 &&
        stones[kingPos.row + 1][kingPos.col] == 2 &&
        stones[kingPos.row][kingPos.col + 1] == 2) {
        return (2) // team 2 has won!
    }

    return (stones)
}

// if the king is surrounded by 4 sides, he's done
function checkKingFourSides(stones: number[][], kingPos: Stone) {

    // if on the edge, king is not touched by 4-side-rule
    if (kingPos.row == 0 || kingPos.row == stones.length - 1 ||
        kingPos.col == 0 || kingPos.col == stones.length - 1) return (stones)

    // check if surrounded on all sides
    if (stones[kingPos.row - 1][kingPos.col] == 2 &&
        stones[kingPos.row + 1][kingPos.col] == 2 &&
        stones[kingPos.row][kingPos.col - 1] == 2 &&
        stones[kingPos.row][kingPos.col + 1] == 2) {
        return (2) // team 2 has won!
    }

    return (stones)
}

// if the king is surrounded by 4 sides, he's done
function checkKingNew(stones: number[][], kingPos: Stone) {
    var thronePos: Stone = {
        row: (stones.length - 1) / 2,
        col: (stones.length - 1) / 2
    }

    // if on the edge, king is not touched by 4-side-rule
    if (kingPos.row == 0 || kingPos.row == stones.length - 1 ||
        kingPos.col == 0 || kingPos.col == stones.length - 1) return (stones)

    
    var tmpthronePosVal = stones[thronePos.row][thronePos.col]
    stones[thronePos.row][thronePos.col] = 2

    /* DEPRACATED // check if surrounded on all sides
    if ((stones[kingPos.row - 1][kingPos.col] == 2 || (kingPos.row - 1 == thronePos.row && kingPos.col == thronePos.col)) &&
        (stones[kingPos.row + 1][kingPos.col] == 2 || (kingPos.row + 1 == thronePos.row && kingPos.col == thronePos.col)) &&
        (stones[kingPos.row][kingPos.col - 1] == 2 || (kingPos.row == thronePos.row && kingPos.col - 1 == thronePos.col)) &&
        (stones[kingPos.row][kingPos.col + 1] == 2 || (kingPos.row == thronePos.row && kingPos.col + 1 == thronePos.col))) {
        return (2) // team 2 has won!
    } */

    if (stones[kingPos.row - 1][kingPos.col] == 2 &&
        stones[kingPos.row + 1][kingPos.col] == 2 &&
        stones[kingPos.row][kingPos.col - 1] == 2 &&
        stones[kingPos.row][kingPos.col + 1] == 2) {
            stones[thronePos.row][thronePos.col] = tmpthronePosVal
            return (2) // team 2 has won!
    }
    stones[thronePos.row][thronePos.col] = tmpthronePosVal
    return (stones)
}


// advanced case: our move places an enemy stone between empty throne and us
// check in all 4 directions if step1 is enemy and step2 is empty throne
// if so, remove enemy stone
function checkBeatingWithEmptyThrone(stones: number[][], whichTeamIsOn: number, newStone: Stone) {
    if (newStone.value === null) return (stones)

    const enemy = whichTeamIsOn == 1 ? 2 : 1

    // up
    if (newStone.row > 1) {
        if (stones[newStone.row - 1][newStone.col] == enemy &&
            stones[newStone.row - 2][newStone.col] == 0 && 
            newStone.row - 2 == (stones.length - 1) / 2 && newStone.col == (stones.length - 1) / 2) {

            stones[newStone.row - 1][newStone.col] = 0
        }
    }
    // down
    if (newStone.row < stones.length - 2) {
        if (stones[newStone.row + 1][newStone.col] == enemy &&
            stones[newStone.row + 2][newStone.col] == 0 && 
            newStone.row + 2 == (stones.length - 1) / 2 && newStone.col == (stones.length - 1) / 2) {

            stones[newStone.row + 1][newStone.col] = 0
        }
    }
    // left
    if (newStone.col > 1) {
        if (stones[newStone.row][newStone.col - 1] == enemy &&
            stones[newStone.row][newStone.col - 2] == 0 && 
            newStone.col - 2 == (stones.length - 1) / 2 && newStone.row == (stones.length - 1) / 2) {

            stones[newStone.row][newStone.col - 1] = 0
        }
    }
    // right
    if (newStone.col < stones.length - 2) {
        if (stones[newStone.row][newStone.col + 1] == enemy &&
            stones[newStone.row][newStone.col + 2] == 0 && 
            newStone.col + 2 == (stones.length - 1) / 2 && newStone.row == (stones.length - 1) / 2) {

            stones[newStone.row][newStone.col + 1] = 0
        }
    }

    return (stones)
}

// advanced case: our move places an enemy stone between cornr and us
// check in all 4 directions if step1 is enemy and step2 is corner
// if so, remove enemy stone
function checkBeatingWithCorner(stones: number[][], whichTeamIsOn: number, newStone: Stone) {
    if (newStone.value === null) return (stones)

    const enemy = whichTeamIsOn == 1 ? 2 : 1
    
    // up
    if (newStone.row == 2) {
        if (stones[newStone.row - 1][newStone.col] == enemy &&
            stones[newStone.row - 2][newStone.col] == 0 && 
            (newStone.col == 0 || newStone.col == stones.length-1)) {

            stones[newStone.row - 1][newStone.col] = 0
        }
    }
    // down
    if (newStone.row == stones.length - 3) {
        if (stones[newStone.row + 1][newStone.col] == enemy &&
            stones[newStone.row + 2][newStone.col] == 0 && 
            (newStone.col == 0 || newStone.col == stones.length-1)) {

            stones[newStone.row + 1][newStone.col] = 0
        }
    }
    // left
    if (newStone.col - 2 == 0) {
        if (stones[newStone.row][newStone.col - 1] == enemy &&
            stones[newStone.row][newStone.col - 2] == 0 && 
            newStone.col - 2 == 0 && (newStone.row == 0 || newStone.row == stones.length-1)) {

            stones[newStone.row][newStone.col - 1] = 0
        }
    }
    // right
    if (newStone.col == stones.length - 3) {
        if (stones[newStone.row][newStone.col + 1] == enemy &&
            stones[newStone.row][newStone.col + 2] == 0 && 
            (newStone.row == 0 || newStone.row == stones.length-1)) {

            stones[newStone.row][newStone.col + 1] = 0
        }
    }

    return (stones)
}

// simple case: our move encapsuled an enemy stone
// check in all 4 directions if step1 is enemy and step2 is friendly
// if so, remove enemy stone
function checkSimpleBeating(stones: number[][], whichTeamIsOn: number, newStone: Stone) {
    if (newStone.value === null) return (stones)

    const enemy = whichTeamIsOn == 1 ? 2 : 1
    const friendly = whichTeamIsOn

    // up
    if (newStone.row > 1) {
        if (stones[newStone.row - 1][newStone.col] == enemy &&
            stones[newStone.row - 2][newStone.col] == friendly) {

            stones[newStone.row - 1][newStone.col] = 0
        }
    }
    // down
    if (newStone.row < stones.length - 2) {
        if (stones[newStone.row + 1][newStone.col] == enemy &&
            stones[newStone.row + 2][newStone.col] == friendly) {

            stones[newStone.row + 1][newStone.col] = 0
        }
    }
    // left
    if (newStone.col > 1) {
        if (stones[newStone.row][newStone.col - 1] == enemy &&
            stones[newStone.row][newStone.col - 2] == friendly) {

            stones[newStone.row][newStone.col - 1] = 0
        }
    }
    // right
    if (newStone.col < stones.length - 2) {
        if (stones[newStone.row][newStone.col + 1] == enemy &&
            stones[newStone.row][newStone.col + 2] == friendly) {

            stones[newStone.row][newStone.col + 1] = 0
        }
    }

    return (stones)
}