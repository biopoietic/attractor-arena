import { Link, useParams } from 'react-router-dom'
import { X } from 'lucide-react'
import leaderboardData from '../data/leaderboard.json'
import Panel from '../components/ui/Panel'
import CompetitorCard from '../components/ui/CompetitorCard'

const { competitors } = leaderboardData

// Create lookup map for quick access
const competitorMap = Object.fromEntries(competitors.map((c) => [c.id, c]))

// Get rank for a competitor
const getRank = (competitorId) => {
	return competitors.findIndex((c) => c.id === competitorId) + 1
}

const CompetitorPage = () => {
	const { id } = useParams()
	const competitor = competitorMap[id]

	if (!competitor) {
		return (
			<div className='flex items-center justify-center py-20'>
				<p className='text-xs text-zinc-700 italic'>Competitor not found</p>
			</div>
		)
	}

	return (
		<Panel
			header={
				<div className='flex items-center justify-between gap-3'>
					<div className='flex items-center gap-3'>
						<div className='w-2 h-2 rounded-full bg-rose-500 animate-pulse' />
						<span className='text-xs font-bold uppercase tracking-[0.4em] text-zinc-500'>Competitor_Profile</span>
					</div>
					<Link to='/' className='hover:bg-zinc-900 rounded transition-colors'>
						<X size={18} className='text-zinc-500' />
					</Link>
				</div>
			}>
			<CompetitorCard competitor={competitor} rank={getRank(competitor.id)} onViewProfile={() => {}} />
		</Panel>
	)
}

export default CompetitorPage
