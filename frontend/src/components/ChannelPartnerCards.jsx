import { useState } from 'react';
import { MapPin, Navigation, Phone, Clock, Building, ExternalLink, AlertCircle, Search } from 'lucide-react';

export default function ChannelPartnerCards({ partners = [], city, onSearchLocation }) {
  const displayCity = city?.trim() || '';
  const [searchCity, setSearchCity] = useState(displayCity);

  const formatPartnerType = (type) => {
    switch ((type || '').toUpperCase()) {
      case 'SCA':
        return 'Official MoSJE Channelizing Agency (SCA)';
      case 'BANK':
        return 'Public Sector Lead Bank';
      case 'DIC':
        return 'MSME & Entrepreneurship Support Cell (DIC)';
      default:
        return type || 'Authorized Channel Partner';
    }
  };

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
            Authorized Local Channel Partners {displayCity ? `(${displayCity})` : ''}
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Visit these authorized agencies to submit your application packet and complete physical verification.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 text-xs font-semibold text-gray-700 shrink-0">
          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg">
            <MapPin size={14} className="text-orange-600" />
            <span>Location: {displayCity || 'Not specified'}</span>
          </div>
          {onSearchLocation && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (searchCity.trim()) onSearchLocation(searchCity.trim());
              }}
              className="flex items-center gap-1.5"
            >
              <input
                type="text"
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                placeholder="Search another city..."
                className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-medium outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent w-40"
              />
              <button
                type="submit"
                title="Search partners in this city"
                className="bg-orange-600 hover:bg-orange-700 text-white rounded-lg px-2.5 py-1.5 transition active:scale-95 cursor-pointer"
              >
                <Search size={14} />
              </button>
            </form>
          )}
        </div>
      </div>

      {/* When no partners are returned for the extracted location */}
      {(!partners || partners.length === 0) ? (
        <div className="bg-orange-50/50 border border-orange-200/80 rounded-xl p-6 text-center">
          <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <AlertCircle size={22} />
          </div>
          <h3 className="font-bold text-gray-900 text-sm mb-1">
            No authorized partners found in your immediate vicinity{displayCity ? ` (${displayCity})` : ''}
          </h3>
          <p className="text-xs text-gray-600 max-w-md mx-auto leading-relaxed">
            We could not find a registered State Channelizing Agency or Lead Bank branch for this location in our database. You can visit your nearest District Collectorate / Vikas Bhawan or reach the national toll-free support helpline at <strong className="text-gray-900">1800-180-8000</strong>.
          </p>
        </div>
      ) : (
        /* Partners Grid */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {partners.map((partner, index) => {
            const partnerId = partner._id || partner.id || `partner-${index}`;
            const queryText = partner.query || `${partner.name} ${partner.branch || ''} ${partner.city || ''}`;
            const directionsUrl = `https://maps.google.com/?q=${encodeURIComponent(queryText)}`;
            const phone = partner.contact?.phone || partner.phone || '1800-180-8000';
            const hours = partner.contact?.hours || partner.hours || 'Mon – Fri, 10:00 AM – 5:00 PM';
            const role = partner.role || 'Direct subsidy disbursement, application verification & concessional loan facilitation';

            return (
              <div
                key={partnerId}
                className="bg-white border border-gray-200 hover:border-orange-300 rounded-xl p-4 flex flex-col justify-between transition-all duration-200 hover:shadow-sm"
              >
                <div>
                  {/* Agency Badge */}
                  <div className="mb-2">
                    <span className="text-[10px] font-bold text-orange-800 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-md inline-block">
                      {formatPartnerType(partner.type)}
                    </span>
                  </div>

                  {/* Name & Branch */}
                  <h3 className="font-extrabold text-gray-900 text-sm leading-snug">
                    {partner.name}
                  </h3>
                  {partner.branch && (
                    <p className="text-xs text-gray-500 font-medium mt-0.5">
                      {partner.branch}
                    </p>
                  )}

                  {/* Details */}
                  <div className="mt-3.5 space-y-2 text-xs text-gray-600">
                    <div className="flex items-start gap-2">
                      <MapPin size={14} className="text-orange-600 shrink-0 mt-0.5" />
                      <span className="leading-tight">{partner.address}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock size={13} className="text-gray-400 shrink-0" />
                      <span>{hours}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Phone size={13} className="text-gray-400 shrink-0" />
                      <span className="font-mono text-[11px]">{phone}</span>
                    </div>
                  </div>

                  {/* Role description */}
                  <p className="mt-3 pt-2.5 border-t border-gray-100 text-[11px] text-gray-500 leading-relaxed">
                    <strong className="text-gray-700">Scope:</strong> {role}
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
      )}
    </div>
  );
}
