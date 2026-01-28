import { Link, useLoaderData } from 'react-router-dom'
import { X, History, ChevronDown } from 'lucide-react'
import Page from '../components/layout/Page'
import Panel from '../components/ui/Panel'
import CompetitorCard from '../components/ui/CompetitorCard'
import MatchList from '../components/ui/MatchList'

// Loader for competitor data
export const loader = async ({ params }) => {
	try {
		const [competitorMd, leaderboard] = await Promise.all([import(`../competitors/${params.id}.md?raw`), import('../data/leaderboard.json')])

		const leaderboardData = leaderboard.default
		const { competitors, recentMatches, totalMatches } = leaderboardData

		// Find competitor
		const competitor = competitors.find((c) => c.id === params.id)
		if (!competitor) {
			return { competitor: null, markdown: null, rank: null, matches: [], totalMatches }
		}

		// Get rank
		const rank = competitors.findIndex((c) => c.id === params.id) + 1

		// Filter matches for this competitor
		const matches = recentMatches.filter((m) => m.competitorA.id === params.id || m.competitorB.id === params.id)

		return {
			competitor,
			markdown: competitorMd.default,
			rank,
			matches,
			totalMatches,
		}
	} catch (error) {
		return { competitor: null, markdown: null, rank: null, matches: [], totalMatches: 0 }
	}
}

const CompetitorMatchesSidebar = ({ matches, totalMatches }) => {
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
	const { competitor, rank, matches, totalMatches } = useLoaderData()

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
		<Page sidebar={<CompetitorMatchesSidebar matches={matches} totalMatches={totalMatches} />}>
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
				<CompetitorCard competitor={competitor} rank={rank} onViewProfile={() => {}} />
			</Panel>
		</Page>
	)
}

export default CompetitorPage
