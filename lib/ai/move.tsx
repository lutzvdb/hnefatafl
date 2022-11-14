import { Stone } from '../stone'
import { getAllMyStones } from '../stone'
import { isValidMove } from '../moveValidity'
import { checkBeating, getKingPos } from '../beating'
import { getStonesAfterMovement } from '../path'

interface stoneMove {
    from: Stone,
    to: Stone
}

interface stoneMoveWithScore extends stoneMove {
    scoreAfterMove: number,
    stonesAfterMove: number[][]
}

interface hierarchicalTrajectory {
    move: stoneMoveWithScore,
    whichTeamIsOn: number,
    nextMoves?: hierarchicalTrajectory[],
    curDepth: number
}

interface scoreTemplate {
    uneventful: number,
    stoneBeaten: number,
    gameWon: number,
    kingDistanceFromCenter: number // factor: for each stone moved from center, this is added to the score
}

export function AIGetNextMove(stones: number[][], AIteam: number): stoneMoveWithScore | boolean {
    // Plan is:
    // 1. Get all available moves
    // 2. Get all available subsequent moves to level N
    // 3. Get move sequence with best total score
    // 4. Supply that move back

    const scoreTemplateForAI: scoreTemplate = {
        uneventful: 0,
        stoneBeaten: 200,
        gameWon: 10000,
        kingDistanceFromCenter: 50
    }
    const scoreTemplateForOpponent: scoreTemplate = {
        uneventful: 0,
        stoneBeaten: -200,
        gameWon: -10000,
        kingDistanceFromCenter: 0
    }
    // for performance reasons, scale down AI complexity with larger boards
    // otherwise, calculations take too long
    var recursionDepth = 3;
    if(stones.length == 9) {
        recursionDepth = 3
    } else if(stones.length >= 11) {
        recursionDepth = 2
    }
    const initialMoves = getAllMovesForSituation(stones, AIteam, scoreTemplateForAI, 1)

    // are there no moves left?
    if (initialMoves.length == 0) {
        // AI lost!
        return (false)
    }

    // can i win within 1 move?
    const directWinTraj = initialMoves.filter(i => i.scoreAfterMove == scoreTemplateForAI.gameWon)
    if (directWinTraj.length > 0) {
        return (directWinTraj[0])
    }

    var currentTeam = AIteam
    var trajectories: hierarchicalTrajectory[] = initialMoves
        .map((i): hierarchicalTrajectory => ({ move: i, curDepth: 0, whichTeamIsOn: currentTeam == 1 ? 2 : 1 }))

    const beginningOfRecursiveTesting = performance.now()
    trajectories = recursiveMoveTesting(trajectories, 1, recursionDepth,
        AIteam, scoreTemplateForAI, scoreTemplateForOpponent, beginningOfRecursiveTesting)

    const trajScores = trajectories.map(t => recursiveScoreSum(t))
    const bestScore = Math.max(...trajScores)
    const chosenTraj = trajScores.indexOf(bestScore)

    return (initialMoves[chosenTraj])
}

// get the sum of the scores
function recursiveScoreSum(traj: hierarchicalTrajectory) {
    var mysum = traj.move.scoreAfterMove *
        (1 / (Math.pow(traj.curDepth + 1, 1)))
    // factor to make events further down the road less important

    if (!traj.nextMoves) return (mysum)

    for (var i = 0; i < traj.nextMoves?.length; i++) {
        mysum += recursiveScoreSum(traj.nextMoves[i])
    }

    return (mysum)
}

function recursiveMoveTesting
    (
        trajectories: hierarchicalTrajectory[],
        curDepth: number,
        maxDepth: number,
        AIteam: number,
        scoreTemplateForAI: scoreTemplate,
        scoreTemplateForOpponent: scoreTemplate,
        beginningOfRecursiveTesting: number
    ): hierarchicalTrajectory[] {

    // if we have reached max depth, stop recursive iteration
    if (curDepth > maxDepth) return (trajectories)

    // if calculation has already taken more than 5 seconds, just stop
    if (performance.now() - beginningOfRecursiveTesting > 5000) return(trajectories)

    // go through all existing trajectories and calculate next steps
    for (var i = 0; i < trajectories.length; i++) {
        // generate all moves based on this trajectory and append to new list of trajectories

        var nextSteps = getAllMovesForSituation(
            trajectories[i].move.stonesAfterMove,
            trajectories[i].whichTeamIsOn,
            trajectories[i].whichTeamIsOn == AIteam ? scoreTemplateForAI : scoreTemplateForOpponent,
            1 / (curDepth * 1.5 + 2))

        // add all resulting trajectories to list
        var followingTrajectories: hierarchicalTrajectory[] = nextSteps.map(singlestep => ({
            move: singlestep,
            curDepth: curDepth,
            whichTeamIsOn: trajectories[i].whichTeamIsOn == 1 ? 2 : 1
        }))

        followingTrajectories = recursiveMoveTesting(
            followingTrajectories,
            curDepth + 1,
            maxDepth,
            AIteam,
            scoreTemplateForAI, scoreTemplateForOpponent,
            beginningOfRecursiveTesting
        )
        trajectories[i].nextMoves = followingTrajectories
    }

    return (trajectories)
}

// gets the all possible moves with scores for a given situation
function getAllMovesForSituation
    (
        stones: number[][],
        myteam: number,
        scoreTemplate: scoreTemplate,
        drawingChance: number // 0-1; represents probability to evaluate a single possible move
    ) {
    const myStones = getAllMyStones(stones, myteam)
    const moves = getAllPossibleMoves(stones, myStones, drawingChance)
    const movesWithScores = getMoveScore(stones, myteam, moves, scoreTemplate)

    return (movesWithScores)
}

// pick drawingChance% of the moves
function filterMoves(moves: Stone[], drawingChance: number) {
    if (drawingChance == 1) return (moves)

    // return all possible moves for the king. For other players, have it depend on chance
    return moves.filter(m => m.value == 3 || Math.random() < drawingChance)
}

function getMoveScore(stones: number[][], myteam: number, moves: stoneMove[], scoreTemplate: scoreTemplate): stoneMoveWithScore[] {
    // get a score for the result of each move
    // scoreTemplate provides the scores

    // initialize return array... we'll change values in the loop below
    var ret: stoneMoveWithScore[] = moves.map(m => ({ from: m.from, to: m.to, scoreAfterMove: 0, stonesAfterMove: stones }))

    const gameValueBeforeMove = getBoardValue(stones)
    for (var i = 0; i < moves.length; i++) {
        ret[i].stonesAfterMove = getStonesAfterMovement(stones, moves[i].from, moves[i].to)
        var afterBeating = checkBeating(ret[i].stonesAfterMove, myteam, moves[i].to)

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

            // check for king position
            const kingPos: Stone = getKingPos(afterBeating)
            if (kingPos.col != 3 || kingPos.row != 3) {
                const dist = (
                    // col
                    Math.abs(kingPos.col - (stones.length - 1) / 2)
                    +
                    // row
                    Math.abs(kingPos.row - (stones.length - 1) / 2)
                )
                ret[i].scoreAfterMove += dist * scoreTemplate.kingDistanceFromCenter
            }
        }
    }

    return (ret)
}

// get a sum of all stones on board 
function getBoardValue(stones: number[][]) {
    return (stones.flat().reduce((sum, curVal) => sum + curVal))
}

function getAllPossibleMoves(stones: number[][], myStones: Stone[], drawingChance: number): stoneMove[] {
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
            .filter(i => i.value == 0) // only consider moves to empty fields..
        
        possibleTargetStones = filterMoves(possibleTargetStones, drawingChance)

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