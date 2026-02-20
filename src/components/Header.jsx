import React from 'react';
import { Briefcase, MapPin, Search } from 'lucide-react';

const Header = ({ onShowSaved, onShowHome, savedCount = 0 }) => {
    return (
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                <div onClick={onShowHome} className="flex items-center gap-2 cursor-pointer group">
                    <Briefcase className="h-8 w-8 text-blue-600 group-hover:scale-105 transition-transform" />
                    <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        Universal Job Aggregator
                    </h1>
                </div>
                <nav className="flex items-center gap-4">
                    <button onClick={onShowHome} className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
                        Buscar
                    </button>
                    <button onClick={onShowSaved} className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors relative">
                        Guardados
                        {savedCount > 0 && (
                            <span className="absolute -top-2 -right-3 bg-blue-600 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                                {savedCount}
                            </span>
                        )}
                    </button>
                </nav>
            </div>
        </header>
    );
};

export default Header;
