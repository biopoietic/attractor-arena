import { Link } from 'react-router-dom'
import { User, Database, History, ChevronDown } from 'lucide-react'

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
	const leaderboard = competitors.slice(0, 100)
	const currentLeader = competitors.length > 0 ? competitors[0] : null

	return (
		<Page sidebar={<RecentMatchesSidebar recentMatches={recentMatches} totalMatches={totalMatches} />}>
			{/* Current Leader Highlight */}
			{currentLeader && (
				<Panel
					header={
						<div className='h3 m-0 flex items-center justify-between gap-3'>
							<div className='flex items-center gap-3'>
								<User size={14} className='text-brand-highlight' />
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
					<div className='h3 m-0 flex items-center gap-3'>
						<Database size={14} />
						<span>Leaderboard</span>
					</div>
				}>
				<div className='overflow-x-auto'>
					<table className='text-right text-brand-muted'>
						<thead>
							<tr className='h4'>
								<th>#</th>
								<th className='text-left'>Name</th>
								<th>Matches</th>
								<th>Evals</th>
								<th>Wins</th>
								<th>Loss</th>
								<th>Strength (μ)</th>
								<th>Sigma (σ)</th>
								<th>Win_Rate</th>
								<th>ELO</th>
							</tr>
						</thead>
						<tbody>
							{leaderboard.map((c, index) => (
								<tr key={c.id} className='text-right group'>
									<td className='relative'>
										<div
											className={`absolute left-0 top-2 bottom-2 w-0.75 ${index < 3 ? 'bg-brand-highlight/50' : 'bg-brand-border'} group-hover:bg-brand-highlight`}
										/>
										{index + 1}
									</td>
									<td className='text-left'>
										<Link to={`/competitor/${c.id}`} className='text-md text-brand-text group-hover:text-brand-highlight transition-colors'>
											{c.name}
										</Link>
									</td>
									<td>{c.matches}</td>
									<td>{c.totalEvaluations}</td>
									<td>{c.wins}</td>
									<td>{c.losses}</td>
									<td>{c.mu.toFixed(2)}</td>
									<td>{c.sigma.toFixed(2)}</td>
									<td>
										<div className='flex items-center gap-2 justify-end'>
											<span>{c.winRate}%</span>
											<div className='h-1.5 w-16 bg-brand-surface border border-brand-border overflow-hidden'>
												<div className='h-full bg-brand-highlight' style={{ width: `${c.winRate}%` }} />
											</div>
										</div>
									</td>
									<td className={`font-semibold ${c.rating > 1500 ? 'text-brand-highlight' : ''}`}>{c.rating}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</Panel>
		</Page>
	)
}

export default HomePage
