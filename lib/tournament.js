import fs from 'fs'
import path from 'path'

/**
 * Read and parse leaderboard data
 */
const getLeaderboardData = () => {
	const filePath = path.join(process.cwd(), 'data', 'leaderboard.json')
	const fileContents = fs.readFileSync(filePath, 'utf8')
	return JSON.parse(fileContents)
}

/**
 * Parse JSONL text into array of objects
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
 * Read and parse JSONL matches
 */
const getMatchesJsonl = () => {
	const filePath = path.join(process.cwd(), 'data', 'matches.jsonl')
	const fileContents = fs.readFileSync(filePath, 'utf8')
	return parseMatches(fileContents)
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
 * Get full tournament data (replaces tournamentLoader)
 */
export const getTournamentData = () => {
	const leaderboardData = getLeaderboardData()
	const allMatches = getMatchesJsonl()
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
 * Get competitor markdown content
 */
export const getCompetitorMarkdown = (competitorId) => {
	const filePath = path.join(process.cwd(), 'competitors', `${competitorId}.md`)
	try {
		const fileContents = fs.readFileSync(filePath, 'utf8')
		// Strip frontmatter
		return fileContents.replace(/^---\n[\s\S]*?\n---\n/, '').replace(/^\n+/, '')
	} catch {
		return null
	}
}

/**
 * Get all competitor IDs (for getStaticPaths)
 */
export const getAllCompetitorIds = () => {
	const leaderboardData = getLeaderboardData()
	return leaderboardData.competitors.map((c) => c.id)
}

/**
 * Get all match IDs (for getStaticPaths)
 */
export const getAllMatchIds = () => {
	const matchesDir = path.join(process.cwd(), 'data', 'matches')
	const filenames = fs.readdirSync(matchesDir)
	return filenames.filter((f) => f.endsWith('.json')).map((f) => f.replace('.json', ''))
}

/**
 * Get individual match data
 */
export const getMatchData = (matchId) => {
	const filePath = path.join(process.cwd(), 'data', 'matches', `${matchId}.json`)
	try {
		const fileContents = fs.readFileSync(filePath, 'utf8')
		return JSON.parse(fileContents)
	} catch {
		return null
	}
}
