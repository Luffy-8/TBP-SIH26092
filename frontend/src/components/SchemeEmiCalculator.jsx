import { useState, useMemo } from 'react';
import { Calculator, Sparkles, TrendingDown, Percent, Calendar } from 'lucide-react';

// Concessional interest rates by issuing agency
const SCHEME_RATES = {
  NSFDC: 5.0, // 5% p.a.
  NBCFDC: 5.0, // 5% p.a.
  NSKFDC: 4.0, // 4% p.a. (Sanitation worker concessional rate)
  MoSJE: 5.0,
};

const COMMERCIAL_BANK_RATE = 10.0; // 10% standard commercial bank baseline

export default function SchemeEmiCalculator({ scheme }) {
  const [loanAmount, setLoanAmount] = useState(150000);
  const [tenureYears, setTenureYears] = useState(3); // 3 or 5 years

  // Determine concessional rate
  const schemeRate = useMemo(() => {
    for (const [key, rate] of Object.entries(SCHEME_RATES)) {
      if (scheme.issuing_authority?.includes(key)) return rate;
    }
    return 5.0;
  }, [scheme.issuing_authority]);

  // EMI calculation helper: P * r * (1+r)^n / ((1+r)^n - 1)
  const calculateEMI = (principal, annualRate, years) => {
    const monthlyRate = annualRate / 12 / 100;
    const totalMonths = years * 12;
    if (monthlyRate === 0) return principal / totalMonths;
    const emi =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
      (Math.pow(1 + monthlyRate, totalMonths) - 1);
    return Math.round(emi);
  };

  const schemeEMI = useMemo(
    () => calculateEMI(loanAmount, schemeRate, tenureYears),
    [loanAmount, schemeRate, tenureYears]
  );

  const bankEMI = useMemo(
    () => calculateEMI(loanAmount, COMMERCIAL_BANK_RATE, tenureYears),
    [loanAmount, tenureYears]
  );

  const totalMonths = tenureYears * 12;
  const totalSchemeInterest = schemeEMI * totalMonths - loanAmount;
  const totalBankInterest = bankEMI * totalMonths - loanAmount;
  const totalSubsidySaved = Math.max(0, totalBankInterest - totalSchemeInterest);

  const presetAmounts = [50000, 100000, 200000, 350000, 500000];

  return (
    <div className="p-4 bg-gray-50/70 rounded-xl border border-gray-200 mt-3">
      {/* Title */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
          <Calculator size={14} className="text-orange-600" />
          Interactive Subsidy & EMI Calculator
        </span>
        <span className="text-[11px] font-bold text-orange-700 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full flex items-center gap-1">
          <Percent size={11} /> {schemeRate}% Concessional Rate
        </span>
      </div>

      {/* Slider Controls */}
      <div className="space-y-3">
        <div>
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="text-gray-500 font-medium">Desired Loan Amount</span>
            <span className="text-sm font-extrabold text-gray-900">
              ₹{loanAmount.toLocaleString('en-IN')}
            </span>
          </div>

          <input
            type="range"
            min="50000"
            max="500000"
            step="10000"
            value={loanAmount}
            onChange={(e) => setLoanAmount(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
          />

          <div className="flex justify-between text-[10px] text-gray-400 mt-1">
            <span>₹50,000</span>
            <span>₹2,50,000</span>
            <span>₹5,00,000</span>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="text-[10px] text-gray-500 font-medium mr-1">Presets:</span>
          {presetAmounts.map((amt) => (
            <button
              key={amt}
              type="button"
              onClick={() => setLoanAmount(amt)}
              className={`text-[10px] px-2 py-0.5 rounded-md font-semibold transition cursor-pointer ${
                loanAmount === amt
                  ? 'bg-orange-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-700 hover:border-orange-300'
              }`}
            >
              ₹{(amt / 100000).toFixed(amt % 100000 === 0 ? 0 : 1)}L
            </button>
          ))}
        </div>

        {/* Repayment Tenure */}
        <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-200/60">
          <span className="text-gray-500 font-medium flex items-center gap-1">
            <Calendar size={12} className="text-gray-400" /> Repayment Tenure:
          </span>
          <div className="inline-flex rounded-lg border border-gray-200 bg-white p-0.5">
            <button
              type="button"
              onClick={() => setTenureYears(3)}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition cursor-pointer ${
                tenureYears === 3
                  ? 'bg-orange-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              3 Years (36 mo)
            </button>
            <button
              type="button"
              onClick={() => setTenureYears(5)}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition cursor-pointer ${
                tenureYears === 5
                  ? 'bg-orange-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              5 Years (60 mo)
            </button>
          </div>
        </div>

        {/* Result Figures */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          {/* Scheme EMI */}
          <div className="p-2.5 bg-white border border-gray-200 rounded-xl">
            <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">
              Govt. Scheme EMI
            </p>
            <p className="text-base font-extrabold text-orange-600 leading-tight mt-0.5">
              ₹{schemeEMI.toLocaleString('en-IN')}
              <span className="text-[10px] text-gray-500 font-normal"> /mo</span>
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5">
              @ {schemeRate}% subsidized rate
            </p>
          </div>

          {/* Standard Bank EMI */}
          <div className="p-2.5 bg-white border border-gray-200 rounded-xl">
            <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">
              Commercial Bank EMI
            </p>
            <p className="text-base font-extrabold text-gray-700 leading-tight mt-0.5">
              ₹{bankEMI.toLocaleString('en-IN')}
              <span className="text-[10px] text-gray-500 font-normal"> /mo</span>
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5">
              @ {COMMERCIAL_BANK_RATE}% standard rate
            </p>
          </div>
        </div>

        {/* Highlighted Subsidy / Interest Saved Badge */}
        <div className="p-3 bg-orange-50 border border-orange-200 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-orange-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <TrendingDown size={15} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-orange-950 flex items-center gap-1">
                <Sparkles size={12} className="text-orange-600" />
                Government Subsidy / Interest Saved
              </p>
              <p className="text-[10px] text-orange-800">
                Total savings compared to private / commercial bank loans
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-sm sm:text-base font-extrabold text-orange-700">
              ₹{totalSubsidySaved.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
