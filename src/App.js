import React, { useState } from 'react';

function App() {
  const [cv, setCV] = useState('');
  const [jobUrl, setJobUrl] = useState('');
  const [tone, setTone] = useState('Professional');
  const [letter, setLetter] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!cv || !jobUrl) {
      alert('Please paste your CV and a job link first.');
      return;
    }

    setLoading(true);
    setLetter('');

    try {
      // 1) get job description from your Render parser
      const parserRes = await fetch('https://autocover-parser-wnot.onrender.com/parser?url=' + encodeURIComponent(jobUrl));
      const parserData = await parserRes.json();

      // 2) build the GPT prompt
      const gptPrompt = `
You are an expert cover letter writer. Write a one‑page cover letter tailored to the following job, using the specified tone.

Tone: ${tone}
Job Title: ${parserData.title || 'Unknown Title'}
Job Description: ${parserData.content || 'No description found'}
User CV: ${cv}

Your letter should sound confident but humble and highlight at least two requirements from the job.
      `;

      // 3) send prompt to our backend route (we'll implement /api/generate next)
      const gptRes = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: gptPrompt })
      });

      const gptData = await gptRes.json();
      setLetter(gptData.text);
    } catch (err) {
      console.error(err);
      setLetter('😔 Something went wrong. Please double‑check the job link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', fontFamily: 'Arial, sans-serif' }}>
      <h1>AutoCover ✍️</h1>
      <p>Paste your CV, a job link, pick a tone, and get a tailored cover letter.</p>

      <textarea
        rows="6"
        placeholder="Paste your CV here..."
        value={cv}
        onChange={(e) => setCV(e.target.value)}
        style={{ width: '100%', padding: '8px', marginBottom: '16px' }}
      />

      <input
        type="text"
        placeholder="Paste job link"
        value={jobUrl}
        onChange={(e) => setJobUrl(e.target.value)}
        style={{ width: '100%', padding: '8px', marginBottom: '16px' }}
      />

      <select value={tone} onChange={(e) => setTone(e.target.value)} style={{ marginBottom: '16px', padding: '8px' }}>
        <option>Professional</option>
        <option>Creative</option>
        <option>Direct</option>
      </select>
      <br />

      <button onClick={handleGenerate} disabled={loading} style={{ padding: '10px 18px' }}>
        {loading ? 'Generating...' : 'Generate Cover Letter'}
      </button>

      <hr />

      <h3>Generated Letter:</h3>
      <pre style={{ whiteSpace: 'pre-wrap', background: '#f7f7f7', padding: '12px' }}>{letter}</pre>
    </div>
  );
}

export default App;
