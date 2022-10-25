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

interface hierarchicalTrajectory {
    move: stoneMoveWithScore,
    whichTeamIsOn: number,
    nextMoves?: hierarchicalTrajectory[],
    curDepth: number
}

interface scoreTemplate {
    uneventful: number,
    stoneBeaten: number,
    gameWon: number
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
        gameWon: 10000
    }
    const scoreTemplateForOpponent: scoreTemplate = {
        uneventful: 0,
        stoneBeaten: -100,
        gameWon: -500
    }
    const initialMoves = getAllMovesForSituation(stones, AIteam, scoreTemplateForAI, 1)

    // are there no moves left?
    if (initialMoves.length == 0) {
        // AI lost!
        return (false)
    }

    // can i win within 1 move?
    const directWinTraj = initialMoves.filter(i => i.scoreAfterMove == 1000)
    if (directWinTraj.length > 0) {
        return (directWinTraj[0])
    }

    var currentTeam = AIteam
    var trajectories: hierarchicalTrajectory[] = initialMoves
        .map((i): hierarchicalTrajectory => ({ move: i, curDepth: 0, whichTeamIsOn: currentTeam == 1 ? 2 : 1 }))

    trajectories = recursiveMoveTesting(trajectories, 1, 3,
        AIteam, scoreTemplateForAI, scoreTemplateForOpponent)

    const trajScores = trajectories.map(t => recursiveScoreSum(t))
    const bestScore = Math.max(...trajScores)
    const chosenTraj = trajScores.indexOf(bestScore)

    console.log(trajectories)

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
        scoreTemplateForOpponent: scoreTemplate
    ): hierarchicalTrajectory[] {

    // if we have reached max depth, stop recursive iteration
    if (curDepth > maxDepth) return (trajectories)

    // go through all existing trajectories and calculate next steps
    for (var i = 0; i < trajectories.length; i++) {
        // generate all moves based on this trajectory and append to new list of trajectories

        var nextSteps = getAllMovesForSituation(
            trajectories[i].move.stonesAfterMove,
            trajectories[i].whichTeamIsOn,
            trajectories[i].whichTeamIsOn == AIteam ? scoreTemplateForAI : scoreTemplateForOpponent,
            1 / (curDepth + 2))

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
            scoreTemplateForAI, scoreTemplateForOpponent
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
    //moves = filterMoves(moves, drawingChance)
    const movesWithScores = getMoveScore(stones, myteam, moves, scoreTemplate)

    return (movesWithScores)
}

// pick drawingChance% of the moves
function filterMoves(moves: Stone[], drawingChance: number) {
    if(drawingChance == 1) return(moves)

    // always consider all moves for the king
    const kingMoves = moves.filter(m => m.value == 3)
    const peasantMoves = moves.filter(m => m.value != 3)
    // pick drawingChance% of the peasant moves
    peasantMoves.sort(() => 0.5 - Math.random());
    let selected = peasantMoves.slice(0, Math.round(drawingChance * peasantMoves.length));
    selected = selected.concat(kingMoves)
    return (selected)
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

function getAllPossibleMoves(stones: number[][], myStones: Stone[], drawingChance: number): stoneMove[] {
    const boardLength: Number[] = Array.from({ length: stones.length }, (x, i) => i)
    var allMoves: stoneMove[] = []

    const considerForMoving = filterMoves(myStones, drawingChance)

    for (var i = 0; i < considerForMoving.length; i++) {
        var horizontalMoves = boardLength.map((item): Stone => ({ row: item.valueOf(), col: considerForMoving[i].col }))
        var verticalMoves = boardLength.map((item): Stone => ({ row: considerForMoving[i].row, col: item.valueOf() }))
        var possibleTargetStones: Stone[] = horizontalMoves.concat(verticalMoves)
            .map(item => ({
                row: item.row,
                col: item.col,
                value: stones[item.row][item.col]
            }))

        var movesForThisStone: stoneMove[] = possibleTargetStones.map(
            (item): stoneMove => ({
                from: considerForMoving[i],
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