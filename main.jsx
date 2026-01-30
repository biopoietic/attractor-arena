import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom'

import { tournamentLoader } from './api/tournament'
import HomePage from './pages/HomePage'
import CompetitorPage, { loader as competitorLoader } from './pages/CompetitorPage'
import MatchPage, { loader as matchLoader } from './pages/MatchPage'
import './assets/styles/global.css'

const router = createBrowserRouter([
	{
		id: 'root',
		path: '/',
		loader: tournamentLoader,
		element: <Outlet />,
		children: [
			{
				index: true,
				element: <HomePage />,
			},
			{
				path: 'competitor/:id',
				element: <CompetitorPage />,
				loader: competitorLoader,
			},
			{
				path: 'match/:id',
				element: <MatchPage />,
				loader: matchLoader,
			},
		],
	},
])

ReactDOM.createRoot(document.getElementById('root')).render(
	<React.StrictMode>
		<RouterProvider router={router} />
	</React.StrictMode>,
)
