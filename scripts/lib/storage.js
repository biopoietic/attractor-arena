/**
 * Storage utilities for tournament data
 * - Write operations for matches and competitor stats
 * - Read operations have been moved to lib/data.js
 */

import { eq } from 'drizzle-orm'
import { getDb } from '../../db/index.js'
import * as schema from '../../db/schema.js'

/**
 * Save a match and its evaluations to database
 * @param {Object} match - Match record
 * @param {Array} evaluations - Array of evaluation objects
 */
export function saveMatch(match, evaluationList) {
	const db = getDb()

	// Insert match
	db.insert(schema.matches)
		.values({
			id: match.matchId,
			timestamp: match.timestamp,
			competitorAId: match.competitorA,
			competitorBId: match.competitorB,
			winnerId: match.winner,
			scoreA: match.scoreA,
			scoreB: match.scoreB,
			totalEvaluations: match.totalEvaluations,
			entropy: match.entropy,
			seed: match.seed,
			judgeVersion: match.judgeVersion,
		})
		.run()

	// Insert evaluations
	const evalRecords = evaluationList.map((ev) => ({
		matchId: match.matchId,
		model: ev.model,
		ordering: ev.ordering,
		choice: ev.choice,
		selectedId: ev.selectedId,
		rationale: ev.rationale,
	}))

	db.insert(schema.evaluations).values(evalRecords).run()
}

/**
 * Update competitor stats in database
 * @param {string} competitorId - Competitor ID
 * @param {Object} stats - Stats object with rating info
 */
export function updateCompetitorStats(competitorId, stats) {
	const db = getDb()

	db.update(schema.competitors)
		.set({
			rating: Math.round(1500 + stats.mu * 200),
			uncertainty: Math.round(stats.sigma * 200),
			mu: stats.mu,
			sigma: stats.sigma,
			matches: stats.matches,
			wins: stats.wins,
			losses: stats.losses,
			totalEvaluations: stats.wins + stats.losses,
			winRate: stats.wins + stats.losses > 0 ? Math.round((stats.wins / (stats.wins + stats.losses)) * 100) : 0,
		})
		.where(eq(schema.competitors.id, competitorId))
		.run()
}

/**
 * Initialize competitors in database from markdown files
 * @param {Array} competitors - Array of competitor objects
 */
export function initCompetitors(competitors) {
	const db = getDb()

	for (const competitor of competitors) {
		// Check if competitor exists
		const existing = db.select().from(schema.competitors).where(eq(schema.competitors.id, competitor.id)).get()

		if (!existing) {
			// Insert new competitor with default stats
			db.insert(schema.competitors)
				.values({
					id: competitor.id,
					name: competitor.name,
					justification: competitor.justification,
					rating: 1500,
					uncertainty: 300,
					mu: 0,
					sigma: 1.5,
					matches: 0,
					wins: 0,
					losses: 0,
					totalEvaluations: 0,
					winRate: 0,
				})
				.run()
		} else {
			// Update justification if changed
			db.update(schema.competitors)
				.set({
					name: competitor.name,
					justification: competitor.justification,
				})
				.where(eq(schema.competitors.id, competitor.id))
				.run()
		}
	}
}
