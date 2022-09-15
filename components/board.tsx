

export default function Board(props: { stones: number[][] }) {
    if (props.stones.length != 11) throw new Error('Incorrect dimensions')

    const getProperStyle = (item: number) => {
        var styles = "shadow-md"
        if(item == 0) styles = styles + " bg-stone-100"
        if(item == 1) styles = styles + " bg-emerald-200"
        if(item == 2) styles = styles + " bg-rose-200"
        if(item == 3) styles = styles + " bg-lime-200"

        return(styles)
    }

    return (
        <div className="grid grid-cols-11 gap-5 h-full w-full">
            {props.stones.map(row =>
                row.map(item =>
                    <div className={getProperStyle(item)}>
                        
                    </div>
                )
            )}
        </div>
    )
}