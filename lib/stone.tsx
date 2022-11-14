
export interface Stone {
    row: number,
    col: number,
    value?: number
}

export function getAllMyStones(stones: number[][], myTeam: number) {
    // not the prettiest code in the world, but at least somewhat efficient
    // prepare a too-large array beforehand and shrink it down later so memory only has to be allocated once
    var allMyStones = new Array<Stone>(stones.length * stones.length)
    var curCnt = 0;

    if (myTeam == 1) {
        stones.map((row, ri) => row.map((item, ci) => {
            if (item == 1 || item == 3) {
                allMyStones[curCnt] = {
                    row: ri,
                    col: ci,
                    value: item
                }
                curCnt = curCnt + 1
            }
        }))
    } else {
        stones.map((row, ri) => row.map((item, ci) => {
            if (item == 2) {
                allMyStones[curCnt] = {
                    row: ri,
                    col: ci,
                    value: 2
                }
                curCnt = curCnt + 1
            }
        }))
    }
    
    allMyStones = allMyStones.slice(0, curCnt)

    return (allMyStones)
}