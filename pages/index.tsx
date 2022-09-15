import type { NextPage } from 'next'
import Game from '../components/game'

const Home: NextPage = () => {
  return (
    <div>
      <div className="text-6xl text-center pt-5">
        HNEFATAFL
      </div>
      <Game />
    </div>
  )
}

export default Home