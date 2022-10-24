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

// a trajectory consists of a series of moves
interface trajectory {
    moves: stoneMoveWithScore[],
    whichTeamIsOn: number
}

interface trajectoryWithTotalScore extends trajectory {
    totalScore: number
}

interface scoreTemplate {
    uneventful: number,
    stoneBeaten: number, 
    gameWon: number
}

export function AIGetNextMove(stones: number[][], AIteam: number): stoneMoveWithScore {
    // Plan is:
    // 1. Get all available moves
    // 2. Get all available subsequent moves to level N
    // 3. Get move sequence with best total score
    // 4. Supply that move back

    const depth = 2;
    const scoreTemplateForAI: scoreTemplate = {
        uneventful: 0,
        stoneBeaten: 10,
        gameWon: 999
    }
    const scoreTemplateForOpponent: scoreTemplate = {
        uneventful: 1,
        stoneBeaten: -20,
        gameWon: -999
    }
    const initialMoves = getAllMovesForSituation(stones, AIteam, scoreTemplateForAI)
    var currentTeam = AIteam
    var trajectories: trajectory[] = initialMoves.map((i): trajectory => ({moves: [i], whichTeamIsOn: currentTeam == 1 ? 2 : 1}))
    
    for(var d = 0; d < depth; d++) {
        var newtrajectories: trajectory[] = []
        var currentTeam = currentTeam == 1 ? 2 : 1
        // go through all existing trajectories and calculate next steps
        for(var i = 0; i < trajectories.length; i++) {
            // generate all moves based on this trajectory and append to new list of trajectories
            
            var movesSoFar = trajectories[i].moves
            var nextSteps = getAllMovesForSituation(
                movesSoFar[movesSoFar.length-1].stonesAfterMove, 
                trajectories[i].whichTeamIsOn,
                currentTeam == AIteam ? scoreTemplateForAI : scoreTemplateForOpponent)
            
            // add all resulting trajectories to list
            var movesFromThisTrajectory: trajectory[] = nextSteps.map(singlestep => ({
                moves: movesSoFar.concat(singlestep),
                whichTeamIsOn: currentTeam == 1 ? 2 : 1 
            }))

            newtrajectories = newtrajectories.concat(movesFromThisTrajectory)
        }

        trajectories = newtrajectories
    }

    // get optimal trajectory
    const trajWithScore: trajectoryWithTotalScore[] = trajectories.map(t => ({
        ...t,
        totalScore: t.moves.map(i => i.scoreAfterMove).reduce((curSum, item) => curSum + item)
    }))
    
    const bestOutcomeTrajectory = trajWithScore.reduce(
        (curMax, curVal) => (
            curVal.totalScore >= curMax.totalScore ? curVal : curMax
        )
    )

    return (bestOutcomeTrajectory.moves[0])
}

// gets the all possible moves with scores for a given situation
function getAllMovesForSituation(stones: number[][], myteam: number, scoreTemplate: scoreTemplate) {
    const myStones = getAllMyStones(stones, myteam)
    const moves = getAllPossibleMoves(stones, myStones)
    
    const movesWithScores = getMoveScore(stones, myteam, moves, scoreTemplate)

    return (movesWithScores)
}

function getMoveScore(stones: number[][], myteam: number, moves: stoneMove[], scoreTemplate: scoreTemplate): stoneMoveWithScore[] {
    // get a score for the result of each move
    // scoreTemplate provides the scores
    
    // initialize return array... we'll change values in the loop below
    var ret: stoneMoveWithScore[] = moves.map(m => ({ from: m.from, to: m.to, scoreAfterMove: 0, stonesAfterMove: stones }))

    const gameValueBeforeMove = getBoardValue(stones)
    for (var i = 0; i < moves.length; i++) {
        var stonesAfterMove = getStonesAfterMovement(stones, moves[i].from, moves[i].to)
        var afterBeating = checkBeating(stonesAfterMove, myteam, moves[i].to)

        // default value of move: 0
        if (!Array.isArray(afterBeating)) {
            // a team has won!
            ret[i].scoreAfterMove = scoreTemplate.gameWon
        } else {
            // to see if we beat an opponent figure, calculate sum of stones on board
            // if the sum got smaller, we apparanently beat someone
            var gameValueAfterMove = getBoardValue(afterBeating)
            if (gameValueAfterMove < gameValueBeforeMove) ret[i].scoreAfterMove = scoreTemplate.stoneBeaten
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