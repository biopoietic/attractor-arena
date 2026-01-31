import { eq, sql } from 'drizzle-orm'
import { getDb } from '../db/index.js'
import * as schema from '../db/schema.js'

/**
 * Load all matches from database
 * @returns {Array} - Array of match objects
 */
export function loadMatches() {
	const db = getDb()
	const matchRecords = db.select().from(schema.matches).orderBy(schema.matches.timestamp).all()

	return matchRecords.map((m) => ({
		competitorA: m.competitorAId,
		competitorB: m.competitorBId,
		winner: m.winnerId,
		scoreA: m.scoreA,
		scoreB: m.scoreB,
		totalEvaluations: m.totalEvaluations,
		entropy: m.entropy,
		seed: m.seed,
		judgeVersion: m.judgeVersion,
		matchId: m.id,
		timestamp: m.timestamp,
	}))
}

/**
 * Get all competitors from database, sorted by rating
 * @returns {Array} - Array of competitor objects
 */
export const getCompetitors = () => {
	const db = getDb()

	// Get all competitors with stats
	const competitors = db.select().from(schema.competitors).all()

	// Sort by conservative rating (mu - 3*sigma)
	const competitorData = competitors
		.map((c) => ({
			id: c.id,
			name: c.name,
			rating: c.rating,
			uncertainty: c.uncertainty,
			mu: Math.round(c.mu * 100) / 100,
			sigma: Math.round(c.sigma * 100) / 100,
			matches: c.matches,
			wins: c.wins,
			losses: c.losses,
			totalEvaluations: c.totalEvaluations,
			winRate: c.winRate,
		}))
		.sort((a, b) => {
			const conservativeA = a.mu - 3 * a.sigma
			const conservativeB = b.mu - 3 * b.sigma
			return conservativeB - conservativeA
		})

	return competitorData
}

/**
 * Build leaderboard data from database
 * @returns {Object} - Leaderboard structure
 */
export const getLeaderboard = () => {
	const db = getDb()

	// Get competitors
	const competitors = getCompetitors()

	// Get match count
	const matchCountResult = db
		.select({ count: sql`count(*)` })
		.from(schema.matches)
		.get()
	const totalMatches = matchCountResult.count

	// Calculate total evaluations
	const totalEvaluations = competitors.reduce((acc, c) => acc + c.totalEvaluations, 0)

	// Calculate average rating
	const avgRating = competitors.length ? Math.round((competitors.reduce((acc, c) => acc + c.mu, 0) / competitors.length) * 100) / 100 : 0

	return {
		generatedAt: new Date().toISOString(),
		totalMatches,
		totalEvaluations,
		avgRating,
		competitors,
	}
}

/**
 * Get all matches from database
 */
const getAllMatches = () => {
	try {
		const db = getDb()
		const matchRecords = db.select().from(schema.matches).orderBy(schema.matches.timestamp).all()

		const competitors = db.select().from(schema.competitors).all()
		const competitorMap = Object.fromEntries(competitors.map((c) => [c.id, c]))

		return matchRecords.map((m) => ({
			competitorA: m.competitorAId,
			competitorB: m.competitorBId,
			winner: m.winnerId,
			scoreA: m.scoreA,
			scoreB: m.scoreB,
			totalEvaluations: m.totalEvaluations,
			entropy: m.entropy,
			seed: m.seed,
			judgeVersion: m.judgeVersion,
			matchId: m.id,
			timestamp: m.timestamp,
			competitorAName: competitorMap[m.competitorAId]?.name,
			competitorBName: competitorMap[m.competitorBId]?.name,
			winnerName: competitorMap[m.winnerId]?.name,
		}))
	} catch (error) {
		return []
	}
}

/**
 * Transform matches to include competitor names
 */
