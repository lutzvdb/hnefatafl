import { Stone } from '../stone'
import { getAllMyStones } from '../stone'
import { isValidMove } from '../moveValidity'
import { checkBeating, isKingInCorner } from '../beating'
import { getStonesAfterMovement } from '../path'

interface stoneMove {
    from: Stone,
    to: Stone
}

interface stoneMoveWithScore extends stoneMove {
    scoreAfterMove: number,
    stonesAfterMove: number[][]
}

export function AIGetNextMove(stones: number[][], AIteam: number) {
    // Plan is:
    // 1. Get all available moves
    // 2. Get all available subsequent moves to level N
    // 3. Get move sequence with best total score
    // 4. Supply that move back

    const myStones = getAllMyStones(stones, AIteam)
    const moves = getAllPossibleMoves(stones, myStones)
    const movesWithScores = getMoveScore(stones, AIteam, moves)

    // get optimal move
    const bestOutcomeMove = movesWithScores.reduce(
        (curMax, curVal) => (
            curVal.scoreAfterMove >= curMax.scoreAfterMove ? curVal : curMax
        )
    )

    return (bestOutcomeMove)
}

function getMoveScore(stones: number[][], myteam: number, moves: stoneMove[]): stoneMoveWithScore[] {
    // get a score for the result of each move
    // Beat a stone: 10 points
    // Win the game: 999 points

    // initialize return array... we'll change values in the loop below
    var ret: stoneMoveWithScore[] = moves.map(m => ({ from: m.from, to: m.to, scoreAfterMove: 0, stonesAfterMove: stones }))

    const gameValueBeforeMove = getBoardValue(stones)
    for (var i = 0; i < moves.length; i++) {
        var stonesAfterMove = getStonesAfterMovement(stones, moves[i].from, moves[i].to)
        var afterBeating = checkBeating(stonesAfterMove, myteam, moves[i].to)

        // default value of move: 0
        if (afterBeating === 2) {
            // team 2 has won
            ret[i].scoreAfterMove = 999
        } else if (Array.isArray(afterBeating)) {
            // to see if we beat an opponent figure, calculate sum of stones on board
            // if the sum got smaller, we apparanently beat someone
            var gameValueAfterMove = getBoardValue(afterBeating)
            if (gameValueAfterMove < gameValueBeforeMove) ret[i].scoreAfterMove = 10
            ret[i].stonesAfterMove = afterBeating
        }
    }

    return (ret)
}

// get a sum of all stones on board 
function getBoardValue(stones: number[][]) {
    return (stones.flat().reduce((sum, curVal) => sum + curVal))
}

function getAllPossibleMoves(stones: number[][], myStones: Stone[]): stoneMove[] {
    const boardLength: Number[] = Array.from({ length: stones.length }, (x, i) => i)
    var allMoves: stoneMove[] = []

    for (var i = 0; i < myStones.length; i++) {
        var horizontalMoves = boardLength.map((item): Stone => ({ row: item.valueOf(), col: myStones[i].col }))
        var verticalMoves = boardLength.map((item): Stone => ({ row: myStones[i].row, col: item.valueOf() }))
        var possibleTargetStones: Stone[] = horizontalMoves.concat(verticalMoves)
            .map(item => ({
                row: item.row,
                col: item.col,
                value: stones[item.row][item.col]
            }))

        var movesForThisStone: stoneMove[] = possibleTargetStones.map(
            (item): stoneMove => ({
                from: myStones[i],
                to: item
            })
        )

        // now we have an array of all thinkable moves
        // narrow it down to legal moves
        movesForThisStone = movesForThisStone.filter(
            i => isValidMove(stones, i.from, i.to) !== false
        )

        allMoves = allMoves.concat(movesForThisStone)
    }

    return (allMoves)
}