import React from 'react';
import { Building2, MapPin, Clock, ArrowUpRight, DollarSign, Bookmark } from 'lucide-react';

const JobCard = ({ job, isSaved, onToggleSave }) => {
    return (
        <div className="group bg-white rounded-xl p-5 border border-slate-200 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-5 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        onToggleSave(job);
                    }}
                    className={`p-2 rounded-lg transition-colors ${isSaved
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-slate-100 text-slate-400 hover:bg-blue-50 hover:text-blue-600'
                        }`}
                >
                    <Bookmark className={`h-5 w-5 ${isSaved ? 'fill-current' : ''}`} />
                </button>
                <a
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                >
                    <ArrowUpRight className="h-5 w-5" />
                </a>
            </div>

            <div className="flex gap-4">
                <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-xl shrink-0 overflow-hidden">
                    {job.logo ? (
                        <img src={job.logo} alt={job.company} className="h-full w-full object-cover" />
                    ) : (
                        job.company ? job.company.charAt(0) : <Building2 className="h-6 w-6" />
                    )}
                </div>

                <div className="flex-1">
                    <h3 className="font-semibold text-lg text-slate-800 group-hover:text-blue-600 transition-colors pr-8">
                        {job.title}
                    </h3>
                    <p className="text-slate-500 font-medium text-sm mt-1 mb-3">
                        {job.company}
                    </p>

                    <div className="flex flex-wrap gap-y-2 gap-x-4 text-sm text-slate-500">
                        <div className="flex items-center gap-1.5">
                            <MapPin className="h-4 w-4 text-slate-400" />
                            <span>{job.location}</span>
                        </div>

                        {job.salary && (
                            <div className="flex items-center gap-1.5">
                                <DollarSign className="h-4 w-4 text-slate-400" />
                                <span>{job.salary}</span>
                            </div>
                        )}

                        <div className="flex items-center gap-1.5">
                            <Clock className="h-4 w-4 text-slate-400" />
                            <span>{job.postedAt}</span>
                        </div>
                    </div>

                    <div className="mt-4 flex gap-2 flex-wrap items-center">
                        {job.source && (
                            <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${job.source === 'LinkedIn' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                    job.source === 'InfoJobs' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                        job.source === 'Indeed' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                                            'bg-green-50 text-green-700 border-green-200'
                                }`}>
                                {job.source === 'Adzuna' ? 'Verificado' : `Vía ${job.source}`}
                            </span>
                        )}
                        {job.tags && job.tags.map((tag, i) => (
                            <span
                                key={i}
                                className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-medium"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JobCard;
