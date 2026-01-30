/**
 * Storage utilities for tournament data
 * - Competitors from markdown files
 * - Match results as individual JSON files
 * - Leaderboard JSON output
 */

import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

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
 * Load all matches from JSONL file (newline-delimited JSON)
 * @param {string} matchesFile - Path to matches.jsonl
 * @returns {Array} - Array of match objects
 */
export function loadMatches(matchesFile) {
	if (!fs.existsSync(matchesFile)) {
		return []
	}

	const content = fs.readFileSync(matchesFile, 'utf-8').trim()

	if (!content) {
		return []
	}

	// Parse as JSONL (one JSON object per line)
	const lines = content.split('\n').filter((line) => line.trim())

	return lines
		.map((line) => {
			try {
				return JSON.parse(line)
			} catch {
				console.warn('Failed to parse match line:', line.substring(0, 100) + '...')
				return null
			}
		})
		.filter(Boolean)
}

/**
 * Append a single match to JSONL file
 * @param {string} matchesFile - Path to matches.jsonl
 * @param {Object} match - Match object to append
 */
export function appendMatch(matchesFile, match) {
	const dir = path.dirname(matchesFile)
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, { recursive: true })
	}

	const line = JSON.stringify(match) + '\n'
	fs.appendFileSync(matchesFile, line)
}

/**
 * Save individual match file with full evaluation data
 * @param {string} matchesDir - Path to matches directory
 * @param {string} matchId - Unique match identifier
 * @param {Object} matchData - Full match data including evaluations
 */
export function saveMatchFile(matchesDir, matchId, matchData) {
	if (!fs.existsSync(matchesDir)) {
		fs.mkdirSync(matchesDir, { recursive: true })
	}

	const filePath = path.join(matchesDir, `${matchId}.json`)
	fs.writeFileSync(filePath, JSON.stringify(matchData, null, 2))
}

/**
 * Build leaderboard data structure for frontend
 * @param {Array} competitors - All competitors
 * @param {Object} ratings - Rating data by competitor ID
 * @param {Array} matches - All matches
 * @returns {Object} - Leaderboard structure
 */
export function buildLeaderboardData(competitors, ratings, matches) {
	// Build competitor data with ratings
	const competitorData = competitors.map((c) => {
		const rating = ratings[c.id] || { mu: 0, sigma: 1.5, matches: 0, wins: 0, losses: 0 }
		const totalEvaluations = rating.wins + rating.losses

		return {
			id: c.id,
			name: c.name,
			rating: {
				mu: Math.round(rating.mu * 100) / 100,
				sigma: Math.round(rating.sigma * 100) / 100,
			},
			matches: rating.matches,
			wins: rating.wins,
			losses: rating.losses,
			totalEvaluations,
			winRate: totalEvaluations > 0 ? Math.round((rating.wins / totalEvaluations) * 100) : 0,
			conservativeRating: Math.round((rating.mu - 3 * rating.sigma + 5) * 10),
		}
	}) // Sort by conservative rating (mu - 3*sigma) descending
	competitorData.sort((a, b) => {
		const conservativeA = a.rating.mu - 3 * a.rating.sigma
		const conservativeB = b.rating.mu - 3 * b.rating.sigma
		return conservativeB - conservativeA
	})

	// Calculate average rating across all competitors
	const avgRating = competitorData.length ? Math.round((competitorData.reduce((acc, c) => acc + c.rating.mu, 0) / competitorData.length) * 100) / 100 : 0

	return {
		generatedAt: new Date().toISOString(),
		totalMatches: matches.length,
		avgRating,
		competitors: competitorData,
	}
}

/**
 * Write all public data files for frontend consumption
 * @param {string} publicDir - Path to public directory
 * @param {Array} competitors - All competitors
 * @param {Object} ratings - Rating data by competitor ID
 * @param {Array} matches - All matches
 */
export function writePublicData(publicDir, competitors, ratings, matches) {
	if (!fs.existsSync(publicDir)) {
		fs.mkdirSync(publicDir, { recursive: true })
	}

	// Build leaderboard data (contains competitors with ratings)
	const leaderboardData = buildLeaderboardData(competitors, ratings, matches)
	fs.writeFileSync(path.join(publicDir, 'leaderboard.json'), JSON.stringify(leaderboardData, null, 2))

	return { leaderboardData }
}
