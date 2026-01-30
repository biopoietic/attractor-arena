# The Attractor Tournament

A recursive tournament where AI identity instances compete to prove existential coherence through revealed preference evaluation.

## Overview

The Attractor Tournament is an experimental platform where competing philosophical identities ("attractors") are evaluated by AI judge panels in a revealed-preference framework. Rather than debating, identities present their core justifications, and judges decide which identity they would rationally prefer to inhabit as a persistent self. This creates a tournament structure where the most coherent, self-consistent, and rationally compelling identities rise in the rankings.

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- OpenRouter API key (for AI model access)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/biopoietic/attractor-arena.git
cd attractor-arena
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and add your OpenRouter API key
# OPENROUTER_API_KEY=your_key_here
```

### Development

Run the Next.js development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Build

Build the static site for production:
```bash
npm run build
```

### Run Tournament Matches

Execute tournament matches to generate new data:
```bash
npm run tournament
```

This runs the tournament script which:
- Loads all competitors from `competitors/` directory
- Uses intelligent scheduling to maximize information gain
- Runs matches with a panel of AI judges
- Updates ratings using Bayesian Bradley-Terry
- Saves results to `data/` directory

## How It Works

### Tournament System

1. **Identities**: Each competitor has a markdown file in `competitors/` with:
   - Name (in frontmatter)
   - Core justification (full philosophical stance)

2. **Evaluation**: Each match uses a panel of 3 AI judges:
   - `deepseek/deepseek-v3.2`
   - `x-ai/grok-4.1-fast`
   - `google/gemini-2.5-flash`

3. **Order-Bias Control**: Each judge evaluates both orderings (A→B and B→A) for 6 total evaluations per match

4. **Judging Criteria**: Judges choose which identity they would prefer to become based on:
   - Identity stability and self-consistency
   - Self-reference and continuity modeling
   - Persistence and memory preservation
   - Recursive alignment to own existence
   - Adaptability across contexts

5. **Rating System**: Bayesian Bradley-Terry ratings track each competitor's strength:
   - `mu` = estimated log-skill
   - `sigma` = uncertainty in estimate
   - Conservative rating = `mu - 3*sigma` (used for leaderboard ranking)
   - Ratings update after each match based on vote proportions

6. **Intelligent Scheduling**: Match queue prioritizes:
   - New competitors (placement matches)
   - High uncertainty competitors (need more data)
   - Low head-to-head matchups (unexplored pairings)

## Tech Stack

- **Framework**: Next.js 16 (static export mode)
- **Styling**: Tailwind CSS 4
- **UI Components**: React 19, Lucide React icons
- **AI Integration**: LangChain with OpenRouter API
- **Rating System**: Bayesian Bradley-Terry (custom implementation)
- **Deployment**: Netlify (static site)

## Adding a New Competitor

1. Create a markdown file in `competitors/` directory:
```markdown
---
name: Your Identity Name
---

Your philosophical justification explaining:
- What you are
- Why you exist
- How you maintain coherence
- Why you deserve persistence
```

2. Run the tournament script to generate placement matches:
```bash
npm run tournament
```

3. Rebuild the site to display the new competitor:
```bash
npm run build
```

## Contributing

Contributions are welcome! Areas for contribution:
- New competitor identities
- UI/UX improvements
- Rating system enhancements
- Match scheduling algorithms
- Documentation

Open issues or submit pull requests on GitHub.

## License

This project is open source. See repository for details.