import { useEffect, useState } from 'react'
import useSWR from 'swr'
import { stonesByName } from '../lib/initialSetup'

async function fetcher<JSON = any>(
    input: RequestInfo,
    init?: RequestInit
): Promise<JSON> {
    const res = await fetch(input, init)
    return res.json()
}

export default function MultiplayerOpenGames(props: {
    startOnlineGame: Function,
    myName: string,
    isVisible: boolean
}) {
    const [myInt, setMyInterval] = useState<any|null>(null)
    const OG = useSWR('/api/opengames', fetcher)

    useEffect(() => {
        if(props.isVisible) {
            OG.mutate() // initial refresh on open

            // continually refresh
            const i = setInterval(() => {
                OG.mutate()
            }, 5000)
            setMyInterval(i)
        } else {
            clearInterval(myInt)
        }
    }, [props.isVisible])
    
    if (OG.error) return <div>Error loading multiplayer games.</div>
    if (!OG.data) return <div>Loading...</div>
    if (!Array.isArray(OG.data)) return <div>Error loading multiplayer games.</div>

    const joinGame = async (game: any) => {
        // get correct stones for desired game type
        const stones = stonesByName.filter(s => s.name == game.game ? s.stones : null)
        if(stones.length !== 1) return 

        const ret = await fetch('/api/joinGame', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                gameId: game._id,
                name: props.myName
            })
        })
        
        props.startOnlineGame(
            game._id, 
            stones[0].stones,
            game.hostTeam == 1 ? 2 : 1,
            game.host
        )
    }

    return (
        <div>
            {OG.data.length == 0 ? <>No open games found.</> : ''}
            <ul>
                {OG.data.map((g: any) =>
                    <li key={g._id}>
                         - <a href="#" onClick={() => joinGame(g)}>{g.host} </a>
                        <span className="text-xs">{g.game}, host plays {g.hostTeam == 1 ? 'green' : 'red'}</span>
                    </li>)}
            </ul>
        </div>
    )
}