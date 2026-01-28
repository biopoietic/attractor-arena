import { Link, useNavigate } from 'react-router-dom'

const MatchList = ({ matches, totalMatches }) => {
	const navigate = useNavigate()

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
			{matches.map((match, i) => (
				<div
					key={match.timestamp + i}
					onClick={() => navigate(`/match/${match.matchId}`)}
					className='w-full border-b border-zinc-900 transition-all hover:bg-zinc-900/5 py-5 px-4 flex justify-between items-center cursor-pointer'>
					<div className='flex flex-col gap-2'>
						<div className='flex gap-2 text-xs'>
							<span className='text-zinc-500 font-bold'> EVAL_{totalMatches - i}</span>
							{match.entropy !== undefined && <span className='text-zinc-600'>{getEntropyLabel(match.entropy)}</span>}
						</div>
						<div className='flex items-center gap-2'>
							<Competitor competitor={match.competitorA} match={match} />
							<span className='text-xs text-zinc-700'>vs</span>
							<Competitor competitor={match.competitorB} match={match} />
						</div>
					</div>
					<div className='text-right flex flex-col gap-1'>
						<span className='text-xs text-zinc-600'>
							{match.scoreA}-{match.scoreB}
						</span>
						<span className='text-xs text-zinc-800'>{new Date(match.timestamp).toLocaleDateString()}</span>
					</div>
				</div>
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