const enrichMatches = (matches, competitors) => {
	const competitorMap = Object.fromEntries(competitors.map((c) => [c.id, c]))

	return matches.map((m) => ({
		matchId: m.matchId,
		competitorA: {
			id: m.competitorA,
			name: m.competitorAName || competitorMap[m.competitorA]?.name || m.competitorA,
		},
		competitorB: {
			id: m.competitorB,
			name: m.competitorBName || competitorMap[m.competitorB]?.name || m.competitorB,
		},
		winnerId: m.winner,
		winnerName: m.winnerName || competitorMap[m.winner]?.name || m.winner,
		scoreA: m.scoreA,
		scoreB: m.scoreB,
		totalEvaluations: m.totalEvaluations,
		entropy: Math.round(m.entropy * 100) / 100,
		timestamp: m.timestamp,
		judgeVersion: m.judgeVersion,
	}))
}

/**
 * Get full tournament data
 */
export const getTournamentData = () => {
	const leaderboardData = getLeaderboard()
	const allMatches = getAllMatches()
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
export const getCompetitorMatches = (competitorId, count = 50) => {
	const allMatches = getAllMatches()
	const competitors = getCompetitors()
	const enrichedMatches = enrichMatches(allMatches, competitors)

	return enrichedMatches
		.filter((m) => m.competitorA.id === competitorId || m.competitorB.id === competitorId)
		.slice(-count)
		.reverse()
}

/**
 * Get full competitor data with justification from database
 */
export const getCompetitor = (competitorId) => {
	try {
		const db = getDb()
		const competitor = db.select().from(schema.competitors).where(eq(schema.competitors.id, competitorId)).get()
		if (!competitor) return null

		return {
			id: competitor.id,
			name: competitor.name,
			justification: competitor.justification,
			url: competitor.url,
			description: competitor.description,
			rating: competitor.rating,
			uncertainty: competitor.uncertainty,
			mu: Math.round(competitor.mu * 100) / 100,
			sigma: Math.round(competitor.sigma * 100) / 100,
			matches: competitor.matches,
			wins: competitor.wins,
			losses: competitor.losses,
			totalEvaluations: competitor.totalEvaluations,
			winRate: competitor.winRate,
		}
	} catch {
		return null
	}
}

/**
 * Get competitor rank (1-indexed)
 */
export const getCompetitorRank = (competitorId) => {
	const competitors = getCompetitors()
	return competitors.findIndex((c) => c.id === competitorId) + 1
}

/**
 * Get all competitor IDs (for getStaticPaths)
 */
export const getAllCompetitorIds = () => {
	const competitors = getCompetitors()
	return competitors.map((c) => c.id)
}

/**
 * Get all match IDs (for getStaticPaths)
 */
export const getAllMatchIds = () => {
	try {
		const db = getDb()
		const matches = db.select({ id: schema.matches.id }).from(schema.matches).all()
		return matches.map((m) => m.id)
	} catch (error) {
		return []
	}
}

/**
 * Get individual match data with evaluations
 */
export const getMatchData = (matchId) => {
	try {
		const db = getDb()

		// Get match
		const match = db.select().from(schema.matches).where(eq(schema.matches.id, matchId)).get()
		if (!match) return null

		// Get competitors
		const competitorA = db.select().from(schema.competitors).where(eq(schema.competitors.id, match.competitorAId)).get()
		const competitorB = db.select().from(schema.competitors).where(eq(schema.competitors.id, match.competitorBId)).get()

		// Get evaluations
		const evaluations = db.select().from(schema.evaluations).where(eq(schema.evaluations.matchId, matchId)).all()

		const judgePanel = [...new Set(evaluations.map((e) => e.model))]

		return {
			id: match.id,
			timestamp: match.timestamp,
			competitorA: {
				id: competitorA.id,
				name: competitorA.name,
				justification: competitorA.justification,
			},
			competitorB: {
				id: competitorB.id,
				name: competitorB.name,
				justification: competitorB.justification,
			},
			evaluations: evaluations.map((e) => ({
				choice: e.choice,
				rationale: e.rationale,
				model: e.model,
				ordering: e.ordering,
				selectedId: e.selectedId,
			})),
			score: {
				[competitorA.id]: match.scoreA,
				[competitorB.id]: match.scoreB,
				total: match.totalEvaluations,
			},
			entropy: match.entropy,
			winnerId: match.winnerId,
			winnerName: match.winnerId === competitorA.id ? competitorA.name : competitorB.name,
			judgeVersion: match.judgeVersion,
			judgePanel,
		}
	} catch (error) {
		return null
	}
}
