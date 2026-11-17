import { MapPin, Navigation, Phone, Clock, Building, ExternalLink } from 'lucide-react';

export default function ChannelPartnerCards({ city }) {
  const currentCity = city || 'Lucknow';

  const PARTNERS = [
    {
      id: 1,
      name: `State Scheduled Castes Development Corporation (SCA)`,
      type: 'Official MoSJE Channelizing Agency',
      branch: `${currentCity} District Office`,
      address: `Vikas Bhawan, Collectorate Complex, ${currentCity}`,
      hours: 'Mon – Fri, 10:00 AM – 5:00 PM',
      phone: '0522-2621000 / 1800-180-8000',
      role: 'Direct subsidy disbursement, application verification & NSFDC/NSKFDC facilitation',
      query: `State Scheduled Castes Development Corporation ${currentCity}`,
    },
    {
      id: 2,
      name: `State Bank of India — Lead District Office`,
      type: 'Public Sector Lead Bank',
      branch: `${currentCity} Main Administrative Branch`,
      address: `Station Road, Civil Lines, ${currentCity}`,
      hours: 'Mon – Sat, 10:00 AM – 4:00 PM',
      phone: '1800-1234-724',
      role: 'Concessional term loan sanctions, Mudra/PM-DAKSH credit line processing',
      query: `Lead Bank District Office SBI ${currentCity}`,
    },
    {
      id: 3,
      name: `District Industries Centre (DIC)`,
      type: 'MSME & Entrepreneurship Support Cell',
      branch: `Industrial Area Office, ${currentCity}`,
      address: `DIC Compound, Near Subhash Chowk, ${currentCity}`,
      hours: 'Mon – Fri, 9:30 AM – 5:30 PM',
      phone: '0522-2435000',
      role: 'Project report preparation support, EDP training & margin money subsidy clearance',
      query: `District Industries Centre ${currentCity}`,
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mt-8 print:border-none print:shadow-none print:p-0">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-4 border-b border-gray-100">
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-orange-600 bg-orange-50 border border-orange-200 px-2.5 py-0.5 rounded-full inline-block mb-1.5">
            Geographical Localization · Section 4.5
          </span>
          <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 flex items-center gap-2">
            <Building size={20} className="text-orange-600" />
            Authorized Local Channel Partners ({currentCity})
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Visit these authorized agencies to submit your application packet and complete physical verification.
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg shrink-0">
          <MapPin size={14} className="text-orange-600" />
          <span>Location: {currentCity}</span>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PARTNERS.map((partner) => {
          const directionsUrl = `https://maps.google.com/?q=${encodeURIComponent(partner.query)}`;

          return (
            <div
              key={partner.id}
              className="bg-white border border-gray-200 hover:border-orange-300 rounded-xl p-4 flex flex-col justify-between transition-all duration-200 hover:shadow-sm"
            >
              <div>
                {/* Agency Badge */}
                <div className="mb-2">
                  <span className="text-[10px] font-bold text-orange-800 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-md inline-block">
                    {partner.type}
                  </span>
                </div>

                {/* Name */}
                <h3 className="font-extrabold text-gray-900 text-sm leading-snug">
                  {partner.name}
                </h3>
                <p className="text-xs text-gray-500 font-medium mt-0.5">
                  {partner.branch}
                </p>

                {/* Details */}
                <div className="mt-3.5 space-y-2 text-xs text-gray-600">
                  <div className="flex items-start gap-2">
                    <MapPin size={14} className="text-orange-600 shrink-0 mt-0.5" />
                    <span className="leading-tight">{partner.address}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock size={13} className="text-gray-400 shrink-0" />
                    <span>{partner.hours}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Phone size={13} className="text-gray-400 shrink-0" />
                    <span className="font-mono text-[11px]">{partner.phone}</span>
                  </div>
                </div>

                {/* Role description */}
                <p className="mt-3 pt-2.5 border-t border-gray-100 text-[11px] text-gray-500 leading-relaxed">
                  <strong className="text-gray-700">Scope:</strong> {partner.role}
                </p>
              </div>

              {/* Action Button */}
              <div className="mt-4 pt-3 border-t border-gray-100">
                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 active:scale-95 text-white font-bold text-xs py-2 px-3 rounded-lg transition-all shadow-2xs hover:shadow cursor-pointer"
                >
                  <Navigation size={13} />
                  <span>Get Directions</span>
                  <ExternalLink size={11} className="opacity-70 ml-0.5" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
