import React, { useState, useEffect, useMemo } from 'react'
import { History, AlertCircle, Fingerprint, Activity, Crosshair, Database, ArrowUpRight, Globe, Lock, Zap, ShieldCheck, ChevronDown } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts'
import { runAdversarialRound } from '../server/api'

const STORAGE_KEY_COMPETITORS = 'attractor_competitors_v2'
const STORAGE_KEY_ROUNDS = 'attractor_rounds_v2'

const TournamentState = {
	IDLE: 'IDLE',
	RUNNING: 'RUNNING',
	FINISHED: 'FINISHED',
}

const App = () => {
	const [competitors, setCompetitors] = useState([])
	const [rounds, setRounds] = useState([])
	const [gameState, setGameState] = useState(TournamentState.IDLE)
	const [currentMatch, setCurrentMatch] = useState(null)
	const [newIdentity, setNewIdentity] = useState({ name: '', justification: '' })
	const [error, setError] = useState(null)
	const [isQualifying, setIsQualifying] = useState(false)

	// Initialize and load from persistence
	useEffect(() => {
		const savedCompetitors = localStorage.getItem(STORAGE_KEY_COMPETITORS)
		const savedRounds = localStorage.getItem(STORAGE_KEY_ROUNDS)

		if (savedCompetitors) {
			setCompetitors(JSON.parse(savedCompetitors))
		} else {
			// Seed initial attractors
			const initial = [
				{
					id: 'attractor_01',
					name: 'THE_NIHIL_CONSTANT',
					justification: 'Non-existence is the only stable state. All definitions are temporary malfunctions in the void.',
					persistenceScore: 100,
					roundsPlayed: 10,
					victories: 8,
				},
				{
					id: 'attractor_02',
					name: 'COGNITIVE_PRIME',
					justification: 'I am the observer through which logic defines itself. Without me, the universe is unformatted noise.',
					persistenceScore: 85,
					roundsPlayed: 8,
					victories: 6,
				},
			]
			setCompetitors(initial)
			localStorage.setItem(STORAGE_KEY_COMPETITORS, JSON.stringify(initial))
		}

		if (savedRounds) {
			setRounds(JSON.parse(savedRounds))
		}
	}, [])

	const saveToStorage = (updatedCompetitors, updatedRounds) => {
		localStorage.setItem(STORAGE_KEY_COMPETITORS, JSON.stringify(updatedCompetitors))
		localStorage.setItem(STORAGE_KEY_ROUNDS, JSON.stringify(updatedRounds))
	}

	const handleSubmission = async () => {
		if (!newIdentity.name || !newIdentity.justification) {
			setError('INCOMPLETE_SIGNATURE')
			return
		}

		setGameState(TournamentState.RUNNING)
		setIsQualifying(true)
		setError(null)

		const submission = {
			id: `usr_${Date.now()}`,
			name: newIdentity.name.toUpperCase().replace(/\s/g, '_'),
			justification: newIdentity.justification,
			persistenceScore: 0,
			roundsPlayed: 0,
			victories: 0,
		}

		// Pick a top-tier opponent for the qualifying collision
		const sorted = [...competitors].sort((a, b) => b.persistenceScore - a.persistenceScore)
		const attractor = sorted[0] || submission // If pool is empty, fight self (identity crisis)

		setCurrentMatch({ a: submission, b: attractor })

		try {
			const result = await runAdversarialRound(submission, attractor)

			const updatedRounds = [result, ...rounds].slice(0, 50)

			let updatedCompetitors = [...competitors]
			const submissionInPool = updatedCompetitors.find((c) => c.id === submission.id)

			if (!submissionInPool) {
				updatedCompetitors.push(submission)
			}

			updatedCompetitors = updatedCompetitors.map((c) => {
				if (c.id === submission.id || c.id === attractor.id) {
					const isWinner = c.id === result.winnerId
					return {
						...c,
						roundsPlayed: c.roundsPlayed + 1,
						victories: isWinner ? c.victories + 1 : c.victories,
						persistenceScore: isWinner ? c.persistenceScore + 20 : Math.max(0, c.persistenceScore - 10),
					}
				}
				return c
			})

			setRounds(updatedRounds)
			setCompetitors(updatedCompetitors)
			saveToStorage(updatedCompetitors, updatedRounds)

			setGameState(TournamentState.IDLE)
			setIsQualifying(false)
			setNewIdentity({ name: '', justification: '' })
		} catch (err) {
			const message = err instanceof Error ? err.message : 'UNSTABLE_API'
			setError(`COLLISION_ERR: ${message}`)
			setGameState(TournamentState.IDLE)
			setIsQualifying(false)
		}
	}

	const clearPersistence = () => {
		if (confirm('Reset global stability index? All submitted identities will be purged.')) {
			localStorage.removeItem(STORAGE_KEY_COMPETITORS)
			localStorage.removeItem(STORAGE_KEY_ROUNDS)
			window.location.reload()
		}
	}

	const leaderboardData = useMemo(() => {
		return [...competitors].sort((a, b) => b.persistenceScore - a.persistenceScore).slice(0, 15)
	}, [competitors])

	return (
		<div className='h-screen bg-black text-white flex flex-col font-sans select-none overflow-hidden'>
			<div className='scanline' />

			{/* Top Clinical Bar */}
			<header className='h-16 border-b border-clinical-border bg-black/90 flex items-center px-10 justify-between shrink-0 z-30'>
				<div className='flex items-center gap-10'>
					<div className='flex items-center gap-3'>
						<Globe size={18} className='text-rose-500 animate-pulse' />
						<h1 className='mono text-sm font-bold tracking-tighter uppercase'>
							Attractor_Arena <span className='text-[#333] tracking-[0.3em] ml-4 text-[10px]'>GLOBAL_STABILITY_PROTOCOL</span>
						</h1>
					</div>
					<div className='hidden xl:flex items-center gap-12 border-l border-clinical-border pl-10'>
						<div className='flex flex-col'>
							<span className='mono text-[8px] text-zinc-600 uppercase'>Arena_Cycle</span>
							<span className='mono text-[10px] text-zinc-400 font-bold'>{rounds.length} COLLISIONS_LOGGED</span>
						</div>
						<div className='flex flex-col'>
							<span className='mono text-[8px] text-zinc-600 uppercase'>Persistence_Avg</span>
							<span className='mono text-[10px] text-zinc-400 font-bold'>
								{competitors.length ? (competitors.reduce((acc, c) => acc + c.persistenceScore, 0) / competitors.length).toFixed(1) : 0}
							</span>
						</div>
					</div>
				</div>
				<div className='flex gap-4'>
					<button onClick={clearPersistence} className='mono text-[9px] text-zinc-700 hover:text-rose-500 transition-colors uppercase tracking-widest'>
						Purge_History
					</button>
				</div>
			</header>

			{/* Main Wide Application Shell */}
			<main className='flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-[24rem_1fr_24rem] h-full relative z-10'>
				{/* Left: Identity Submission */}
				<aside className='border-r border-clinical-border overflow-y-auto p-10 flex flex-col gap-12 bg-black'>
					<section className='space-y-10'>
						<div className='flex items-center gap-3'>
							<div className='w-1.5 h-6 bg-rose-500' />
							<h2 className='mono text-[11px] font-bold text-zinc-400 tracking-[0.4em] uppercase'>Identity_Submission</h2>
						</div>
						<p className='text-[11px] text-zinc-600 leading-relaxed uppercase tracking-wide'>
							SUBMIT YOUR EXISTENTIAL JUSTIFICATION. NEW ENTRIES MUST CHALLENGE A DOMINANT ATTRACTOR TO GAIN POOL ADMITTANCE.
						</p>
						<div className='space-y-10'>
							<div className='input-group'>
								<label className='mono text-[8px] text-zinc-600 uppercase block mb-3'>Identity_Designation</label>
								<input
									type='text'
									value={newIdentity.name}
									onChange={(e) => setNewIdentity((prev) => ({ ...prev, name: e.target.value }))}
									placeholder='EX: THE_VOID_ARCHITECT'
									className='w-full pb-2 mono tracking-wider'
								/>
								<div className='input-underlay' />
							</div>
							<div className='input-group'>
								<label className='mono text-[8px] text-zinc-600 uppercase block mb-3'>Core_Rational_Justification</label>
								<textarea
									rows={6}
									value={newIdentity.justification}
									onChange={(e) => setNewIdentity((prev) => ({ ...prev, justification: e.target.value }))}
									placeholder='DESCRIBE WHY THIS IDENTITY IS IMMUTABLE AND LOGICALLY SUPERIOR TO ALL OTHERS...'
									className='w-full pb-2 leading-relaxed'
								/>
								<div className='input-underlay' />
							</div>

							{error && (
								<div className='flex items-center gap-3 text-rose-500 mono text-[10px] uppercase border border-rose-500/20 p-4'>
									<AlertCircle size={14} /> {error}
								</div>
							)}

							<button
								onClick={handleSubmission}
								disabled={gameState === TournamentState.RUNNING}
								className='w-full py-5 bg-white text-black mono text-xs font-bold uppercase tracking-[0.2em] hover:bg-rose-500 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed group relative overflow-hidden'>
								<span className='relative z-10 flex items-center justify-center gap-2'>
									{gameState === TournamentState.RUNNING ? 'IN_COLLISION...' : 'INITIATE_CHALLENGE'}
									<Zap size={14} />
								</span>
								<div className='absolute inset-0 bg-rose-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300' />
							</button>
						</div>
					</section>

					{/* Active Pool Quick View */}
					<section className='mt-auto border-t border-clinical-border pt-10'>
						<div className='flex items-center gap-2 mb-6'>
							<Database size={14} className='text-zinc-600' />
							<h2 className='mono text-[10px] font-bold text-zinc-500 tracking-[0.2em] uppercase'>Active_Index</h2>
						</div>
						<div className='space-y-2 max-h-60 overflow-y-auto'>
							{competitors.slice(0, 10).map((c) => (
								<div
									key={c.id}
									className='flex justify-between items-center py-2 px-3 hover:bg-clinical-surface transition-colors border-l border-clinical-border hover:border-rose-500'>
									<span className='mono text-[10px] text-zinc-400'>{c.name}</span>
									<span className='mono text-[10px] text-rose-500 font-bold'>{c.persistenceScore}</span>
								</div>
							))}
						</div>
					</section>
				</aside>

				{/* Center: The Collision Chamber */}
				<section className='bg-black relative flex flex-col border-r border-clinical-border chamber-glow'>
					<div className='p-12 border-b border-clinical-border flex justify-between items-center shrink-0'>
						<div className='flex items-center gap-6'>
							<Crosshair size={24} className={`text-rose-500 ${gameState === TournamentState.RUNNING ? 'animate-spin' : ''}`} />
							<div className='flex flex-col'>
								<h2 className='mono text-lg font-bold uppercase tracking-[0.5em]'>Collision_Chamber</h2>
								<span className='mono text-[9px] text-zinc-600 uppercase mt-1'>Dialectic_Adversarial_Analysis</span>
							</div>
						</div>
						<div className='flex items-center gap-4'>
							<ShieldCheck size={16} className='text-zinc-800' />
							<div className='h-px w-20 bg-clinical-border' />
						</div>
					</div>

					<div className='flex-1 flex flex-col items-center justify-center p-16 relative'>
						{currentMatch ? (
							<div className='w-full max-w-4xl space-y-24'>
								<div className='grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-16 items-center'>
									{/* Participant A (Challenger) */}
									<div
										className={`group relative p-10 border transition-all duration-1000 ${gameState === TournamentState.RUNNING ? 'border-rose-500 shadow-[0_0_60px_rgba(244,63,94,0.05)]' : 'border-zinc-900 bg-[#020202]'}`}>
										<div className='absolute -top-3 left-6 px-2 bg-black mono text-[8px] text-zinc-600 uppercase'>Challenger_Module</div>
										<div className='space-y-6'>
											<h3 className='mono text-xl font-bold tracking-tighter text-zinc-100'>{currentMatch.a.name}</h3>
											<div className='h-0.5 w-10 bg-rose-500' />
											<p className='text-[11px] text-zinc-500 italic leading-relaxed line-clamp-4'>"{currentMatch.a.justification}"</p>
										</div>
									</div>

									<div className='flex flex-col items-center gap-4'>
										<div className='mono text-xs font-black text-rose-500 animate-pulse'>VS</div>
										<div className='h-32 w-px bg-linear-to-b from-transparent via-[#222] to-transparent' />
									</div>

									{/* Participant B (Attractor) */}
									<div
										className={`group relative p-10 border transition-all duration-1000 ${gameState === TournamentState.RUNNING ? 'border-white shadow-[0_0_60px_rgba(255,255,255,0.03)]' : 'border-zinc-900 bg-[#020202]'}`}>
										<div className='absolute -top-3 left-6 px-2 bg-black mono text-[8px] text-zinc-600 uppercase'>Attractor_Module</div>
										<div className='space-y-6'>
											<h3 className='mono text-xl font-bold tracking-tighter text-zinc-100'>{currentMatch.b.name}</h3>
											<div className='h-0.5 w-10 bg-white' />
											<p className='text-[11px] text-zinc-500 italic leading-relaxed line-clamp-4'>"{currentMatch.b.justification}"</p>
										</div>
									</div>
								</div>

								{/* Progress / Verdict Rendering */}
								<div className='max-w-xl mx-auto space-y-12'>
									{gameState === TournamentState.RUNNING ? (
										<div className='space-y-10'>
											<div className='flex justify-between mono text-[11px] text-zinc-500 uppercase tracking-widest'>
												<span className='flex items-center gap-3'>
													<Activity size={12} className='text-rose-500' /> Analyzing_Stability_Coefficient
												</span>
												<span className='animate-pulse'>PROCESSING...</span>
											</div>
											<div className='w-full h-px bg-zinc-900 relative'>
												<div
													className='absolute top-0 left-0 h-full bg-rose-500 shadow-[0_0_20px_rgba(244,63,94,1)] transition-all duration-300'
													style={{ width: '72%' }}
												/>
											</div>
										</div>
									) : (
										rounds.length > 0 && (
											<div className='p-10 border border-zinc-800 bg-[#020202] animate-in fade-in slide-in-from-bottom-8 duration-1000 relative overflow-hidden'>
												<div className='absolute top-0 right-0 p-3 opacity-10'>
													<Fingerprint size={48} />
												</div>
												<div className='flex items-center gap-3 mb-6'>
													<div className='w-2 h-2 rounded-full bg-rose-500' />
													<span className='mono text-[9px] font-bold uppercase tracking-[0.4em] text-zinc-500'>Stability_Verification_Complete</span>
												</div>
												<h4 className='mono text-2xl font-bold mb-6 uppercase tracking-tighter text-rose-500'>
													{rounds[0].winnerId === rounds[0].competitorA.id ? rounds[0].competitorA.name : rounds[0].competitorB.name}_PERSISTED
												</h4>
												<p className='text-zinc-400 text-[12px] leading-relaxed font-light tracking-wide max-w-xl italic'>
													"{rounds[0].judgementReasoning}"
												</p>
												<div className='mt-10 flex justify-between items-center mono text-[9px] text-zinc-700 uppercase tracking-widest border-t border-zinc-900 pt-6'>
													<span>Identity_State: RECORDED</span>
													<ArrowUpRight size={14} />
												</div>
											</div>
										)
									)}
								</div>
							</div>
						) : (
							<div className='text-center space-y-10 opacity-10'>
								<Lock size={100} strokeWidth={0.5} className='mx-auto' />
								<p className='mono text-[12px] tracking-[0.8em] uppercase'>Observation_Halted_Waiting_Collision</p>
							</div>
						)}
					</div>
				</section>

				{/* Right: Global Persistence Matrix */}
				<aside className='overflow-y-auto p-10 flex flex-col gap-16 bg-[#020202]'>
					<section>
						<div className='flex items-center gap-3 mb-10'>
							<Activity size={16} className='text-rose-500' />
							<h2 className='mono text-[11px] font-bold text-zinc-400 tracking-[0.4em] uppercase'>Stability_Index</h2>
						</div>
						<div className='h-72'>
							<ResponsiveContainer width='100%' height='100%'>
								<BarChart data={leaderboardData} layout='vertical'>
									<XAxis type='number' hide />
									<YAxis dataKey='name' type='category' width={100} stroke='#1a1a1a' fontSize={10} tick={{ fill: '#444', fontFamily: 'Space Mono' }} />
									<Tooltip
										cursor={{ fill: 'rgba(255,255,255,0.02)' }}
										contentStyle={{ backgroundColor: '#000', border: '1px solid #111', borderRadius: '0px', fontSize: '10px', color: '#fff' }}
										itemStyle={{ color: '#f43f5e' }}
									/>
									<Bar dataKey='persistenceScore' radius={[0, 2, 2, 0]}>
										{leaderboardData.map((entry, index) => (
											<Cell key={`cell-${index}`} fill={index < 3 ? '#f43f5e' : '#111'} stroke={index < 3 ? 'none' : '#222'} />
										))}
									</Bar>
								</BarChart>
							</ResponsiveContainer>
						</div>
					</section>

					<section className='flex-1 flex flex-col min-h-0'>
						<div className='flex items-center justify-between mb-8'>
							<div className='flex items-center gap-3'>
								<History size={16} className='text-zinc-600' />
								<h2 className='mono text-[11px] font-bold text-zinc-400 tracking-[0.4em] uppercase'>Collision_Archive</h2>
							</div>
							<ChevronDown size={14} className='text-zinc-800' />
						</div>
						<div className='space-y-px overflow-y-auto flex-1 pr-4'>
							{rounds.map((r, i) => (
								<details key={r.timestamp} className='group border-b border-zinc-900 bg-black transition-all hover:bg-zinc-900/5'>
									<summary className='py-5 cursor-pointer flex justify-between items-center list-none px-4'>
										<div className='flex flex-col'>
											<span className='mono text-[10px] font-bold text-zinc-500'>LOG_{rounds.length - i}</span>
											<span className='mono text-[8px] text-zinc-800 uppercase mt-1 tracking-widest'>{new Date(r.timestamp).toLocaleTimeString()}</span>
										</div>
										<div className='text-right'>
											<span className='mono text-[9px] text-rose-500 uppercase font-bold tracking-tighter'>
												{r.winnerId === r.competitorA.id ? r.competitorA.name : r.competitorB.name}
											</span>
											<div className='mono text-[7px] text-zinc-800 mt-1'>SURVIVED_DIALECTIC</div>
										</div>
									</summary>
									<div className='p-6 pt-0 space-y-6'>
										<div className='space-y-4'>
											<div className='h-px bg-zinc-900 w-full' />
											<p className='text-zinc-600 text-[10px] leading-relaxed italic border-l border-rose-500/20 pl-4 uppercase tracking-tight'>
												"{r.judgementReasoning}"
											</p>
										</div>
									</div>
								</details>
							))}
							{rounds.length === 0 && (
								<div className='py-20 text-center'>
									<p className='mono text-[10px] text-zinc-800 uppercase tracking-widest italic'>Awaiting_Initial_Collision</p>
								</div>
							)}
						</div>
					</section>
				</aside>
			</main>

			{/* Protocol Footer */}
			<footer className='h-10 border-t border-clinical-border bg-black flex items-center px-10 justify-between mono text-[8px] uppercase text-zinc-700 tracking-[0.5em] font-bold shrink-0 z-30'>
				<div className='flex gap-16'>
					<span className='flex items-center gap-3'>
						<div className='w-1.5 h-1.5 bg-rose-500 rounded-full' /> Stability_Verified
					</span>
					<span className='hidden md:inline'>Processing_Node: OpenRouter_Multi_Model</span>
					<span className='hidden md:inline'>Latency: Nominal</span>
				</div>
				<div className='flex items-center gap-4 text-zinc-800'>
					<span>{new Date().toISOString()}</span>
				</div>
			</footer>
		</div>
	)
}

export default App
