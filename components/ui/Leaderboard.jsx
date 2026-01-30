import { Link } from 'react-router-dom'

const Leaderboard = ({ leaderboard }) => {
	return (
		<div className='overflow-x-auto'>
			<table className='text-right text-brand-muted'>
				<thead>
					<tr className='h4'>
						<th>#</th>
						<th className='text-left'>Name</th>
						<th>Matches</th>
						<th>Evals</th>
						<th>Wins</th>
						<th>Loss</th>
						<th>Strength (μ)</th>
						<th>Sigma (σ)</th>
						<th>Win_Rate</th>
						<th>ELO</th>
					</tr>
				</thead>
				<tbody>
					{leaderboard.map((c, index) => (
						<tr key={c.id} className='text-right group'>
							<td className='relative'>
								<div
									className={`absolute left-0 top-2 bottom-2 w-0.75 ${index < 3 ? 'bg-brand-highlight/50' : 'bg-brand-border'} group-hover:bg-brand-highlight`}
								/>
								{index + 1}
							</td>
							<td className='text-left'>
								<Link to={`/competitor/${c.id}`} className='text-md text-brand-text group-hover:text-brand-highlight transition-colors'>
									{c.name}
								</Link>
							</td>
							<td>{c.matches}</td>
							<td>{c.totalEvaluations}</td>
							<td>{c.wins}</td>
							<td>{c.losses}</td>
							<td>{c.mu.toFixed(2)}</td>
							<td>{c.sigma.toFixed(2)}</td>
							<td>
								<div className='flex items-center gap-2 justify-end'>
									<span>{c.winRate}%</span>
									<div className='h-1.5 w-16 bg-brand-surface border border-brand-border overflow-hidden'>
										<div className='h-full bg-brand-highlight' style={{ width: `${c.winRate}%` }} />
									</div>
								</div>
							</td>
							<td className={`font-semibold ${c.rating > 1500 ? 'text-brand-highlight' : ''}`}>{c.rating}</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	)
}

export default Leaderboard
