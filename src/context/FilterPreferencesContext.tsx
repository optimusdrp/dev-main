import React, { createContext, useContext, useState, useEffect } from 'react';

export type FilterMode = 'mustAct' | 'waiting' | 'all';
export type UrgencyFilter = 'todas' | 'alta' | 'media' | 'baixa';
export type SpecialtyFilter =
  | 'todas'
  | 'Cardiologia'
  | 'Odontologia / Ortodontia'
  | 'Dermatologia'
  | 'Ginecologia'
  | 'Cirurgia Geral'
  | 'Clínica Geral';

export interface FilterPreferences {
  selectedSpecialty: string;
  selectedUrgency: string;
  filterMode: FilterMode;
  searchQuery: string;
}

interface FilterPreferencesContextType {
  filters: FilterPreferences;
  selectedSpecialty: string;
  selectedUrgency: string;
  filterMode: FilterMode;
  searchQuery: string;
  activeFiltersCount: number;
  setSelectedSpecialty: (specialty: string) => void;
  setSelectedUrgency: (urgency: string) => void;
  setFilterMode: (mode: FilterMode) => void;
  setSearchQuery: (query: string) => void;
  resetFilters: () => void;
}

const STORAGE_KEY = 'mediflux_atendimentos_filter_preferences';

const DEFAULT_FILTERS: FilterPreferences = {
  selectedSpecialty: 'todas',
  selectedUrgency: 'todas',
  filterMode: 'mustAct',
  searchQuery: '',
};

const FilterPreferencesContext = createContext<FilterPreferencesContextType | undefined>(undefined);

export const FilterPreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [filters, setFilters] = useState<FilterPreferences>(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY) || localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          selectedSpecialty: parsed.selectedSpecialty || 'todas',
          selectedUrgency: parsed.selectedUrgency || 'todas',
          filterMode: parsed.filterMode || 'mustAct',
          searchQuery: parsed.searchQuery || '',
        };
      }
    } catch (e) {
      console.warn('[FilterPreferencesContext] Failed to load saved filters from storage', e);
    }
    return DEFAULT_FILTERS;
  });

  // Sync filters to sessionStorage and localStorage for session persistence
  useEffect(() => {
    try {
      const json = JSON.stringify(filters);
      sessionStorage.setItem(STORAGE_KEY, json);
      localStorage.setItem(STORAGE_KEY, json);
    } catch (e) {
      console.warn('[FilterPreferencesContext] Failed to save filters to storage', e);
    }
  }, [filters]);

  const setSelectedSpecialty = (specialty: string) => {
    setFilters((prev) => ({ ...prev, selectedSpecialty: specialty }));
  };

  const setSelectedUrgency = (urgency: string) => {
    setFilters((prev) => ({ ...prev, selectedUrgency: urgency }));
  };

  const setFilterMode = (mode: FilterMode) => {
    setFilters((prev) => ({ ...prev, filterMode: mode }));
  };

  const setSearchQuery = (query: string) => {
    setFilters((prev) => ({ ...prev, searchQuery: query }));
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  // Calculate active filters count (non-default filters)
  const activeFiltersCount =
    (filters.selectedSpecialty !== 'todas' ? 1 : 0) +
    (filters.selectedUrgency !== 'todas' ? 1 : 0) +
    (filters.filterMode !== 'mustAct' ? 1 : 0) +
    (filters.searchQuery.trim() !== '' ? 1 : 0);

  return (
    <FilterPreferencesContext.Provider
      value={{
        filters,
        selectedSpecialty: filters.selectedSpecialty,
        selectedUrgency: filters.selectedUrgency,
        filterMode: filters.filterMode,
        searchQuery: filters.searchQuery,
        activeFiltersCount,
        setSelectedSpecialty,
        setSelectedUrgency,
        setFilterMode,
        setSearchQuery,
        resetFilters,
      }}
    >
      {children}
    </FilterPreferencesContext.Provider>
  );
};

export const useFilterPreferences = () => {
  const context = useContext(FilterPreferencesContext);
  if (!context) {
    throw new Error('useFilterPreferences deve ser usado dentro de um FilterPreferencesProvider');
  }
  return context;
};
