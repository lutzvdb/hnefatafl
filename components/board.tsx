import { Stone } from '../lib/stone'

export default function Board(props: {
    stones: number[][],
    myteam: number[],
    handleStoneClicked: Function,
    handleMouseOver: Function,
    validPathInSelection: boolean,
    selectedStone: Stone | null,
    whichTeamIsOn: number
}) {

    const getProperStyle = (item: number, row: number, col: number) => {
        // basic styling
        var styles = `shadow-md duration-100 ease-in
            rounded-md md:rounded-xl lg:rounded-xl xl:rounded-xl 2xl:rounded-xl
            `

        // item-coding:
        // >= 0: permanent
        // < 0: temporary
        // --> 
        // 0 = empty field
        // 1 = player 1: regular
        // 2 = player 2
        // 3 = player 1: king
        // -1 = considering move

        // handle colors...
        var bgColor = ""
        if (item == 0) bgColor = " bg-stone-100"
        if (item == 1) bgColor = " bg-emerald-200"
        if (item == 2) bgColor = " bg-rose-200"
        if (item == 3) bgColor = " bg-yellow-200"
        if (item == -1) bgColor = " bg-stone-200"

        // cornerstones and middle-field are only accessible for king
        // mark that
        if (item == 0 && (
            (row == 0 && col == 0) ||
            (row == 0 && col == props.stones.length - 1) ||
            (row == props.stones.length - 1 && col == props.stones.length - 1) ||
            (row == props.stones.length - 1 && col == 0) ||
            (row == (props.stones.length - 1) / 2 && col == (props.stones.length - 1) / 2)
        )) bgColor = " bg-stone-200"
        styles += bgColor

        if (
            // if a stone is selected, rotate it a bit
            row == props.selectedStone?.row &&
            col == props.selectedStone?.col
        ) {
            styles += " rotate-[25deg]"
        }

        if (
            // option 1: we're trying to move
            // and are hovering over an empty field
            // --> offer it
            item == -1
        ) styles += " hover:scale-125"

        if (
            // option 2: we're choosing a stone to move
            // --> offer it
            props.selectedStone === null &&
            (
                props.myteam.includes(item) ||
                (item == 3 && props.myteam.includes(1))
            ) &&
            (
                item == props.whichTeamIsOn ||
                (item == 3 && props.whichTeamIsOn == 1)
            )
        ) styles += " hover:scale-125"

        return (styles)
    }

    var gridClasses = `grid 
        gap-2 md:gap-4 lg:gap-4 xl:gap-5 2xl:gap-5
        w-full h-full`

    if (props.stones.length == 11) gridClasses += ' grid-cols-11'
    if (props.stones.length == 9) gridClasses += ' grid-cols-9'
    if (props.stones.length == 7) gridClasses += ' grid-cols-7'
    if (props.stones.length == 5) gridClasses += ' grid-cols-5'
    if (props.stones.length == 19) {
        var gridClasses = `grid 
        gap-1 md:gap-2 lg:gap-2 xl:gap-3 2xl:gap-3
        w-full h-full grid-cols-19`
    }

    return (
        <div className={gridClasses}>
            {props.stones.map((row, ridx) =>
                row.map((item, iidx) =>
                    <div
                        key={'r' + ridx + 'c' + iidx}
                        className={getProperStyle(item, ridx, iidx)}
                        onClick={() => { props.handleStoneClicked({ row: ridx, col: iidx, value: item }) }}
                        onMouseOver={() => { props.handleMouseOver({ row: ridx, col: iidx, value: item }) }}
                    >

                    </div>
                )
            )}
        </div>
    )
}