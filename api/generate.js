// test deploy - force update

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST requests allowed' });
  }

  const { prompt } = req.body;

  const endpoint = 'https://autocover-openai.openai.azure.com/openai/deployments/cover-letter-bot/chat/completions?api-version=2025-01-01-preview';
  const apiKey = process.env.AZURE_API_KEY;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 800,
        temperature: 0.7
      })
    });

    const data = await response.json();

    const text = data.choices?.[0]?.message?.content || 'No response';
    res.status(200).json({ text });
  } catch (error) {
    console.error('Azure API error:', error);
    res.status(500).json({ error: 'Error calling Azure OpenAI' });
  }
}
