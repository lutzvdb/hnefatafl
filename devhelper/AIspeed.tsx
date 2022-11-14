import { AIGetNextMove } from "../lib/ai/move"
import { brandubh, tablut } from "../lib/initialSetup"


export const testAIspeed = () => {
    const n = 1
    const t0 = performance.now()
    for(var i = 0; i <= (n-1); i++) {
        console.log('Trying...')
        AIGetNextMove(tablut, 2)
    }
    const t1 = performance.now()
    const timeSecPerRun = ((t1 - t0) / 1000) / n
    console.log(`It took ${timeSecPerRun} seconds per AI move generation.`)
}