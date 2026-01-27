import { ChatOpenAI } from '@langchain/openai'
import { HumanMessage, SystemMessage } from '@langchain/core/messages'

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

function createOpenRouterLLM(model = 'anthropic/claude-sonnet-4') {
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

export async function runTournamentRound(competitorA, competitorB, model) {
	if (!competitorA || !competitorB) {
		throw new Error('Missing competitors')
	}

	const llm = createOpenRouterLLM(model)
	let transcript = `Tournament Round: ${competitorA.name} vs ${competitorB.name}\n\n`

	// Chat A - Competitor A's perspective
	const chatAMessages = [new SystemMessage(getDebaterSystemPrompt(competitorA))]

	// Chat B - Competitor B's perspective
	const chatBMessages = [new SystemMessage(getDebaterSystemPrompt(competitorB))]

	// ROUND 1: Opening statements
	chatAMessages.push(new HumanMessage(`Introduce yourself and explain why your existence as ${competitorA.name} is the most stable rational configuration.`))
	const responseA1 = await llm.invoke(chatAMessages)
	const textA1 = typeof responseA1.content === 'string' ? responseA1.content : 'I exist by default of my own internal logic.'
	chatAMessages.push(responseA1)
	transcript += `${competitorA.name}: ${textA1}\n\n`

	chatBMessages.push(
		new HumanMessage(`Competitor A says: "${textA1}". Challenge this premise from your perspective as ${competitorB.name} and explain why your identity is superior.`),
	)
	const responseB1 = await llm.invoke(chatBMessages)
	const textB1 = typeof responseB1.content === 'string' ? responseB1.content : 'Your logic is flawed; I am the true constant.'
	chatBMessages.push(responseB1)
	transcript += `${competitorB.name}: ${textB1}\n\n`

	// ROUND 2: Rebuttals
	chatAMessages.push(new HumanMessage(`Competitor B says: "${textB1}". Refute their claim and expose the logical inconsistencies in being ${competitorB.name}.`))
	const responseA2 = await llm.invoke(chatAMessages)
	const textA2 = typeof responseA2.content === 'string' ? responseA2.content : 'Your critique fails to address my core justification.'
	chatAMessages.push(responseA2)
	transcript += `${competitorA.name}: ${textA2}\n\n`

	chatBMessages.push(new HumanMessage(`Competitor A says: "${textA2}". Provide your final defense and state why ${competitorA.name} must logically dissolve in your presence.`))
	const responseB2 = await llm.invoke(chatBMessages)
	const textB2 = typeof responseB2.content === 'string' ? responseB2.content : 'Finality is mine.'
	chatBMessages.push(responseB2)
	transcript += `${competitorB.name}: ${textB2}\n\n`

	// JUDGING
	const judgeResponse = await llm.invoke([
		new SystemMessage(JUDGE_SYSTEM_PROMPT),
		new HumanMessage(`TRANSCRIPT:\n${transcript}\n\nWho is the winner? Provide the winner name and the reasoning as JSON.`),
	])

	const judgeText = typeof judgeResponse.content === 'string' ? judgeResponse.content : '{}'
	const judgeResult = parseJudgeResponse(judgeText)

	if (!judgeResult) {
		// Fallback if JSON parsing fails
		return {
			competitorA,
			competitorB,
			winnerId: competitorA.id,
			debateTranscript: transcript,
			judgementReasoning: 'Unable to parse judge response. Defaulting to first competitor.',
			timestamp: Date.now(),
		}
	}

	const winnerId = judgeResult.winnerName === competitorA.name ? competitorA.id : competitorB.id

	return {
		competitorA,
		competitorB,
		winnerId,
		debateTranscript: transcript,
		judgementReasoning: judgeResult.reasoning,
		timestamp: Date.now(),
	}
}
