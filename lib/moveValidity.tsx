import { Stone } from '../lib/stone'
import { getPath } from '../lib/path'

export function isValidMove(
    stones: number[][],
    from: Stone,
    to: Stone,
    isComputerGenerated: boolean = false
) {
    if (!isComputerGenerated) {
        // only do these checks for human moves
        if (to.value === undefined) return (false)
        if (to.value > 0) return (false) // place is already taken
        if (to.col != from.col && to.row != from.row) return (false) // diagonal move
        if (to.col == from.col && to.row == from.row) return (false) // non-move
    }

    if ( // only king can go to the extreme corners
        (
            (to.row == 0 || to.row == stones.length - 1) &&
            (to.col == 0 || to.col == stones.length - 1)
        ) &&
        from.value != 3
    ) return (false)
    if ( // only king can go to the middle
        (
            (to.row == (stones.length - 1) / 2) &&
            (to.col == (stones.length - 1) / 2)
        ) &&
        from.value != 3
    ) return (false)
    if (from.value == 3) {
        // we're trying to move the king.. no more than 3 steps
        if (
            (to.col == from.col && Math.abs(to.row - from.row) > 3) ||
            (to.row == from.row && Math.abs(to.col - from.col) > 3)
        ) return (false)
    }

    // ok, we have a generally valid path
    // let's get intersecting cells
    // to see if we're crossing a different stone
    // (not allowed)

    const plannedPath = getPath(from, to)

    // loop through planned path and see if any spots are taken
    // if so, invalid
    // otherwise, go ahead

    const hasTakenSpots = plannedPath.map(
        step => stones[step.row][step.col] == 0 ? false : true
    )

    if (hasTakenSpots.includes(true)) return (false)

    return plannedPath
}