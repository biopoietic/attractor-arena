import { Activity } from 'lucide-react'
import { Link } from 'react-router-dom'

const Logo = () => {
	return (
		<Link to='/' className='flex items-center gap-3 font-sans hover:opacity-80 transition-opacity'>
			<Activity size={18} className='text-brand-highlight animate-pulse' />
			<h1 className='text-lg font-bold tracking-tighter uppercase'>Attractor Arena</h1>
		</Link>
	)
}

export default Logo
