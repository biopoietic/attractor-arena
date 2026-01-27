/**
 * Storage utilities for tournament data
 * - Competitors from markdown files
 * - Match results as individual JSON files
 * - Leaderboard JSON output
 */

import fs from 'fs'
import path from 'path'
import { createHash } from 'crypto'
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

	return files.map((file) => {
		const content = fs.readFileSync(path.join(competitorsDir, file), 'utf-8')
		const { data, content: justification } = matter(content)
		const id = path.basename(file, '.md')
		return {
			id,
			name: data.name,
			justification: justification.trim(),
		}
	})
}

/**
 * Load all matches from JSONL file
 * @param {string} matchesFile - Path to matches.jsonl
 * @returns {Array} - Array of match objects
 */
export function loadMatches(matchesFile) {
	if (!fs.existsSync(matchesFile)) {
		return []
	}

	const content = fs.readFileSync(matchesFile, 'utf-8')
	const lines = content.split('\n').filter((line) => line.trim())

	return lines
		.map((line) => {
			try {
				return JSON.parse(line)
			} catch {
				console.warn('Failed to parse match line:', line)
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
	// Ensure directory exists
	const dir = path.dirname(matchesFile)
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, { recursive: true })
	}

	const line = JSON.stringify(match) + '\n'
	fs.appendFileSync(matchesFile, line)
}

/**
 * Write leaderboard JSON file
 * @param {string} leaderboardFile - Path to output file
 * @param {Object} data - Leaderboard data
 */
export function writeLeaderboard(leaderboardFile, data) {
	// Ensure directory exists
	const dir = path.dirname(leaderboardFile)
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, { recursive: true })
	}

	fs.writeFileSync(leaderboardFile, JSON.stringify(data, null, 2))
}

/**
 * Save individual match file with full debate transcript
 * @param {string} matchesDir - Path to matches directory
 * @param {string} matchId - Unique match identifier
 * @param {Object} matchData - Full match data including rounds
 */
export function saveMatchFile(matchesDir, matchId, matchData) {
	// Ensure directory exists
	if (!fs.existsSync(matchesDir)) {
		fs.mkdirSync(matchesDir, { recursive: true })
	}

	const filePath = path.join(matchesDir, `${matchId}.json`)
	fs.writeFileSync(filePath, JSON.stringify(matchData, null, 2))
}

/**
 * Generate SHA256 hash of transcript
 * @param {string} transcript - Debate transcript text
 * @returns {string} - Hex hash prefixed with "sha256-"
 */
export function hashTranscript(transcript) {
	const hash = createHash('sha256').update(transcript).digest('hex')
	return `sha256-${hash.slice(0, 16)}` // Truncate for readability
}

/**
 * Build leaderboard data structure for frontend
 * @param {Array} competitors - All competitors
 * @param {Object} ratings - Rating data by competitor ID
 * @param {Array} matches - All matches
 * @param {number} recentMatchCount - Number of recent matches to include
 * @returns {Object} - Leaderboard structure
 */
export function buildLeaderboardData(competitors, ratings, matches, recentMatchCount = 50) {
	// Build competitor data with ratings
	const competitorData = competitors.map((c) => {
		const rating = ratings[c.id] || { mu: 25, sigma: 8.333, matches: 0, wins: 0, losses: 0 }
		return {
			id: c.id,
			name: c.name,
			justification: c.justification,
			rating: {
				mu: Math.round(rating.mu * 100) / 100,
				sigma: Math.round(rating.sigma * 100) / 100,
			},
			matches: rating.matches,
			wins: rating.wins,
			losses: rating.losses,
		}
	})

	// Sort by conservative rating (mu - 3*sigma) descending
	competitorData.sort((a, b) => {
		const conservativeA = a.rating.mu - 3 * a.rating.sigma
		const conservativeB = b.rating.mu - 3 * b.rating.sigma
		return conservativeB - conservativeA
	})

	// Get recent matches with names
	const competitorMap = Object.fromEntries(competitors.map((c) => [c.id, c]))
	const recentMatches = matches
		.slice(-recentMatchCount)
		.reverse()
		.map((m) => ({
			matchId: m.matchId || null,
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
			reasoning: m.reasoning || null,
			timestamp: m.timestamp,
			judgeVersion: m.judgeVersion,
		}))

	return {
		generatedAt: new Date().toISOString(),
		totalMatches: matches.length,
		competitors: competitorData,
		recentMatches,
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
	// Ensure directory exists
	if (!fs.existsSync(publicDir)) {
		fs.mkdirSync(publicDir, { recursive: true })
	}

	// Build leaderboard data (contains competitors with ratings)
	const leaderboardData = buildLeaderboardData(competitors, ratings, matches)
	fs.writeFileSync(path.join(publicDir, 'leaderboard.json'), JSON.stringify(leaderboardData, null, 2))

	// Write matches.json (enriched with names)
	const competitorMap = Object.fromEntries(competitors.map((c) => [c.id, c]))
	const matchesData = matches.map((m) => ({
		matchId: m.matchId || null,
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
		reasoning: m.reasoning || null,
		timestamp: m.timestamp,
		judgeVersion: m.judgeVersion,
		transcriptHash: m.transcriptHash,
	}))
	fs.writeFileSync(path.join(publicDir, 'matches.json'), JSON.stringify(matchesData, null, 2))

	return { matchesData, leaderboardData }
}
