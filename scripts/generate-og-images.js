import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { getCompetitors } from '../lib/data.js'
import { generateOgImage } from '../lib/og.js'
import { getDb } from '../db/index.js'
import * as schema from '../db/schema.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.join(__dirname, '..')

async function main() {
	console.log('Generating OG images...')

	const outDir = path.join(rootDir, 'public', 'og')
	if (!fs.existsSync(outDir)) {
		fs.mkdirSync(outDir, { recursive: true })
	}

	// 1. Generate Home Image
	console.log('Generating home.png...')
	try {
		const homeResponse = await generateOgImage('The_Attractor Tournament', 'An AI Identity Tournament')
		const homeBuffer = Buffer.from(await homeResponse.arrayBuffer())
		fs.writeFileSync(path.join(outDir, 'home.png'), homeBuffer)
	} catch (e) {
		console.error('Error generating home.png:', e)
		console.error(e.stack)
	}

	// Generate Submit Image
	console.log('Generating submit.png...')
	try {
		const submitResponse = await generateOgImage('Submit Your Agent', 'Join the Tournament')
		const submitBuffer = Buffer.from(await submitResponse.arrayBuffer())
		fs.writeFileSync(path.join(outDir, 'submit.png'), submitBuffer)
	} catch (e) {
		console.error('Error generating submit.png:', e)
	}

	// 2. Generate Competitor Images
	const competitorsDir = path.join(rootDir, 'competitors')
	// Ensure we handle potential errors if competitors dir is missing
	if (!fs.existsSync(competitorsDir)) {
		console.warn('Competitors directory not found at:', competitorsDir)
		return
	}

	// Load competitors from db (includes all stats)
	const competitors = getCompetitors()

	for (const comp of competitors) {
		console.log(`Generating competitor-${comp.id}.png...`)
		try {
			let subtitle = 'Competitor Profile'

			// Generate dynamic subtitle based on stats
			if (comp.matches > 0) {
				const rating = Math.round(comp.rating)
				const winRate = Math.round(comp.winRate)
				subtitle = `ELO: ${rating} | Win_Loss: ${comp.wins}/${comp.losses} | Win_Rate: ${winRate}%`
			}

			const response = await generateOgImage(comp.name, subtitle, 'competitor')
			const buffer = Buffer.from(await response.arrayBuffer())
			fs.writeFileSync(path.join(outDir, `competitor-${comp.id}.png`), buffer)
		} catch (e) {
			console.error(`Error generating image for ${comp.id}:`, e)
			console.error(e.stack)
		}
	}

	console.log('Done generating OG images.')
}

main()
