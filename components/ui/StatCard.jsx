const StatCard = ({ label, value, variant = 'default', className = '', children }) => {
	const getValueColor = () => {
		if (variant === 'primary') return 'text-brand-highlight'
		return 'text-white'
	}

	return (
		<div className={`bg-brand-surface border border-brand-border p-4 ${className}`}>
			<span className='text-sm text-brand-muted uppercase tracking-wider block mb-2'>{label}</span>
			<p className={`text-xl font-semibold tabular-nums ${getValueColor()}`}>{value}</p>

			{children}
		</div>
	)
}

export default StatCard
