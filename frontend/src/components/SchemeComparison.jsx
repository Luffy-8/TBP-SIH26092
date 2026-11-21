import { X, Scale } from 'lucide-react';

function ComparisonColumn({ scheme, onRemove }) {
  const criteria = scheme.eligibility_criteria || {};
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 min-w-0">
      <div className="flex items-start justify-between gap-2 mb-3">
        <h4 className="text-sm font-extrabold text-gray-900 leading-snug">{scheme.name}</h4>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            title="Remove from comparison"
            className="text-gray-400 hover:text-red-600 transition cursor-pointer shrink-0"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <dl className="space-y-2.5 text-xs">
        <div>
          <dt className="text-gray-500 font-semibold uppercase tracking-wide text-[10px]">Authority</dt>
          <dd className="text-gray-800 font-medium mt-0.5 leading-snug">{scheme.issuing_authority}</dd>
        </div>
        <div>
          <dt className="text-gray-500 font-semibold uppercase tracking-wide text-[10px]">Income Cap</dt>
          <dd className="text-gray-800 font-bold mt-0.5">
            {criteria.max_income ? `₹${criteria.max_income.toLocaleString('en-IN')}` : 'No ceiling'}
          </dd>
        </div>
        <div>
          <dt className="text-gray-500 font-semibold uppercase tracking-wide text-[10px]">Categories</dt>
          <dd className="text-gray-800 font-bold mt-0.5">
            {criteria.target_category?.length > 0 ? criteria.target_category.join(', ') : 'All'}
          </dd>
        </div>
        <div>
          <dt className="text-gray-500 font-semibold uppercase tracking-wide text-[10px]">Gender</dt>
          <dd className="text-gray-800 font-bold mt-0.5">
            {criteria.target_gender?.length > 0 ? criteria.target_gender.join(', ') : 'All'}
          </dd>
        </div>
        <div>
          <dt className="text-gray-500 font-semibold uppercase tracking-wide text-[10px]">States</dt>
          <dd className="text-gray-800 font-bold mt-0.5">
            {criteria.eligible_states?.length > 0 ? criteria.eligible_states.join(', ') : 'Pan-India'}
          </dd>
        </div>
        <div>
          <dt className="text-gray-500 font-semibold uppercase tracking-wide text-[10px]">Min Age</dt>
          <dd className="text-gray-800 font-bold mt-0.5">{criteria.min_age || 18} years</dd>
        </div>
        <div>
          <dt className="text-gray-500 font-semibold uppercase tracking-wide text-[10px]">
            Documents ({scheme.required_documents?.length || 0})
          </dt>
          <dd className="mt-1 space-y-1">
            {scheme.required_documents?.map((doc, i) => (
              <p key={i} className="text-gray-700 flex items-start gap-1.5 leading-tight">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-600 shrink-0 mt-1" />
                {doc}
              </p>
            ))}
          </dd>
        </div>
      </dl>
    </div>
  );
}

export default function SchemeComparison({ schemes = [], onRemove }) {
  if (schemes.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mt-8 print:hidden">
      <div className="flex items-center gap-2 mb-1.5">
        <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center shrink-0">
          <Scale size={16} className="text-white" />
        </div>
        <h2 className="text-lg sm:text-xl font-extrabold text-gray-900">Compare Your Matched Schemes</h2>
      </div>
      <p className="text-xs text-gray-500 mb-5">
        Side-by-side view of eligibility rules and paperwork so you can pick the best-fit scheme.
      </p>

      <div
        className={`grid gap-4 ${
          schemes.length === 1 ? 'grid-cols-1' : schemes.length === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
        }`}
      >
        {schemes.map((scheme, idx) => (
          <ComparisonColumn
            key={scheme._id || idx}
            scheme={scheme}
            onRemove={onRemove ? () => onRemove(scheme) : undefined}
          />
        ))}
      </div>
    </div>
  );
}
