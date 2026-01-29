import { Link } from 'react-router-dom'
import { Database, History, ChevronDown } from 'lucide-react'

import { useTournament } from '../contexts/Tournament'
import Page from '../components/layout/Page'
import Panel from '../components/ui/Panel'
import CompetitorCard from '../components/ui/CompetitorCard'
import MatchList from '../components/ui/MatchList'

const RecentMatchesSidebar = ({ recentMatches, totalMatches }) => (
	<section className='flex-1 flex flex-col'>
		<div className='flex items-center justify-between mb-8'>
			<div className='h3 flex items-center gap-3'>
				<History size={16} />
				<h2>Recent_Matches</h2>
			</div>
			<ChevronDown size={14} className='text-brand-muted' />
		</div>
		<div className='overflow-y-auto flex-1'>
			<MatchList matches={recentMatches} totalMatches={totalMatches} />
		</div>
	</section>
)

const HomePage = () => {
	const { competitors, totalMatches, getRecentMatches } = useTournament()
	const recentMatches = getRecentMatches()

	// Leaderboard data is pre-sorted by conservative rating (mu - 3*sigma)
	const leaderboard = competitors.slice(0, 15)
	const currentLeader = competitors.length > 0 ? competitors[0] : null

	return (
		<Page sidebar={<RecentMatchesSidebar recentMatches={recentMatches} totalMatches={totalMatches} />}>
			{/* Current Leader Highlight */}
			{currentLeader && (
				<Panel
					header={
						<div className='h3 m-0 flex items-center justify-between gap-3'>
							<div className='flex items-center gap-3'>
								<div className='w-2 h-2 rounded-full bg-brand-highlight animate-pulse' />
								<span>Current_Leader</span>
							</div>

							<Link to={`/competitor/${currentLeader.id}`} className='text-xs hover:text-brand-highlight transition-colors'>
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
					<div className='h3 m-0 flex items-center gap-2'>
						<Database size={14} />
						<span>Leaderboard</span>
					</div>
				}>
				<div className='grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4'>
					{/* Column Headers */}
					<div className='contents h4'>
						<span className='pl-4'>#</span>
						<span>Name</span>
						<span>Win_Rate</span>
						<span className='text-right'>Strength (μ)</span>
						<span className='text-right'>Uncertainty (σ)</span>
						<span className='text-right'>Rating</span>
					</div>

					{/* Leaderboard Rows */}
					{leaderboard.map((c, index) => (
						<Link key={c.id} to={`/competitor/${c.id}`} className={`contents group text-brand-muted text-sm`}>
							<span className={`pl-4 border-l-2 ${index < 3 ? 'border-brand-highlight/50' : 'border-brand-border'} group-hover:border-brand-highlight`}>
								{index + 1}
							</span>
							<span className='text-lg text-left text-brand-text group-hover:text-brand-highlight'>{c.name}</span>
							<div className='flex items-center gap-2 justify-end'>
								<span>{c.winRate}%</span>
								<div className='h-1.5 w-16 bg-brand-surface border border-brand-border overflow-hidden'>
									<div className='h-full bg-brand-highlight' style={{ width: `${c.winRate}%` }} />
								</div>
							</div>
							<span className='text-right'>{c.rating.mu.toFixed(2)}</span>
							<span className='text-right'>{c.rating.sigma.toFixed(2)}</span>
							<span className={`text-right font-bold ${index < 3 ? 'text-brand-highlight' : 'text-brand-muted'}`}>{c.conservativeRating}</span>
						</Link>
					))}
				</div>
			</Panel>
		</Page>
	)
}

export default HomePage
