import Link from 'next/link'
import { useRouter } from 'next/router'

const MatchList = ({ matches, totalMatches }) => {
	const router = useRouter()

	// Get entropy label
	const getEntropyLabel = (entropy) => {
		if (entropy < 0.5) return 'Strong'
		if (entropy < 0.8) return 'Moderate'
		return 'Contested'
	}

	const Competitor = ({ competitor, match }) => (
		<Link
			href={`/competitor/${competitor.id}`}
			onClick={(e) => e.stopPropagation()}
			className={`uppercase hover:underline ${match.winnerName === competitor.name ? 'text-green-500' : 'text-red-500'}`}>
			{competitor.name}
		</Link>
	)

	return (
		<div className='space-y-px text-sm text-brand-muted'>
			{matches.map((match, i) => (
				<div
					key={match.timestamp + i}
					onClick={() => router.push(`/match/${match.matchId}`)}
					className='w-full border-b border-brand-border transition-all hover:bg-brand-surface py-5 px-4 flex justify-between items-center cursor-pointer'>
					<div className='flex flex-col gap-1'>
						<div className='flex gap-2'>
							<span className='font-semibold'>EVAL_{totalMatches - i}</span>
							{match.entropy !== undefined && <span>{getEntropyLabel(match.entropy)}</span>}
						</div>
						<div className='flex items-center gap-2'>
							<Competitor competitor={match.competitorA} match={match} />
							<span>vs</span>
							<Competitor competitor={match.competitorB} match={match} />
						</div>
					</div>
					<div className='text-right flex flex-col gap-1'>
						<span className='text-brand-text'>
							{match.scoreA}-{match.scoreB}
						</span>
						<span>{new Date(match.timestamp).toLocaleDateString()}</span>
					</div>
				</div>
			))}
			{matches.length === 0 && (
				<div className='py-10 text-center'>
					<p className='italic'>No matches recorded</p>
				</div>
			)}
		</div>
	)
}

export default MatchList
