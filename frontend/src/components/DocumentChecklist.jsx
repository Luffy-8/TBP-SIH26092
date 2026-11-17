import { useState } from 'react';
import {
  CheckSquare,
  Square,
  Printer,
  ClipboardList,
  Sparkles,
} from 'lucide-react';

export default function DocumentChecklist({ documents = [], summary, applicantProfile }) {
  const [checked, setChecked] = useState({});

  const toggle = (doc) => setChecked((prev) => ({ ...prev, [doc]: !prev[doc] }));

  const checkedCount = Object.values(checked).filter(Boolean).length;
  const progress = documents.length > 0 ? (checkedCount / documents.length) * 100 : 0;

  const handlePrint = () => {
    window.print();
  };

  if (!documents.length) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 print:border-none print:shadow-none print:p-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
        <div>
          <h3 className="font-extrabold text-gray-900 text-sm flex items-center gap-2">
            <ClipboardList size={18} className="text-orange-600 print:text-black" />
            <span>Actionable Document Checklist</span>
          </h3>
          <p className="text-[11px] text-gray-500 mt-0.5 print:hidden">
            Mark items as you gather them before visiting the partner agency
          </p>
        </div>

        {/* Print Application Packet Button (Hidden on Print) */}
        <button
          type="button"
          onClick={handlePrint}
          className="print:hidden flex items-center gap-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 active:scale-95 px-3.5 py-2 rounded-xl transition shadow-sm hover:shadow cursor-pointer"
          title="Print official scheme packet and document checklist"
        >
          <Printer size={14} />
          <span>Print Application Packet</span>
        </button>
      </div>

      {/* Progress Bar (Hidden on Print) */}
      <div className="mb-4 print:hidden">
        <div className="flex justify-between text-xs text-gray-600 mb-1.5 font-medium">
          <span>
            <strong className="text-orange-600 font-bold">{checkedCount}</strong> of{' '}
            {documents.length} verified
          </span>
          <span className="font-bold text-gray-800">{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-orange-600 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Checklist items */}
      <div className="space-y-2 print:space-y-3">
        {documents.map((doc, i) => (
          <label
            key={i}
            className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
              checked[doc]
                ? 'bg-orange-50/70 border border-orange-200 text-gray-900'
                : 'bg-gray-50 border border-gray-100 hover:border-orange-200 text-gray-800'
            } print:bg-white print:border-b print:border-gray-200 print:rounded-none print:p-1.5`}
          >
            {/* Screen checkbox */}
            <button
              type="button"
              onClick={() => toggle(doc)}
              className="shrink-0 print:hidden cursor-pointer"
            >
              {checked[doc] ? (
                <CheckSquare size={18} className="text-orange-600" />
              ) : (
                <Square size={18} className="text-gray-400" />
              )}
            </button>

            {/* Print checkbox box [ ] */}
            <span className="hidden print:inline-block w-4 h-4 border-2 border-gray-700 rounded-xs shrink-0 mr-2"></span>

            <span
              className={`text-xs sm:text-sm font-medium ${
                checked[doc] ? 'line-through text-gray-400 print:no-underline print:text-black' : 'text-gray-800'
              }`}
            >
              {doc}
            </span>
          </label>
        ))}
      </div>

      {/* All Complete Banner (Hidden on Print) */}
      {checkedCount === documents.length && documents.length > 0 && (
        <div className="mt-4 p-3 bg-green-50 border border-green-300 rounded-xl text-xs text-green-900 font-bold text-center print:hidden flex items-center justify-center gap-2">
          <Sparkles size={14} className="text-green-600" />
          <span>All documents gathered! Ready to present to your Channel Partner.</span>
        </div>
      )}

      {/* Print Footer Note (Only visible in Print output) */}
      <div className="hidden print:block mt-6 pt-4 border-t border-gray-300 text-[11px] text-gray-600 leading-normal">
        <p className="font-bold text-gray-800 mb-1">
          Loan Saathi Instructions for Beneficiary:
        </p>
        <p>
          1. Carry original documents along with two sets of self-attested photocopies.
        </p>
        <p>
          2. Visit your designated State Channelizing Agency (SCA) or Lead District Bank branch.
        </p>
        <p className="mt-2 text-[10px] text-gray-400">
          Generated via Loan Saathi (SIH26092) · Ministry of Social Justice & Empowerment
        </p>
      </div>
    </div>
  );
}
