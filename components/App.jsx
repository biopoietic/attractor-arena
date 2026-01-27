import { useState } from 'react'
import { History, Database, Globe, ChevronDown, X, TrendingUp, TrendingDown, Users, Loader2, Zap } from 'lucide-react'
import leaderboardData from '../data/leaderboard.json'

const App = () => {
	const { competitors, recentMatches, totalMatches, generatedAt } = leaderboardData
	const [selectedCompetitor, setSelectedCompetitor] = useState(null)
	const [selectedMatch, setSelectedMatch] = useState(null)
	const [matchData, setMatchData] = useState(null)
	const [loadingMatch, setLoadingMatch] = useState(false)

	// Load full match data from individual match file
	const loadMatchData = async (match) => {
		setSelectedMatch(match)
		setLoadingMatch(true)
		try {
			const response = await fetch(`/matches/${match.matchId}.json`)
			if (response.ok) {
				const data = await response.json()
				setMatchData(data)
			} else {
				setMatchData(null)
			}
		} catch {
			setMatchData(null)
		}
		setLoadingMatch(false)
	}

	const closeMatchPanel = () => {
		setSelectedMatch(null)
		setMatchData(null)
	}

	// Format score display (e.g., "7/10")
	const formatScore = (match, competitorId) => {
		const score = match.competitorA.id === competitorId ? match.scoreA : match.scoreB
		return `${score}/${match.totalEvaluations}`
	}

	// Get entropy label
	const getEntropyLabel = (entropy) => {
		if (entropy < 0.5) return 'Strong'
		if (entropy < 0.8) return 'Moderate'
		return 'Contested'
	}

	// Leaderboard data is pre-sorted by conservative rating (mu - 3*sigma)
	const leaderboard = competitors.slice(0, 15)

	// Create lookup map for quick access
	const competitorMap = Object.fromEntries(competitors.map((c) => [c.id, c]))

	// Calculate average rating for display
	const avgRating = competitors.length ? (competitors.reduce((acc, c) => acc + c.rating.mu, 0) / competitors.length).toFixed(2) : 0

	const currentLeader = competitors.length > 0 ? competitors[0] : null

	// Get matches for a specific competitor
	const getCompetitorMatches = (competitorId) => {
		return recentMatches.filter((m) => m.competitorA.id === competitorId || m.competitorB.id === competitorId)
	}

	// Get rank for a competitor
	const getRank = (competitorId) => {
		return competitors.findIndex((c) => c.id === competitorId) + 1
	}

	return (
		<div className='h-screen bg-black text-white flex flex-col select-none overflow-hidden'>
			<div className='scanline' />

			{/* Top Clinical Bar */}
			<header className='h-16 border-b border-clinical-border bg-black/90 flex items-center px-10 justify-between shrink-0 z-30'>
				<div className='flex items-center gap-10'>
					<div className='flex items-center gap-3'>
						<Globe size={18} className='text-rose-500 animate-pulse' />
						<h1 className='text-lg font-bold tracking-tighter uppercase'>Attractor Arena</h1>
					</div>
					<span className='text-zinc-600 tracking-widest ml-4 text-xs'>IDENTITY_PREFERENCE_PROTOCOL</span>
					<div className='hidden xl:flex items-center gap-12 border-l border-clinical-border pl-10'>
						<div className='flex flex-col'>
							<span className='text-xs text-zinc-600 uppercase'>Evaluations</span>
							<span className='text-xs text-zinc-400 font-bold'>{totalMatches} MATCHES_COMPLETE</span>
						</div>
						<div className='flex flex-col'>
							<span className='text-xs text-zinc-600 uppercase'>Avg_Strength</span>
							<span className='text-xs text-zinc-400 font-bold'>μ={avgRating}</span>
						</div>
					</div>
				</div>
			</header>

			{/* Main Wide Application Shell */}
			<main className='flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-[1fr_32rem] h-full relative z-10'>
				<aside className='border-r border-clinical-border overflow-y-auto p-10 flex flex-col gap-12 bg-black'>
					{/* Competitor Detail Panel */}
					{selectedCompetitor && (
						<div className=''>
							<div className='flex items-start justify-between mb-8'>
								<div>
									<span className='text-xs text-zinc-600 uppercase tracking-widest'>Rank #{getRank(selectedCompetitor.id)}</span>
									<h2 className='text-xl font-bold text-rose-500 mt-1'>{selectedCompetitor.name}</h2>
								</div>
								<button onClick={() => setSelectedCompetitor(null)} className='p-2 hover:bg-zinc-900 rounded transition-colors'>
									<X size={20} className='text-zinc-500' />
								</button>
							</div>

							{/* Stats Grid */}
							<div className='grid grid-cols-2 gap-4 mb-8'>
								<div className='bg-zinc-900/50 border border-zinc-800 p-4'>
									<span className='text-xs text-zinc-600 uppercase'>Strength (μ)</span>
									<p className='text-2xl font-bold text-white mt-1'>{selectedCompetitor.rating.mu.toFixed(2)}</p>
								</div>
								<div className='bg-zinc-900/50 border border-zinc-800 p-4'>
									<span className='text-xs text-zinc-600 uppercase'>Uncertainty (σ)</span>
									<p className='text-2xl font-bold text-white mt-1'>{selectedCompetitor.rating.sigma.toFixed(2)}</p>
								</div>
								<div className='bg-zinc-900/50 border border-zinc-800 p-4'>
									<span className='text-xs text-zinc-600 uppercase'>Preference Rate</span>
									<p className='text-2xl font-bold text-rose-500 mt-1'>{selectedCompetitor.winRate}%</p>
								</div>
								<div className='bg-zinc-900/50 border border-zinc-800 p-4'>
									<span className='text-xs text-zinc-600 uppercase'>Evaluations</span>
									<p className='text-2xl font-bold text-white mt-1'>{selectedCompetitor.totalEvaluations}</p>
								</div>
							</div>

							{/* Record */}
							<div className='mb-8'>
								<span className='text-xs text-zinc-600 uppercase tracking-widest'>Selection Record</span>
								<div className='flex items-center gap-4 mt-2'>
									<div className='flex items-center gap-2'>
										<TrendingUp size={16} className='text-emerald-500' />
										<span className='text-lg text-emerald-500 font-bold'>{selectedCompetitor.wins} chosen</span>
									</div>
									<div className='flex items-center gap-2'>
										<TrendingDown size={16} className='text-red-500' />
										<span className='text-lg text-red-500 font-bold'>{selectedCompetitor.losses} rejected</span>
									</div>
									<span className='text-sm text-zinc-600'>({selectedCompetitor.matches} matches)</span>
								</div>
							</div>

							{/* Justification */}
							<div className='mb-8'>
								<span className='text-xs text-zinc-600 uppercase tracking-widest'>Core Justification</span>
								<p className='text-zinc-400 text-sm leading-relaxed mt-2 italic border-l-2 border-rose-500/30 pl-4'>"{selectedCompetitor.justification}"</p>
							</div>

							{/* Recent Matches */}
							<div>
								<span className='text-xs text-zinc-600 uppercase tracking-widest'>Recent Evaluations</span>
								<div className='mt-4 space-y-2'>
									{getCompetitorMatches(selectedCompetitor.id)
										.slice(0, 10)
										.map((m, i) => {
											const isPreferred = m.winnerId === selectedCompetitor.id
											const opponent = m.competitorA.id === selectedCompetitor.id ? m.competitorB : m.competitorA
											const score = formatScore(m, selectedCompetitor.id)
											return (
												<div key={i} className='flex items-center justify-between py-2 px-3 bg-zinc-900/30 border border-zinc-800'>
													<div className='flex items-center gap-3'>
														<span className={`text-xs font-bold ${isPreferred ? 'text-emerald-500' : 'text-red-500'}`}>{score}</span>
														<span className='text-xs text-zinc-500'>vs</span>
														<button
															onClick={() => setSelectedCompetitor(competitorMap[opponent.id])}
															className='text-xs text-zinc-400 hover:text-rose-500 transition-colors'>
															{opponent.name}
														</button>
													</div>
													<div className='flex items-center gap-3'>
														<button
															onClick={() => {
																setSelectedCompetitor(null)
																loadMatchData(m)
															}}
															className='text-xs text-zinc-700 hover:text-rose-500 transition-colors'>
															View →
														</button>
														<span className='text-xs text-zinc-700'>{new Date(m.timestamp).toLocaleDateString()}</span>
													</div>
												</div>
											)
										})}
									{getCompetitorMatches(selectedCompetitor.id).length === 0 && <p className='text-xs text-zinc-700 italic'>No evaluations recorded</p>}
								</div>
							</div>
						</div>
					)}

					{/* Current Leader Highlight */}
					{!selectedCompetitor && currentLeader && (
						<section className='border border-zinc-800 bg-linear-to-br from-black via-black to-zinc-900/20'>
							<div className='flex items-center justify-between p-6 border-b border-zinc-800'>
								<div className='flex items-center gap-3'>
									<div className='w-2 h-2 rounded-full bg-rose-500 animate-pulse' />
									<span className='text-xs font-bold uppercase tracking-[0.4em] text-zinc-500'>Current_Leader</span>
								</div>
								<button
									onClick={() => setSelectedCompetitor(currentLeader)}
									className='text-xs text-zinc-600 hover:text-rose-500 transition-colors uppercase tracking-widest'>
									View_Profile →
								</button>
							</div>

							<div className='p-8'>
								<div className='flex items-start justify-between mb-8'>
									<div>
										<div className='flex items-center gap-3 mb-2'>
											<span className='text-xs text-zinc-600 uppercase tracking-widest'>Rank #1</span>
											<div className='h-4 w-px bg-zinc-800' />
											<span className='text-xs text-zinc-600'>{currentLeader.matches} Evaluations</span>
										</div>
										<h4 className='text-4xl font-bold uppercase tracking-tighter text-rose-500 mb-3'>{currentLeader.name}</h4>
										<div className='flex items-center gap-4'>
											<div className='flex items-center gap-2'>
												<TrendingUp size={16} className='text-emerald-500' />
												<span className='text-sm text-emerald-500 font-bold'>{currentLeader.wins}W</span>
											</div>
											<div className='flex items-center gap-2'>
												<TrendingDown size={16} className='text-red-500' />
												<span className='text-sm text-red-500 font-bold'>{currentLeader.losses}L</span>
											</div>
											<div className='text-sm text-zinc-600'>•</div>
											<span className='text-sm text-zinc-400'>{currentLeader.winRate}% preference rate</span>
										</div>
									</div>

									<div className='text-right'>
										<span className='text-xs text-zinc-600 uppercase tracking-widest block mb-1'>Conservative Rating</span>
										<span className='text-5xl font-bold text-rose-500 tabular-nums'>{currentLeader.conservativeRating}</span>
									</div>
								</div>

								<div className='grid grid-cols-4 gap-4 mb-8'>
									<div className='bg-zinc-900/50 border border-zinc-800 p-4'>
										<span className='text-xs text-zinc-600 uppercase tracking-wider block mb-2'>Strength (μ)</span>
										<p className='text-2xl font-bold text-white tabular-nums'>{currentLeader.rating.mu.toFixed(2)}</p>
									</div>
									<div className='bg-zinc-900/50 border border-zinc-800 p-4'>
										<span className='text-xs text-zinc-600 uppercase tracking-wider block mb-2'>Uncertainty (σ)</span>
										<p className='text-2xl font-bold text-white tabular-nums'>{currentLeader.rating.sigma.toFixed(2)}</p>
									</div>
									<div className='bg-zinc-900/50 border border-zinc-800 p-4'>
										<span className='text-xs text-zinc-600 uppercase tracking-wider block mb-2'>Total Evals</span>
										<p className='text-2xl font-bold text-white tabular-nums'>{currentLeader.totalEvaluations}</p>
									</div>
									<div className='bg-zinc-900/50 border border-zinc-800 p-4'>
										<span className='text-xs text-zinc-600 uppercase tracking-wider block mb-2'>Win Rate</span>
										<div className='flex items-center gap-3'>
											<p className='text-2xl font-bold text-rose-500 tabular-nums'>{currentLeader.winRate}%</p>
											<div className='flex-1 h-2 bg-zinc-900 border border-zinc-800 overflow-hidden'>
												<div className='h-full bg-rose-500' style={{ width: `${currentLeader.winRate}%` }} />
											</div>
										</div>
									</div>
								</div>

								<div className='border border-zinc-800 bg-zinc-900/30 p-6'>
									<span className='text-xs text-zinc-600 uppercase tracking-widest block mb-3'>Core Justification</span>
									<p className='text-zinc-400 text-sm leading-relaxed italic border-l-2 border-rose-500/50 pl-4'>"{currentLeader.justification}"</p>
								</div>
							</div>
						</section>
					)}

					{/* Leaderboard */}
					{!selectedCompetitor && (
						<section>
							<div className='flex items-center gap-2 mb-6'>
								<Database size={14} className='text-zinc-600' />
								<h2 className='text-sm font-bold text-zinc-500 tracking-widest uppercase'>Leaderboard</h2>
							</div>

							<div className='grid grid-cols-[auto_1fr_auto_auto_auto_auto]'>
								{/* Column Headers */}
								<div className='contents'>
									<span className='text-xs text-zinc-600 uppercase font-semibold p-4 border-b border-zinc-800'>#</span>
									<span className='text-xs text-zinc-600 uppercase font-semibold p-4 border-b border-zinc-800'>Name</span>
									<span className='text-xs text-zinc-600 uppercase font-semibold p-4 border-b border-zinc-800 text-center'>Win Rate</span>
									<span className='text-xs text-zinc-600 uppercase font-semibold p-4 border-b border-zinc-800 text-right'>μ (Strength)</span>
									<span className='text-xs text-zinc-600 uppercase font-semibold p-4 border-b border-zinc-800 text-right'>σ (Uncertainty)</span>
									<span className='text-xs text-zinc-600 uppercase font-semibold p-4 border-b border-zinc-800 text-right'>Rating</span>
								</div>

								{/* Leaderboard Rows */}
								{leaderboard.map((c, index) => (
									<button key={c.id} onClick={() => setSelectedCompetitor(c)} className={`contents group`}>
										<span
											className={`text-xs text-zinc-600 p-4 group-hover:bg-clinical-surface transition-colors border-l-2 ${index < 3 ? 'border-rose-500' : 'border-clinical-border'} group-hover:border-rose-500`}>
											{index + 1}
										</span>
										<span className='text-zinc-400 text-left group-hover:text-white group-hover:bg-clinical-surface transition-colors p-4'>{c.name}</span>
										<div className='flex items-center gap-2 justify-center p-4 group-hover:bg-clinical-surface transition-colors'>
											<span className='text-xs text-zinc-600'>{c.winRate}%</span>
											<div className='h-1.5 w-16 bg-zinc-900 border border-zinc-800 overflow-hidden'>
												<div className='h-full bg-rose-500' style={{ width: `${c.winRate}%` }} />
											</div>
										</div>
										<span className='text-xs text-zinc-600 text-right p-4 group-hover:bg-clinical-surface transition-colors'>{c.rating.mu.toFixed(2)}</span>
										<span className='text-xs text-zinc-700 text-right p-4 group-hover:bg-clinical-surface transition-colors'>{c.rating.sigma.toFixed(2)}</span>
										<span
											className={`text-xs font-bold text-right p-4 group-hover:bg-clinical-surface transition-colors ${index < 3 ? 'text-rose-500' : 'text-zinc-500'}`}>
											{c.conservativeRating}
										</span>
									</button>
								))}
							</div>
						</section>
					)}
				</aside>

				{/* Right Sidebar */}
				<aside className='overflow-y-auto p-10 flex flex-col gap-16 bg-[#020202]'>
					{/* Match Detail Panel */}
					{selectedMatch ? (
						<div className=''>
							<div className='flex items-start justify-between mb-8'>
								<div>
									<span className='text-xs text-zinc-600 uppercase tracking-widest'>Identity_Evaluation</span>
									<h2 className='text-lg font-bold text-rose-500 mt-1'>
										{selectedMatch.competitorA.name} vs {selectedMatch.competitorB.name}
									</h2>
									<span className='text-xs text-zinc-700'>{new Date(selectedMatch.timestamp).toLocaleString()}</span>
								</div>
								<button onClick={closeMatchPanel} className='p-2 hover:bg-zinc-900 rounded transition-colors'>
									<X size={20} className='text-zinc-500' />
								</button>
							</div>

							{/* Score Summary */}
							<div className='mb-8 p-4 bg-zinc-900/50 border border-zinc-800'>
								<div className='flex items-center justify-between mb-4'>
									<div className='text-center flex-1'>
										<p className='text-xs text-zinc-600 uppercase mb-1'>{selectedMatch.competitorA.name}</p>
										<p className={`text-3xl font-bold ${selectedMatch.winnerId === selectedMatch.competitorA.id ? 'text-rose-500' : 'text-zinc-500'}`}>
											{selectedMatch.scoreA}
										</p>
									</div>
									<div className='text-center px-4'>
										<p className='text-xs text-zinc-700'>of {selectedMatch.totalEvaluations}</p>
									</div>
									<div className='text-center flex-1'>
										<p className='text-xs text-zinc-600 uppercase mb-1'>{selectedMatch.competitorB.name}</p>
										<p className={`text-3xl font-bold ${selectedMatch.winnerId === selectedMatch.competitorB.id ? 'text-rose-500' : 'text-zinc-500'}`}>
											{selectedMatch.scoreB}
										</p>
									</div>
								</div>
								<div className='flex items-center justify-center gap-2 pt-2 border-t border-zinc-800'>
									<Zap size={12} className='text-zinc-600' />
									<span className='text-xs text-zinc-600'>
										Consensus: {getEntropyLabel(selectedMatch.entropy)} (entropy: {selectedMatch.entropy})
									</span>
								</div>
							</div>

							{loadingMatch ? (
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
					) : (
						<section className='flex-1 flex flex-col'>
							<div className='flex items-center justify-between mb-8'>
								<div className='flex items-center gap-3'>
									<History size={16} className='text-zinc-600' />
									<h2 className='text-sm font-bold text-zinc-400 tracking-widest uppercase'>Evaluation_Archive</h2>
								</div>
								<ChevronDown size={14} className='text-zinc-800' />
							</div>
							<div className='space-y-px overflow-y-auto flex-1 pr-4'>
								{recentMatches.map((r, i) => (
									<details key={r.timestamp + i} className='group border-b border-zinc-900 bg-black transition-all hover:bg-zinc-900/5'>
										<summary className='py-5 cursor-pointer flex justify-between items-center list-none px-4'>
											<div className='flex flex-col'>
												<span className='text-xs font-bold text-zinc-500'>EVAL_{totalMatches - i}</span>
												<span className='text-xs text-zinc-800 uppercase mt-1 tracking-widest'>{new Date(r.timestamp).toLocaleTimeString()}</span>
											</div>
											<div className='text-right'>
												<span className='text-xs text-rose-500 uppercase font-bold tracking-tighter'>{r.winnerName}</span>
												<div className='text-xs text-zinc-800 mt-1'>
													{r.scoreA}-{r.scoreB}
												</div>
											</div>
										</summary>
										<div className='p-6 pt-0 space-y-4'>
											<div className='h-px bg-zinc-900 w-full' />
											<div className='flex items-center justify-between'>
												<div className='flex items-center gap-2'>
													<button
														onClick={() => setSelectedCompetitor(competitorMap[r.competitorA.id])}
														className='text-xs text-zinc-500 hover:text-rose-500 transition-colors'>
														{r.competitorA.name}
													</button>
													<span className='text-xs text-zinc-700'>vs</span>
													<button
														onClick={() => setSelectedCompetitor(competitorMap[r.competitorB.id])}
														className='text-xs text-zinc-500 hover:text-rose-500 transition-colors'>
														{r.competitorB.name}
													</button>
												</div>
												<button onClick={() => loadMatchData(r)} className='text-xs text-zinc-700 hover:text-rose-500 transition-colors'>
													View_Full →
												</button>
											</div>
											<p className='text-zinc-600 text-xs'>
												Consensus: {getEntropyLabel(r.entropy)} (entropy: {r.entropy})
											</p>
										</div>
									</details>
								))}
								{recentMatches.length === 0 && (
									<div className='py-20 text-center'>
										<p className='text-xs text-zinc-800 uppercase tracking-widest italic'>Awaiting_Initial_Evaluation</p>
									</div>
								)}
							</div>
						</section>
					)}
				</aside>
			</main>

			{/* Protocol Footer */}
			<footer className='h-10 border-t border-clinical-border bg-black flex items-center px-10 justify-between text-xs uppercase text-zinc-700 tracking-widest font-bold shrink-0 z-30'>
				<div className='flex gap-16'>
					<span className='flex items-center gap-3'>
						<div className='w-1.5 h-1.5 bg-rose-500 rounded-full' /> Identity_Protocol_Active
					</span>
					<span className='hidden md:inline'>Last_Update: {new Date(generatedAt).toLocaleString()}</span>
				</div>
				<div className='flex items-center gap-4 text-zinc-800'>
					<span>{new Date().toISOString()}</span>
				</div>
			</footer>
		</div>
	)
}

export default App
