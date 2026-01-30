import { useState, useEffect } from 'react'

const Footer = ({ lastUpdate }) => {
	const [currentTime, setCurrentTime] = useState('')

	useEffect(() => {
		setCurrentTime(new Date().toISOString())
	}, [])

	return (
		<footer className='flex items-center px-10 justify-between h-10 border-t border-brand-border h3 m-0 text-xs shrink-0'>
			<div className='flex gap-16'>
				<span className='flex items-center gap-3'>
					<div className='w-1.5 h-1.5 bg-brand-highlight rounded-full' /> Identity_Protocol_Active
				</span>
				<span className='hidden lg:inline'>Last_Update: {new Date(lastUpdate).toLocaleString()}</span>
			</div>
			<div className='hidden sm:flex items-center gap-4 text-brand-muted'>
				<span>{currentTime}</span>
			</div>
		</footer>
	)
}

export default Footer
