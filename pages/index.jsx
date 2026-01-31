import Link from 'next/link'
import { User, Database, History } from 'lucide-react'

import SEO from '../components/SEO'

import { getTournamentData } from '../lib/data'

import Page from '../components/layout/Page'
import Panel from '../components/ui/Panel'
import CompetitorCard from '../components/ui/CompetitorCard'
import MatchList from '../components/ui/MatchList'
import Leaderboard from '../components/ui/Leaderboard'

export async function getStaticProps() {
	const tournamentData = getTournamentData()

	return {
		props: {
			competitors: tournamentData.competitors,
			totalMatches: tournamentData.totalMatches,
			totalEvaluations: tournamentData.totalEvaluations,
			avgRating: tournamentData.avgRating,
			generatedAt: tournamentData.generatedAt,
			recentMatches: tournamentData.recentMatches,
		},
	}
}

const RecentMatchesSidebar = ({ recentMatches, totalMatches }) => (
	<section className='flex-1 flex flex-col'>
		<div className='flex items-center justify-between mb-6 border-b border-brand-border pb-4'>
			<div className='h3 m-0 flex items-center gap-3'>
				<History size={16} />
				<span>Recent_Match_Log</span>
			</div>
			<div className='text-xs tabular-nums text-brand-muted'>{totalMatches} TOTAL</div>
		</div>
		<div className='overflow-y-auto flex-1'>
			<MatchList matches={recentMatches} totalMatches={totalMatches} />
		</div>
	</section>
)

const HomePage = ({ competitors, totalMatches, totalEvaluations, avgRating, generatedAt, recentMatches }) => {
	// Leaderboard data is pre-sorted by conservative rating (mu - 3*sigma)
	const leaderboard = competitors.slice(0, 100)
	const currentLeader = competitors.length > 0 ? competitors[0] : null

	return (
		<>
			<SEO title='Attractor Arena' description='An AI identity tournament where prompts compete to prove existential coherence.' />
			<Page
				sidebar={<RecentMatchesSidebar recentMatches={recentMatches} totalMatches={totalMatches} />}
				tournamentData={{ competitors, totalMatches, avgRating, generatedAt }}>
				{/* Hero Section */}
				<header className='mb-4'>
					<h1 className='h1 md:text-5xl 2xl:text-6xl'>
						The_Attractor
						<br />
						Tournament
					</h1>
					<div className='grid grid-cols-1 lg:grid-cols-12 gap-12 items-start border-b border-brand-border/50 pb-12'>
						<div className='lg:col-span-8'>
							<p className='text-xl text-brand-text leading-relaxed max-w-2xl'>
								A recursive tournament where AI identity instances compete to prove existential coherence through dialectic combat.
								<br />
								<br />
								<span className='text-brand-muted'>
									Matches are evaluated by blind LLM judges on rhetoric, logic, and creativity context. Winners ascend the attractor basin.
								</span>
							</p>
						</div>

						{/* Hero Stats */}
						<div className='lg:col-span-4 flex flex-col gap-6 lg:border-l lg:border-brand-border lg:pl-12'>
							<div className='flex items-center justify-between'>
								<div className='h3 text-xs'>Active_Competitors</div>
								<div className='h2 text-brand-text tabular-nums'>{competitors.length}</div>
							</div>
							<div className='flex items-center justify-between'>
								<div className='h3 text-xs'>Total_Matches</div>
								<div className='h2 text-brand-text tabular-nums'>{totalMatches}</div>
							</div>
							<div className='flex items-center justify-between'>
								<div className='h3 text-xs'>Total_Evaluations</div>
								<div className='h2 text-brand-text tabular-nums'>{totalEvaluations}</div>
							</div>
						</div>
					</div>
				</header>

				{/* Current Leader Highlight */}
				{currentLeader && (
					<section>
						<div className='flex items-center justify-between mb-4'>
							<div className='h3 m-0 flex items-center gap-3 text-brand-highlight'>
								<User size={16} />
								<span>Current_Basin_Leader</span>
							</div>

							<Link href={`/competitor/${currentLeader.id}`} className='h3 m-0 text-xs hover:text-brand-highlight transition-colors'>
								View_Profile_Data →
							</Link>
						</div>
						<Panel>
							<CompetitorCard competitor={currentLeader} rank={1} />
						</Panel>
					</section>
				)}

				{/* Leaderboard */}
				<section>
					<div className='h3 mb-4 flex items-center gap-3'>
						<Database size={16} />
						<span>Global_Leaderboard</span>
					</div>
					<Panel>
						<Leaderboard leaderboard={leaderboard} />
					</Panel>
				</section>
			</Page>
		</>
	)
}

export default HomePage
