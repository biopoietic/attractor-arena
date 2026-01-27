/**
 * Bayesian Bradley-Terry rating system
 * Each player has a rating represented by (mu, sigma):
 *   mu = estimated log-skill (strength parameter)
 *   sigma = uncertainty in that estimate
 *
 * Adapted for panel evaluation where each match produces
 * multiple Bernoulli observations (judge votes).
 */

// Default parameters
const DEFAULT_MU = 0.0 // Log-skill starts at 0 (equal odds)
const DEFAULT_SIGMA = 1.5 // Initial uncertainty
const MIN_SIGMA = 0.2 // Floor for uncertainty
const LEARNING_RATE = 0.4 // How much to adjust per observation

/**
 * Create a new rating with default values
 */
export function createRating(mu = DEFAULT_MU, sigma = DEFAULT_SIGMA) {
	return { mu, sigma }
}

/**
 * Sigmoid function - probability that player with rating diff wins
 * P(A beats B) = 1 / (1 + exp(-(muA - muB)))
 */
function sigmoid(x) {
	return 1 / (1 + Math.exp(-x))
}

/**
 * Update ratings after a match with multiple judge votes
 * Uses online Bayesian update approximation for Bradley-Terry
 *
 * @param {Object} winnerRating - Higher scorer's rating {mu, sigma}
 * @param {Object} loserRating - Lower scorer's rating {mu, sigma}
 * @param {number} winnerScore - Votes for winner (e.g., 7)
 * @param {number} loserScore - Votes for loser (e.g., 3)
 * @param {number} totalVotes - Total votes (e.g., 10)
 * @returns {Object} - {winner: {mu, sigma}, loser: {mu, sigma}}
 */
export function updateRatings(winnerRating, loserRating, winnerScore, loserScore, totalVotes) {
	// Calculate expected win probability based on current ratings
	const ratingDiff = winnerRating.mu - loserRating.mu
	const expectedWinProb = sigmoid(ratingDiff)

	// Observed win proportion
	const observedWinProp = winnerScore / totalVotes

	// Surprise factor: how much the result differed from expectation
	const surprise = observedWinProp - expectedWinProb

	// Information gain scales with:
	// 1. Number of observations (more votes = more confidence)
	// 2. How decisive the result was (10-0 vs 6-4)
	// 3. Current uncertainty (higher sigma = bigger updates)
	const infoGain = Math.sqrt(totalVotes) * Math.abs(observedWinProp - 0.5) * 2

	// Update magnitude based on current uncertainty
	const winnerUpdateMag = LEARNING_RATE * winnerRating.sigma * infoGain
	const loserUpdateMag = LEARNING_RATE * loserRating.sigma * infoGain

	// Apply updates
	const newWinnerMu = winnerRating.mu + surprise * winnerUpdateMag
	const newLoserMu = loserRating.mu - surprise * loserUpdateMag

	// Reduce uncertainty based on information gained
	// More decisive results reduce uncertainty more
	const uncertaintyReduction = 0.9 - (0.1 * infoGain) / Math.sqrt(totalVotes)
	const newWinnerSigma = Math.max(MIN_SIGMA, winnerRating.sigma * uncertaintyReduction)
	const newLoserSigma = Math.max(MIN_SIGMA, loserRating.sigma * uncertaintyReduction)

	return {
		winner: {
			mu: newWinnerMu,
			sigma: newWinnerSigma,
		},
		loser: {
			mu: newLoserMu,
			sigma: newLoserSigma,
		},
	}
}

/**
 * Compute all ratings by replaying match history
 * @param {Array} matches - Array of match objects
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
		const { competitorA, competitorB, winner, scoreA, scoreB, totalEvaluations } = match

		// Skip if competitors not in our list
		if (!ratings[competitorA] || !ratings[competitorB]) continue

		const winnerId = winner
		const loserId = winner === competitorA ? competitorB : competitorA

		const winnerScore = winnerId === competitorA ? scoreA : scoreB
		const loserScore = winnerId === competitorA ? scoreB : scoreA
		const totalVotes = totalEvaluations

		const winnerRating = { mu: ratings[winnerId].mu, sigma: ratings[winnerId].sigma }
		const loserRating = { mu: ratings[loserId].mu, sigma: ratings[loserId].sigma }

		const updated = updateRatings(winnerRating, loserRating, winnerScore, loserScore, totalVotes)

		// Apply updates
		ratings[winnerId].mu = updated.winner.mu
		ratings[winnerId].sigma = updated.winner.sigma
		ratings[winnerId].matches++
		ratings[winnerId].wins += winnerScore
		ratings[winnerId].losses += loserScore

		ratings[loserId].mu = updated.loser.mu
		ratings[loserId].sigma = updated.loser.sigma
		ratings[loserId].matches++
		ratings[loserId].wins += loserScore
		ratings[loserId].losses += winnerScore
	}

	return ratings
}

/**
 * Get conservative rating (mu - 3*sigma)
 * Used for leaderboard ranking - rewards both skill and consistency
 */
export function getConservativeRating(rating) {
	return rating.mu - 3 * rating.sigma
}

export const DEFAULTS = {
	MU: DEFAULT_MU,
	SIGMA: DEFAULT_SIGMA,
	MIN_SIGMA,
	LEARNING_RATE,
}
