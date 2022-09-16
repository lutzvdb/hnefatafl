import { tablut, hnefatafl, brandubh, ardri } from '../lib/initialSetup'

export default function Menu(props: {
    restartGame: Function,
    showMenu: boolean,
    setShowMenu: Function,
}) {

    const newGame = (stones: number[][]) => {
        props.restartGame(stones)
        props.setShowMenu(false)
    }
    return (
        <div className={
            (props.showMenu ? '' : 'hidden ') +
            `
            bg-gray-200
            bg-opacity-20
            fixed top-0 right-0 left-0 bottom-0
            w-screen h-screen
            backdrop-blur-md
            z-50 
            `}>
            <div className="grid place-content-center w-full h-full text-6xl text-center rounded-2xl">
                <div className="bg-white p-10 rounded-3xl bg-opacity-50">
                    <div className="text-6xl text-center pb-5" >
                        hnefatafl
                    </div>
                    <div className="text-lg lg:text-2xl xl:text-2xl 2xl:text-2xl text-left" style={{fontFamily: 'Roboto Mono'}}>
                        Restart game as ...<br />
                        <a href="#" onClick={() => newGame(brandubh)}>
                             - Brandubh (7x7)
                        </a><br />
                        <a href="#" onClick={() => newGame(ardri)}>
                             - Ard Ri (7x7)
                        </a><br />
                        <a href="#" onClick={() => newGame(tablut)}>
                             - Tablut (9x9)
                        </a><br />
                        <a href="#" onClick={() => newGame(hnefatafl)}>
                             - Hnefatafl (11x11)
                        </a>
                        <br /><br />
                        <a href="#" onClick={(() => props.setShowMenu(false))}>
                            Close Menu
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}