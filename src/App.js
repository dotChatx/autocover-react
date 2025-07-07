import React, { useState } from 'react';

function App() {
  const [cv, setCV] = useState('');
  const [jobUrl, setJobUrl] = useState('');
  const [manualJobTitle, setManualJobTitle] = useState('');
  const [manualCompany, setManualCompany] = useState('');
  const [manualDescription, setManualDescription] = useState('');
  const [tone, setTone] = useState('Professional');
  const [letter, setLetter] = useState('');
  const [loading, setLoading] = useState(false);
  const [usedFallback, setUsedFallback] = useState(false);

  const handleGenerate = async () => {
    if (!cv || (!jobUrl && !manualDescription)) {
      alert('Please paste your CV and either a job link OR a job description.');
      return;
    }

    setLoading(true);
    setLetter('');
    setUsedFallback(false);

    let jobTitle = '';
    let companyName = '';
    let jobDescription = '';

    try {
      if (jobUrl) {
        const parserRes = await fetch(
          'https://autocover-parser-wnot.onrender.com/parser?url=' + encodeURIComponent(jobUrl)
        );
        const parserData = await parserRes.json();

        jobTitle = parserData.title || 'Unknown Title';
        companyName = parserData.domain || 'Unknown Company';
        jobDescription = parserData.content || '';
      }

      // Fallback if no link or parsing failed
      if (!jobDescription && manualDescription) {
        jobTitle = manualJobTitle || 'Unknown Title';
        companyName = manualCompany || 'Unknown Company';
        jobDescription = manualDescription;
        setUsedFallback(true);
      }

      const prompt = `
You are an expert cover letter writer. Based on the job description and the user's CV, generate a custom, one-page cover letter.

Tone: ${tone}
Job Title: ${jobTitle}
Company: ${companyName}
Job Description: ${jobDescription}
User CV: ${cv}

Instructions:
- Make it personalized and engaging
- Reference at least 2 responsibilities or qualifications
- End with a short, confident closing paragraph
      `;

      const gptRes = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      const gptData = await gptRes.json();
      setLetter(gptData.text);
    } catch (err) {
      console.error(err);
      setLetter('❌ Something went wrong. Please check your input and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', fontFamily: 'Arial, sans-serif' }}>
      <h1>AutoCover ✍️</h1>
      <p>Paste your CV and a job link OR description to get a tailored cover letter.</p>
      <p style={{ color: 'darkred' }}><strong>⚠️ LinkedIn links often don’t work. Use Indeed, Wellfound, or paste the job details manually below.</strong></p>

      <textarea
        rows="6"
        placeholder="Paste your CV here..."
        value={cv}
        onChange={(e) => setCV(e.target.value)}
        style={{ width: '100%', padding: '8px', marginBottom: '16px' }}
      />

      <input
        type="text"
        placeholder="Paste job link (optional)"
        value={jobUrl}
        onChange={(e) => setJobUrl(e.target.value)}
        style={{ width: '100%', padding: '8px', marginBottom: '16px' }}
      />

      <h4>Or paste job details manually if link doesn't work:</h4>
      <input
        type="text"
        placeholder="Job Title"
        value={manualJobTitle}
        onChange={(e) => setManualJobTitle(e.target.value)}
        style={{ width: '100%', padding: '8px', marginBottom: '8px' }}
      />
      <input
        type="text"
        placeholder="Company Name"
        value={manualCompany}
        onChange={(e) => setManualCompany(e.target.value)}
        style={{ width: '100%', padding: '8px', marginBottom: '8px' }}
      />
      <textarea
        rows="4"
        placeholder="Paste job description"
        value={manualDescription}
        onChange={(e) => setManualDescription(e.target.value)}
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

      {usedFallback && (
        <p style={{ color: 'gray', fontStyle: 'italic' }}>
          (ℹ️ Used manual job details fallback – consider trying another job link if possible.)
        </p>
      )}
    </div>
  );
}

export default App;
