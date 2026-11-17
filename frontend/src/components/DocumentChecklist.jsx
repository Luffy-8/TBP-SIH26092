import { useState } from 'react';
import { CheckSquare, Square, Download, Printer, ClipboardList } from 'lucide-react';

export default function DocumentChecklist({ documents = [], summary }) {
  const [checked, setChecked] = useState({});

  const toggle = (doc) => setChecked(prev => ({ ...prev, [doc]: !prev[doc] }));

  const checkedCount = Object.values(checked).filter(Boolean).length;
  const progress = documents.length > 0 ? (checkedCount / documents.length) * 100 : 0;

  const handlePrint = () => {
    const content = documents.map(d => `[ ] ${d}`).join('\n');
    const win = window.open('', '_blank');
    win.document.write(`<pre style="font-family:sans-serif;font-size:14px;padding:24px;">
<strong>Loan Saathi — Document Checklist</strong>
${summary || ''}

${content}

Generated: ${new Date().toLocaleDateString('en-IN')}
Ministry of Social Justice & Empowerment | SIH26092
</pre>`);
    win.print();
  };

  if (!documents.length) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-900 flex items-center gap-2">
          <ClipboardList size={18} className="text-orange-500" />
          Documents to Collect
        </h3>
        <button
          onClick={handlePrint}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-orange-600 transition border border-gray-200 hover:border-orange-300 rounded-lg px-2.5 py-1.5"
        >
          <Printer size={12} />
          Print List
        </button>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-500 mb-1.5">
          <span>{checkedCount} of {documents.length} collected</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-orange-400 to-green-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Checklist items */}
      <div className="space-y-2">
        {documents.map((doc, i) => (
          <label
            key={i}
            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${checked[doc] ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-100 hover:border-orange-200'}`}
          >
            <button
              type="button"
              onClick={() => toggle(doc)}
              className="shrink-0"
            >
              {checked[doc]
                ? <CheckSquare size={18} className="text-green-600" />
                : <Square size={18} className="text-gray-400" />
              }
            </button>
            <span className={`text-sm ${checked[doc] ? 'line-through text-gray-400' : 'text-gray-700'}`}>
              {doc}
            </span>
          </label>
        ))}
      </div>

      {checkedCount === documents.length && documents.length > 0 && (
        <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded-lg text-sm text-green-800 font-medium text-center">
          🎉 All documents collected! You're ready to apply.
        </div>
      )}
    </div>
  );
}
