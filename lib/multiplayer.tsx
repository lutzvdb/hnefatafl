import { Stone } from "./stone"

export const sendMoveToServer = (onlineGameId: string, myteam: number[], from: Stone, to: Stone) => {
    // we did a move.. send our move to the server so the opponent can see it
    if (!onlineGameId) return

    fetch('/api/move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            gameId: onlineGameId,
            movingTeam: myteam[0],
            fromRow: from.row,
            fromCol: from.col,
            toRow: to.row,
            toCol: to.col
        })
    })
}

export const updateLatestActive = (onlineGameId: string) => {
    // let the database know we're still looking
    if (!onlineGameId) return

    fetch('/api/updateLatestActive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            gameId: onlineGameId
        })
    })
}