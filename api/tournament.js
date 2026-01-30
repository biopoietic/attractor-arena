import leaderboardData from '../data/leaderboard.json'
import matchesJsonl from '../data/matches.jsonl?raw'

/**
 * Parse JSONL matches into array
 */
const parseMatches = (jsonlText) => {
	if (!jsonlText?.trim()) return []
	return jsonlText
		.trim()
		.split('\n')
		.filter((line) => line.trim())
		.map((line) => {
			try {
				return JSON.parse(line)
			} catch {
				return null
			}
		})
		.filter(Boolean)
}

/**
 * Transform raw matches to include competitor names
 */
const enrichMatches = (matches, competitors) => {
	const competitorMap = Object.fromEntries(competitors.map((c) => [c.id, c]))

	return matches.map((m) => ({
		matchId: m.matchId,
		competitorA: {
			id: m.competitorA,
			name: competitorMap[m.competitorA]?.name || m.competitorA,
		},
		competitorB: {
			id: m.competitorB,
			name: competitorMap[m.competitorB]?.name || m.competitorB,
		},
		winnerId: m.winner,
		winnerName: competitorMap[m.winner]?.name || m.winner,
		scoreA: m.scoreA,
		scoreB: m.scoreB,
		totalEvaluations: m.totalEvaluations,
		entropy: Math.round(m.entropy * 100) / 100,
		timestamp: m.timestamp,
		judgeVersion: m.judgeVersion,
	}))
}

/**
 * Get matches for a specific competitor
 */
export const getCompetitorMatches = (matches, competitorId, count = 50) => {
	return matches
		.filter((m) => m.competitorA.id === competitorId || m.competitorB.id === competitorId)
		.slice(-count)
		.reverse()
}

/**
 * Find competitor by id
 */
export const getCompetitor = (competitors, competitorId) => {
	return competitors.find((c) => c.id === competitorId)
}

/**
 * Get competitor rank (1-indexed)
 */
export const getCompetitorRank = (competitors, competitorId) => {
	return competitors.findIndex((c) => c.id === competitorId) + 1
}

/**
 * Root loader - loads all tournament data
 */
export const tournamentLoader = () => {
	const allMatches = parseMatches(matchesJsonl)
	const enrichedMatches = enrichMatches(allMatches, leaderboardData.competitors)
	const recentMatches = enrichedMatches.slice(-50).reverse()

	return {
		competitors: leaderboardData.competitors,
		totalMatches: leaderboardData.totalMatches,
		totalEvaluations: leaderboardData.totalEvaluations,
		avgRating: leaderboardData.avgRating,
		generatedAt: leaderboardData.generatedAt,
		matches: enrichedMatches,
		recentMatches,
	}
}
