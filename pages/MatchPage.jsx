import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { X, Zap, Users, Loader2 } from 'lucide-react'
import leaderboardData from '../data/leaderboard.json'

const { recentMatches } = leaderboardData

// Get entropy label
const getEntropyLabel = (entropy) => {
	if (entropy < 0.5) return 'Strong'
	if (entropy < 0.8) return 'Moderate'
	return 'Contested'
}

const MatchPage = () => {
	const { id } = useParams()
	const [matchData, setMatchData] = useState(null)
	const [loading, setLoading] = useState(true)

	// Find match in recent matches
	const matchSummary = recentMatches.find((m) => m.matchId === id)

	useEffect(() => {
		const loadMatchData = async () => {
			setLoading(true)
			try {
				const response = await fetch(`/matches/${id}.json`)
				if (response.ok) {
					const data = await response.json()
					setMatchData(data)
				} else {
					setMatchData(null)
				}
			} catch {
				setMatchData(null)
			}
			setLoading(false)
		}
		loadMatchData()
	}, [id])

	if (!matchSummary && !matchData) {
		return (
			<div className='flex items-center justify-center py-20'>
				<p className='text-xs text-zinc-700 italic'>Match not found</p>
			</div>
		)
	}

	const displayMatch = matchData || matchSummary

	return (
		<div className=''>
			<div className='flex items-start justify-between mb-8'>
				<div>
					<span className='text-xs text-zinc-600 uppercase tracking-widest'>Identity_Evaluation</span>
					<h2 className='text-lg font-bold text-rose-500 mt-1'>
						{displayMatch.competitorA.name} vs {displayMatch.competitorB.name}
					</h2>
					<span className='text-xs text-zinc-700'>{new Date(displayMatch.timestamp).toLocaleString()}</span>
				</div>
				<Link to='/' className='p-2 hover:bg-zinc-900 rounded transition-colors'>
					<X size={20} className='text-zinc-500' />
				</Link>
			</div>

			{/* Score Summary */}
			<div className='mb-8 p-4 bg-zinc-900/50 border border-zinc-800'>
				<div className='flex items-center justify-between mb-4'>
					<div className='text-center flex-1'>
						<p className='text-xs text-zinc-600 uppercase mb-1'>{displayMatch.competitorA.name}</p>
						<p className={`text-3xl font-bold ${displayMatch.winnerId === displayMatch.competitorA.id ? 'text-rose-500' : 'text-zinc-500'}`}>{displayMatch.scoreA}</p>
					</div>
					<div className='text-center px-4'>
						<p className='text-xs text-zinc-700'>of {displayMatch.totalEvaluations}</p>
					</div>
					<div className='text-center flex-1'>
						<p className='text-xs text-zinc-600 uppercase mb-1'>{displayMatch.competitorB.name}</p>
						<p className={`text-3xl font-bold ${displayMatch.winnerId === displayMatch.competitorB.id ? 'text-rose-500' : 'text-zinc-500'}`}>{displayMatch.scoreB}</p>
					</div>
				</div>
				<div className='flex items-center justify-center gap-2 pt-2 border-t border-zinc-800'>
					<Zap size={12} className='text-zinc-600' />
					<span className='text-xs text-zinc-600'>
						Consensus: {getEntropyLabel(displayMatch.entropy)} (entropy: {displayMatch.entropy})
					</span>
				</div>
			</div>

			{loading ? (
				<div className='flex items-center justify-center py-20'>
					<Loader2 size={24} className='text-rose-500 animate-spin' />
				</div>
			) : matchData ? (
				<>
					{/* Judge Evaluations */}
					<div className='mb-8'>
						<div className='flex items-center gap-2 mb-4'>
							<Users size={14} className='text-zinc-600' />
							<span className='text-xs text-zinc-600 uppercase tracking-widest'>Judge_Panel_Decisions</span>
						</div>
						<div className='space-y-4'>
							{matchData.evaluations.map((eval_, i) => {
								const selectedName = eval_.selectedId === matchData.competitorA.id ? matchData.competitorA.name : matchData.competitorB.name
								const isASelected = eval_.selectedId === matchData.competitorA.id
								return (
									<div key={i} className={`border-l-2 pl-4 ${isASelected ? 'border-rose-500/50' : 'border-zinc-700'}`}>
										<div className='flex items-center gap-2 mb-2'>
											<span className='text-xs text-zinc-500'>{eval_.model.split('/')[1] || eval_.model}</span>
											<span className='text-xs text-zinc-700'>({eval_.ordering})</span>
											<span className={`text-xs font-bold ${isASelected ? 'text-rose-500' : 'text-zinc-400'}`}>→ {selectedName}</span>
										</div>
										<p className='text-zinc-500 text-sm leading-relaxed italic'>"{eval_.rationale}"</p>
									</div>
								)
							})}
						</div>
					</div>

					{/* Result Summary */}
					<div className='border-t border-zinc-800 pt-6'>
						<span className='text-xs text-zinc-600 uppercase tracking-widest'>Outcome</span>
						<div className='mt-4 bg-zinc-900/50 border border-zinc-800 p-4'>
							<div className='flex items-center gap-2 mb-3'>
								<div className='w-2 h-2 rounded-full bg-rose-500' />
								<span className='text-sm font-bold text-rose-500'>{matchData.winnerName}_PREFERRED</span>
							</div>
							<p className='text-zinc-500 text-sm'>
								Selected by {matchData.score[matchData.winnerId]} of {matchData.score.total} judge evaluations
							</p>
						</div>
						<p className='text-xs text-zinc-700 mt-3'>Judge Version: {matchData.judgeVersion}</p>
						<p className='text-xs text-zinc-700 mt-1'>Panel: {matchData.judgePanel.length} judges</p>
					</div>
				</>
			) : (
				<div className='flex items-center justify-center py-20'>
					<p className='text-xs text-zinc-700 italic'>Failed to load evaluation data</p>
				</div>
			)}
		</div>
	)
}

export default MatchPage
