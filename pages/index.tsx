import type { NextPage } from 'next'
import Head from 'next/head'
import { useEffect, useState } from 'react'
import Game from '../components/game'

const Home: NextPage = () => {
    const [bgColor, setBgColor] = useState("bg-red-50")
    const [titleAppendix, setTitleAppendix] = useState('')
    const [fullTitle, setFullTitle] = useState('hnefatafl')

    useEffect(() => {
        setFullTitle('hnefatafl' + titleAppendix)
    }, [titleAppendix])

    return (
        <>
            <Head>
                <title>{fullTitle}</title>
            </Head>
            <div className={'h-screen w-screen duration-200 ' + bgColor}>
                <Game setBgColor={setBgColor} setTitleAppendix={setTitleAppendix} />
            </div>
        </>
    )
}

export default Home