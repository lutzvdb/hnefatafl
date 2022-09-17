export interface savedGame {
    whichTeamIsOn: number,
    stones: number[][]
}

export function saveGameToLocalStroage(gameName: string, stones: number[][], whichTeamIsOn: number) {
    const gameToSave: savedGame = {
        whichTeamIsOn: whichTeamIsOn,
        stones: stones
    }
    const gameAsString = JSON.stringify(gameToSave)
    localStorage.setItem("savedgame_" + gameName, gameAsString)
    saveSavedGameInfo(gameName)
}

export function loadGameFromLocalStroage(gameName: string) {
    const storedGame = localStorage.getItem("savedgame_" + gameName)
    if (!storedGame) return
    const newgame: savedGame = JSON.parse(storedGame)

    return(newgame)
}

export function getAllSavedGames() {
    const allgames = localStorage.getItem("savedgames")
    if(allgames === null) return(null)
    const arrGames: string[] = JSON.parse(allgames)

    return(arrGames)
}

// store info that this game was saved
function saveSavedGameInfo(gameName: string) {
    var allgames = getAllSavedGames()
    if(allgames === null) {
        allgames = [gameName]
    } else {
        allgames = allgames.concat(gameName)
    }
    // get unique values
    let saveme = allgames.filter((v, i, a) => a.indexOf(v) === i);

    localStorage.setItem('savedgames', JSON.stringify(saveme))
}
