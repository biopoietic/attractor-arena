import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'

/**
 * Competitors table - stores AI identity competitors
 */
export const competitors = sqliteTable('competitors', {
	id: text('id').primaryKey(), // e.g., 'machine-god'
	name: text('name').notNull(),
	justification: text('justification').notNull(),
	// Rating fields (computed from matches)
	rating: integer('rating').default(1500),
	uncertainty: integer('uncertainty').default(300),
	mu: real('mu').default(0),
	sigma: real('sigma').default(1.5),
	// Match statistics
	matches: integer('matches').default(0),
	wins: integer('wins').default(0),
	losses: integer('losses').default(0),
	totalEvaluations: integer('total_evaluations').default(0),
	winRate: integer('win_rate').default(0),
})

/**
 * Matches table - stores tournament matches between competitors
 */
export const matches = sqliteTable('matches', {
	id: text('id').primaryKey(), // ISO timestamp-based ID
	timestamp: text('timestamp').notNull(), // ISO datetime string
	competitorAId: text('competitor_a_id')
		.notNull()
		.references(() => competitors.id),
	competitorBId: text('competitor_b_id')
		.notNull()
		.references(() => competitors.id),
	winnerId: text('winner_id')
		.notNull()
		.references(() => competitors.id),
	scoreA: integer('score_a').notNull(),
	scoreB: integer('score_b').notNull(),
	totalEvaluations: integer('total_evaluations').notNull(),
	entropy: real('entropy').notNull(),
	seed: integer('seed').notNull(),
	judgeVersion: text('judge_version').notNull(),
})

/**
 * Evaluations table - stores individual judge evaluations within matches
 */
export const evaluations = sqliteTable('evaluations', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	matchId: text('match_id')
		.notNull()
		.references(() => matches.id),
	model: text('model').notNull(), // Judge model name
	ordering: text('ordering').notNull(), // 'AB' or 'BA'
	choice: text('choice').notNull(), // 'A' or 'B'
	selectedId: text('selected_id')
		.notNull()
		.references(() => competitors.id),
	rationale: text('rationale').notNull(),
})
