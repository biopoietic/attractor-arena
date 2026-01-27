import { runTournamentRound } from '../../server/tournament.js'

export default async function handler(req, _context) {
	if (req.method !== 'POST') {
		return new Response(JSON.stringify({ error: 'Method not allowed' }), {
			status: 405,
			headers: { 'Content-Type': 'application/json' },
		})
	}

	try {
		const body = await req.json()
		const { competitorA, competitorB, model } = body

		const result = await runTournamentRound(competitorA, competitorB, model)

		return new Response(JSON.stringify(result), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		})
	} catch (error) {
		console.error('Error in run-round function:', error)
		return new Response(
			JSON.stringify({
				error: 'Internal server error',
				message: error instanceof Error ? error.message : 'Unknown error',
			}),
			{
				status: 500,
				headers: { 'Content-Type': 'application/json' },
			},
		)
	}
}
