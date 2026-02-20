import React from 'react';

const JobCardSkeleton = () => {
    return (
        <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm animate-pulse">
            <div className="flex gap-4">
                <div className="h-12 w-12 rounded-lg bg-slate-200 shrink-0"></div>
                <div className="flex-1 space-y-3">
                    <div className="flex justify-between">
                        <div className="h-5 bg-slate-200 rounded w-3/4"></div>
                        <div className="h-5 w-5 bg-slate-200 rounded"></div>
                    </div>
                    <div className="h-4 bg-slate-200 rounded w-1/2"></div>

                    <div className="flex gap-2 pt-2">
                        <div className="h-4 bg-slate-200 rounded w-20"></div>
                        <div className="h-4 bg-slate-200 rounded w-20"></div>
                        <div className="h-4 bg-slate-200 rounded w-20"></div>
                    </div>

                    <div className="flex gap-2 pt-2">
                        <div className="h-6 w-16 bg-slate-200 rounded"></div>
                        <div className="h-6 w-16 bg-slate-200 rounded"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JobCardSkeleton;
