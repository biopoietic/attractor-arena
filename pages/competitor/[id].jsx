import Link from 'next/link'
import Head from 'next/head'
import { X, History, ChevronDown, User, FileText } from 'lucide-react'

import { getTournamentData, getCompetitor, getCompetitorRank, getCompetitorMatches, getCompetitorMarkdown, getAllCompetitorIds } from '../../lib/tournament'

import Page from '../../components/layout/Page'
import Panel from '../../components/ui/Panel'
import MatchList from '../../components/ui/MatchList'
import CompetitorCard from '../../components/ui/CompetitorCard'

export async function getStaticPaths() {
	const competitorIds = getAllCompetitorIds()

	return {
		paths: competitorIds.map((id) => ({
			params: { id },
		})),
		fallback: false,
	}
}

export async function getStaticProps({ params }) {
	const { competitors, matches, totalMatches, avgRating, generatedAt } = getTournamentData()

	const competitor = getCompetitor(competitors, params.id)
	const rank = getCompetitorRank(competitors, params.id)
	const competitorMatches = getCompetitorMatches(matches, params.id)
	const justification = getCompetitorMarkdown(params.id)

	if (!competitor) {
		return { notFound: true }
	}

	return {
		props: {
			competitor,
			rank,
			competitorMatches,
			justification,
			totalMatches,
			competitors,
			avgRating,
			generatedAt,
		},
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

const CompetitorPage = ({ competitor, rank, competitorMatches, justification, totalMatches, competitors, avgRating, generatedAt }) => {
	if (!competitor) {
		return (
			<Page competitors={competitors} totalMatches={totalMatches} avgRating={avgRating} generatedAt={generatedAt}>
				<div className='flex items-center justify-center py-20'>
					<p className='text-sm text-brand-muted italic'>Competitor not found</p>
				</div>
			</Page>
		)
	}

	return (
		<>
			<Head>
				<title>{competitor.name} | Attractor Arena</title>
			</Head>
			<Page
				sidebar={<CompetitorMatchesSidebar matches={competitorMatches} totalMatches={totalMatches} />}
				competitors={competitors}
				totalMatches={totalMatches}
				avgRating={avgRating}
				generatedAt={generatedAt}>
				<Panel
					header={
						<div className='flex items-center justify-between gap-3'>
							<div className='h3 m-0 flex items-center gap-3'>
								<User size={14} className='text-brand-highlight' />
								<span>Competitor_Profile</span>
							</div>
							<Link href='/' className='hover:bg-brand-border rounded transition-colors'>
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
		</>
	)
}

export default CompetitorPage
