import Link from 'next/link'
import Head from 'next/head'
import { X, Zap, Users, TrendingUp } from 'lucide-react'

import { getTournamentData, getAllMatchIds, getMatchData } from '../../lib/data'

import Page from '../../components/layout/Page'
import Panel from '../../components/ui/Panel'

export async function getStaticPaths() {
	const matchIds = getAllMatchIds()

	return {
		paths: matchIds.map((id) => ({
			params: { id },
		})),
		fallback: false,
	}
}

export async function getStaticProps({ params }) {
	const matchData = getMatchData(params.id)
	const { competitors, totalMatches, avgRating, generatedAt } = getTournamentData()

	if (!matchData) {
		return { notFound: true }
	}

	return {
		props: {
			matchData,
			competitors,
			totalMatches,
			avgRating,
			generatedAt,
		},
	}
}

// Get entropy label
const getEntropyLabel = (entropy) => {
	if (entropy < 0.5) return 'Strong'
	if (entropy < 0.8) return 'Moderate'
	return 'Contested'
}

const MatchHeader = () => {
	return (
		<div className='flex items-center justify-between gap-3'>
			<div className='h3 m-0 flex items-center gap-3'>
				<div className='w-2 h-2 rounded-full bg-brand-highlight animate-pulse' />
				<span>Identity_Evaluation</span>
			</div>
			<Link href='/' className='hover:bg-brand-border rounded transition-colors'>
				<X size={18} className='text-brand-muted' />
			</Link>
		</div>
	)
}

const MatchSidebar = ({ matchData }) => {
	return (
		<section className='flex-1 flex flex-col'>
			<div className='h3 mb-6 flex items-center gap-3'>
				<TrendingUp size={16} />
				<h2>Outcome</h2>
			</div>

			<div>
				<div className='h2 mb-6 flex items-center gap-3'>
					<div className='w-2 h-2 rounded-full bg-green-500 animate-pulse' />
					<Link href={`/competitor/${matchData.winnerId}`} className='text-green-500 hover:underline'>
						{matchData.winnerName}_PREFERRED
					</Link>
				</div>

				{/* Score Summary */}
				<div className='mb-8 p-6 bg-brand-surface border border-brand-border'>
					<div className='flex items-center justify-between mb-4'>
						<div className='text-center flex-1'>
							<Link href={`/competitor/${matchData.competitorA.id}`} className='h3 hover:text-brand-text transition-colors'>
								{matchData.competitorA.name}
							</Link>
							<p className={`h1 ${matchData.winnerId === matchData.competitorA.id ? 'text-green-500' : 'text-red-500'}`}>
								{matchData.score[matchData.competitorA.id]}
							</p>
						</div>
						<div className='text-center px-6'>
							<p className='text-sm text-brand-muted'>of</p>
							<p className='text-xl font-semibold text-brand-text'>{matchData.score.total}</p>
						</div>
						<div className='text-center flex-1'>
							<Link href={`/competitor/${matchData.competitorB.id}`} className='h3 hover:text-brand-text transition-colors'>
								{matchData.competitorB.name}
							</Link>
							<p className={`h1 ${matchData.winnerId === matchData.competitorB.id ? 'text-green-500' : 'text-red-500'}`}>
								{matchData.score[matchData.competitorB.id]}
							</p>
						</div>
					</div>
					<div className='flex items-center justify-center gap-2 pt-4 border-t border-brand-border'>
						<Zap size={14} className='text-brand-muted' />
						<span className='text-sm text-brand-muted'>
							Consensus: <span className='font-semibold text-brand-text'>{getEntropyLabel(matchData.entropy)}</span> (entropy: {matchData.entropy.toFixed(3)})
						</span>
					</div>
				</div>

				<div className='space-y-2 text-xs text-brand-muted'>
					<p>
						<span className='font-semibold'>Judge Version:</span> {matchData.judgeVersion}
					</p>
					<p>
						<span className='font-semibold'>Panel Size:</span> {matchData.judgePanel.length} judges
					</p>
				</div>
			</div>
		</section>
	)
}

const MatchPage = ({ matchData, competitors, totalMatches, avgRating, generatedAt }) => {
	if (!matchData) {
		return (
			<Page tournamentData={{ competitors, totalMatches, avgRating, generatedAt }}>
				<div className='flex items-center justify-center py-20'>
					<p className='text-sm text-brand-muted italic'>Match not found</p>
				</div>
			</Page>
		)
	}

	return (
		<>
			<Head>
				<title>
					{matchData.competitorA.name} vs {matchData.competitorB.name} | Attractor Arena
				</title>
			</Head>
			<Page sidebar={<MatchSidebar matchData={matchData} />} tournamentData={{ competitors, totalMatches, avgRating, generatedAt }}>
				<Panel header={<MatchHeader />}>
					{/* Match Title */}
					<div className='mb-8'>
						<div className='h3'>
							Selected by{' '}
							<span className='font-semibold text-brand-text'>
								{matchData.score[matchData.winnerId]} of {matchData.score.total}
							</span>{' '}
							judge evaluations
						</div>
						<h2 className='h1 flex gap-2'>
							<Link
								href={`/competitor/${matchData.competitorA.id}`}
								className={`hover:underline ${matchData.winnerId === matchData.competitorA.id ? 'text-green-500' : 'text-red-500'}`}>
								{matchData.competitorA.name}
							</Link>
							<span className='text-brand-text'>vs</span>
							<Link
								href={`/competitor/${matchData.competitorB.id}`}
								className={`hover:underline ${matchData.winnerId === matchData.competitorB.id ? 'text-green-500' : 'text-red-500'}`}>
								{matchData.competitorB.name}
							</Link>
						</h2>
						<div className='h3'>{new Date(matchData.timestamp).toLocaleString()}</div>
					</div>
				</Panel>

				<Panel
					header={
						<div className='h3 m-0 flex items-center gap-2'>
							<Users size={16} />
							<span>Judge_Panel_Decisions</span>
						</div>
					}>
					{/* Judge Evaluations */}
					<div className='space-y-6'>
						{matchData.evaluations.map((eval_, i) => {
							const selectedName = eval_.selectedId === matchData.competitorA.id ? matchData.competitorA.name : matchData.competitorB.name
							const isASelected = eval_.selectedId === matchData.competitorA.id
							return (
								<div key={i} className={`border-l-2 pl-6 py-2 text-sm ${isASelected ? 'border-green-500' : 'border-red-500'}`}>
									<div className='flex items-center gap-2 mb-3'>
										<span className='font-semibold uppercase'>{eval_.model.split('/')[1] || eval_.model}</span>
										<span className='text-xs text-brand-muted'>→</span>
										<Link href={`/competitor/${eval_.selectedId}`} className='font-semibold uppercase hover:underline'>
											{selectedName}
										</Link>
										<span className='text-xs uppercase text-brand-muted'>Order_{eval_.ordering}</span>
									</div>
									<p className='text-brand-muted font-sans leading-relaxed'>&ldquo;{eval_.rationale}&rdquo;</p>
								</div>
							)
						})}
					</div>
				</Panel>
			</Page>
		</>
	)
}

export default MatchPage
