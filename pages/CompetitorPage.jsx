import { Link, useLoaderData } from 'react-router-dom'
import { X, History, ChevronDown, User, FileText } from 'lucide-react'

import Page from '../components/layout/Page'
import Panel from '../components/ui/Panel'
import CompetitorCard from '../components/ui/CompetitorCard'
import MatchList from '../components/ui/MatchList'
import { tournamentLoader, getCompetitor, getCompetitorRank, getCompetitorMatches } from '../api/tournament'

/**
 * Competitor page loader - loads competitor markdown and data
 */
export const loader = async ({ params }) => {
	const competitorId = params.id

	// Load tournament data directly (will be cached by React Router)
	const { competitors, matches, totalMatches } = tournamentLoader()

	const competitor = getCompetitor(competitors, competitorId)
	const rank = getCompetitorRank(competitors, competitorId)
	const competitorMatches = getCompetitorMatches(matches, competitorId)

	let justification = null
	try {
		const competitorMd = await import(`../competitors/${competitorId}.md?raw`)
		const markdown = competitorMd.default
		// Strip frontmatter from markdown
		justification = markdown ? markdown.replace(/^---\n[\s\S]*?\n---\n/, '').replace(/^\n+/, '') : null
	} catch {
		justification = null
	}

	return {
		justification,
		competitor,
		rank,
		competitorMatches,
		totalMatches,
	}
}

const CompetitorMatchesSidebar = ({ matches, totalMatches }) => {
	return (
		<section className='flex-1 flex flex-col'>
			<div className='flex items-center justify-between mb-8'>
				<div className='flex items-center gap-3'>
					<History size={16} className='text-brand-muted' />
					<h2 className='h3'>Recent_Matches</h2>
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
	const { justification, competitor, rank, competitorMatches, totalMatches } = useLoaderData()

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
		<Page sidebar={<CompetitorMatchesSidebar matches={competitorMatches} totalMatches={totalMatches} />}>
			<Panel
				header={
					<div className='flex items-center justify-between gap-3'>
						<div className='h3 m-0 flex items-center gap-3'>
							<User size={14} className='text-brand-highlight' />
							<span>Competitor_Profile</span>
						</div>
						<Link to='/' className='hover:bg-brand-border rounded transition-colors'>
							<X size={18} className='text-brand-muted' />
						</Link>
					</div>
				}>
				<CompetitorCard competitor={competitor} rank={rank} />
			</Panel>

			<Panel
				header={
					<div className='h3 m-0 flex items-center gap-3'>
						<FileText size={14} className='text-brand-highlight' />
						<span>Core_Justification</span>
					</div>
				}>
				{justification ? (
					<div className='prose prose-invert max-w-none'>
						<pre className='whitespace-pre-wrap text-sm text-brand-text'>{justification}</pre>
					</div>
				) : (
					<p className='text-sm text-brand-muted italic'>No justification available</p>
				)}
			</Panel>
		</Page>
	)
}

export default CompetitorPage
