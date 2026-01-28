import { Link } from 'react-router-dom'

const MatchList = ({ matches, totalMatches }) => {
	// Get entropy label
	const getEntropyLabel = (entropy) => {
		if (entropy < 0.5) return 'Strong'
		if (entropy < 0.8) return 'Moderate'
		return 'Contested'
	}

	const Competitor = ({ competitor, match }) => (
		<Link
			to={`/competitor/${competitor.id}`}
			onClick={(e) => e.stopPropagation()}
			className={`text-xs hover:underline ${match.winnerName === competitor.name ? 'text-green-500' : 'text-red-500'}`}>
			{competitor.name}
		</Link>
	)

	return (
		<div className='space-y-px'>
			{matches.map((m, i) => (
				<Link
					key={m.timestamp + i}
					to={`/match/${m.matchId}`}
					className='w-full border-b border-zinc-900 bg-black transition-all hover:bg-zinc-900/5 py-5 px-4 flex justify-between items-center text-left'>
					<div className='flex flex-col gap-2'>
						<div className='flex gap-2 text-xs'>
							<span className='text-zinc-500 font-bold'> EVAL_{totalMatches - i}</span>
							{m.entropy !== undefined && <span className='text-zinc-600'>{getEntropyLabel(m.entropy)}</span>}
						</div>
						<div className='flex items-center gap-2'>
							<Competitor competitor={m.competitorA} match={m} />
							<span className='text-xs text-zinc-700'>vs</span>
							<Competitor competitor={m.competitorB} match={m} />
						</div>
					</div>
					<div className='text-right flex flex-col gap-1'>
						<span className='text-xs text-zinc-600'>
							{m.scoreA}-{m.scoreB}
						</span>
						<span className='text-xs text-zinc-800'>{new Date(m.timestamp).toLocaleDateString()}</span>
					</div>
				</Link>
			))}
			{matches.length === 0 && (
				<div className='py-10 text-center'>
					<p className='text-xs text-zinc-700 italic'>No matches recorded</p>
				</div>
			)}
		</div>
	)
}

export default MatchList
