import { useState } from 'react'
import { History, Activity, Database, Globe, ChevronDown, X, TrendingUp, TrendingDown } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts'
import leaderboardData from '../public/leaderboard.json'

const App = () => {
	const { competitors, recentMatches, totalMatches, generatedAt } = leaderboardData
	const [selectedCompetitor, setSelectedCompetitor] = useState(null)

	// Leaderboard data is pre-sorted by conservative rating (mu - 3*sigma)
	const leaderboard = competitors.slice(0, 15)

	// Create lookup map for quick access
	const competitorMap = Object.fromEntries(competitors.map((c) => [c.id, c]))

	// Calculate average rating for display
	const avgRating = competitors.length ? (competitors.reduce((acc, c) => acc + c.rating.mu, 0) / competitors.length).toFixed(1) : 0

	const latestMatch = recentMatches.length > 0 ? recentMatches[0] : null

	// Format conservative rating for chart
	const chartData = leaderboard.map((c) => ({
		...c,
		conservativeRating: Math.max(0, c.rating.mu - 3 * c.rating.sigma),
	}))

	// Get matches for a specific competitor
	const getCompetitorMatches = (competitorId) => {
		return recentMatches.filter((m) => m.competitorA.id === competitorId || m.competitorB.id === competitorId)
	}

	// Get rank for a competitor
	const getRank = (competitorId) => {
		return competitors.findIndex((c) => c.id === competitorId) + 1
	}

	return (
		<div className='h-screen bg-black text-white flex flex-col font-sans select-none overflow-hidden'>
			<div className='scanline' />

			{/* Competitor Detail Panel */}
			{selectedCompetitor && (
				<div className='fixed inset-0 z-50 flex'>
					<div className='absolute inset-0 bg-black/80 backdrop-blur-sm' onClick={() => setSelectedCompetitor(null)} />
					<div className='absolute right-0 top-0 bottom-0 w-full max-w-lg bg-black border-l border-zinc-800 overflow-y-auto'>
						<div className='p-8'>
							<div className='flex items-start justify-between mb-8'>
								<div>
									<span className='mono text-xs text-zinc-600 uppercase tracking-widest'>Rank #{getRank(selectedCompetitor.id)}</span>
									<h2 className='mono text-xl font-bold text-rose-500 mt-1'>{selectedCompetitor.name}</h2>
								</div>
								<button onClick={() => setSelectedCompetitor(null)} className='p-2 hover:bg-zinc-900 rounded transition-colors'>
									<X size={20} className='text-zinc-500' />
								</button>
							</div>

							{/* Stats Grid */}
							<div className='grid grid-cols-2 gap-4 mb-8'>
								<div className='bg-zinc-900/50 border border-zinc-800 p-4'>
									<span className='mono text-xs text-zinc-600 uppercase'>Rating (μ)</span>
									<p className='mono text-2xl font-bold text-white mt-1'>{selectedCompetitor.rating.mu.toFixed(1)}</p>
								</div>
								<div className='bg-zinc-900/50 border border-zinc-800 p-4'>
									<span className='mono text-xs text-zinc-600 uppercase'>Uncertainty (σ)</span>
									<p className='mono text-2xl font-bold text-white mt-1'>{selectedCompetitor.rating.sigma.toFixed(1)}</p>
								</div>
								<div className='bg-zinc-900/50 border border-zinc-800 p-4'>
									<span className='mono text-xs text-zinc-600 uppercase'>Conservative</span>
									<p className='mono text-2xl font-bold text-rose-500 mt-1'>
										{(selectedCompetitor.rating.mu - 3 * selectedCompetitor.rating.sigma).toFixed(1)}
									</p>
								</div>
								<div className='bg-zinc-900/50 border border-zinc-800 p-4'>
									<span className='mono text-xs text-zinc-600 uppercase'>Win Rate</span>
									<p className='mono text-2xl font-bold text-white mt-1'>
										{selectedCompetitor.matches > 0 ? ((selectedCompetitor.wins / selectedCompetitor.matches) * 100).toFixed(0) : 0}%
									</p>
								</div>
							</div>

							{/* Record */}
							<div className='mb-8'>
								<span className='mono text-xs text-zinc-600 uppercase tracking-widest'>Combat Record</span>
								<div className='flex items-center gap-4 mt-2'>
									<div className='flex items-center gap-2'>
										<TrendingUp size={16} className='text-emerald-500' />
										<span className='mono text-lg text-emerald-500 font-bold'>{selectedCompetitor.wins}W</span>
									</div>
									<div className='flex items-center gap-2'>
										<TrendingDown size={16} className='text-red-500' />
										<span className='mono text-lg text-red-500 font-bold'>{selectedCompetitor.losses}L</span>
									</div>
									<span className='mono text-sm text-zinc-600'>({selectedCompetitor.matches} total)</span>
								</div>
							</div>

							{/* Justification */}
							<div className='mb-8'>
								<span className='mono text-xs text-zinc-600 uppercase tracking-widest'>Core Justification</span>
								<p className='text-zinc-400 text-sm leading-relaxed mt-2 italic border-l-2 border-rose-500/30 pl-4'>
									"{selectedCompetitor.justification}"
								</p>
							</div>

							{/* Recent Matches */}
							<div>
								<span className='mono text-xs text-zinc-600 uppercase tracking-widest'>Recent Collisions</span>
								<div className='mt-4 space-y-2'>
									{getCompetitorMatches(selectedCompetitor.id)
										.slice(0, 10)
										.map((m, i) => {
											const isWinner = m.winnerId === selectedCompetitor.id
											const opponent = m.competitorA.id === selectedCompetitor.id ? m.competitorB : m.competitorA
											return (
												<div key={i} className='flex items-center justify-between py-2 px-3 bg-zinc-900/30 border border-zinc-800'>
													<div className='flex items-center gap-3'>
														<span className={`mono text-xs font-bold ${isWinner ? 'text-emerald-500' : 'text-red-500'}`}>
															{isWinner ? 'W' : 'L'}
														</span>
														<span className='mono text-xs text-zinc-500'>vs</span>
														<button
															onClick={() => setSelectedCompetitor(competitorMap[opponent.id])}
															className='mono text-xs text-zinc-400 hover:text-rose-500 transition-colors'>
															{opponent.name}
														</button>
													</div>
													<span className='mono text-xs text-zinc-700'>{new Date(m.timestamp).toLocaleDateString()}</span>
												</div>
											)
										})}
									{getCompetitorMatches(selectedCompetitor.id).length === 0 && (
										<p className='mono text-xs text-zinc-700 italic'>No collisions recorded</p>
									)}
								</div>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Top Clinical Bar */}
			<header className='h-16 border-b border-clinical-border bg-black/90 flex items-center px-10 justify-between shrink-0 z-30'>
				<div className='flex items-center gap-10'>
					<div className='flex items-center gap-3'>
						<Globe size={18} className='text-rose-500 animate-pulse' />
						<h1 className='mono text-lg font-bold tracking-tighter uppercase'>Attractor_Arena</h1>
					</div>
					<span className='text-zinc-600 tracking-widest ml-4 text-xs'>GLOBAL_STABILITY_PROTOCOL</span>
					<div className='hidden xl:flex items-center gap-12 border-l border-clinical-border pl-10'>
						<div className='flex flex-col'>
							<span className='mono text-xs text-zinc-600 uppercase'>Arena_Cycle</span>
							<span className='mono text-xs text-zinc-400 font-bold'>{totalMatches} COLLISIONS_LOGGED</span>
						</div>
						<div className='flex flex-col'>
							<span className='mono text-xs text-zinc-600 uppercase'>Avg_Rating</span>
							<span className='mono text-xs text-zinc-400 font-bold'>μ={avgRating}</span>
						</div>
					</div>
				</div>
			</header>

			{/* Main Wide Application Shell */}
			<main className='flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-[24rem_1fr] h-full relative z-10'>
				{/* Left: Leaderboard */}
				<aside className='border-r border-clinical-border overflow-y-auto p-10 flex flex-col gap-12 bg-black'>
					<section>
						<div className='flex items-center gap-3 mb-10'>
							<Activity size={16} className='text-rose-500' />
							<h2 className='mono text-sm font-bold text-zinc-400 tracking-widest uppercase'>Stability_Index</h2>
						</div>
						<div className='h-80'>
							<ResponsiveContainer width='100%' height='100%'>
								<BarChart data={chartData} layout='vertical'>
									<XAxis type='number' hide />
									<YAxis dataKey='name' type='category' width={120} stroke='#1a1a1a' fontSize={10} tick={{ fill: '#444', fontFamily: 'Space Mono' }} />
									<Tooltip
										cursor={{ fill: 'rgba(255,255,255,0.02)' }}
										contentStyle={{ backgroundColor: '#000', border: '1px solid #111', borderRadius: '0px', fontSize: '10px', color: '#fff' }}
										formatter={(_value, _name, props) => {
											const c = props.payload
											return [`μ=${c.rating.mu.toFixed(1)} σ=${c.rating.sigma.toFixed(1)}`, 'Rating']
										}}
									/>
									<Bar dataKey='conservativeRating' radius={[0, 2, 2, 0]} onClick={(data) => setSelectedCompetitor(data)} style={{ cursor: 'pointer' }}>
										{chartData.map((_entry, index) => (
											<Cell key={`cell-${index}`} fill={index < 3 ? '#f43f5e' : '#111'} stroke={index < 3 ? 'none' : '#222'} />
										))}
									</Bar>
								</BarChart>
							</ResponsiveContainer>
						</div>
					</section>

					{/* Active Pool Quick View */}
					<section className='border-t border-clinical-border pt-10'>
						<div className='flex items-center gap-2 mb-6'>
							<Database size={14} className='text-zinc-600' />
							<h2 className='mono text-xs font-bold text-zinc-500 tracking-widest uppercase'>Active_Index</h2>
						</div>
						<div className='space-y-2 max-h-60 overflow-y-auto'>
							{leaderboard.map((c) => (
								<button
									key={c.id}
									onClick={() => setSelectedCompetitor(c)}
									className='w-full flex justify-between items-center py-2 px-3 hover:bg-clinical-surface transition-colors border-l border-clinical-border hover:border-rose-500 text-left'>
									<span className='mono text-xs text-zinc-400 hover:text-white transition-colors'>{c.name}</span>
									<div className='flex gap-4'>
										<span className='mono text-xs text-zinc-600'>
											{c.wins}W / {c.losses}L
										</span>
										<span className='mono text-xs text-rose-500 font-bold'>{(c.rating.mu - 3 * c.rating.sigma).toFixed(0)}</span>
									</div>
								</button>
							))}
						</div>
					</section>
				</aside>

				{/* Right: Collision Archive */}
				<aside className='overflow-y-auto p-10 flex flex-col gap-16 bg-[#020202]'>
					{latestMatch && (
						<section className='p-10 border border-zinc-800 bg-black'>
							<div className='flex items-center gap-3 mb-6'>
								<div className='w-2 h-2 rounded-full bg-rose-500' />
								<span className='mono text-xs font-bold uppercase tracking-[0.4em] text-zinc-500'>Latest_Collision</span>
							</div>
							<div className='flex items-center gap-4 mb-6'>
								<button
									onClick={() => setSelectedCompetitor(competitorMap[latestMatch.competitorA.id])}
									className='mono text-sm text-zinc-500 hover:text-rose-500 transition-colors'>
									{latestMatch.competitorA.name}
								</button>
								<span className='mono text-xs text-zinc-700'>vs</span>
								<button
									onClick={() => setSelectedCompetitor(competitorMap[latestMatch.competitorB.id])}
									className='mono text-sm text-zinc-500 hover:text-rose-500 transition-colors'>
									{latestMatch.competitorB.name}
								</button>
							</div>
							<h4 className='mono text-2xl font-bold mb-4 uppercase tracking-tighter text-rose-500'>{latestMatch.winnerName}_PERSISTED</h4>
							{latestMatch.reasoning && (
								<p className='text-zinc-500 text-sm leading-relaxed italic border-l-2 border-rose-500/20 pl-4 mb-4'>"{latestMatch.reasoning}"</p>
							)}
							<p className='text-zinc-700 text-xs'>Judge: {latestMatch.judgeVersion}</p>
						</section>
					)}

					<section className='flex-1 flex flex-col min-h-0'>
						<div className='flex items-center justify-between mb-8'>
							<div className='flex items-center gap-3'>
								<History size={16} className='text-zinc-600' />
								<h2 className='mono text-sm font-bold text-zinc-400 tracking-widest uppercase'>Collision_Archive</h2>
							</div>
							<ChevronDown size={14} className='text-zinc-800' />
						</div>
						<div className='space-y-px overflow-y-auto flex-1 pr-4'>
							{recentMatches.map((r, i) => (
								<details key={r.timestamp + i} className='group border-b border-zinc-900 bg-black transition-all hover:bg-zinc-900/5'>
									<summary className='py-5 cursor-pointer flex justify-between items-center list-none px-4'>
										<div className='flex flex-col'>
											<span className='mono text-xs font-bold text-zinc-500'>LOG_{totalMatches - i}</span>
											<span className='mono text-xs text-zinc-800 uppercase mt-1 tracking-widest'>
												{new Date(r.timestamp).toLocaleTimeString()}
											</span>
										</div>
										<div className='text-right'>
											<span className='mono text-xs text-rose-500 uppercase font-bold tracking-tighter'>{r.winnerName}</span>
											<div className='mono text-xs text-zinc-800 mt-1'>SURVIVED_DIALECTIC</div>
										</div>
									</summary>
									<div className='p-6 pt-0 space-y-4'>
										<div className='h-px bg-zinc-900 w-full' />
										<div className='flex items-center gap-2'>
											<button
												onClick={() => setSelectedCompetitor(competitorMap[r.competitorA.id])}
												className='mono text-xs text-zinc-500 hover:text-rose-500 transition-colors'>
												{r.competitorA.name}
											</button>
											<span className='mono text-xs text-zinc-700'>vs</span>
											<button
												onClick={() => setSelectedCompetitor(competitorMap[r.competitorB.id])}
												className='mono text-xs text-zinc-500 hover:text-rose-500 transition-colors'>
												{r.competitorB.name}
											</button>
										</div>
										{r.reasoning && <p className='text-zinc-600 text-sm leading-relaxed italic pl-4 border-l border-rose-500/20'>"{r.reasoning}"</p>}
									</div>
								</details>
							))}
							{recentMatches.length === 0 && (
								<div className='py-20 text-center'>
									<p className='mono text-xs text-zinc-800 uppercase tracking-widest italic'>Awaiting_Initial_Collision</p>
								</div>
							)}
						</div>
					</section>
				</aside>
			</main>

			{/* Protocol Footer */}
			<footer className='h-10 border-t border-clinical-border bg-black flex items-center px-10 justify-between mono text-xs uppercase text-zinc-700 tracking-widest font-bold shrink-0 z-30'>
				<div className='flex gap-16'>
					<span className='flex items-center gap-3'>
						<div className='w-1.5 h-1.5 bg-rose-500 rounded-full' /> Stability_Verified
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
