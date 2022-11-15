import { useEffect, useState } from "react"
import { brandubh, stonesByName } from '../lib/initialSetup'
import CloseIcon from '@mui/icons-material/Close';

export function Tutorial(
    props:
        {
            setStones: Function,
            finishTutorial: Function
        }
) {

    const [curStep, setCurStep] = useState(1)
    const [curMove, setCurMove] = useState(0)
    const [curInterval, setCurInterval] = useState<any | null>(null)

    const steps = [
        {
            headline: 'Welcome to the hnefatafl tutorial!',
            text: 'This tutorial will show you the rules of hnefatafl. To proceed, click "next".',
            stones: [brandubh]
        },
        {
            headline: 'Background',
            text: `hnefatafl is a 1000+ years old game, most likely invented by the vikings. 
            It is similar in some ideas to today's chess.`,
            stones: [brandubh]
        },
        {
            headline: 'Background',
            text: `There are many different ways to play it; the rules here are just one variant.`,
            stones: [brandubh]
        },
        {
            headline: 'Core concept',
            text: `In hnefatafl, two teams play against each other: Red and green. 
                    The green team also has the king, which is yellow. `,
            stones: [brandubh]
        },
        {
            headline: 'Core concept',
            text: `The goal of the green team is to move the king to one of the four corners. 
                    The goal of the red team is to stop this from happening.`,
            stones: [brandubh]
        },
        {
            headline: 'Stone movement',
            text: `The teams move a single stone, one after another. The red team always starts.`,
            stones: [brandubh]
        },
        {
            headline: 'Stone movement',
            text: `Similar to the rook in chess, all red and green stones can move horizontally and vertically as far as they want.`,
            stones: [
                brandubh,
                [
                    [0, 0, 0, 2, 0, 0, 0],
                    [0, 0, 0, 2, 0, 0, 0],
                    [0, 0, 0, 1, 0, 0, 0],
                    [2, 2, 1, 3, 1, 2, 2],
                    [0, 0, 0, 0, 0, 0, 1],
                    [0, 0, 0, 2, 0, 0, 0],
                    [0, 0, 0, 2, 0, 0, 0]
                ],
                brandubh,
                [
                    [0, 0, 0, 2, 0, 0, 0],
                    [0, 0, 0, 2, 0, 0, 2],
                    [0, 0, 0, 1, 0, 0, 0],
                    [2, 2, 1, 3, 1, 2, 0],
                    [0, 0, 0, 1, 0, 0, 0],
                    [0, 0, 0, 2, 0, 0, 0],
                    [0, 0, 0, 2, 0, 0, 0]
                ],
                brandubh,
                [
                    [0, 0, 0, 2, 0, 2, 0],
                    [0, 0, 0, 2, 0, 0, 0],
                    [0, 0, 0, 1, 0, 0, 0],
                    [2, 2, 1, 3, 1, 0, 2],
                    [0, 0, 0, 1, 0, 0, 0],
                    [0, 0, 0, 2, 0, 0, 0],
                    [0, 0, 0, 2, 0, 0, 0]
                ],
            ]
        },
        {
            headline: 'Stone movement',
            text: `The king is the only stone allowed in the corner field and center ("throne"). Furthermore, it can only go three steps horizontally or vertically.`,
            stones: [
                [
                    [0, 0, 0, 2, 0, 0, 0],
                    [0, 0, 0, 2, 0, 0, 0],
                    [0, 0, 0, 1, 0, 0, 0],
                    [2, 2, 1, 0, 0, 0, 2],
                    [0, 0, 0, 1, 0, 0, 0],
                    [0, 0, 0, 2, 0, 0, 0],
                    [0, 0, 0, 2, 3, 0, 0]
                ],
                [
                    [0, 0, 0, 2, 0, 0, 0],
                    [0, 0, 0, 2, 0, 0, 0],
                    [0, 0, 0, 1, 0, 0, 0],
                    [2, 2, 1, 0, 3, 0, 2],
                    [0, 0, 0, 1, 0, 0, 0],
                    [0, 0, 0, 2, 0, 0, 0],
                    [0, 0, 0, 2, 0, 0, 0]
                ],
                [
                    [0, 0, 0, 2, 0, 0, 0],
                    [0, 0, 0, 2, 0, 0, 0],
                    [0, 0, 0, 1, 0, 0, 0],
                    [2, 2, 1, 0, 0, 0, 2],
                    [0, 0, 0, 1, 0, 0, 0],
                    [0, 0, 0, 2, 0, 0, 0],
                    [0, 0, 0, 2, 3, 0, 0]
                ],
                [
                    [0, 0, 0, 2, 0, 0, 0],
                    [0, 0, 0, 2, 0, 0, 0],
                    [0, 0, 0, 1, 0, 0, 0],
                    [2, 2, 1, 0, 0, 0, 2],
                    [0, 0, 0, 1, 0, 0, 0],
                    [0, 0, 0, 2, 0, 0, 0],
                    [0, 0, 0, 2, 0, 0, 3]
                ],
            ]
        },
        {
            headline: 'Stone beating',
            text: `If you actively trap an enemy stone between two of your own stones, you beat the enemy stone.`,
            stones: [
                [
                    [0, 0, 0, 2, 0, 0, 0],
                    [0, 0, 0, 2, 0, 0, 0],
                    [0, 0, 0, 0, 0, 1, 0],
                    [2, 2, 1, 3, 1, 2, 2],
                    [0, 0, 0, 1, 0, 0, 0],
                    [0, 0, 0, 2, 0, 0, 0],
                    [0, 0, 0, 2, 0, 0, 0]
                ],
                [
                    [0, 0, 0, 2, 0, 0, 0],
                    [0, 0, 0, 2, 0, 0, 0],
                    [0, 0, 0, 0, 0, 1, 0],
                    [2, 2, 1, 3, 1, 2, 2],
                    [0, 0, 0, 0, 0, 1, 0],
                    [0, 0, 0, 2, 0, 0, 0],
                    [0, 0, 0, 2, 0, 0, 0]
                ],
                [
                    [0, 0, 0, 2, 0, 0, 0],
                    [0, 0, 0, 2, 0, 0, 0],
                    [0, 0, 0, 0, 0, 1, 0],
                    [2, 2, 1, 3, 1, 0, 2],
                    [0, 0, 0, 0, 0, 1, 0],
                    [0, 0, 0, 2, 0, 0, 0],
                    [0, 0, 0, 2, 0, 0, 0]
                ]
            ]
        },
        {
            headline: 'Stone beating',
            text: `If you are moving in between two enemy stones, you're safe however.`,
            stones: [
                [
                    [0, 0, 0, 2, 0, 0, 0],
                    [0, 0, 0, 0, 0, 2, 0],
                    [0, 0, 0, 1, 0, 0, 0],
                    [2, 2, 1, 3, 1, 2, 2],
                    [0, 0, 0, 1, 0, 0, 0],
                    [0, 0, 0, 2, 0, 0, 0],
                    [0, 0, 0, 2, 0, 0, 0]
                ],
                [
                    [0, 0, 0, 2, 0, 0, 0],
                    [0, 0, 0, 0, 0, 2, 0],
                    [0, 0, 0, 0, 0, 1, 0],
                    [2, 2, 1, 3, 1, 2, 2],
                    [0, 0, 0, 1, 0, 0, 0],
                    [0, 0, 0, 2, 0, 0, 0],
                    [0, 0, 0, 2, 0, 0, 0]
                ]
            ]
        },
        {
            headline: 'Stone beating',
            text: `It is also possible to beat both red and green stones when they are next to an empty throne or corner.`,
            stones: [
                [
                    [0, 0, 0, 2, 0, 0, 0],
                    [0, 0, 0, 2, 0, 0, 0],
                    [0, 0, 0, 0, 0, 1, 0],
                    [2, 2, 1, 0, 2, 0, 2],
                    [0, 0, 0, 1, 0, 0, 0],
                    [0, 0, 0, 2, 3, 0, 0],
                    [0, 0, 0, 2, 0, 0, 0]
                ],
                [
                    [0, 0, 0, 2, 0, 0, 0],
                    [0, 0, 0, 2, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0],
                    [2, 2, 1, 0, 2, 1, 2],
                    [0, 0, 0, 1, 0, 0, 0],
                    [0, 0, 0, 2, 3, 0, 0],
                    [0, 0, 0, 2, 0, 0, 0]
                ],
                [
                    [0, 0, 0, 2, 0, 0, 0],
                    [0, 0, 0, 2, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0],
                    [2, 2, 1, 0, 0, 1, 2],
                    [0, 0, 0, 1, 0, 0, 0],
                    [0, 0, 0, 2, 3, 0, 0],
                    [0, 0, 0, 2, 0, 0, 0]
                ],
                [
                    [0, 0, 0, 2, 0, 0, 0],
                    [0, 0, 0, 2, 0, 0, 1],
                    [0, 0, 0, 0, 0, 2, 0],
                    [2, 2, 1, 0, 0, 0, 2],
                    [0, 0, 0, 1, 0, 0, 0],
                    [0, 0, 0, 2, 3, 0, 0],
                    [0, 0, 0, 2, 0, 0, 0]
                ],
                [
                    [0, 0, 0, 2, 0, 0, 0],
                    [0, 0, 0, 2, 0, 0, 1],
                    [0, 0, 0, 0, 0, 0, 2],
                    [2, 2, 1, 0, 0, 0, 2],
                    [0, 0, 0, 1, 0, 0, 0],
                    [0, 0, 0, 2, 3, 0, 0],
                    [0, 0, 0, 2, 0, 0, 0]
                ],
                [
                    [0, 0, 0, 2, 0, 0, 0],
                    [0, 0, 0, 2, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 2],
                    [2, 2, 1, 0, 0, 0, 2],
                    [0, 0, 0, 1, 0, 0, 0],
                    [0, 0, 0, 2, 3, 0, 0],
                    [0, 0, 0, 2, 0, 0, 0]
                ],
            ]
        },
        {
            headline: 'King beating',
            text: `The red team can win by enclosing the king with 4 stones, or three stones and the empty throne.`,
            stones: [
                [
                    [0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 1, 0, 2, 0],
                    [2, 2, 1, 0, 2, 3, 2],
                    [0, 0, 0, 1, 0, 0, 0],
                    [0, 0, 0, 2, 0, 2, 0],
                    [0, 0, 0, 2, 0, 0, 0]
                ],
                [
                    [0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 1, 0, 2, 0],
                    [2, 2, 1, 0, 2, 3, 2],
                    [0, 0, 0, 1, 0, 2, 0],
                    [0, 0, 0, 2, 0, 0, 0],
                    [0, 0, 0, 2, 0, 0, 0]
                ],
                [
                    [0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 1, 0, 2, 0],
                    [2, 2, 1, 0, 2, 0, 2],
                    [0, 0, 0, 1, 0, 2, 0],
                    [0, 0, 0, 2, 0, 0, 0],
                    [0, 0, 0, 2, 0, 0, 0]
                ],
                [
                    [0, 0, 0, 2, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 1, 2, 0, 0],
                    [2, 2, 1, 0, 3, 0, 2],
                    [0, 0, 0, 1, 2, 0, 0],
                    [0, 0, 0, 2, 0, 0, 0],
                    [0, 0, 0, 2, 0, 0, 0]
                ],
                [
                    [0, 0, 0, 2, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 1, 2, 0, 0],
                    [2, 2, 1, 0, 3, 2, 0],
                    [0, 0, 0, 1, 2, 0, 0],
                    [0, 0, 0, 2, 0, 0, 0],
                    [0, 0, 0, 2, 0, 0, 0]
                ],
                [
                    [0, 0, 0, 2, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 1, 2, 0, 0],
                    [2, 2, 1, 0, 0, 2, 0],
                    [0, 0, 0, 1, 2, 0, 0],
                    [0, 0, 0, 2, 0, 0, 0],
                    [0, 0, 0, 2, 0, 0, 0]
                ],
            ]
        },
        {
            headline: 'King beating',
            text: `The king can not be beaten when it is on the edge of the board.`,
            stones: [
                [
                    [0, 0, 0, 2, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 1, 0, 0, 2],
                    [2, 2, 1, 0, 0, 2, 3],
                    [0, 0, 0, 1, 0, 0, 0],
                    [0, 0, 0, 2, 0, 0, 2],
                    [0, 0, 0, 2, 0, 0, 0]
                ],
                [
                    [0, 0, 0, 2, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 1, 0, 0, 2],
                    [2, 2, 1, 0, 0, 2, 3],
                    [0, 0, 0, 1, 0, 0, 2],
                    [0, 0, 0, 2, 0, 0, 0],
                    [0, 0, 0, 2, 0, 0, 0]
                ],
            ]
        },
        {
            headline: 'King in corner',
            text: `If the green team manages to get the king into one of the four corners, it has won.`,
            stones: [
                [
                    [0, 0, 0, 2, 0, 0, 0],
                    [0, 0, 0, 2, 0, 0, 0],
                    [0, 0, 0, 1, 1, 0, 0],
                    [2, 2, 1, 0, 0, 2, 2],
                    [0, 0, 0, 1, 0, 0, 3],
                    [0, 0, 0, 2, 0, 0, 0],
                    [0, 0, 0, 2, 0, 0, 0]
                ],
                [
                    [0, 0, 0, 2, 0, 0, 0],
                    [0, 0, 0, 2, 0, 0, 0],
                    [0, 0, 0, 1, 1, 0, 0],
                    [2, 2, 1, 0, 0, 2, 2],
                    [0, 0, 0, 1, 0, 0, 0],
                    [0, 0, 0, 2, 0, 0, 0],
                    [0, 0, 0, 2, 0, 0, 3]
                ],
            ]
        },
        {
            headline: 'Game layouts',
            text: `There are several game layouts available, posing different interesting challenges. Try them all!`,
            stones: stonesByName.map(s => s.stones),
            timing: 2000
        },
    ]

    useEffect(() => {
        const myStep = steps[curStep - 1]
        props.setStones(myStep.stones[0])
        setCurMove(0)

        // if we illustrated some moves before, let's clear out the old timer
        if (curInterval !== null) {
            clearInterval(curInterval)
            setCurInterval(null)
        }

        if (myStep.stones.length > 1) {
            // we want to loop through some moves to illustrate a game play
            const myTiming = myStep.timing ? myStep.timing : 1000 // 1sec default
            const interv = setInterval(() => {
                const totalMoves = (steps[curStep - 1].stones.length - 1)
                setCurMove((current) => current == totalMoves ? 0 : (current + 1))
            }, myTiming)
            setCurInterval(interv)

            //return () => clearInterval(interv)
        }
    }, [curStep])

    useEffect(() => {
        // we're looping through a move, set current stones
        props.setStones(steps[curStep - 1].stones[curMove])
    }, [curMove])

    return (
        <div className="absolute top-4 left-4 right-4 h-52 flex flex-row justify-center">
            <div className="w-full max-w-[600px] h-full bg-white bg-opacity-75 backdrop-blur-md rounded-xl" style={{ fontFamily: 'Raleway' }}>
                <div className="flex flex-col h-full p-2">
                    {/* Tutorial text */}
                    <div className="grow flex flex-row">
                        <div className="grow">
                            <div className="font-bold pl-4 py-2">
                                {steps[curStep - 1].headline}
                            </div>
                            <div>
                                {steps[curStep - 1].text}
                            </div>
                        </div>
                        <div className="py-2 pr-4">
                            <a href="#" onClick={() => { setCurStep(1); props.finishTutorial(); }}>
                                <CloseIcon />
                            </a>
                        </div>
                    </div>
                    {/* Next / previous step selector */}
                    <div className="shrink w-full">
                        <div className="font-2xl flex flex-row w-full">
                            <div className="flex items-center px-4">
                                {
                                    curStep == 1 ?
                                        <span className="text-gray-400">Previous</span>
                                        :
                                        <a href="#" onClick={() => setCurStep(curStep - 1)}>Previous</a>
                                }
                            </div>
                            <div className="flex grow flex-col items-center justify-center">
                                <div>
                                    Step {curStep} / {steps.length}
                                </div>
                                <div className="px-4">
                                    <progress className="progress w-32" value={100 * ((curStep - 1) / (steps.length - 1))} max="100" />
                                </div>
                            </div>
                            <div className="flex items-center px-4">
                                {
                                    curStep == steps.length ?
                                        <a href="#" onClick={() => { setCurStep(1); props.finishTutorial(); }}>
                                            Finish
                                        </a>
                                        :
                                        <a href="#" onClick={() => setCurStep(curStep + 1)}>Next</a>
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}