import { useState } from 'react'
import { History, Database, ChevronDown, X, Users, Loader2, Zap } from 'lucide-react'
import leaderboardData from '../data/leaderboard.json'
import Header from './layout/Header'
import Footer from './layout/Footer'
import Panel from './ui/Panel'
import CompetitorCard from './ui/CompetitorCard'
import MatchList from './ui/MatchList'

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

			<Header totalMatches={totalMatches} avgRating={avgRating} />

			{/* Main Wide Application Shell */}
			<main className='flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-[1fr_32rem] h-full relative z-10'>
				<aside className='border-r border-clinical-border overflow-y-auto p-10 flex flex-col gap-12 bg-black'>
					{/* Competitor Detail Panel */}
					{selectedCompetitor && (
						<>
							<Panel
								header={
									<div className='flex items-center justify-between gap-3'>
										<div className='flex items-center gap-3'>
											<div className='w-2 h-2 rounded-full bg-rose-500 animate-pulse' />
											<span className='text-xs font-bold uppercase tracking-[0.4em] text-zinc-500'>Competitor_Profile</span>
										</div>
										<button onClick={() => setSelectedCompetitor(null)} className='hover:bg-zinc-900 rounded transition-colors'>
											<X size={18} className='text-zinc-500' />
										</button>
									</div>
								}>
								<CompetitorCard competitor={selectedCompetitor} rank={getRank(selectedCompetitor.id)} onViewProfile={() => {}} />
							</Panel>
						</>
					)}

					{selectedMatch && (
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
					)}

					{/* Current Leader Highlight */}
					{!selectedCompetitor && !selectedMatch && currentLeader && (
						<Panel
							header={
								<div className='flex items-center justify-between gap-3'>
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
							}>
							<CompetitorCard competitor={currentLeader} rank={1} />
						</Panel>
					)}
					{/* Leaderboard */}
					{!selectedCompetitor && !selectedMatch && (
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

					<section className='flex-1 flex flex-col'>
						<div className='flex items-center justify-between mb-8'>
							<div className='flex items-center gap-3'>
								<History size={16} className='text-zinc-600' />
								<h2 className='text-sm font-bold text-zinc-400 tracking-widest uppercase'>Recent_Matches</h2>
							</div>
							<ChevronDown size={14} className='text-zinc-800' />
						</div>
						<div className='overflow-y-auto flex-1 pr-4'>
							<MatchList
								matches={recentMatches}
								totalMatches={totalMatches}
								onSelectCompetitor={(id) => setSelectedCompetitor(competitorMap[id])}
								onLoadMatch={loadMatchData}
							/>
						</div>
					</section>
				</aside>
			</main>

			<Footer lastUpdate={generatedAt} />
		</div>
	)
}

export default App
