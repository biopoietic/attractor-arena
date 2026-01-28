const Footer = ({ lastUpdate }) => {
	return (
		<footer className='h-10 border-t border-brand-border flex items-center px-10 justify-between text-xs uppercase text-brand-muted tracking-widest font-bold shrink-0'>
			<div className='flex gap-16'>
				<span className='flex items-center gap-3'>
					<div className='w-1.5 h-1.5 bg-brand-highlight rounded-full' /> Identity_Protocol_Active
				</span>
				<span className='hidden md:inline'>Last_Update: {new Date(lastUpdate).toLocaleString()}</span>
			</div>
			<div className='flex items-center gap-4 text-brand-muted'>
				<span>{new Date().toISOString()}</span>
			</div>
		</footer>
	)
}

export default Footer
