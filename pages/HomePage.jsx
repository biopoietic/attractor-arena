import { Link, useRouteLoaderData } from 'react-router-dom'
import { User, Database, History, ChevronDown } from 'lucide-react'

import Page from '../components/layout/Page'
import Panel from '../components/ui/Panel'
import CompetitorCard from '../components/ui/CompetitorCard'
import MatchList from '../components/ui/MatchList'
import Leaderboard from '../components/ui/Leaderboard'

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
	const { competitors, totalMatches, recentMatches } = useRouteLoaderData('root')

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
				<Leaderboard leaderboard={leaderboard} />
			</Panel>
		</Page>
	)
}

export default HomePage
