import { createContext, useContext, useMemo } from 'react'
import leaderboardData from '../data/leaderboard.json'
import matchesJsonl from '../data/matches.jsonl?raw'

const TournamentContext = createContext(null)

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

export const TournamentProvider = ({ children }) => {
	const value = useMemo(() => {
		const allMatches = parseMatches(matchesJsonl)
		const enrichedMatches = enrichMatches(allMatches, leaderboardData.competitors)

		return {
			// Leaderboard data
			competitors: leaderboardData.competitors,
			totalMatches: leaderboardData.totalMatches,
			avgRating: leaderboardData.avgRating,
			generatedAt: leaderboardData.generatedAt,

			// All matches (enriched with names)
			matches: enrichedMatches,

			// Helper to get recent matches
			getRecentMatches: (count = 50) => enrichedMatches.slice(-count).reverse(),

			// Helper to get matches for a specific competitor
			getCompetitorMatches: (competitorId, count = 50) => {
				return enrichedMatches
					.filter((m) => m.competitorA.id === competitorId || m.competitorB.id === competitorId)
					.slice(-count)
					.reverse()
			},

			// Helper to find competitor by id
			getCompetitor: (competitorId) => {
				return leaderboardData.competitors.find((c) => c.id === competitorId)
			},

			// Helper to get competitor rank
			getCompetitorRank: (competitorId) => {
				return leaderboardData.competitors.findIndex((c) => c.id === competitorId) + 1
			},
		}
	}, [])

	return <TournamentContext.Provider value={value}>{children}</TournamentContext.Provider>
}

export const useTournament = () => {
	const context = useContext(TournamentContext)
	if (!context) {
		throw new Error('useTournament must be used within a TournamentProvider')
	}
	return context
}
