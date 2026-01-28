import { Link } from 'react-router-dom'
import { Database, History, ChevronDown } from 'lucide-react'

import leaderboardData from '../data/leaderboard.json'
import Page from '../components/layout/Page'
import Panel from '../components/ui/Panel'
import CompetitorCard from '../components/ui/CompetitorCard'
import MatchList from '../components/ui/MatchList'

const { competitors, recentMatches, totalMatches } = leaderboardData

const RecentMatchesSidebar = () => (
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
)

const HomePage = () => {
	// Leaderboard data is pre-sorted by conservative rating (mu - 3*sigma)
	const leaderboard = competitors.slice(0, 15)
	const currentLeader = competitors.length > 0 ? competitors[0] : null

	return (
		<Page sidebar={<RecentMatchesSidebar />}>
			{/* Current Leader Highlight */}
			{currentLeader && (
				<Panel
					header={
						<div className='flex items-center justify-between gap-3'>
							<div className='flex items-center gap-3'>
								<div className='w-2 h-2 rounded-full bg-rose-500 animate-pulse' />
								<span className='text-xs font-bold uppercase tracking-[0.4em] text-zinc-500'>Current_Leader</span>
							</div>

							<Link to={`/competitor/${currentLeader.id}`} className='text-xs text-zinc-600 hover:text-rose-500 transition-colors uppercase tracking-widest'>
								View_Profile →
							</Link>
						</div>
					}>
					<CompetitorCard competitor={currentLeader} rank={1} />
				</Panel>
			)}

			{/* Leaderboard */}
			<Panel
				header={
					<div className='flex items-center gap-2'>
						<Database size={14} className='text-zinc-600' />
						<span className='text-xs font-bold uppercase tracking-[0.4em] text-zinc-500'>Leaderboard</span>
					</div>
				}>
				<div className='grid grid-cols-[auto_1fr_auto_auto_auto_auto]'>
					{/* Column Headers */}
					<div className='contents'>
						<span className='text-xs text-zinc-600 uppercase font-semibold p-4 border-b border-zinc-800'>#</span>
						<span className='text-xs text-zinc-600 uppercase font-semibold p-4 border-b border-zinc-800'>Name</span>
						<span className='text-xs text-zinc-600 uppercase font-semibold p-4 border-b border-zinc-800 text-center'>Win Rate</span>
						<span className='text-xs text-zinc-600 uppercase font-semibold p-4 border-b border-zinc-800 text-right'>μ (Strength)</span>
						<span className='text-xs text-zinc-600 uppercase font-semibold p-4 border-b border-zinc-800 text-right'>σ (Uncertainty)</span>
						<span className='text-xs text-zinc-600 uppercase font-semibold p-4 border-b border-zinc-800 text-right'>Rating</span>
					</div>

					{/* Leaderboard Rows */}
					{leaderboard.map((c, index) => (
						<Link key={c.id} to={`/competitor/${c.id}`} className={`contents group`}>
							<span
								className={`text-xs text-zinc-600 p-4 group-hover:bg-clinical-surface transition-colors border-l-2 ${index < 3 ? 'border-rose-500' : 'border-clinical-border'} group-hover:border-rose-500`}>
								{index + 1}
							</span>
							<span className='text-zinc-400 text-left group-hover:text-white group-hover:bg-clinical-surface transition-colors p-4'>{c.name}</span>
							<div className='flex items-center gap-2 justify-center p-4 group-hover:bg-clinical-surface transition-colors'>
								<span className='text-xs text-zinc-600'>{c.winRate}%</span>
								<div className='h-1.5 w-16 bg-zinc-900 border border-zinc-800 overflow-hidden'>
									<div className='h-full bg-rose-500' style={{ width: `${c.winRate}%` }} />
								</div>
							</div>
							<span className='text-xs text-zinc-600 text-right p-4 group-hover:bg-clinical-surface transition-colors'>{c.rating.mu.toFixed(2)}</span>
							<span className='text-xs text-zinc-700 text-right p-4 group-hover:bg-clinical-surface transition-colors'>{c.rating.sigma.toFixed(2)}</span>
							<span className={`text-xs font-bold text-right p-4 group-hover:bg-clinical-surface transition-colors ${index < 3 ? 'text-rose-500' : 'text-zinc-500'}`}>
								{c.conservativeRating}
							</span>
						</Link>
					))}
				</div>
			</Panel>
		</Page>
	)
}

export default HomePage
