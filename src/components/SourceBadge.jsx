import React from 'react';
import { Globe, Zap, Shield } from 'lucide-react';

/**
 * Badge component to show job source with icon
 */
const SourceBadge = ({ source }) => {
    const getSourceConfig = (src) => {
        switch (src) {
            case 'LinkedIn':
                return {
                    color: 'bg-blue-50 text-blue-700 border-blue-200',
                    icon: '💼',
                    label: 'LinkedIn'
                };
            case 'Indeed':
                return {
                    color: 'bg-green-50 text-green-700 border-green-200',
                    icon: '🔍',
                    label: 'Indeed'
                };
            case 'Adzuna':
                return {
                    color: 'bg-purple-50 text-purple-700 border-purple-200',
                    icon: '📊',
                    label: 'Adzuna'
                };
            case 'InfoJobs':
                return {
                    color: 'bg-cyan-50 text-cyan-700 border-cyan-200',
                    icon: '💼',
                    label: 'InfoJobs'
                };
            case 'Tecnoempleo':
                return {
                    color: 'bg-orange-50 text-orange-700 border-orange-200',
                    icon: '💻',
                    label: 'Tecnoempleo'
                };
            case 'Jobatus':
                return {
                    color: 'bg-yellow-50 text-yellow-700 border-yellow-200',
                    icon: '🐝',
                    label: 'Jobatus'
                };
            default:
                return {
                    color: 'bg-gray-50 text-gray-700 border-gray-200',
                    icon: '🌐',
                    label: src || 'Web'
                };
        }
    };

    const config = getSourceConfig(source);

    return (
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border ${config.color}`}>
            <span>{config.icon}</span>
            {config.label}
        </span>
    );
};

/**
 * Scraping status indicator
 */
export const ScrapingIndicator = ({ isActive }) => {
    if (!isActive) return null;

    return (
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
            <span className="font-medium">Buscando en LinkedIn, Indeed, InfoJobs, Tecnoempleo y Jobatus...</span>
            <Shield className="w-4 h-4 ml-auto" />
        </div>
    );
};

/**
 * Info banner about scraping capabilities
 */
export const ScrapingInfoBanner = () => {
    return (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                    <h4 className="font-semibold text-slate-800 mb-1">
                        🚀 Scraping Avanzado Activado
                    </h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                        Estamos extrayendo ofertas en tiempo real de <strong>LinkedIn</strong>, <strong>Indeed</strong>, <strong>InfoJobs</strong>, <strong>Tecnoempleo</strong> y <strong>Jobatus</strong>
                        usando tecnología Puppeteer con modo stealth. Las ofertas se mezclan automáticamente con
                        resultados de Adzuna y se ordenan por fecha de publicación.
                    </p>
                    <div className="flex gap-2 mt-2 flex-wrap">
                        <span className="inline-flex items-center gap-1 text-xs bg-white px-2 py-1 rounded-md border border-blue-100">
                            <Globe className="w-3 h-3" />
                            Bypass anti-bot
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs bg-white px-2 py-1 rounded-md border border-blue-100">
                            <Shield className="w-3 h-3" />
                            User-Agent dinámico
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs bg-white px-2 py-1 rounded-md border border-blue-100">
                            <Zap className="w-3 h-3" />
                            Scraping paralelo
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SourceBadge;
