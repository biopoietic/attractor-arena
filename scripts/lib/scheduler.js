/**
 * Match scheduler for intelligent pairing
 * Builds a match queue that maximizes information gain
 */

import { getMatchQuality, getConservativeRating, DEFAULTS } from './ratings.js'

// Thresholds
const HIGH_SIGMA_THRESHOLD = 6.0 // Competitors with sigma > this are "uncertain"
const MIN_HEAD_TO_HEAD = 2 // Minimum h2h matches before pair is "saturated"
const PLACEMENT_MATCHES = 12 // Max placement matches for new competitors
const EXPLORATION_RATIO = 0.1 // 10% of budget for exploration

/**
 * Build head-to-head matrix from match history
 * @param {Array} matches - Match history
 * @returns {Object} - Map of "idA:idB" -> count (sorted so idA < idB)
 */
function buildH2HMatrix(matches) {
	const h2h = {}
	for (const match of matches) {
		const [a, b] = [match.competitorA, match.competitorB].sort()
		const key = `${a}:${b}`
		h2h[key] = (h2h[key] || 0) + 1
	}
	return h2h
}

/**
 * Get head-to-head count for a pair
 */
function getH2HCount(h2h, idA, idB) {
	const [a, b] = [idA, idB].sort()
	return h2h[`${a}:${b}`] || 0
}

/**
 * Identify competitors that need matches
 * @param {Array} competitors - Array of competitor objects with id
 * @param {Object} ratings - Map of id -> rating data
 * @param {Array} matches - Match history
 * @returns {Object} - { newCompetitors, highUncertainty, lowH2HPairs }
 */
export function identifyNeedsMatches(competitors, ratings, matches) {
	const h2h = buildH2HMatrix(matches)
	const ids = competitors.map((c) => c.id)

	// New competitors (0 matches)
	const newCompetitors = ids.filter((id) => ratings[id]?.matches === 0)

	// High uncertainty (sigma > threshold and has some matches)
	const highUncertainty = ids.filter((id) => {
		const r = ratings[id]
		return r && r.matches > 0 && r.sigma > HIGH_SIGMA_THRESHOLD
	})

	// Pairs with few head-to-heads (excluding new competitors)
	const establishedIds = ids.filter((id) => ratings[id]?.matches > 0)
	const lowH2HPairs = []
	for (let i = 0; i < establishedIds.length; i++) {
		for (let j = i + 1; j < establishedIds.length; j++) {
			const count = getH2HCount(h2h, establishedIds[i], establishedIds[j])
			if (count < MIN_HEAD_TO_HEAD) {
				lowH2HPairs.push([establishedIds[i], establishedIds[j], count])
			}
		}
	}
	// Sort by count ascending (fewest h2h first)
	lowH2HPairs.sort((a, b) => a[2] - b[2])

	return { newCompetitors, highUncertainty, lowH2HPairs }
}

/**
 * Get quantile representatives from established competitors
 * Returns competitors at top 10%, median, and bottom 10% by conservative rating
 */
function getQuantileRepresentatives(competitors, ratings) {
	// Filter to established competitors (have ratings with matches)
	const established = competitors.filter((c) => ratings[c.id]?.matches > 0)

	if (established.length === 0) return []

	// Sort by conservative rating (mu - 3*sigma)
	const sorted = [...established].sort((a, b) => {
		const rA = ratings[a.id]
		const rB = ratings[b.id]
		return getConservativeRating(rB) - getConservativeRating(rA)
	})

	const n = sorted.length
	const representatives = []

	// Top 10%
	representatives.push(sorted[Math.floor(n * 0.1)] || sorted[0])
	// Median
	representatives.push(sorted[Math.floor(n * 0.5)])
	// Bottom 10%
	representatives.push(sorted[Math.floor(n * 0.9)] || sorted[n - 1])

	// Deduplicate
	return [...new Set(representatives.map((c) => c.id))].map((id) => competitors.find((c) => c.id === id))
}

/**
 * Get neighborhood (closest by mu) for a competitor
 */
function getNeighborhood(targetId, competitors, ratings, count = 8) {
	const targetRating = ratings[targetId]
	if (!targetRating) return []

	// Filter out target and those without ratings
	const others = competitors.filter((c) => c.id !== targetId && ratings[c.id]?.matches > 0)

	// Sort by distance from target mu
	const sorted = [...others].sort((a, b) => {
		const distA = Math.abs(ratings[a.id].mu - targetRating.mu)
		const distB = Math.abs(ratings[b.id].mu - targetRating.mu)
		return distA - distB
	})

	return sorted.slice(0, count)
}

