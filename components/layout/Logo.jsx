import { Globe } from 'lucide-react'

const Logo = () => {
	return (
		<div className='flex items-center gap-3 font-sans'>
			<Globe size={18} className='text-rose-500 animate-pulse' />
			<h1 className='text-lg font-bold tracking-tighter uppercase'>Attractor Arena</h1>
		</div>
	)
}

export default Logo
