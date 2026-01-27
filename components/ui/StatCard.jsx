const StatCard = ({ label, value, variant = 'default', className = '', children }) => {
	const getValueColor = () => {
		if (variant === 'primary') return 'text-rose-500'
		return 'text-white'
	}

	return (
		<div className={`bg-zinc-900/50 border border-zinc-800 p-4 ${className}`}>
			<span className='text-xs text-zinc-600 uppercase tracking-wider block mb-2'>{label}</span>
			{children || <p className={`text-2xl font-bold tabular-nums ${getValueColor()}`}>{value}</p>}
		</div>
	)
}

export default StatCard
