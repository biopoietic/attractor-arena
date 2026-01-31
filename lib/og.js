import React from 'react'
import { ImageResponse } from 'next/og.js'

const div = (classNameOrProps, ...children) => {
	const props = typeof classNameOrProps === 'string' ? { tw: classNameOrProps } : classNameOrProps
	return React.createElement('div', props, ...children)
}

export async function generateOgImage(title, subtitle, type = 'default') {
	// Define type-specific configurations
	const typeConfig = {
		competitor: {
			label: 'COMPETITOR_PROFILE',
			statusLabel: 'Basin Status',
			statusValue: 'ACTIVE',
			liveIndicator: true,
		},
		default: {
			statusLabel: 'System Status',
			statusValue: 'ONLINE',
			liveIndicator: true,
		},
	}

	const config = typeConfig[type] || typeConfig.default

	return new ImageResponse(
		div(
			'h-full w-full flex flex-col items-center justify-center bg-[#000000] font-mono relative',

			// Main Content Panel
			div(
				'flex flex-col w-[94%] h-[90%] bg-[#020202] border border-[#141414] relative p-12 justify-between',

				// Header
				div(
					'flex justify-between items-center border-b border-[#141414] pb-6',
					div('flex items-center', div('w-3 h-3 mr-3 bg-[#ff2056] rounded-full'), div('text-2xl text-[#9f9fa9] font-black uppercase tracking-widest', 'Attractor Arena')),
					config.liveIndicator && div('text-lg text-[#444444] tracking-wider', 'LIVE'),
				),

				// Body
				div(
					'flex flex-col items-start justify-center flex-1',
					config.label && div('text-xl text-[#ff2056] uppercase tracking-widest font-bold', config.label),
					div('text-7xl font-black text-[#ff2056] uppercase', title),
					subtitle && div('mt-4 px-6 py-3 border-l-4 bg-[#ff2056]/5 border-[#ff2056] text-[#9f9fa9] text-2xl uppercase tracking-wide', subtitle),
				),

				// Footer
				div(
					'flex justify-between items-end border-t border-[#141414] pt-6',
					div(
						'flex flex-col',
						div('text-xs text-[#444444] tracking-widest uppercase', config.statusLabel),
						div('text-xl text-[#ff2056] tracking-widest uppercase font-bold', config.statusValue),
					),
					div('flex', ...[0, 1, 2, 3, 4].map((i) => div({ key: i, tw: `w-10 h-2 ml-1 ${i === 4 ? 'bg-[#ff2056]' : 'bg-[#141414]'}` }))),
				),
			),
		),
		{ width: 1200, height: 630 },
	)
}
