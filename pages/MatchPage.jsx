import { Link, useLoaderData } from 'react-router-dom'
import { X, Zap, Users, TrendingUp } from 'lucide-react'

import Page from '../components/layout/Page'
import Panel from '../components/ui/Panel'

// Loader for match data
export const loader = async ({ params }) => {
	try {
		const matchData = await import(`../data/matches/${params.id}.json`)
		return matchData.default
	} catch (error) {
		return null
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
			<div className='flex items-center gap-3'>
				<div className='w-2 h-2 rounded-full bg-brand-highlight animate-pulse' />
				<span className='text-sm font-bold uppercase text-brand-muted'>Identity_Evaluation</span>
			</div>
			<Link to='/' className='hover:bg-brand-border rounded transition-colors'>
				<X size={18} className='text-brand-muted' />
			</Link>
		</div>
	)
}

const MatchSidebar = ({ matchData }) => {
	return (
		<section className='flex-1 flex flex-col'>
			<div className='flex items-center gap-3 mb-8 text-brand-muted'>
				<TrendingUp size={16} className='text-brand-muted' />
				<h2 className='text-sm font-bold tracking-widest uppercase'>Outcome</h2>
			</div>

			<div className='bg-brand-surface border border-brand-border p-6'>
				<div className='flex items-center gap-3 mb-4'>
					<div className='w-2 h-2 rounded-full bg-green-500 animate-pulse' />
					<Link to={`/competitor/${matchData.winnerId}`} className='text-lg uppercase font-bold text-green-500 hover:underline'>
						{matchData.winnerName}_PREFERRED
					</Link>
				</div>
				<p className='text-brand-muted text-sm mb-4'>
					Selected by{' '}
					<span className='font-semibold text-brand-text'>
						{matchData.score[matchData.winnerId]} of {matchData.score.total}
					</span>{' '}
					judge evaluations
				</p>
				<div className='pt-4 border-t border-brand-border space-y-2'>
					<p className='text-xs text-brand-muted flex items-center gap-2'>
						<span className='font-semibold'>Judge Version:</span> {matchData.judgeVersion}
					</p>
					<p className='text-xs text-brand-muted flex items-center gap-2'>
						<span className='font-semibold'>Panel Size:</span> {matchData.judgePanel.length} judges
					</p>
				</div>
			</div>
		</section>
	)
}

const MatchPage = () => {
	const matchData = useLoaderData()

	if (!matchData) {
		return (
			<Page>
				<div className='flex items-center justify-center py-20'>
					<p className='text-sm text-brand-muted italic'>Match not found</p>
				</div>
			</Page>
		)
	}

	return (
		<Page sidebar={<MatchSidebar matchData={matchData} />}>
			<Panel header={<MatchHeader />}>
				{/* Match Title */}
				<div className='mb-8'>
					<h2 className='flex gap-2 text-2xl font-bold mb-2'>
						<Link
							to={`/competitor/${matchData.competitorA.id}`}
							className={`hover:underline ${matchData.winnerId === matchData.competitorA.id ? 'text-green-500' : 'text-red-500'}`}>
							{matchData.competitorA.name}
						</Link>
						<span className='text-brand-text'>vs</span>
						<Link
							to={`/competitor/${matchData.competitorB.id}`}
							className={`hover:underline ${matchData.winnerId === matchData.competitorB.id ? 'text-green-500' : 'text-red-500'}`}>
							{matchData.competitorB.name}
						</Link>
					</h2>
					<span className='text-sm text-brand-muted'>{new Date(matchData.timestamp).toLocaleString()}</span>
				</div>

				{/* Score Summary */}
				<div className='mb-8 p-6 bg-brand-surface border border-brand-border'>
					<div className='flex items-center justify-between mb-4'>
						<div className='text-center flex-1'>
							<Link
								to={`/competitor/${matchData.competitorA.id}`}
								className='text-xs text-brand-muted uppercase tracking-widest mb-2 hover:text-brand-text transition-colors inline-block'>
								{matchData.competitorA.name}
							</Link>
							<p className={`text-4xl font-bold ${matchData.winnerId === matchData.competitorA.id ? 'text-green-500' : 'text-red-500'}`}>
								{matchData.score[matchData.competitorA.id]}
							</p>
						</div>
						<div className='text-center px-6'>
							<p className='text-sm text-brand-muted'>of</p>
							<p className='text-xl font-semibold text-brand-text'>{matchData.score.total}</p>
						</div>
						<div className='text-center flex-1'>
							<Link
								to={`/competitor/${matchData.competitorB.id}`}
								className='text-xs text-brand-muted uppercase tracking-widest mb-2 hover:text-brand-text transition-colors inline-block'>
								{matchData.competitorB.name}
							</Link>
							<p className={`text-4xl font-bold ${matchData.winnerId === matchData.competitorB.id ? 'text-green-500' : 'text-red-500'}`}>
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

				{/* Judge Evaluations */}
				<div className='mb-8'>
					<div className='flex items-center gap-2 mb-6'>
						<Users size={16} className='text-brand-muted' />
						<span className='text-sm font-bold uppercase tracking-widest text-brand-muted'>Judge_Panel_Decisions</span>
					</div>
					<div className='space-y-6'>
						{matchData.evaluations.map((eval_, i) => {
							const selectedName = eval_.selectedId === matchData.competitorA.id ? matchData.competitorA.name : matchData.competitorB.name
							const isASelected = eval_.selectedId === matchData.competitorA.id
							return (
								<div key={i} className={`border-l-2 pl-6 py-2 ${isASelected ? 'border-green-500' : 'border-red-500'}`}>
									<div className='flex items-center gap-2 mb-3 text-sm'>
										<span className='font-semibold uppercase'>{eval_.model.split('/')[1] || eval_.model}</span>
										<span className='text-xs text-brand-muted'>→</span>
										<Link to={`/competitor/${eval_.selectedId}`} className='font-semibold uppercase hover:underline'>
											{selectedName}
										</Link>
										<span className='text-xs uppercase text-brand-muted'>Order_{eval_.ordering}</span>
									</div>
									<p className='text-brand-muted font-sans text-sm leading-relaxed'>&ldquo;{eval_.rationale}&rdquo;</p>
								</div>
							)
						})}
					</div>
				</div>
			</Panel>
		</Page>
	)
}

export default MatchPage
