import Header from './Header'
import Footer from './Footer'

import leaderboardData from '../../data/leaderboard.json'

const Page = ({ children, sidebar }) => {
	const { competitors, totalMatches, avgRating, generatedAt } = leaderboardData

	return (
		<div className='h-screen bg-black text-white flex flex-col select-none overflow-hidden'>
			<div className='scanline' />

			<Header competitors={competitors} totalMatches={totalMatches} avgRating={avgRating} />

			{/* Main Wide Application Shell */}
			<main className='flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-[1fr_32rem] h-full relative z-10'>
				<aside className='border-r border-clinical-border overflow-y-auto p-10 flex flex-col gap-12 bg-black'>{children}</aside>

				{/* Right Sidebar */}
				{sidebar && <aside className='overflow-y-auto p-10 flex flex-col gap-16 bg-[#020202]'>{sidebar}</aside>}
			</main>

			<Footer lastUpdate={generatedAt} />
		</div>
	)
}

export default Page
