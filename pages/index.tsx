import type { NextPage } from 'next'
import Board from '../components/board'

const Home: NextPage = () => {
  const stones = [
    [0, 0, 0, 2, 2, 2, 2, 2, 0, 0, 0],
    [0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [2, 0, 0, 0, 0, 1, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 1, 1, 1, 0, 0, 0, 2],
    [2, 2, 0, 1, 1, 3, 1, 1, 0, 2, 2],
    [2, 0, 0, 0, 1, 1, 1, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 1, 0, 0, 0, 0, 2],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0],
    [0, 0, 0, 2, 2, 2, 2, 2, 0, 0, 0],
  ]
  return (
    <div className="h-screen p-10">
      <Board stones={stones} />
    </div>
  )
}

export default Home