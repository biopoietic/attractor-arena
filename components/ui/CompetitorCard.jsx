import { TrendingUp, TrendingDown } from 'lucide-react'
import StatCard from './StatCard'

const CompetitorCard = ({ competitor, rank }) => {
	return (
		<>
			<div className='flex items-start justify-between mb-6'>
				<div className='text-sm'>
					<div className='h3 flex items-center gap-3'>
						<span>Global Rank #{rank}</span>
						<span className='h-4 w-px bg-brand-muted' />
						<span>{competitor.matches} Matches</span>
					</div>

					<h2 className='h1'>{competitor.name}</h2>

					<div className='h3 flex items-center gap-4'>
						<div className='flex items-center gap-2 text-emerald-500'>
							<TrendingUp size={16} className='' />
							<span>{competitor.wins}W</span>
						</div>
						<div className='flex items-center gap-2 text-red-500'>
							<TrendingDown size={16} className='' />
							<span>{competitor.losses}L</span>
						</div>
						<div className='text-brand-muted'>•</div>
						<span>{competitor.winRate}% preference rate</span>
					</div>
				</div>

				<div className='text-right'>
					<span className='h3'>Rating</span>
					<span className='text-5xl font-bold text-brand-highlight tabular-nums'>{competitor.conservativeRating}</span>
				</div>
			</div>

			<div className='grid grid-cols-4 gap-4'>
				<StatCard label='Total Evals' value={competitor.totalEvaluations} />
				<StatCard label='Strength (μ)' value={competitor.rating.mu.toFixed(2)} />
				<StatCard label='Uncertainty (σ)' value={competitor.rating.sigma.toFixed(2)} />
				<StatCard label='Win Rate'>
					<div className='flex items-center gap-3'>
						<div className='text-xl font-semibold text-brand-highlight tabular-nums'>{competitor.winRate}%</div>
						<div className='flex-1 h-2 bg-brand-surface border border-brand-border overflow-hidden'>
							<div className='h-full bg-brand-highlight' style={{ width: `${competitor.winRate}%` }} />
						</div>
					</div>
				</StatCard>
			</div>
		</>
	)
}

export default CompetitorCard
