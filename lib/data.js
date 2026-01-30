import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { eq, desc, or, sql } from 'drizzle-orm'
import { getDb } from '../db/index.js'
import * as schema from '../db/schema.js'

/**
 * Load all competitors from markdown files
 * @param {string} competitorsDir - Path to competitors directory
 * @returns {Array} - Array of competitor objects
 */
export function loadCompetitors(competitorsDir) {
	if (!fs.existsSync(competitorsDir)) {
		return []
	}

	const files = fs.readdirSync(competitorsDir).filter((f) => f.endsWith('.md'))

	return files
		.map((file) => {
			const content = fs.readFileSync(path.join(competitorsDir, file), 'utf-8')
			const { data, content: justification } = matter(content)
			const id = path.basename(file, '.md')
			return {
				id,
				name: data.name,
				justification: justification.trim(),
			}
		})
		.filter((competitor) => competitor.justification.length > 0)
}

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
 * Build leaderboard data from database
 * @returns {Object} - Leaderboard structure
 */
export function buildLeaderboardData() {
	const db = getDb()

	// Get all competitors with stats
	const competitors = db.select().from(schema.competitors).all()

	// Get match count
	const matchCountResult = db
		.select({ count: sql`count(*)` })
		.from(schema.matches)
		.get()
	const totalMatches = matchCountResult.count

	// Calculate total evaluations
	const totalEvaluations = competitors.reduce((acc, c) => acc + c.totalEvaluations, 0)

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

	// Calculate average rating
	const avgRating = competitorData.length ? Math.round((competitorData.reduce((acc, c) => acc + c.mu, 0) / competitorData.length) * 100) / 100 : 0

	return {
		generatedAt: new Date().toISOString(),
		totalMatches,
		totalEvaluations,
		avgRating,
		competitors: competitorData,
	}
}

/**
 * Get leaderboard data from database or fallback to JSON
 */
const getLeaderboardData = () => {
	try {
		return buildLeaderboardData()
	} catch (error) {
		throw error
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
	const leaderboardData = getLeaderboardData()
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
