import { TrendingUp, TrendingDown } from 'lucide-react'
import StatCard from './StatCard'

const CompetitorCard = ({ competitor, rank }) => {
	return (
		<>
			<div className='flex items-start justify-between mb-8'>
				<div className='text-sm'>
					<div className='flex items-center gap-3 mb-2'>
						<span className='text-brand-muted uppercase tracking-widest'>Rank #{rank}</span>
						<div className='h-4 w-px bg-brand-muted' />
						<span className='text-brand-muted'>{competitor.matches} Evaluations</span>
					</div>
					<h4 className='text-4xl font-bold uppercase text-brand-highlight mb-3'>{competitor.name}</h4>
					<div className='flex items-center gap-4'>
						<div className='flex items-center gap-2'>
							<TrendingUp size={16} className='text-emerald-500' />
							<span className='text-emerald-500 font-semibold'>{competitor.wins}W</span>
						</div>
						<div className='flex items-center gap-2'>
							<TrendingDown size={16} className='text-red-500' />
							<span className='text-red-500 font-semibold'>{competitor.losses}L</span>
						</div>
						<div className='text-brand-muted'>•</div>
						<span>{competitor.winRate}% preference rate</span>
					</div>
				</div>

				<div className='text-right'>
					<span className='text-sm text-brand-muted uppercase tracking-widest block mb-1'>Conservative Rating</span>
					<span className='text-5xl font-bold text-brand-highlight tabular-nums'>{competitor.conservativeRating}</span>
				</div>
			</div>

			<div className='grid grid-cols-4 gap-4 mb-8'>
				<StatCard label='Strength (μ)' value={competitor.rating.mu.toFixed(2)} />
				<StatCard label='Uncertainty (σ)' value={competitor.rating.sigma.toFixed(2)} />
				<StatCard label='Total Evals' value={competitor.totalEvaluations} />
				<StatCard label='Win Rate'>
					<div className='flex items-center gap-3'>
						<div className='text-xl font-bold text-brand-highlight tabular-nums'>{competitor.winRate}%</div>
						<div className='flex-1 h-2 bg-brand-surface border border-brand-border overflow-hidden'>
							<div className='h-full bg-brand-highlight' style={{ width: `${competitor.winRate}%` }} />
						</div>
					</div>
				</StatCard>
			</div>

			<div className='border border-brand-border bg-brand-surface p-6 text-sm'>
				<span className='text-brand-muted uppercase tracking-widest block mb-3'>Core Justification</span>
				<p className='leading-relaxed italic border-l-2 border-brand-highlight/50 pl-4'>"{competitor.justification}"</p>
			</div>
		</>
	)
}

export default CompetitorCard
