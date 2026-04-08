import { useState, useRef, useEffect } from 'react';

function App() {
  const [pairs, setPairs] = useState(() => {
    const saved = localStorage.getItem('lora_dataset_pairs');
    try { return saved ? JSON.parse(saved) : []; } catch { return []; }
  });
  const [instruction, setInstruction] = useState(() => {
    return localStorage.getItem('lora_dataset_instruction') || '';
  });
  const [output, setOutput] = useState(() => {
    return localStorage.getItem('lora_dataset_output') || '';
  });
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState('');
  const [syntaxError, setSyntaxError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [wrapLines, setWrapLines] = useState(true);
  const editRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('lora_dataset_pairs', JSON.stringify(pairs));
  }, [pairs]);

  useEffect(() => {
    localStorage.setItem('lora_dataset_instruction', instruction);
  }, [instruction]);

  useEffect(() => {
    localStorage.setItem('lora_dataset_output', output);
  }, [output]);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!instruction.trim() || !output.trim()) return;
    setPairs([...pairs, { instruction: instruction.trim(), output: output.trim(), id: Date.now() }]);
    setInstruction('');
    setOutput('');
  };

  const clearDataset = () => {
    if (window.confirm('Clear all dataset items?')) {
      setPairs([]);
      setEditing(false);
    }
  };

  const getJsonlText = () => {
    return pairs.map(p => JSON.stringify({ instruction: p.instruction, output: p.output })).join('\n');
  };

  const handleDownload = () => {
    const text = getJsonlText();
    if (!text) return;
    const blob = new window.Blob([text], { type: 'application/jsonl' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dataset.jsonl';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(getJsonlText());
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // Validate JSONL: each non-empty line must be valid JSON with instruction & output keys
  const validateJsonl = (text) => {
    const lines = text.split('\n').filter(l => l.trim() !== '');
    if (lines.length === 0) return { valid: true, pairs: [] };
    try {
      const parsed = lines.map(line => {
        const obj = JSON.parse(line);
        if (typeof obj.instruction === 'undefined' || typeof obj.output === 'undefined') {
          throw new Error('Missing keys');
        }
        return { instruction: obj.instruction, output: obj.output, id: Date.now() + Math.random() };
      });
      return { valid: true, pairs: parsed };
    } catch {
      return { valid: false, pairs: [] };
    }
  };

  const startEditing = () => {
    setEditText(getJsonlText());
    setSyntaxError(false);
    setEditing(true);
  };

  const handleEditChange = (text) => {
    setEditText(text);
    const { valid } = validateJsonl(text);
    setSyntaxError(!valid && text.trim() !== '');
  };

  const finishEditing = () => {
    const { valid, pairs: newPairs } = validateJsonl(editText);
    if (!valid && editText.trim() !== '') {
      setSyntaxError(true);
      return; // don't exit edit mode if there's an error
    }
    setPairs(newPairs);
    setEditing(false);
    setSyntaxError(false);
  };

  // Auto-resize the edit textarea
  useEffect(() => {
    if (editing && editRef.current) {
      editRef.current.style.height = 'auto';
      editRef.current.style.height = editRef.current.scrollHeight + 'px';
    }
  }, [editing, editText]);

  const ClipboardIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="2" width="6" height="4" rx="1" ry="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    </svg>
  );

  const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );

  const EditIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );

  return (
    <div className="min-h-screen bg-[#121212] text-[#e0e0e0] p-8 font-mono">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="border-b border-[#333] pb-4">
          <h1 className="text-2xl font-bold tracking-tight text-[#ededed]">LoRA Dataset Generator</h1>
          <p className="text-sm text-[#888] mt-1">Minimalist interface for dataset creation.</p>
        </header>

        <div className="grid md:grid-cols-2 gap-6 relative">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-[#888] font-bold">User Prompt</label>
            <textarea
              className="w-full h-80 bg-[#1a1a1a] border border-[#333] rounded p-4 text-[#e0e0e0] placeholder-[#555] focus:outline-none focus:border-[#666] transition-colors resize-y leading-relaxed"
              placeholder="Enter instruction..."
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-[#888] font-bold">AI Response</label>
            <textarea
              className="w-full h-80 bg-[#1a1a1a] border border-[#333] rounded p-4 text-[#e0e0e0] placeholder-[#555] focus:outline-none focus:border-[#666] transition-colors resize-y leading-relaxed"
              placeholder="Enter expected output..."
              value={output}
              onChange={(e) => setOutput(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleAdd}
            disabled={!instruction.trim() || !output.trim()}
            className="px-6 py-2 bg-[#ededed] text-[#121212] font-semibold text-sm rounded hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Append to Dataset
          </button>
        </div>

        <div className="space-y-4 pt-8 border-t border-[#333]">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-lg font-bold text-[#ededed]">Dataset Preview</h2>
              <p className="text-xs text-[#888] mt-1">{pairs.length} pair{pairs.length === 1 ? '' : 's'}</p>
            </div>
            <div className="flex gap-2 items-center">
              {/* Edit / Done button */}
              <button
                onClick={editing ? finishEditing : startEditing}
                className={`p-2 text-xs border rounded transition-colors flex items-center gap-1.5 ${
                  editing
                    ? 'border-emerald-700 text-emerald-400 hover:bg-emerald-900/30'
                    : 'border-[#333] text-[#aaa] hover:text-[#ededed] hover:border-[#555]'
                }`}
                title={editing ? 'Save edits' : 'Edit dataset'}
              >
                {editing ? (
                  <>
                    <CheckIcon />
                    <span>Done</span>
                  </>
                ) : (
                  <>
                    <EditIcon />
                    <span>Edit</span>
                  </>
                )}
              </button>

              {!editing && pairs.length > 0 && (
                <button
                  onClick={() => setWrapLines(!wrapLines)}
                  className="px-3 py-2 text-xs border border-[#333] text-[#aaa] rounded hover:text-[#ededed] hover:border-[#555] transition-colors"
                >
                  {wrapLines ? 'Unwrap' : 'Wrap'}
                </button>
              )}

              <button
                onClick={clearDataset}
                disabled={pairs.length === 0}
                className="px-4 py-2 text-xs border border-[#333] text-[#aaa] rounded hover:text-red-400 hover:border-[#5a2a2a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Clear All
              </button>
              <button
                onClick={copyToClipboard}
                disabled={pairs.length === 0}
                className="p-2 text-xs bg-[#2a2a2a] text-[#aaa] rounded hover:bg-[#3a3a3a] hover:text-[#ededed] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Copy to clipboard"
              >
                {copied ? <CheckIcon /> : <ClipboardIcon />}
              </button>
              <button
                onClick={handleDownload}
                disabled={pairs.length === 0}
                className="px-4 py-2 text-xs bg-[#ededed] text-[#121212] font-semibold rounded hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Download .jsonl
              </button>
            </div>
          </div>

          {editing ? (
            <textarea
              ref={editRef}
              value={editText}
              onChange={(e) => handleEditChange(e.target.value)}
              spellCheck={false}
              className={`w-full bg-[#1a1a1a] border rounded p-4 text-sm font-mono whitespace-pre text-[#a0a0a0] focus:outline-none transition-colors resize-y min-h-[120px] ${
                syntaxError
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-[#333] focus:border-[#666]'
              }`}
            />
          ) : pairs.length === 0 ? (
            <div className="bg-[#1a1a1a] border border-[#333] rounded p-8 flex flex-col items-center justify-center text-center gap-3 text-[#555]">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <line x1="9" y1="9" x2="15" y2="9" />
                <line x1="9" y1="13" x2="15" y2="13" />
                <line x1="9" y1="17" x2="15" y2="17" />
              </svg>
              <p className="text-sm">No dataset entries yet. Click "Edit" to input manually or use the form above.</p>
            </div>
          ) : (
            <div className="bg-[#1a1a1a] border border-[#333] rounded p-4 overflow-x-auto">
              <pre className={`text-sm font-mono text-[#a0a0a0] ${wrapLines ? 'whitespace-pre-wrap break-all' : 'whitespace-pre'}`}>
                <code>{getJsonlText()}</code>
              </pre>
            </div>
          )}

          {syntaxError && editing && (
            <p className="text-xs text-red-400 flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              Invalid JSONL — each line must be valid JSON with "instruction" and "output" keys.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
