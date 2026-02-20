import React from 'react';
import { ExternalLink, AlertTriangle } from 'lucide-react';

const EmergencyCard = ({ source, url }) => {
    const getSourceColors = (src) => {
        switch (src) {
            case 'LinkedIn': return 'from-blue-600 to-blue-800';
            case 'InfoJobs': return 'from-cyan-500 to-cyan-700';
            case 'Indeed': return 'from-green-600 to-green-800';
            default: return 'from-slate-600 to-slate-800';
        }
    };

    return (
        <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-6 flex flex-col items-center justify-center text-center space-y-4 hover:border-blue-300 transition-all group">
            <div className={`p-3 rounded-full bg-gradient-to-br ${getSourceColors(source)} text-white shadow-lg`}>
                <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
                <h4 className="font-bold text-slate-800">Muro Detectado en {source}</h4>
                <p className="text-sm text-slate-500 max-w-[200px]">
                    No pudimos extraer todas las ofertas automáticamente debido a bloqueos de seguridad.
                </p>
            </div>
            <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors group-hover:scale-105 transform duration-200"
            >
                Ver en {source}
                <ExternalLink className="w-4 h-4" />
            </a>
        </div>
    );
};

export default EmergencyCard;
