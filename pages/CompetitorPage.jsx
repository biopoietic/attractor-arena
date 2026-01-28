import { Link, useParams } from 'react-router-dom'
import { X, History, ChevronDown } from 'lucide-react'
import leaderboardData from '../data/leaderboard.json'
import Page from '../components/layout/Page'
import Panel from '../components/ui/Panel'
import CompetitorCard from '../components/ui/CompetitorCard'
import MatchList from '../components/ui/MatchList'

const { competitors, recentMatches, totalMatches } = leaderboardData

// Create lookup map for quick access
const competitorMap = Object.fromEntries(competitors.map((c) => [c.id, c]))

// Get rank for a competitor
const getRank = (competitorId) => {
	return competitors.findIndex((c) => c.id === competitorId) + 1
}

// Filter matches for a specific competitor
const getCompetitorMatches = (competitorId) => {
	return recentMatches.filter((m) => m.competitorA.id === competitorId || m.competitorB.id === competitorId)
}

const CompetitorMatchesSidebar = ({ competitorId }) => {
	const matches = getCompetitorMatches(competitorId)

	return (
		<section className='flex-1 flex flex-col'>
			<div className='flex items-center justify-between mb-8'>
				<div className='flex items-center gap-3'>
					<History size={16} className='text-brand-muted' />
					<h2 className='text-sm font-bold tracking-widest uppercase'>Recent_Matches</h2>
				</div>
				<ChevronDown size={14} className='text-brand-border' />
			</div>
			<div className='overflow-y-auto flex-1 pr-4'>
				<MatchList matches={matches} totalMatches={totalMatches} />
			</div>
		</section>
	)
}

const CompetitorPage = () => {
	const { id } = useParams()
	const competitor = competitorMap[id]

	if (!competitor) {
		return (
			<Page>
				<div className='flex items-center justify-center py-20'>
					<p className='text-sm text-brand-muted italic'>Competitor not found</p>
				</div>
			</Page>
		)
	}

	return (
		<Page sidebar={<CompetitorMatchesSidebar competitorId={id} />}>
			<Panel
				header={
					<div className='flex items-center justify-between gap-3'>
						<div className='flex items-center gap-3'>
							<div className='w-2 h-2 rounded-full bg-brand-highlight animate-pulse' />
							<span className='text-sm font-bold uppercase tracking-widest text-brand-muted'>Competitor_Profile</span>
						</div>
						<Link to='/' className='hover:bg-brand-border rounded transition-colors'>
							<X size={18} className='text-brand-muted' />
						</Link>
					</div>
				}>
				<CompetitorCard competitor={competitor} rank={getRank(competitor.id)} onViewProfile={() => {}} />
			</Panel>
		</Page>
	)
}

export default CompetitorPage
