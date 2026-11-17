import { useState, useRef } from 'react';
import { Mic, MicOff, Send, Loader2, Sparkles, UserCheck, RefreshCw } from 'lucide-react';
import api from '../api/client';
import Header from '../components/Header';
import SchemeCard from '../components/SchemeCard';
import DocumentChecklist from '../components/DocumentChecklist';
import ChannelPartnerCards from '../components/ChannelPartnerCards';
import { useAuth } from '../context/AuthContext';

const SAMPLE_PERSONAS = [
  {
    id: 'student',
    label: '🎓 Student PG Loan',
    role: 'SC Student',
    text: "I am a 21-year-old SC student from Lucknow pursuing a Master's degree. My family's annual income is 1.2 lakhs and I need an educational concessional loan to pay tuition fees.",
  },
  {
    id: 'artisan',
    label: '👞 SC Leather Artisan',
    role: 'SC Footwear Maker',
    text: "I am a 25-year-old SC entrepreneur from Lucknow running a small handicraft shop. My annual family income is around 1.8 lakhs and I am looking for a concessional loan to buy raw materials.",
  },
  {
    id: 'women-tailor',
    label: '🧵 OBC Woman Tailoring',
    role: 'OBC Woman Entrepreneur',
    text: 'I am a 28-year-old OBC woman from Jaipur with annual family income of 2.2 lakhs. I want to expand my tailoring and garment business by purchasing two commercial sewing machines.',
  },
  {
    id: 'safai-karamchari',
    label: '🧹 Sanitation Microfinance',
    role: 'Safai Karamchari Dependent',
    text: 'I am a 32-year-old Safai Karamchari from Delhi. My annual income is about 1.4 lakhs and I want a low-interest microfinance loan to set up an alternative small grocery store.',
  },
];

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
    <div className="min-h-screen bg-gray-50 print:bg-white print:p-0">
      <Header />

      <main className="max-w-5xl mx-auto px-4 py-8 print:py-0 print:px-0 print:max-w-none">
        {/* Print-Only Official Header */}
        <div className="hidden print:block mb-6 pb-4 border-b-2 border-gray-900">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                LOAN SAATHI — SCHEME APPLICATION PACKET
              </h1>
              <p className="text-xs font-semibold text-gray-700 mt-0.5">
                Ministry of Social Justice & Empowerment · Scheme ID: SIH26092
              </p>
            </div>
            <div className="text-right text-xs text-gray-600">
              <p className="font-bold text-gray-900">Applicant: {user?.username}</p>
              <p>Generated: {new Date().toLocaleDateString('en-IN')}</p>
            </div>
          </div>

          {result?.extracted_profile && (
            <div className="mt-3 pt-2 border-t border-gray-300 text-xs flex gap-5 text-gray-800 font-medium">
              <span><strong>Category:</strong> {result.extracted_profile.category || 'N/A'}</span>
              <span><strong>Annual Income:</strong> ₹{result.extracted_profile.annual_income?.toLocaleString('en-IN') || 'N/A'}/yr</span>
              <span><strong>Age:</strong> {result.extracted_profile.age || 'N/A'} yrs</span>
              <span><strong>City/District:</strong> {result.extracted_profile.city || 'N/A'}</span>
            </div>
          )}
        </div>

        {/* Hero Section (Hidden on Print) */}
        <div className="text-center mb-8 print:hidden">
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

        {/* Input Card with Enhanced Voice UX & Sample Personas (Hidden on Print) */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8 print:hidden">
          {/* Header & Quick Personas */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <label className="block text-sm font-bold text-gray-900">
              Describe your socioeconomic situation (in English or Hindi)
            </label>
            <span className="text-xs text-gray-500 font-medium">
              Try a demo profile:
            </span>
          </div>

          {/* Sample Persona Chips */}
          <div className="flex flex-wrap gap-2 mb-4">
            {SAMPLE_PERSONAS.map((persona) => (
              <button
                key={persona.id}
                type="button"
                onClick={() => setText(persona.text)}
                className="text-xs bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-800 font-medium px-3 py-1.5 rounded-full transition-all duration-150 flex items-center gap-1.5 active:scale-95 cursor-pointer"
                title={`Load sample: ${persona.role}`}
              >
                <span>{persona.label}</span>
              </button>
            ))}
          </div>

          {/* Text Area */}
          <div className="relative">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={4}
              placeholder={placeholder}
              className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-600 focus:border-transparent outline-none resize-none text-sm text-gray-900 placeholder:text-gray-400 leading-relaxed transition bg-white"
            />
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4 pt-3 border-t border-gray-100">
            {/* Left: Prominent Pulsing Mic Button */}
            <div className="flex items-center gap-3">
              <div className="relative inline-flex items-center justify-center">
                {isListening && (
                  <>
                    <span className="absolute inline-flex h-12 w-12 rounded-full bg-orange-400 opacity-75 animate-ping"></span>
                    <span className="absolute inline-flex h-14 w-14 rounded-full bg-orange-200 opacity-50 animate-pulse"></span>
                  </>
                )}
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`relative z-10 w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer shadow-sm ${
                    isListening
                      ? 'bg-orange-600 text-white shadow-orange-300 shadow-md ring-4 ring-orange-200'
                      : 'bg-orange-600 hover:bg-orange-700 text-white hover:scale-105 active:scale-95'
                  }`}
                  title={isListening ? 'Click to stop listening' : 'Click to dictate via Voice'}
                >
                  {isListening ? (
                    <MicOff size={20} className="animate-pulse" />
                  ) : (
                    <Mic size={20} />
                  )}
                </button>
              </div>

              {/* Status / Waveform or Helper Text */}
              {isListening ? (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 border border-orange-200 rounded-full animate-fadeIn">
                  <span className="w-1.5 h-3 bg-orange-600 rounded-full animate-pulse"></span>
                  <span className="w-1.5 h-5 bg-orange-600 rounded-full animate-pulse delay-75"></span>
                  <span className="w-1.5 h-2 bg-orange-600 rounded-full animate-pulse delay-150"></span>
                  <span className="w-1.5 h-4 bg-orange-600 rounded-full animate-pulse delay-100"></span>
                  <span className="text-xs font-bold text-orange-700 ml-1.5">
                    Listening... Speak now
                  </span>
                </div>
              ) : (
                <div className="text-xs text-gray-500">
                  <span className="font-semibold text-gray-700">Voice Input ready</span> · Tap mic or type above
                </div>
              )}
            </div>

            {/* Right: Character count and Submit */}
            <div className="flex items-center gap-3 justify-end">
              <span className="text-xs font-medium text-gray-500">
                <span className="font-bold text-gray-800">{text.length}</span> characters
              </span>

              {text.length > 0 && (
                <button
                  type="button"
                  onClick={() => setText('')}
                  className="text-xs text-gray-500 hover:text-gray-800 font-medium px-2 py-1 transition cursor-pointer"
                >
                  Clear
                </button>
              )}

              <button
                onClick={handleAnalyze}
                disabled={loading || !text.trim()}
                className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-bold px-6 py-2.5 rounded-xl transition-all duration-200 text-sm shadow-sm hover:shadow active:scale-95 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Send size={15} />
                    <span>Find Schemes</span>
                  </>
                )}
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

            {/* Local Channel Partner Cards (Feature 5: Section 4.5) */}
            {result.matched_count > 0 && (
              <ChannelPartnerCards city={result.extracted_profile?.city} />
            )}
          </div>
        )}
      </main>

      {/* Footer (Hidden on Print) */}
      <footer className="border-t border-gray-200 py-6 mt-16 print:hidden">
        <p className="text-center text-xs text-gray-400">
          Loan Saathi (SIH26092) · Ministry of Social Justice & Empowerment ·
          AI-driven scheme matching for marginalized entrepreneurs
        </p>
      </footer>
    </div>
  );
}
