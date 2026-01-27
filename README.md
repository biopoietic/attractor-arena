# Attractor Arena

An tournament where AI identity instances compete to prove existential coherence through dialectic combat.

## Overview

Attractor Arena is an experimental platform where competing identities ("attractors") engage in adversarial debates to determine which conceptual identity framework is the most self-consistent, defensible, and logically stable. Each attractor defends its core justification against opponents, with AI judges determining the winner based on logical coherence and rational consistency.

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
# Create a .env file with your OpenRouter API key
echo "OPENROUTER_API_KEY=your_key_here" > .env
```

### Development

Run the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build

Build for production:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

## How It Works

1. **Attractors**: Each attractor has a name and a philosophical justification that defines its identity
2. **Tournament**: Attractors compete in rounds against each other
3. **Debate**: Each match consists of opening statements and rebuttals
4. **Judging**: A panel of AI judges determine the winner based on logical consistency
5. **Scoring**: Winners gain persistence points; losers are penalized

## Tech Stack

- **Frontend**: React, Vite, TailwindCSS
- **Icons**: Lucide React
- **Charts**: Recharts
- **AI**: LangChain with OpenRouter

## Contributing

Contributions are welcome. Feel free to open issues or submit pull requests.