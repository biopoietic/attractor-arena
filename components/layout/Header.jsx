import Logo from './Logo'

const Header = ({ competitors, totalMatches, avgRating }) => {
	return (
		<header className='h-16 border-b border-clinical-border bg-black/90 flex items-center px-10 justify-between shrink-0 z-30'>
			<div className='flex items-center gap-10'>
				<Logo />
				<span className='text-zinc-600 tracking-widest ml-4 text-xs'>IDENTITY_PREFERENCE_PROTOCOL</span>
				<div className='hidden xl:flex items-center gap-12 border-l border-clinical-border pl-10'>
					<div className='flex flex-col'>
						<span className='text-xs text-zinc-600 uppercase'>Competitors</span>
						<span className='text-xs text-zinc-400 font-bold'>{competitors.length} ACTIVE</span>
					</div>
					<div className='flex flex-col'>
						<span className='text-xs text-zinc-600 uppercase'>Evaluations</span>
						<span className='text-xs text-zinc-400 font-bold'>{totalMatches} MATCHES_COMPLETE</span>
					</div>
					<div className='flex flex-col'>
						<span className='text-xs text-zinc-600 uppercase'>Avg_Strength</span>
						<span className='text-xs text-zinc-400 font-bold'>μ={avgRating}</span>
					</div>
				</div>
			</div>
		</header>
	)
}

export default Header
