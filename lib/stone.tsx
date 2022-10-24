
export interface Stone {
    row: number,
    col: number,
    value?: number
}

export function getAllMyStones(stones: number[][], myTeam: number) {
    const myStones: Number[] = myTeam == 1 ? [1, 3] : [2] // team 1 has king (3) as well, team 2 just 2-stones
    var allMyStones: Stone[] = []
    stones
        .map((row, ri) => row.map((item, ci) => {
            if(myStones.includes(item)) allMyStones.push({
                row: ri, 
                col: ci,
                value: item})
            }
        ))

    return(allMyStones)
}