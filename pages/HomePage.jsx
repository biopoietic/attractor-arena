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
			<div className='flex items-center gap-3'>
				<History size={16} className='text-brand-muted' />
				<h2 className='text-sm font-bold tracking-widest uppercase'>Recent_Matches</h2>
			</div>
			<ChevronDown size={14} className='text-brand-border' />
		</div>
		<div className='overflow-y-auto flex-1 pr-4'>
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
						<div className='flex items-center justify-between gap-3'>
							<div className='flex items-center gap-3'>
								<div className='w-2 h-2 rounded-full bg-brand-highlight animate-pulse' />
								<span className='text-sm font-bold uppercase tracking-widest text-brand-muted'>Current_Leader</span>
							</div>

							<Link
								to={`/competitor/${currentLeader.id}`}
								className='text-xs text-brand-muted hover:text-brand-highlight transition-colors uppercase tracking-widest'>
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
						<Database size={14} className='text-brand-muted' />
						<span className='text-sm font-bold uppercase tracking-widest text-brand-muted'>Leaderboard</span>
					</div>
				}>
				<div className='grid grid-cols-[auto_1fr_auto_auto_auto_auto]'>
					{/* Column Headers */}
					<div className='contents text-sm text-brand-muted uppercase font-semibold'>
						<span className='p-4'>#</span>
						<span className='p-4'>Name</span>
						<span className='p-4'>Win Rate</span>
						<span className='p-4'>μ (Strength)</span>
						<span className='p-4'>σ (Uncertainty)</span>
						<span className='p-4'>Rating</span>
					</div>

					{/* Leaderboard Rows */}
					{leaderboard.map((c, index) => (
						<Link key={c.id} to={`/competitor/${c.id}`} className={`contents group text-brand-muted text-sm`}>
							<span
								className={`p-4 group-hover:bg-brand-surface transition-colors border-l-2 ${index < 3 ? 'border-brand-highlight/50' : 'border-brand-border'} group-hover:border-brand-highlight`}>
								{index + 1}
							</span>
							<span className='text-lg text-left text-brand-text group-hover:text-brand-highlight group-hover:bg-brand-surface transition-colors p-4'>{c.name}</span>
							<div className='flex items-center gap-2 justify-center p-4 group-hover:bg-brand-surface transition-colors'>
								<span>{c.winRate}%</span>
								<div className='h-1.5 w-16 bg-brand-surface border border-brand-border overflow-hidden'>
									<div className='h-full bg-brand-highlight' style={{ width: `${c.winRate}%` }} />
								</div>
							</div>
							<span className='text-right p-4 group-hover:bg-brand-surface transition-colors'>{c.rating.mu.toFixed(2)}</span>
							<span className='text-right p-4 group-hover:bg-brand-surface transition-colors'>{c.rating.sigma.toFixed(2)}</span>
							<span className={`font-bold text-right p-4 group-hover:bg-brand-surface transition-colors ${index < 3 ? 'text-brand-highlight' : 'text-brand-muted'}`}>
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
