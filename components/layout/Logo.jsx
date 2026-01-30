import { Activity } from 'lucide-react'
import Link from 'next/link'

const Logo = () => {
	return (
		<Link href='/' className='flex items-center gap-3 font-sans hover:opacity-80 transition-opacity'>
			<Activity size={18} className='text-brand-highlight animate-pulse' />
			<span className='text-lg font-bold tracking-tighter uppercase'>Attractor Arena</span>
		</Link>
	)
}

export default Logo
