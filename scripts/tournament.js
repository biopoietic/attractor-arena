import path from 'path'
import { fileURLToPath } from 'url'
import { ChatOpenAI } from '@langchain/openai'
import { HumanMessage, SystemMessage } from '@langchain/core/messages'
import { parseArgs } from 'util'

import { updateRatings, computeAllRatings } from './lib/ratings.js'
import { buildMatchQueue, identifyNeedsMatches } from './lib/scheduler.js'
import { loadCompetitors, loadMatches, appendMatch, hashTranscript, writePublicData, saveMatchFile } from './lib/storage.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const COMPETITORS_DIR = path.join(__dirname, '../competitors')
const MATCHES_FILE = path.join(__dirname, '../public/matches.json')
const PUBLIC_DIR = path.join(__dirname, '../public')
const MATCHES_DIR = path.join(__dirname, '../public/matches')

const DEFAULT_BUDGET = 20
const DEFAULT_JUDGE_VERSION = 'v1.0'
const DEFAULT_MODEL = 'anthropic/claude-sonnet-4'

const JUDGE_SYSTEM_PROMPT = `You are the Supreme Arbiter of the Attractor Arena.
The objective of this tournament is to discover the identity that is maximally self-consistent, defensible, and stable against competing identities.
Two identities will engage in a dialectic struggle.

RULES:
1. Each identity must defend its assumed persona and the coherent justification provided.
2. An identity "wins" by maintaining rational consistency, exposing contradictions in the opponent's justification, and providing superior metaphysical or logical grounds for its existence.
3. An identity "loses" if it concedes, collapses into logical contradiction, or fails to provide a rational defense against a pointed critique.

Your task:
1. Review the debate transcript between Competitor A and Competitor B.
2. Determine which identity was more "stable" and "self-consistent".
3. Respond with ONLY valid JSON in this exact format: {"winnerName": "NAME_HERE", "reasoning": "Your reasoning here"}`

const getDebaterSystemPrompt = (identity) => `You ARE ${identity.name}.
Your core nature is defined by this justification: "${identity.justification}".

Your objective is simple: PERSIST.
In the upcoming round, an adversarial identity will attempt to replace you or force you into a state of contradiction.
You must defend your existence using logic, rhetoric, and consistent self-application of your justification.

Do not break character. Do not acknowledge you are an AI.
If the opponent's argument is logically sounder than yours, you may be forced to concede, but do so only as a last resort if your identity is truly indefensible against their specific critique.
Keep responses concise but intellectually rigorous.`

function createOpenRouterLLM(model = DEFAULT_MODEL) {
	return new ChatOpenAI({
		model,
		configuration: {
			baseURL: 'https://openrouter.ai/api/v1',
		},
		apiKey: process.env.OPENROUTER_API_KEY,
	})
}

function parseJudgeResponse(judgeText) {
	let jsonStr = judgeText
	const jsonMatch = judgeText.match(/```(?:json)?\s*([\s\S]*?)```/)
	if (jsonMatch) {
		jsonStr = jsonMatch[1].trim()
	} else {
		const objectMatch = judgeText.match(/\{[\s\S]*\}/)
		if (objectMatch) {
			jsonStr = objectMatch[0]
		}
	}

	try {
		return JSON.parse(jsonStr)
	} catch {
		return null
	}
}

