import { GitPullRequest, Github } from 'lucide-react'
import Logo from './Logo'

const Header = ({ competitors, totalMatches, avgRating }) => {
	return (
		<header className='h-16 border-b border-brand-border bg-brand-surface flex items-center gap-10 px-10 shrink-0 z-30 uppercase'>
			<Logo />

			<div className='hidden lg:flex items-center gap-12 border-l border-brand-border pl-10 text-xs font-semibold tracking-wider'>
				<div className='flex flex-col'>
					<span className='text-brand-muted'>Competitors</span>
					<span>{competitors.length} ACTIVE</span>
				</div>
				<div className='flex flex-col'>
					<span className='text-brand-muted'>Matches</span>
					<span>{totalMatches}</span>
				</div>
				<div className='flex flex-col'>
					<span className='text-brand-muted'>Avg_Strength</span>
					<span>μ={avgRating}</span>
				</div>
			</div>

			<nav className='ml-auto flex items-center gap-12 text-xs h3 m-0 text-brand-muted'>
				<a href='/submit' className='flex items-center gap-2 hover:text-brand-highlight transition-colors'>
					<GitPullRequest size={14} />
					<span>Submit_Identity</span>
				</a>
				<a href='https://github.com/biopoietic/attractor-arena' target='_blank' className='hidden sm:flex hover:text-brand-highlight transition-colors'>
					<Github size={14} />
				</a>
			</nav>
		</header>
	)
}

export default Header
