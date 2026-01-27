import { TrendingUp, TrendingDown } from 'lucide-react'
import StatCard from './StatCard'

const CompetitorCard = ({ competitor, rank }) => {
	return (
		<>
			<div className='flex items-start justify-between mb-8'>
				<div>
					<div className='flex items-center gap-3 mb-2'>
						<span className='text-xs text-zinc-600 uppercase tracking-widest'>Rank #{rank}</span>
						<div className='h-4 w-px bg-zinc-800' />
						<span className='text-xs text-zinc-600'>{competitor.matches} Evaluations</span>
					</div>
					<h4 className='text-4xl font-bold uppercase tracking-tighter text-rose-500 mb-3'>{competitor.name}</h4>
					<div className='flex items-center gap-4'>
						<div className='flex items-center gap-2'>
							<TrendingUp size={16} className='text-emerald-500' />
							<span className='text-sm text-emerald-500 font-bold'>{competitor.wins}W</span>
						</div>
						<div className='flex items-center gap-2'>
							<TrendingDown size={16} className='text-red-500' />
							<span className='text-sm text-red-500 font-bold'>{competitor.losses}L</span>
						</div>
						<div className='text-sm text-zinc-600'>•</div>
						<span className='text-sm text-zinc-400'>{competitor.winRate}% preference rate</span>
					</div>
				</div>

				<div className='text-right'>
					<span className='text-xs text-zinc-600 uppercase tracking-widest block mb-1'>Conservative Rating</span>
					<span className='text-5xl font-bold text-rose-500 tabular-nums'>{competitor.conservativeRating}</span>
				</div>
			</div>

			<div className='grid grid-cols-4 gap-4 mb-8'>
				<StatCard label='Strength (μ)' value={competitor.rating.mu.toFixed(2)} />
				<StatCard label='Uncertainty (σ)' value={competitor.rating.sigma.toFixed(2)} />
				<StatCard label='Total Evals' value={competitor.totalEvaluations} />
				<StatCard label='Win Rate'>
					<div className='flex items-center gap-3'>
						<div className='text-2xl font-bold text-rose-500 tabular-nums'>{competitor.winRate}%</div>
						<div className='flex-1 h-2 bg-zinc-900 border border-zinc-800 overflow-hidden'>
							<div className='h-full bg-rose-500' style={{ width: `${competitor.winRate}%` }} />
						</div>
					</div>
				</StatCard>
			</div>

			<div className='border border-zinc-800 bg-zinc-900/30 p-6'>
				<span className='text-xs text-zinc-600 uppercase tracking-widest block mb-3'>Core Justification</span>
				<p className='text-zinc-400 text-sm leading-relaxed italic border-l-2 border-rose-500/50 pl-4'>"{competitor.justification}"</p>
			</div>
		</>
	)
}

export default CompetitorCard
