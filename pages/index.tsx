import type { NextPage } from 'next'
import { useState } from 'react'
import Game from '../components/game'

const Home: NextPage = () => {
  const [bgColor, setBgColor] = useState("bg-red-50")

  const classNames = "h-screen w-screen " + bgColor

  return (
    <div className={classNames}>
      <div className="text-6xl text-center pt-5">
        HNEFATAFL
      </div>
      <Game setBgColor={setBgColor} />
    </div>
  )
}

export default Home