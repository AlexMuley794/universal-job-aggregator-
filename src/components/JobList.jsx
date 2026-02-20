import React from 'react';
import JobCard from './JobCard';
import JobCardSkeleton from './JobCardSkeleton';

const JobList = ({ jobs, savedJobs = [], onToggleSave, loading }) => {
    if (loading && jobs.length === 0) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                    <JobCardSkeleton key={i} />
                ))}
            </div>
        );
    }

    if (!loading && jobs.length === 0) {
        return (
            <div className="text-center py-20">
                <h3 className="text-xl font-medium text-slate-500">No se encontraron empleos</h3>
                <p className="text-slate-400 mt-2">Intenta ajustar tus criterios de búsqueda</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
                <JobCard
                    key={job.id}
                    job={job}
                    isSaved={savedJobs.some(s => s.id === job.id)}
                    onToggleSave={onToggleSave}
                />
            ))}
            {loading && (
                <>
                    {[...Array(3)].map((_, i) => (
                        <JobCardSkeleton key={`skeleton-${i}`} />
                    ))}
                </>
            )}
        </div>
    );
};

export default JobList;
