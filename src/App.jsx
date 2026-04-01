import { useState } from 'react';

function App() {
  const [pairs, setPairs] = useState([]);
  const [instruction, setInstruction] = useState('');
  const [output, setOutput] = useState('');

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
  };

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

        {pairs.length > 0 && (
          <div className="space-y-4 pt-8 border-t border-[#333]">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-lg font-bold text-[#ededed]">Dataset Preview</h2>
                <p className="text-xs text-[#888] mt-1">{pairs.length} pair{pairs.length === 1 ? '' : 's'}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={clearDataset}
                  className="px-4 py-2 text-xs border border-[#333] text-[#aaa] rounded hover:text-red-400 hover:border-[#5a2a2a] transition-colors"
                >
                  Clear All
                </button>
                <button
                  onClick={copyToClipboard}
                  className="px-4 py-2 text-xs bg-[#2a2a2a] text-[#ededed] rounded hover:bg-[#3a3a3a] transition-colors"
                >
                  Copy to Clipboard
                </button>
                <button
                  onClick={handleDownload}
                  className="px-4 py-2 text-xs bg-[#ededed] text-[#121212] font-semibold rounded hover:bg-white transition-colors"
                >
                  Download .jsonl
                </button>
              </div>
            </div>

            <div className="bg-[#1a1a1a] border border-[#333] rounded p-4 overflow-x-auto">
              <pre className="text-sm font-mono whitespace-pre-wrap break-all text-[#a0a0a0]">
                <code>{getJsonlText()}</code>
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