/**
 * Build match queue with intelligent scheduling
 * @param {Array} competitors - All competitors
 * @param {Object} ratings - Current ratings
 * @param {Array} matches - Match history
 * @param {number} budget - Total matches to schedule
 * @returns {Array} - Array of [competitorA_id, competitorB_id] pairs
 */
export function buildMatchQueue(competitors, ratings, matches, budget) {
	const queue = []
	const scheduled = new Set() // Track scheduled pairs this round

	const addMatch = (idA, idB) => {
		if (idA === idB) return false
		const key = [idA, idB].sort().join(':')
		if (scheduled.has(key)) return false
		scheduled.add(key)
		queue.push([idA, idB])
		return true
	}

	const { newCompetitors, highUncertainty, lowH2HPairs } = identifyNeedsMatches(competitors, ratings, matches)

	// Phase 1: Placement matches for new competitors
	const placementBudget = Math.min(budget * 0.6, newCompetitors.length * PLACEMENT_MATCHES)

	for (const newId of newCompetitors) {
		if (queue.length >= placementBudget) break

		// Get quantile representatives and neighborhood
		const quantiles = getQuantileRepresentatives(competitors, ratings)
		const neighborhood = getNeighborhood(newId, competitors, ratings, 8)

		// Mix quantiles and neighborhood
		const opponents = [...quantiles]
		for (const n of neighborhood) {
			if (!opponents.find((o) => o.id === n.id)) {
				opponents.push(n)
			}
		}

		// Schedule matches against these opponents
		let matchesForNew = 0
		for (const opponent of opponents) {
			if (matchesForNew >= PLACEMENT_MATCHES) break
			if (queue.length >= placementBudget) break
			if (addMatch(newId, opponent.id)) {
				matchesForNew++
			}
		}

		// If not enough established opponents, match against other new competitors
		if (matchesForNew < PLACEMENT_MATCHES) {
			for (const otherId of newCompetitors) {
				if (matchesForNew >= PLACEMENT_MATCHES) break
				if (queue.length >= placementBudget) break
				if (otherId !== newId && addMatch(newId, otherId)) {
					matchesForNew++
				}
			}
		}
	}

	// Phase 2: High-info matches (high sigma, close mu)
	const highInfoBudget = Math.floor(budget * 0.8) // Up to 80% total (including placement)

	// Prioritize high uncertainty competitors
	const uncertainCompetitors = [...highUncertainty].sort((a, b) => ratings[b].sigma - ratings[a].sigma)

	for (const uncertainId of uncertainCompetitors) {
		if (queue.length >= highInfoBudget) break

		// Find best opponents (closest mu for maximum info gain)
		const neighborhood = getNeighborhood(uncertainId, competitors, ratings, 5)
		for (const opponent of neighborhood) {
			if (queue.length >= highInfoBudget) break
			addMatch(uncertainId, opponent.id)
		}
	}

	// Also schedule some low h2h pairs
	for (const [idA, idB] of lowH2HPairs) {
		if (queue.length >= highInfoBudget) break
		addMatch(idA, idB)
	}

	// Phase 3: Exploration matches (random pairs)
	const explorationBudget = budget

	// Get all possible pairs not yet scheduled
	const allIds = competitors.map((c) => c.id)
	const possiblePairs = []
	for (let i = 0; i < allIds.length; i++) {
		for (let j = i + 1; j < allIds.length; j++) {
			const key = [allIds[i], allIds[j]].sort().join(':')
			if (!scheduled.has(key)) {
				possiblePairs.push([allIds[i], allIds[j]])
			}
		}
	}

	// Shuffle and add exploration matches
	const shuffled = possiblePairs.sort(() => Math.random() - 0.5)
	for (const [idA, idB] of shuffled) {
		if (queue.length >= explorationBudget) break
		addMatch(idA, idB)
	}

	// Shuffle final queue to mix match types
	return queue.sort(() => Math.random() - 0.5).slice(0, budget)
}

/**
 * Get match priority score (for sorting)
 * Higher = more important to run
 */
export function getMatchPriority(idA, idB, ratings, matches) {
	const rA = ratings[idA]
	const rB = ratings[idB]

	if (!rA || !rB) return 100 // New competitor = high priority

	// Combine factors:
	// - Higher sigma = more uncertain = higher priority
	// - Higher match quality = more informative = higher priority
	const avgSigma = (rA.sigma + rB.sigma) / 2
	const quality = getMatchQuality(rA, rB)

	return avgSigma * 2 + quality * 10
}
