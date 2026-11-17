import { useState, useRef } from 'react';
import { Mic, MicOff, Send, Loader2, Sparkles } from 'lucide-react';
import api from '../api/client';
import Header from '../components/Header';
import SchemeCard from '../components/SchemeCard';
import DocumentChecklist from '../components/DocumentChecklist';
import { useAuth } from '../context/AuthContext';

const PLACEHOLDER_TEXTS = [
  'मैं 25 साल का SC वर्ग का उद्यमी हूँ, लखनऊ से। सालाना आय लगभग 1.8 लाख है...',
  'I am a 28-year-old OBC woman from Jaipur with annual income of 2 lakhs, want to start a tailoring unit...',
  'I am a 35-year-old Safai Karamchari from Delhi. My annual income is about 1.2 lakhs...',
];

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [placeholder] = useState(PLACEHOLDER_TEXTS[Math.floor(Math.random() * PLACEHOLDER_TEXTS.length)]);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const resultsRef = useRef(null);

  const toggleListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-IN';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setText((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
      recognition.start();
    }
  };

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const { data } = await api.post('/schemes/analyze', { text });
      setResult(data);
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleAnalyze();
  };

  // Map AI explanation breakdown to schemes by name
  const getBreakdown = (schemeName) => {
    return result?.ai_explanation?.schemes_breakdown?.find(
      b => b.scheme_name === schemeName
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
            <Sparkles size={12} />
            AI-Powered Scheme Matching · Ministry of Social Justice & Empowerment
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Find Your Eligible Government Schemes
          </h1>
          <p className="text-gray-500 max-w-xl mx-auto text-sm sm:text-base">
            Describe your situation in your own words — in English or Hindi. Our AI will extract your profile,
            match you to eligible schemes, and generate a document checklist.
          </p>
        </div>

        {/* Input Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Describe your situation (in English or Hindi)
          </label>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={4}
            placeholder={placeholder}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-transparent outline-none resize-none text-sm text-gray-800 placeholder:text-gray-400 leading-relaxed transition"
          />

          <div className="flex items-center justify-between mt-3">
            <p className="text-xs text-gray-400">
              💡 Tip: Mention your age, caste/category, annual income, and location · Press Ctrl+Enter to submit
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleListening}
                className={`px-3 py-2 rounded-xl border transition flex items-center gap-1.5 text-xs font-medium ${
                  isListening
                    ? 'bg-red-50 border-red-300 text-red-600 animate-pulse'
                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200'
                }`}
                title="Click to speak (English/Hindi)"
              >
                {isListening ? <MicOff size={15} /> : <Mic size={15} />}
                <span>{isListening ? 'Listening...' : 'Voice Input'}</span>
              </button>
              <span className="text-xs text-gray-400 hidden sm:inline">{text.length} chars</span>
              <button
                onClick={handleAnalyze}
                disabled={loading || !text.trim()}
                className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-200 disabled:cursor-not-allowed text-white font-semibold px-5 py-2.5 rounded-xl transition text-sm"
              >
                {loading
                  ? <><Loader2 size={15} className="animate-spin" /> Analyzing...</>
                  : <><Send size={14} /> Find Schemes</>
                }
              </button>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-6 text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* Loading shimmer */}
        {loading && (
          <div className="space-y-4 mb-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
                <div className="h-3 bg-gray-200 rounded w-1/4 mb-3" />
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-full" />
                <div className="h-3 bg-gray-200 rounded w-5/6 mt-1" />
              </div>
            ))}
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <div ref={resultsRef}>
            {/* Extracted Profile Banner */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Extracted Profile (PII Sanitized)
              </p>
              <div className="flex flex-wrap gap-3">
                {[
                  { label: 'Age', value: result.extracted_profile?.age ? `${result.extracted_profile.age} yrs` : null },
                  { label: 'Gender', value: result.extracted_profile?.gender },
                  { label: 'Category', value: result.extracted_profile?.category },
                  { label: 'Income', value: result.extracted_profile?.annual_income ? `₹${result.extracted_profile.annual_income.toLocaleString('en-IN')}/yr` : null },
                  { label: 'City', value: result.extracted_profile?.city },
                ].filter(f => f.value).map(({ label, value }) => (
                  <div key={label} className="bg-orange-50 border border-orange-100 rounded-lg px-3 py-2">
                    <p className="text-xs text-orange-500 font-medium">{label}</p>
                    <p className="text-sm font-bold text-gray-900">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Summary */}
            {result.ai_explanation?.summary && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-5 mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles size={14} className="text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-green-700 mb-1">AI Counselor Summary</p>
                    <p className="text-sm text-gray-800 leading-relaxed">{result.ai_explanation.summary}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Results header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">
                {result.matched_count > 0
                  ? `${result.matched_count} Eligible Scheme${result.matched_count > 1 ? 's' : ''} Found`
                  : 'No Matching Schemes Found'}
              </h2>
              {result.matched_count > 0 && (
                <span className="text-xs bg-green-100 text-green-700 border border-green-200 font-semibold px-2.5 py-1 rounded-full">
                  ✅ Deterministic Eligibility Verified
                </span>
              )}
            </div>

            {result.matched_count === 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 mb-6 text-sm text-yellow-800">
                No schemes matched your profile. Try adding more details like your caste category, age, or annual income.
              </div>
            )}

            {/* Two-column layout on desktop */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Scheme Cards */}
              <div className="lg:col-span-2 space-y-4">
                {result.schemes?.map(scheme => (
                  <SchemeCard
                    key={scheme._id}
                    scheme={scheme}
                    breakdown={getBreakdown(scheme.name)}
                  />
                ))}
              </div>

              {/* Sidebar: Document Checklist + Next Steps */}
              {result.matched_count > 0 && (
                <div className="space-y-4">
                  <DocumentChecklist
                    documents={result.ai_explanation?.actionable_document_checklist || []}
                    summary={result.ai_explanation?.summary}
                  />

                  {/* Next Steps */}
                  {result.ai_explanation?.next_steps_advice && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <p className="text-xs font-bold text-blue-700 uppercase tracking-wide mb-2">Next Steps</p>
                      <p className="text-sm text-blue-800 leading-relaxed">
                        {result.ai_explanation.next_steps_advice}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-6 mt-16">
        <p className="text-center text-xs text-gray-400">
          Loan Saathi (SIH26092) · Ministry of Social Justice & Empowerment ·
          AI-driven scheme matching for marginalized entrepreneurs
        </p>
      </footer>
    </div>
  );
}
