import { Stone } from './stone'

export function checkBeating(stones: number[][], whichTeamIsOn: number, newStone: Stone) {
    var afterBeating: number[][] | number
    afterBeating = checkSimpleBeating(stones, whichTeamIsOn, newStone)
    afterBeating = checkKingFourSides(afterBeating)
    afterBeating = checkKingEdge(afterBeating)

    return (afterBeating)
}

function getKingPos(stones: number[][]) {
    var kingPos: Stone = { row: 4, col: 4 } // Default
    stones.map((r, rid) => r.map((i, cid) => {
        if (i == 3) kingPos = { row: rid, col: cid }
    }))

    return (kingPos)
}

// if king is at the edge, has to be surrounded on 3 sides to lose
function checkKingEdge(stones: number[][]) {
    const kingPos: Stone = getKingPos(stones)

    // if on the edge, king is not touched by this rule
    if (kingPos.row == 0 &&
        stones[kingPos.row + 1][kingPos.col] == 2 &&
        stones[kingPos.row][kingPos.col - 1] == 2 &&
        stones[kingPos.row][kingPos.col + 1] == 2) {
        return (2) // team 2 has won!
    }

    if (kingPos.row == stones.length - 1 &&
        stones[kingPos.row - 1][kingPos.col] == 2 &&
        stones[kingPos.row][kingPos.col - 1] == 2 &&
        stones[kingPos.row][kingPos.col + 1] == 2) {
        return (2) // team 2 has won!
    }

    if (kingPos.col == 0 &&
        stones[kingPos.row - 1][kingPos.col] == 2 &&
        stones[kingPos.row + 1][kingPos.col] == 2 &&
        stones[kingPos.row][kingPos.col + 1] == 2) {
        return (2) // team 2 has won!
    }

    if (kingPos.col == stones.length - 1 &&
        stones[kingPos.row - 1][kingPos.col] == 2 &&
        stones[kingPos.row + 1][kingPos.col] == 2 &&
        stones[kingPos.row][kingPos.col - 1] == 2) {
        return (2) // team 2 has won!
    }

    return (stones)
}

// if the king is surrounded by 4 sides, he's done
function checkKingFourSides(stones: number[][]) {
    const kingPos: Stone = getKingPos(stones)

    // if on the edge, king is not touched by this rule
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

// simple case: our move encapsuled an enemy stone
// check in all 4 directions if step1 is enemy and step2 is friendly
// if so, remove enemy stone
function checkSimpleBeating(stones: number[][], whichTeamIsOn: number, newStone: Stone) {
    if (!newStone.value) return (stones)

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