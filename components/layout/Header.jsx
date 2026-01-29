import Logo from './Logo'

const Header = ({ competitors, totalMatches, avgRating }) => {
	return (
		<header className='h-16 border-b border-brand-border bg-brand-surface flex items-center gap-10 px-10 shrink-0 z-30 uppercase'>
			<Logo />

			<div className='hidden xl:flex items-center gap-12 border-l border-brand-border pl-10 text-xs font-semibold tracking-wider'>
				<div className='flex flex-col'>
					<span className='text-brand-muted'>Competitors</span>
					<span>{competitors.length} ACTIVE</span>
				</div>
				<div className='flex flex-col'>
					<span className='text-brand-muted'>Evaluations</span>
					<span>{totalMatches} MATCHES_COMPLETE</span>
				</div>
				<div className='flex flex-col'>
					<span className='text-brand-muted'>Avg_Strength</span>
					<span>μ={avgRating}</span>
				</div>
			</div>
		</header>
	)
}

export default Header
