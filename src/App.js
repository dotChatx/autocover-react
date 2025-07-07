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
      // Step 1: Try to parse the job link
      const parserRes = await fetch(
        'https://autocover-parser-wnot.onrender.com/parser?url=' + encodeURIComponent(jobUrl)
      );
      const parserData = await parserRes.json();

      // Step 2: Build the GPT prompt
      const gptPrompt = `
You are an expert cover letter writer. Based on the job description and the user’s CV, generate a custom, one-page cover letter.

Tone: ${tone}
Job Title: ${parserData.title || 'Unknown Title'}
Company Name: ${parserData.domain || 'Unknown Company'}
Job Description: ${parserData.content || 'No description found'}
User CV: ${cv}

Instructions:
- Make it personalized and engaging
- Reference at least 2 responsibilities or qualifications
- End with a short, confident closing paragraph
      `;

      // Step 3: Send it to our backend to generate the letter
      const gptRes = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: gptPrompt })
      });

      const gptData = await gptRes.json();
      setLetter(gptData.text);
    } catch (err) {
      console.error(err);
      setLetter('😔 Something went wrong. Please double-check the job link or paste the job description manually.');
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
        placeholder="Paste job link (LinkedIn, Indeed, etc.)"
        value={jobUrl}
        onChange={(e) => setJobUrl(e.target.value)}
        style={{ width: '100%', padding: '8px', marginBottom: '8px' }}
      />

      {/* Warnings based on job link */}
      {jobUrl.includes("linkedin.com") && (
        <p style={{ color: "red", fontWeight: "bold" }}>
          ⚠️ LinkedIn links don’t work. Please copy & paste the job description instead.
        </p>
      )}

      {jobUrl &&
        !jobUrl.includes("linkedin.com") &&
        !jobUrl.includes("indeed.com") &&
        !jobUrl.includes("wellfound.com") && (
          <p style={{ color: "orange" }}>
            ⚠️ This site might not be supported. If parsing fails, you’ll need to paste the job description manually.
          </p>
        )}

      <select
        value={tone}
        onChange={(e) => setTone(e.target.value)}
        style={{ marginBottom: '16px', padding: '8px' }}
      >
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
