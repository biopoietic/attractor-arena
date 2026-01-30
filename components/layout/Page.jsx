import { useRouteLoaderData } from 'react-router-dom'

import Header from './Header'
import Footer from './Footer'

const Page = ({ children, sidebar }) => {
	const { competitors, totalMatches, avgRating, generatedAt } = useRouteLoaderData('root')

	return (
		<div className='h-screen flex flex-col overflow-hidden'>
			<div className='scanline' />

			<Header competitors={competitors} totalMatches={totalMatches} avgRating={avgRating} />

			{/* Application Shell */}
			<main className={`flex-1 overflow-y-auto ${sidebar ? 'xl:grid md:grid-cols-[1fr_24rem] 2xl:grid-cols-[1fr_36rem]' : 'grid grid-cols-1'} h-full relative z-10`}>
				{/* Main Content */}
				<aside className='p-10 flex flex-col gap-12 xl:overflow-y-auto'>{children}</aside>

				{/* Sidebar */}
				{sidebar && (
					<aside className='p-10 flex flex-col gap-16 bg-brand-surface xl:overflow-y-auto xl:border-l border-t xl:border-t-0 border-brand-border'>{sidebar}</aside>
				)}
			</main>

			<Footer lastUpdate={generatedAt} />
		</div>
	)
}

export default Page
