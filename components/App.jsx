import { Routes, Route } from 'react-router-dom'
import HomePage from '../pages/HomePage'
import CompetitorPage from '../pages/CompetitorPage'
import MatchPage from '../pages/MatchPage'

const App = () => {
	return (
		<Routes>
			<Route path='/' element={<HomePage />} />
			<Route path='/competitor/:id' element={<CompetitorPage />} />
			<Route path='/match/:id' element={<MatchPage />} />
		</Routes>
	)
}

export default App
