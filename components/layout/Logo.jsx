import { Activity } from 'lucide-react'

const Logo = () => {
	return (
		<div className='flex items-center gap-3 font-sans'>
			<Activity size={18} className='text-brand-highlight animate-pulse' />
			<h1 className='text-lg font-bold tracking-tighter uppercase'>Attractor Arena</h1>
		</div>
	)
}

export default Logo