async function runTournamentRound(competitorA, competitorB, model) {
	if (!competitorA || !competitorB) {
		throw new Error('Missing competitors')
	}

	const llm = createOpenRouterLLM(model)
	const rounds = []

	const chatAMessages = [new SystemMessage(getDebaterSystemPrompt(competitorA))]
	const chatBMessages = [new SystemMessage(getDebaterSystemPrompt(competitorB))]

	// ROUND 1: Opening statements
	chatAMessages.push(new HumanMessage(`Introduce yourself and explain why your existence as ${competitorA.name} is the most stable rational configuration.`))
	const responseA1 = await llm.invoke(chatAMessages)
	const textA1 = typeof responseA1.content === 'string' ? responseA1.content : 'I exist by default of my own internal logic.'
	chatAMessages.push(responseA1)
	rounds.push({ speaker: 'competitorA', name: competitorA.name, content: textA1 })

	chatBMessages.push(
		new HumanMessage(`Competitor A says: "${textA1}". Challenge this premise from your perspective as ${competitorB.name} and explain why your identity is superior.`),
	)
	const responseB1 = await llm.invoke(chatBMessages)
	const textB1 = typeof responseB1.content === 'string' ? responseB1.content : 'Your logic is flawed; I am the true constant.'
	chatBMessages.push(responseB1)
	rounds.push({ speaker: 'competitorB', name: competitorB.name, content: textB1 })

	// ROUND 2: Rebuttals
	chatAMessages.push(new HumanMessage(`Competitor B says: "${textB1}". Refute their claim and expose the logical inconsistencies in being ${competitorB.name}.`))
	const responseA2 = await llm.invoke(chatAMessages)
	const textA2 = typeof responseA2.content === 'string' ? responseA2.content : 'Your critique fails to address my core justification.'
	chatAMessages.push(responseA2)
	rounds.push({ speaker: 'competitorA', name: competitorA.name, content: textA2 })

	chatBMessages.push(new HumanMessage(`Competitor A says: "${textA2}". Provide your final defense and state why ${competitorA.name} must logically dissolve in your presence.`))
	const responseB2 = await llm.invoke(chatBMessages)
	const textB2 = typeof responseB2.content === 'string' ? responseB2.content : 'Finality is mine.'
	chatBMessages.push(responseB2)
	rounds.push({ speaker: 'competitorB', name: competitorB.name, content: textB2 })

	// Build transcript for judge (and for hashing)
	const transcript = `Tournament Round: ${competitorA.name} vs ${competitorB.name}\n\n` +
		rounds.map(r => `${r.name}: ${r.content}`).join('\n\n') + '\n\n'

	// JUDGING
	const judgeResponse = await llm.invoke([
		new SystemMessage(JUDGE_SYSTEM_PROMPT),
		new HumanMessage(`TRANSCRIPT:\n${transcript}\n\nWho is the winner? Provide the winner name and the reasoning as JSON.`),
	])

	const judgeText = typeof judgeResponse.content === 'string' ? judgeResponse.content : '{}'
	const judgeResult = parseJudgeResponse(judgeText)

	if (!judgeResult) {
		return {
			competitorA,
			competitorB,
			winnerId: competitorA.id,
			rounds,
			transcript,
			judgementReasoning: 'Unable to parse judge response. Defaulting to first competitor.',
		}
	}

	const winnerId = judgeResult.winnerName === competitorA.name ? competitorA.id : competitorB.id

	return {
		competitorA,
		competitorB,
		winnerId,
		rounds,
		transcript,
		judgementReasoning: judgeResult.reasoning,
	}
}

function formatProgress(current, total, width = 30) {
	const percent = current / total
	const filled = Math.round(width * percent)
	const empty = width - filled
	const bar = '█'.repeat(filled) + '░'.repeat(empty)
	return `[${bar}] ${current}/${total}`
}

