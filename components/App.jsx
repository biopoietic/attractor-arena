import { Routes, Route } from 'react-router-dom'
import { History, ChevronDown } from 'lucide-react'
import leaderboardData from '../data/leaderboard.json'
import Header from './layout/Header'
import Footer from './layout/Footer'
import MatchList from './ui/MatchList'
import HomePage from '../pages/HomePage'
import CompetitorPage from '../pages/CompetitorPage'
import MatchPage from '../pages/MatchPage'

const { competitors, recentMatches, totalMatches, generatedAt } = leaderboardData

// Calculate average rating for display
const avgRating = competitors.length ? (competitors.reduce((acc, c) => acc + c.rating.mu, 0) / competitors.length).toFixed(2) : 0

const App = () => {
	return (
		<div className='h-screen bg-black text-white flex flex-col select-none overflow-hidden'>
			<div className='scanline' />

			<Header totalMatches={totalMatches} avgRating={avgRating} />

			{/* Main Wide Application Shell */}
			<main className='flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-[1fr_32rem] h-full relative z-10'>
				<aside className='border-r border-clinical-border overflow-y-auto p-10 flex flex-col gap-12 bg-black'>
					<Routes>
						<Route path='/' element={<HomePage />} />
						<Route path='/competitor/:id' element={<CompetitorPage />} />
						<Route path='/match/:id' element={<MatchPage />} />
					</Routes>
				</aside>

				{/* Right Sidebar */}
				<aside className='overflow-y-auto p-10 flex flex-col gap-16 bg-[#020202]'>
					<section className='flex-1 flex flex-col'>
						<div className='flex items-center justify-between mb-8'>
							<div className='flex items-center gap-3'>
								<History size={16} className='text-zinc-600' />
								<h2 className='text-sm font-bold text-zinc-400 tracking-widest uppercase'>Recent_Matches</h2>
							</div>
							<ChevronDown size={14} className='text-zinc-800' />
						</div>
						<div className='overflow-y-auto flex-1 pr-4'>
							<MatchList matches={recentMatches} totalMatches={totalMatches} />
						</div>
					</section>
				</aside>
			</main>

			<Footer lastUpdate={generatedAt} />
		</div>
	)
}

export default App
