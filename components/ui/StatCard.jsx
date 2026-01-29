const StatCard = ({ label, value, variant = 'default', className = '', children }) => {
	const getValueColor = () => {
		if (variant === 'primary') return 'text-brand-highlight'
		return 'text-brand-text'
	}

	return (
		<div className={`bg-brand-surface border border-brand-border p-4 ${className}`}>
			<span className='h3'>{label}</span>
			<p className={`text-xl font-semibold tabular-nums ${getValueColor()}`}>{value}</p>

			{children}
		</div>
	)
}

export default StatCard
