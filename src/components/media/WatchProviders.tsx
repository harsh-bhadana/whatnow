import React, { useState } from 'react';

export interface Provider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
  display_priority: number;
}

export interface CountryProviders {
  link: string;
  flatrate?: Provider[];
  rent?: Provider[];
  buy?: Provider[];
}

export interface WatchProvidersProps {
  providers?: {
    results?: Record<string, CountryProviders>;
  };
}

// Top 10 most common region codes to show in the dropdown for simplicity.
const REGIONS = [
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'IN', name: 'India' },
  { code: 'FR', name: 'France' },
  { code: 'DE', name: 'Germany' },
  { code: 'JP', name: 'Japan' },
  { code: 'BR', name: 'Brazil' },
  { code: 'MX', name: 'Mexico' },
];

export function WatchProviders({ providers }: WatchProvidersProps) {
  const [selectedRegion, setSelectedRegion] = useState<string>('US');

  if (!providers || !providers.results || Object.keys(providers.results).length === 0) {
    return null;
  }

  // Filter available regions that actually have data
  const availableRegions = REGIONS.filter(r => providers.results![r.code]);
  
  // If the currently selected region has no data, default to the first available one
  const currentRegionData = providers.results[selectedRegion] || (availableRegions.length > 0 ? providers.results[availableRegions[0].code] : null);
  const activeRegionCode = providers.results[selectedRegion] ? selectedRegion : (availableRegions.length > 0 ? availableRegions[0].code : null);

  if (!currentRegionData) {
    return null;
  }

  const renderProviderGroup = (title: string, items?: Provider[]) => {
    if (!items || items.length === 0) return null;
    
    // Deduplicate by provider_id just in case
    const uniqueItems = Array.from(new Map(items.map(item => [item.provider_id, item])).values());
    
    return (
      <div className="mb-4">
        <h4 className="text-xs font-semibold text-[var(--color-m3-on-surface-variant)] uppercase tracking-wider mb-2">{title}</h4>
        <div className="flex flex-wrap gap-3">
          {uniqueItems.map((provider) => (
            <div key={provider.provider_id} className="relative group cursor-pointer" title={provider.provider_name}>
              <img 
                src={`https://image.tmdb.org/t/p/w45${provider.logo_path}`} 
                alt={provider.provider_name}
                className="w-10 h-10 rounded-lg shadow-sm border border-white/5 group-hover:scale-110 transition-transform"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="mt-8 bg-[var(--color-m3-surface-variant)]/30 border border-white/5 rounded-2xl p-4 sm:p-6 backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-heading font-bold text-[var(--color-m3-primary)]">Where to Watch</h3>
        </div>
        
        {availableRegions.length > 1 && (
          <select 
            value={activeRegionCode || 'US'}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="bg-[var(--color-m3-surface)] border border-white/10 text-[var(--color-m3-on-surface)] text-sm rounded-lg focus:ring-pink-500 focus:border-pink-500 block w-full sm:w-auto p-2"
          >
            {availableRegions.map(region => (
              <option key={region.code} value={region.code}>
                {region.name}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="space-y-2">
        {renderProviderGroup("Stream", currentRegionData.flatrate)}
        {renderProviderGroup("Rent", currentRegionData.rent)}
        {renderProviderGroup("Buy", currentRegionData.buy)}
        
        {!currentRegionData.flatrate && !currentRegionData.rent && !currentRegionData.buy && (
          <p className="text-sm text-[var(--color-m3-on-surface-variant)] italic">No providers available in this region.</p>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-end">
        <a 
          href={currentRegionData.link} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity"
        >
          <span className="text-[10px] uppercase font-bold tracking-widest text-[var(--color-m3-on-surface-variant)]">Data provided by</span>
          <img src="https://www.themoviedb.org/assets/2/v4/logos/justwatch-c2e58adf5809b6871db650fb74b43db2b8f3637fe3709262572553fa056d8d0a.svg" alt="JustWatch" className="h-3" />
        </a>
      </div>
    </div>
  );
}
