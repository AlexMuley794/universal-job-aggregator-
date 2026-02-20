import React, { useState } from 'react';
import { Search, MapPin, ListFilter } from 'lucide-react';

const SearchBar = ({ onSearch }) => {
    const [query, setQuery] = useState('');
    const [location, setLocation] = useState('');

    const [activeFilters, setActiveFilters] = useState([]);

    const FILTER_MAP = {
        'Remoto': 'Remote',
        'Tiempo Completo': 'Full-time',
        'Contrato': 'Contract',
        'Ingeniería': 'Engineering',
        'Diseño': 'Design',
        'Producto': 'Product',
        'Marketing': 'Marketing'
    };

    const handleFilterToggle = (filterLabel) => {
        const filterValue = FILTER_MAP[filterLabel];
        let newFilters;
        if (activeFilters.includes(filterValue)) {
            newFilters = activeFilters.filter(f => f !== filterValue);
        } else {
            newFilters = [...activeFilters, filterValue];
        }
        setActiveFilters(newFilters);
        // We trigger search immediately on filter change or just pass it up?
        // Let's pass it up with current query/location
        onSearch({ query, location, filters: newFilters });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch({ query, location, filters: activeFilters });
    };

    return (
        <div className="w-full max-w-4xl mx-auto bg-white rounded-xl shadow-lg shadow-slate-200/50 p-2 border border-slate-100">
            <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-2">
                <div className="flex-1 flex items-center px-4 py-2 bg-slate-50 rounded-lg group focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/20 transition-all border border-transparent focus-within:border-blue-500">
                    <Search className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Título, palabras clave o empresa"
                        className="w-full bg-transparent border-none outline-none ml-3 text-slate-700 placeholder:text-slate-400"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </div>

                <div className="flex-1 flex items-center px-4 py-2 bg-slate-50 rounded-lg group focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/20 transition-all border border-transparent focus-within:border-blue-500">
                    <MapPin className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Ciudad, país o 'Remoto'"
                        className="w-full bg-transparent border-none outline-none ml-3 text-slate-700 placeholder:text-slate-400"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                    />
                </div>

                <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-2.5 rounded-lg transition-colors shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2"
                >
                    Buscar
                </button>
            </form>

            <div className="mt-3 px-2 flex gap-2 items-center text-sm text-slate-500 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                <ListFilter className="h-4 w-4 mr-1" />
                <span className="font-medium mr-2">Filtros:</span>
                {Object.keys(FILTER_MAP).map((filterLabel) => {
                    const filterValue = FILTER_MAP[filterLabel];
                    return (
                        <button
                            key={filterLabel}
                            onClick={() => handleFilterToggle(filterLabel)}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap border ${activeFilters.includes(filterValue)
                                ? 'bg-blue-100 text-blue-700 border-blue-200'
                                : 'bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100'
                                }`}
                        >
                            {filterLabel}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default SearchBar;

