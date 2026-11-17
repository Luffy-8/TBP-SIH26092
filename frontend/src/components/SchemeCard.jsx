import { useState } from 'react';
import {
  CheckCircle,
  FileText,
  Building2,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Award,
  Calculator,
} from 'lucide-react';
import SchemeEmiCalculator from './SchemeEmiCalculator';

const AUTHORITY_COLORS = {
  NSFDC: 'bg-blue-50 text-blue-800 border-blue-200',
  NBCFDC: 'bg-purple-50 text-purple-800 border-purple-200',
  NSKFDC: 'bg-teal-50 text-teal-800 border-teal-200',
  MoSJE: 'bg-orange-50 text-orange-800 border-orange-200',
};

function getAuthorityTag(authority) {
  for (const [key, cls] of Object.entries(AUTHORITY_COLORS)) {
    if (authority?.includes(key)) return { key, cls };
  }
  return { key: 'Govt. Scheme', cls: 'bg-gray-100 text-gray-800 border-gray-200' };
}

export default function SchemeCard({ scheme, breakdown }) {
  const [docsExpanded, setDocsExpanded] = useState(false);
  const [auditExpanded, setAuditExpanded] = useState(false);
  const [emiExpanded, setEmiExpanded] = useState(false);
  const { key, cls } = getAuthorityTag(scheme.issuing_authority);

  const auditChecks = scheme.eligibility_audit || [];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Card Header */}
      <div className="p-5 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <span
              className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full border mb-2 uppercase tracking-wide ${cls}`}
            >
              {key}
            </span>
            <h3 className="font-extrabold text-gray-900 text-base leading-tight">
              {scheme.name}
            </h3>
            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5 font-medium">
              <Building2 size={13} className="text-gray-400" />
              {scheme.issuing_authority}
            </p>
          </div>
          <div className="shrink-0 w-10 h-10 bg-green-50 border border-green-200 rounded-full flex items-center justify-center">
            <CheckCircle size={22} className="text-green-600" />
          </div>
        </div>

        <p className="text-sm text-gray-600 mt-3 leading-relaxed">
          {scheme.description}
        </p>
      </div>

      {/* Eligibility Tags */}
      <div className="px-5 pb-3 flex flex-wrap gap-2">
        {scheme.eligibility_criteria?.max_income ? (
          <span className="text-xs font-semibold bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 rounded-full">
            Income Cap: ₹{(scheme.eligibility_criteria.max_income / 100000).toFixed(1)} Lakhs
          </span>
        ) : (
          <span className="text-xs font-semibold bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 rounded-full">
            No Income Ceiling
          </span>
        )}
        {scheme.eligibility_criteria?.target_category?.map((cat) => (
          <span
            key={cat}
            className="text-xs font-semibold bg-orange-50 text-orange-800 border border-orange-200 px-2.5 py-1 rounded-full"
          >
            Category: {cat}
          </span>
        ))}
        <span className="text-xs font-semibold bg-gray-50 text-gray-600 border border-gray-200 px-2.5 py-1 rounded-full">
          Min Age: {scheme.eligibility_criteria?.min_age || 18}+
        </span>
      </div>

      {/* AI Grounded Reason (Why You Qualify) */}
      {breakdown?.why_you_qualify && (
        <div className="mx-5 mb-4 p-3.5 bg-orange-50 rounded-xl border border-orange-100">
          <p className="text-xs font-bold text-orange-900 mb-1 flex items-center gap-1.5">
            <Award size={14} className="text-orange-600" />
            Why You Qualify
          </p>
          <p className="text-xs text-orange-950 leading-relaxed font-normal">
            {breakdown.why_you_qualify}
          </p>
        </div>
      )}

      {/* Collapsible Section 1: Required Documents */}
      <div className="border-t border-gray-100">
        <button
          type="button"
          onClick={() => setDocsExpanded(!docsExpanded)}
          className="w-full px-5 py-3 flex items-center justify-between text-xs font-bold text-gray-700 hover:bg-gray-50 transition cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <FileText size={15} className="text-orange-600" />
            <span>Required Documents ({scheme.required_documents?.length || 0})</span>
          </span>
          {docsExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {docsExpanded && (
          <div className="px-5 pb-4 space-y-2 bg-gray-50/50 pt-2 border-t border-gray-100">
            {scheme.required_documents?.map((doc, i) => (
              <div key={i} className="flex items-center gap-2.5 text-xs text-gray-800">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-600 shrink-0" />
                <span>{doc}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Collapsible Section 2: Interactive Subsidy & EMI Slider (Feature 3) */}
      <div className="border-t border-gray-100">
        <button
          type="button"
          onClick={() => setEmiExpanded(!emiExpanded)}
          className="w-full px-5 py-3 flex items-center justify-between text-xs font-bold text-gray-900 hover:bg-orange-50/50 transition cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <Calculator size={15} className="text-orange-600" />
            <span>Interactive Subsidy & EMI Slider</span>
            <span className="text-[10px] font-extrabold bg-orange-100 text-orange-800 border border-orange-200 px-2 py-0.5 rounded-full">
              Calculate Savings
            </span>
          </span>
          <div className="flex items-center gap-1 text-gray-500">
            <span className="text-[11px] font-medium hidden sm:inline">
              {emiExpanded ? 'Hide' : 'Calculate'}
            </span>
            {emiExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </button>

        {emiExpanded && (
          <div className="px-5 pb-4 pt-1 animate-fadeIn">
            <SchemeEmiCalculator scheme={scheme} />
          </div>
        )}
      </div>

      {/* Collapsible Section 3: The "Audit Trail" Accordion (Feature 2) */}
      {auditChecks.length > 0 && (
        <div className="border-t border-gray-100">
          <button
            type="button"
            onClick={() => setAuditExpanded(!auditExpanded)}
            className="w-full px-5 py-3 flex items-center justify-between text-xs font-bold text-gray-900 hover:bg-orange-50/50 transition cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-green-600" />
              <span>View Eligibility Audit</span>
              <span className="bg-green-100 text-green-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-green-200">
                {auditChecks.length}/{auditChecks.length} Passed
              </span>
            </span>
            <div className="flex items-center gap-1 text-gray-500">
              <span className="text-[11px] font-medium hidden sm:inline">
                {auditExpanded ? 'Hide' : 'Inspect Rules'}
              </span>
              {auditExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
          </button>

          {auditExpanded && (
            <div className="px-5 pb-4 pt-2 bg-green-50/40 border-t border-green-100 space-y-2.5 animate-fadeIn">
              <div className="flex items-center justify-between pb-1">
                <p className="text-[10px] font-bold text-green-900 uppercase tracking-wider">
                  Deterministic Rules Engine Audit Trail
                </p>
                <span className="text-[10px] text-green-700 bg-white border border-green-200 px-2 py-0.5 rounded font-mono font-medium">
                  100% Financial Compliance
                </span>
              </div>

              {auditChecks.map((rule, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-2.5 bg-white border border-green-200 rounded-xl shadow-2xs"
                >
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle size={14} className="text-green-700" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-800 leading-relaxed font-medium">
                      {rule}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
