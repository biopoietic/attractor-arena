/**
 * TrueSkill-style Bayesian rating system
 * Each player has a rating represented by (mu, sigma):
 *   mu = estimated skill level
 *   sigma = uncertainty in that estimate
 */

// Standard TrueSkill parameters
const DEFAULT_MU = 25.0
const DEFAULT_SIGMA = 25.0 / 3 // ~8.333
const BETA = DEFAULT_SIGMA / 2 // Performance variance (~4.167)
const TAU = DEFAULT_SIGMA / 100 // Dynamics factor (~0.0833)

/**
 * Create a new rating with default values
 */
export function createRating(mu = DEFAULT_MU, sigma = DEFAULT_SIGMA) {
	return { mu, sigma }
}

/**
 * Gaussian PDF
 */
function gaussianPdf(x) {
	return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI)
}

/**
 * Gaussian CDF (approximation)
 */
function gaussianCdf(x) {
	const a1 = 0.254829592
	const a2 = -0.284496736
	const a3 = 1.421413741
	const a4 = -1.453152027
	const a5 = 1.061405429
	const p = 0.3275911

	const sign = x < 0 ? -1 : 1
	x = Math.abs(x) / Math.sqrt(2)

	const t = 1.0 / (1.0 + p * x)
	const y = 1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x)

	return 0.5 * (1.0 + sign * y)
}

/**
 * V function for TrueSkill update (truncated Gaussian)
 */
function vFunction(t, epsilon = 0) {
	const denom = gaussianCdf(t - epsilon)
	if (denom < 1e-10) return -t + epsilon
	return gaussianPdf(t - epsilon) / denom
}

/**
 * W function for TrueSkill update (variance correction)
 */
function wFunction(t, epsilon = 0) {
	const denom = gaussianCdf(t - epsilon)
	if (denom < 1e-10) return 1
	const v = vFunction(t, epsilon)
	return v * (v + t - epsilon)
}

/**
 * Update ratings after a match
 * @param {Object} winnerRating - Winner's rating {mu, sigma}
 * @param {Object} loserRating - Loser's rating {mu, sigma}
 * @returns {Object} - {winner: {mu, sigma}, loser: {mu, sigma}}
 */
export function updateRatings(winnerRating, loserRating) {
	// Add dynamics factor to prevent sigma from getting too small
	const sigmaW = Math.sqrt(winnerRating.sigma ** 2 + TAU ** 2)
	const sigmaL = Math.sqrt(loserRating.sigma ** 2 + TAU ** 2)

	// Combined variance
	const c = Math.sqrt(2 * BETA ** 2 + sigmaW ** 2 + sigmaL ** 2)

	// Normalized difference (winner - loser)
	const t = (winnerRating.mu - loserRating.mu) / c

	// Update factors
	const v = vFunction(t)
	const w = wFunction(t)

	// Winner update
	const muWinnerDelta = (sigmaW ** 2 / c) * v
	const sigmaWinnerMultiplier = Math.sqrt(1 - (sigmaW ** 2 / c ** 2) * w)

	// Loser update
	const muLoserDelta = (sigmaL ** 2 / c) * v
	const sigmaLoserMultiplier = Math.sqrt(1 - (sigmaL ** 2 / c ** 2) * w)

	return {
		winner: {
			mu: winnerRating.mu + muWinnerDelta,
			sigma: Math.max(sigmaW * sigmaWinnerMultiplier, DEFAULT_SIGMA / 10), // Floor at 10% of initial
		},
		loser: {
			mu: loserRating.mu - muLoserDelta,
			sigma: Math.max(sigmaL * sigmaLoserMultiplier, DEFAULT_SIGMA / 10),
		},
	}
}

/**
 * Compute all ratings by replaying match history
 * @param {Array} matches - Array of match objects with competitorA, competitorB, winner
 * @param {Array} competitorIds - All competitor IDs to include in ratings
 * @returns {Object} - Map of competitorId -> {mu, sigma, matches, wins, losses}
 */
export function computeAllRatings(matches, competitorIds) {
	const ratings = {}

	// Initialize all competitors
	for (const id of competitorIds) {
		ratings[id] = {
			...createRating(),
			matches: 0,
			wins: 0,
			losses: 0,
		}
	}

	// Replay matches in order
	for (const match of matches) {
		const { competitorA, competitorB, winner } = match

		// Skip if competitors not in our list (shouldn't happen)
		if (!ratings[competitorA] || !ratings[competitorB]) continue

		const winnerId = winner
		const loserId = winner === competitorA ? competitorB : competitorA

		const winnerRating = { mu: ratings[winnerId].mu, sigma: ratings[winnerId].sigma }
		const loserRating = { mu: ratings[loserId].mu, sigma: ratings[loserId].sigma }

		const updated = updateRatings(winnerRating, loserRating)

		// Apply updates
		ratings[winnerId].mu = updated.winner.mu
		ratings[winnerId].sigma = updated.winner.sigma
		ratings[winnerId].matches++
		ratings[winnerId].wins++

		ratings[loserId].mu = updated.loser.mu
		ratings[loserId].sigma = updated.loser.sigma
		ratings[loserId].matches++
		ratings[loserId].losses++
	}

	return ratings
}

/**
 * Get match quality (probability of a draw in TrueSkill terms)
 * Higher quality = more evenly matched = more informative match
 * @param {Object} ratingA - Rating {mu, sigma}
 * @param {Object} ratingB - Rating {mu, sigma}
 * @returns {number} - Quality score between 0 and 1
 */
export function getMatchQuality(ratingA, ratingB) {
	const sigmaSq = ratingA.sigma ** 2 + ratingB.sigma ** 2 + 2 * BETA ** 2
	const muDiff = ratingA.mu - ratingB.mu

	return Math.sqrt((2 * BETA ** 2) / sigmaSq) * Math.exp(-(muDiff ** 2) / (2 * sigmaSq))
}

/**
 * Get win probability for player A against player B
 * @param {Object} ratingA - Rating {mu, sigma}
 * @param {Object} ratingB - Rating {mu, sigma}
 * @returns {number} - Probability A wins (0 to 1)
 */
export function getWinProbability(ratingA, ratingB) {
	const sigmaSq = ratingA.sigma ** 2 + ratingB.sigma ** 2 + 2 * BETA ** 2
	return gaussianCdf((ratingA.mu - ratingB.mu) / Math.sqrt(sigmaSq))
}

/**
 * Get conservative rating (mu - 3*sigma)
 * This is what TrueSkill uses for leaderboard ranking
 */
export function getConservativeRating(rating) {
	return rating.mu - 3 * rating.sigma
}

export const DEFAULTS = {
	MU: DEFAULT_MU,
	SIGMA: DEFAULT_SIGMA,
	BETA,
	TAU,
}
