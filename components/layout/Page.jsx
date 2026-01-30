import { useRouteLoaderData } from 'react-router-dom'

import Header from './Header'
import Footer from './Footer'

const Page = ({ children, sidebar }) => {
	const { competitors, totalMatches, avgRating, generatedAt } = useRouteLoaderData('root')

	return (
		<div className='h-screen flex flex-col overflow-hidden'>
			<div className='scanline' />

			<Header competitors={competitors} totalMatches={totalMatches} avgRating={avgRating} />

			{/* Main Wide Application Shell */}
			<main className={`flex-1 overflow-hidden grid grid-cols-1 ${sidebar ? 'lg:grid-cols-[1fr_36rem]' : ''} h-full relative z-10`}>
				<aside className='overflow-y-auto p-10 flex flex-col gap-12'>{children}</aside> {/* Sidebar */}
				{sidebar && <aside className='overflow-y-auto p-10 flex flex-col gap-16 bg-brand-surface border-l border-brand-border'>{sidebar}</aside>}
			</main>

			<Footer lastUpdate={generatedAt} />
		</div>
	)
}

export default Page
