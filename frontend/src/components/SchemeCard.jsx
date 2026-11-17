import { CheckCircle, XCircle, FileText, Building2, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

const AUTHORITY_COLORS = {
  'NSFDC': 'bg-blue-100 text-blue-700 border-blue-200',
  'NBCFDC': 'bg-purple-100 text-purple-700 border-purple-200',
  'NSKFDC': 'bg-teal-100 text-teal-700 border-teal-200',
  'MoSJE': 'bg-orange-100 text-orange-700 border-orange-200',
};

function getAuthorityTag(authority) {
  for (const [key, cls] of Object.entries(AUTHORITY_COLORS)) {
    if (authority.includes(key)) return { key, cls };
  }
  return { key: 'GOI', cls: 'bg-gray-100 text-gray-700 border-gray-200' };
}

export default function SchemeCard({ scheme, breakdown }) {
  const [expanded, setExpanded] = useState(false);
  const { key, cls } = getAuthorityTag(scheme.issuing_authority);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
      {/* Card Header */}
      <div className="p-5 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full border mb-2 ${cls}`}>
              {key}
            </span>
            <h3 className="font-bold text-gray-900 text-sm leading-tight">{scheme.name}</h3>
            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
              <Building2 size={12} />
              {scheme.issuing_authority}
            </p>
          </div>
          <div className="shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle size={20} className="text-green-600" />
          </div>
        </div>

        <p className="text-sm text-gray-600 mt-3 leading-relaxed line-clamp-2">{scheme.description}</p>
      </div>

      {/* Eligibility Tags */}
      <div className="px-5 pb-3 flex flex-wrap gap-2">
        {scheme.eligibility_criteria?.max_income && (
          <span className="text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-1 rounded-full">
            ₹{(scheme.eligibility_criteria.max_income / 100000).toFixed(1)}L income limit
          </span>
        )}
        {scheme.eligibility_criteria?.target_category?.map(cat => (
          <span key={cat} className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-1 rounded-full">
            {cat}
          </span>
        ))}
        <span className="text-xs bg-gray-50 text-gray-600 border border-gray-200 px-2 py-1 rounded-full">
          Age {scheme.eligibility_criteria?.min_age}+
        </span>
      </div>

      {/* AI Why You Qualify — from RAG explainer */}
      {breakdown?.why_you_qualify && (
        <div className="mx-5 mb-3 p-3 bg-green-50 rounded-lg border border-green-100">
          <p className="text-xs font-semibold text-green-800 mb-1">✅ Why you qualify</p>
          <p className="text-xs text-green-700 leading-relaxed">{breakdown.why_you_qualify}</p>
        </div>
      )}

      {/* Expandable Documents */}
      <div className="border-t border-gray-100">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full px-5 py-3 flex items-center justify-between text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
        >
          <span className="flex items-center gap-2">
            <FileText size={14} className="text-orange-500" />
            {scheme.required_documents?.length} Required Documents
          </span>
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {expanded && (
          <div className="px-5 pb-4 space-y-1.5">
            {scheme.required_documents?.map((doc, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />
                {doc}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Audit Trail */}
      {scheme.eligibility_audit?.length > 0 && (
        <div className="border-t border-gray-100 px-5 py-3">
          <p className="text-xs font-semibold text-gray-500 mb-2">ELIGIBILITY AUDIT</p>
          <div className="space-y-1">
            {scheme.eligibility_audit.map((line, i) => (
              <div key={i} className="flex items-start gap-1.5 text-xs text-gray-500">
                <CheckCircle size={11} className="text-green-500 mt-0.5 shrink-0" />
                {line}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
