import { Stone } from './stone'

export function checkBeating(stones: number[][], whichTeamIsOn: number, newStone: Stone) {
    var afterBeating: number[][] | number
    afterBeating = checkSimpleBeating(stones, whichTeamIsOn, newStone)
    afterBeating = checkKingFourSides(afterBeating, whichTeamIsOn, newStone)

    return (afterBeating)
}

// if the king is surrounded by 4 sides, he's done
function checkKingFourSides(stones: number[][], whichTeamIsOn: number, newStone: Stone) {
    if (stones[0][1] == 7) return (1)
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