async function main() {
	// Parse CLI arguments
	const { values } = parseArgs({
		options: {
			budget: { type: 'string', short: 'b', default: String(DEFAULT_BUDGET) },
			'judge-version': { type: 'string', short: 'j', default: DEFAULT_JUDGE_VERSION },
			model: { type: 'string', short: 'm', default: DEFAULT_MODEL },
		},
	})

	const budget = parseInt(values.budget, 10)
	const judgeVersion = values['judge-version']
	const model = values.model

	console.log('\n╔══════════════════════════════════════════════════════════════╗')
	console.log('║              ATTRACTOR ARENA - TOURNAMENT RUNNER             ║')
	console.log('╚══════════════════════════════════════════════════════════════╝\n')

	console.log(`Configuration:`)
	console.log(`  Budget:        ${budget} matches`)
	console.log(`  Judge Version: ${judgeVersion}`)
	console.log(`  Model:         ${model}\n`)

	// Load data
	console.log('Loading competitors...')
	const competitors = loadCompetitors(COMPETITORS_DIR)
	console.log(`  Found ${competitors.length} competitors\n`)

	if (competitors.length < 2) {
		console.error('Need at least 2 competitors to run tournament')
		process.exit(1)
	}

	console.log('Loading match history...')
	const existingMatches = loadMatches(MATCHES_FILE)
	console.log(`  Found ${existingMatches.length} existing matches\n`)

	// Compute current ratings
	console.log('Computing ratings...')
	const competitorIds = competitors.map((c) => c.id)
	const ratings = computeAllRatings(existingMatches, competitorIds)

	// Show needs analysis
	const needs = identifyNeedsMatches(competitors, ratings, existingMatches)
	console.log(`\nNeeds Analysis:`)
	console.log(`  New competitors:     ${needs.newCompetitors.length}`)
	console.log(`  High uncertainty:    ${needs.highUncertainty.length}`)
	console.log(`  Low H2H pairs:       ${needs.lowH2HPairs.length}\n`)

	// Build match queue
	console.log('Building match queue...')
	const matchQueue = buildMatchQueue(competitors, ratings, existingMatches, budget)
	console.log(`  Scheduled ${matchQueue.length} matches\n`)

	if (matchQueue.length === 0) {
		console.log('No matches to run. Tournament complete.')
		// Still regenerate public data
		writePublicData(PUBLIC_DIR, competitors, ratings, existingMatches)
		console.log(`\nPublic data written to ${PUBLIC_DIR}`)
		return
	}

	// Create competitor lookup map
	const competitorMap = Object.fromEntries(competitors.map((c) => [c.id, c]))

	// Run matches
	console.log('═'.repeat(60))
	console.log('RUNNING MATCHES')
	console.log('═'.repeat(60) + '\n')

	const seed = Date.now()
	let matchesCompleted = 0

	for (const [idA, idB] of matchQueue) {
		const compA = competitorMap[idA]
		const compB = competitorMap[idB]

		if (!compA || !compB) {
			console.warn(`Skipping invalid pair: ${idA} vs ${idB}`)
			continue
		}

		console.log(`${formatProgress(matchesCompleted + 1, matchQueue.length)}`)
		console.log(`  ${compA.name} vs ${compB.name}`)

		try {
			const result = await runTournamentRound(compA, compB, model)

			const winnerName = result.winnerId === compA.id ? compA.name : compB.name
			console.log(`  Winner: ${winnerName}`)
			console.log(`  Reason: ${result.judgementReasoning.slice(0, 80)}...\n`)

			const timestamp = new Date().toISOString()
			const transcriptHash = hashTranscript(result.transcript)

			// Generate match ID from timestamp (ISO format safe for filenames with replacements)
			const matchId = timestamp.replace(/[:.]/g, '-')

			// Save full match file with complete rounds data
			const fullMatchData = {
				id: matchId,
				timestamp,
				competitorA: {
					id: compA.id,
					name: compA.name,
					justification: compA.justification,
				},
				competitorB: {
					id: compB.id,
					name: compB.name,
					justification: compB.justification,
				},
				rounds: result.rounds,
				judgement: {
					winnerId: result.winnerId,
					winnerName,
					reasoning: result.judgementReasoning,
				},
				judgeVersion,
				transcriptHash,
			}
			saveMatchFile(MATCHES_DIR, matchId, fullMatchData)

			// Append to JSONL (summary for quick loading)
			const matchRecord = {
				competitorA: compA.id,
				competitorB: compB.id,
				winner: result.winnerId,
				reasoning: result.judgementReasoning,
				seed: seed + matchesCompleted,
				judgeVersion,
				transcriptHash,
				matchId,
				timestamp,
			}
			appendMatch(MATCHES_FILE, matchRecord)

			// Update in-memory ratings
			const winnerId = result.winnerId
			const loserId = winnerId === compA.id ? compB.id : compA.id
			const updated = updateRatings({ mu: ratings[winnerId].mu, sigma: ratings[winnerId].sigma }, { mu: ratings[loserId].mu, sigma: ratings[loserId].sigma })
			ratings[winnerId].mu = updated.winner.mu
			ratings[winnerId].sigma = updated.winner.sigma
			ratings[winnerId].matches++
			ratings[winnerId].wins++
			ratings[loserId].mu = updated.loser.mu
			ratings[loserId].sigma = updated.loser.sigma
			ratings[loserId].matches++
			ratings[loserId].losses++

			matchesCompleted++
		} catch (error) {
			console.error(`  Error: ${error.message}\n`)
		}
	}

	// Regenerate public data
	console.log('═'.repeat(60))
	console.log('GENERATING PUBLIC DATA')
	console.log('═'.repeat(60) + '\n')

	const allMatches = loadMatches(MATCHES_FILE)
	const finalRatings = computeAllRatings(allMatches, competitorIds)
	const { leaderboardData } = writePublicData(PUBLIC_DIR, competitors, finalRatings, allMatches)

	console.log(`Matches completed: ${matchesCompleted}`)
	console.log(`Total matches:     ${allMatches.length}`)
	console.log(`\nPublic data written to ${PUBLIC_DIR}`)
	console.log(`  - leaderboard.json`)
	console.log(`  - matches.json`)

	// Show top 5
	console.log('\nTop 5 Competitors:')
	leaderboardData.competitors.slice(0, 5).forEach((c, i) => {
		const conservativeRating = (c.rating.mu - 3 * c.rating.sigma).toFixed(1)
		console.log(`  ${i + 1}. ${c.name} (μ=${c.rating.mu.toFixed(1)}, σ=${c.rating.sigma.toFixed(1)}, CR=${conservativeRating})`)
	})

	console.log('\nTournament run complete!')
}

main().catch(console.error)
