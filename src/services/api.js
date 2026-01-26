export async function runAdversarialRound(competitorA, competitorB, model) {
  const response = await fetch('/.netlify/functions/run-round', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      competitorA,
      competitorB,
      model,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || `API error: ${response.status}`);
  }

  return response.json();
}
