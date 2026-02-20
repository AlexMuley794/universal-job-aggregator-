import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import JobList from './components/JobList';
import { ScrapingInfoBanner, ScrapingIndicator } from './components/SourceBadge';

import useJobs from './hooks/useJobs';

function App() {
  const { jobs: allAPIJobs, loading, error, getJobs, meta } = useJobs();
  const [displayedJobs, setDisplayedJobs] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [showSaved, setShowSaved] = useState(false);
  const [currentFilters, setCurrentFilters] = useState([]);
  const [lastSearchParams, setLastSearchParams] = useState({ query: 'developer', location: '' });
  const [page, setPage] = useState(1);
  const JOBS_PER_PAGE = 12;

  // Derived state for filtered jobs
  const [filteredJobs, setFilteredJobs] = useState([]);

  // Load recent searches and saved jobs from localStorage
  useEffect(() => {
    const savedSearches = localStorage.getItem('recentSearches');
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }

    const saved = localStorage.getItem('savedJobs');
    if (saved) {
      setSavedJobs(JSON.parse(saved));
    }

    // Initial fetch
    handleSearch({ query: 'developer' });
  }, []);

  // Filter Jobs when API data or Filters change
  useEffect(() => {
    if (!allAPIJobs) return;

    console.log(`🌐 [App] Filtered Jobs Update: ${allAPIJobs.length} total raw jobs`);

    let result = allAPIJobs;
    if (currentFilters.length > 0) {
      result = allAPIJobs.filter(job => {
        return currentFilters.every(filter => {
          const f = filter.toLowerCase();
          // Check job type
          if (f === 'full-time' || f === 'contract' || f === 'part-time') {
            return job.jobType && job.jobType.replace('_', '-').toLowerCase().includes(f);
          }
          if (f === 'remote') {
            return job.location.toLowerCase().includes('remote');
          }
          // Check tags/category
          return job.tags.some(tag => tag.toLowerCase().includes(f)) ||
            job.title.toLowerCase().includes(f);
        });
      });
    }
    setFilteredJobs(result);
    setPage(1); // Reset page when filters/data change
  }, [allAPIJobs, currentFilters]);

  // Update Displayed Jobs based on Page
  useEffect(() => {
    const slice = filteredJobs.slice(0, page * JOBS_PER_PAGE);
    setDisplayedJobs(slice);
  }, [filteredJobs, page]);

  const hasMore = displayedJobs.length < filteredJobs.length;

  const loadMore = useCallback(() => {
    if (hasMore) {
      setPage(prev => prev + 1);
    }
  }, [hasMore]);

  const observer = React.useRef();
  const lastJobElementRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMore();
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore, loadMore]);

  const handleToggleSave = (job) => {
    let newSaved;
    if (savedJobs.some(s => s.id === job.id)) {
      newSaved = savedJobs.filter(s => s.id !== job.id);
    } else {
      newSaved = [...savedJobs, job];
    }
    setSavedJobs(newSaved);
    localStorage.setItem('savedJobs', JSON.stringify(newSaved));
  };

  const handleSearch = async ({ query, location, filters = [] }) => {
    setShowSaved(false);
    setCurrentFilters(filters);

    // Normalizar la ubicación para asegurar que las búsquedas y links externos apunten a España
    let searchLocation = location;
    if (location &&
      !location.toLowerCase().includes('españa') &&
      !location.toLowerCase().includes('spain') &&
      !location.toLowerCase().includes('remoto') &&
      !location.toLowerCase().includes('remote')) {
      searchLocation = `${location}, España`;
    }

    setLastSearchParams({ query, location: searchLocation });

    await getJobs({ query, location: searchLocation });

    if (query && !filters.length) {
      const newSearch = { query, location, date: new Date().toISOString() };
      const updatedSearches = [newSearch, ...recentSearches.filter(s => s.query !== query)].slice(0, 5);
      setRecentSearches(updatedSearches);
      localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-inter">
      <Header
        onShowSaved={() => setShowSaved(true)}
        onShowHome={() => setShowSaved(false)}
        savedCount={savedJobs.length}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 space-y-6 md:space-y-8">
        {!showSaved ? (
          <>
            <section className="text-center space-y-4 pt-4 md:pt-10 pb-6">
              <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight leading-tight">
                Encuentra tu próximo <span className="text-blue-600">trabajo ideal</span>
              </h2>
              <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto px-4">
                Explora miles de vacantes de las mejores empresas.
              </p>
            </section>

            <section className="-mt-4 relative z-10 sticky top-20 md:static">
              <SearchBar onSearch={handleSearch} />
              {recentSearches.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2 justify-center text-sm text-slate-500 max-w-full overflow-x-auto">
                  <span className="shrink-0 py-1">Reciente:</span>
                  {recentSearches.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => handleSearch(s)}
                      className="hover:text-blue-600 underline decoration-dotted underline-offset-2 whitespace-nowrap py-1"
                    >
                      {s.query} {s.location ? `(${s.location})` : ''}
                    </button>
                  ))}
                </div>
              )}
            </section>

            <ScrapingInfoBanner />
            <div className="mb-6">
              <ScrapingIndicator isActive={loading} />
            </div>

            <section className="py-4 md:py-8">
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <h3 className="text-lg md:text-xl font-bold text-slate-800 flex items-center gap-2">
                  Últimas oportunidades
                  <span className="text-slate-400 font-normal text-sm italic">
                    {loading ? 'Buscando en múltiples portales (LinkedIn, Indeed, InfoJobs, Tecnoempleo, Jobatus, Adzuna)...' : `(${filteredJobs.length} resultados)`}
                  </span>
                </h3>
              </div>

              {loading && displayedJobs.length === 0 ? (
                <JobList loading={true} jobs={[]} />
              ) : error ? (
                <div className="text-center py-20 bg-white rounded-xl border border-red-100 p-8">
                  <p className="text-red-500 font-medium mb-2">{error}</p>
                  <button
                    onClick={() => handleSearch({ query: 'developer' })}
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    Probar búsqueda por defecto
                  </button>
                </div>
              ) : displayedJobs.length === 0 && !loading ? (
                <div className="text-center py-20 bg-white rounded-xl border border-slate-200">
                  <h3 className="text-xl font-medium text-slate-500">No se encontraron empleos</h3>
                  <p className="text-slate-400 mt-2">Prueba ajustando tus términos de búsqueda o filtros.</p>
                </div>
              ) : (
                <>
                  <JobList
                    jobs={displayedJobs}
                    savedJobs={savedJobs}
                    onToggleSave={handleToggleSave}
                    loading={loading && displayedJobs.length > 0}
                  />


                  {/* Infinite Scroll Trigger */}
                  <div ref={lastJobElementRef} className="py-8 flex justify-center w-full min-h-[50px]">
                    {loading && <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>}
                    {!loading && hasMore && <div className="animate-pulse bg-slate-200 h-2 w-24 rounded-full"></div>}
                    {!loading && !hasMore && displayedJobs.length > 0 && (
                      <p className="text-slate-400 text-sm">Has llegado al final de la lista</p>
                    )}
                  </div>
                </>
              )}
            </section>
          </>
        ) : (
          <section className="py-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-800">
                Empleos Guardados <span className="text-slate-400 font-normal text-sm ml-2">({savedJobs.length})</span>
              </h3>
              <button
                onClick={() => setShowSaved(false)}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                &larr; Volver a Búsqueda
              </button>
            </div>

            {savedJobs.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-xl border border-slate-200">
                <h3 className="text-xl font-medium text-slate-500">No hay empleos guardados</h3>
                <p className="text-slate-400 mt-2">Guarda los empleos que te interesen para verlos aquí.</p>
                <button
                  onClick={() => setShowSaved(false)}
                  className="mt-4 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-medium hover:bg-blue-100 transition-colors"
                >
                  Buscar Empleos
                </button>
              </div>
            ) : (
              <JobList
                jobs={savedJobs}
                savedJobs={savedJobs}
                onToggleSave={handleToggleSave}
              />
            )}
          </section>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm">
          <p>&copy; {new Date().getFullYear()} Universal Job Aggregator. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
