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
    myName: string
}) {
    const { data, error } = useSWR('/api/opengames', fetcher)
    
    if (error) return <div>Error loading multiplayer games.</div>
    if (!data) return <div>Loading...</div>
    if (!Array.isArray(data)) return <div>Error loading multiplayer games.</div>

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
            {data.length == 0 ? <>No open games found.</> : ''}
            <ul>
                {data.map((g: any) =>
                    <li key={g._id}>
                         - <a href="#" onClick={() => joinGame(g)}>{g.host} </a>
                        <span className="text-xs">{g.game}, host plays {g.hostTeam == 1 ? 'green' : 'red'}</span>
                    </li>)}
            </ul>
        </div>
    )
}