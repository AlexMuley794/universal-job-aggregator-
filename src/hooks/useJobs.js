import { useState, useCallback } from 'react';
import { fetchJobs } from '../services/jobService';

const useJobs = () => {
    const [jobs, setJobs] = useState([]);
    const [meta, setMeta] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const getJobs = useCallback(async (searchParams) => {
        setLoading(true);
        setError(null);
        setJobs([]);

        try {
            // Fetch ALL matching jobs
            const response = await fetchJobs({ ...searchParams, limit: 1000 });

            if (!response || !response.jobs || response.jobs.length === 0) {
                console.log("⚠️ [Hook] No jobs found from services");
                setJobs([]);
                setMeta(response?.meta || null);
                setError('No se encontraron empleos con esos criterios.');
            } else {
                console.log(`✅ [Hook] Updating state with ${response.jobs.length} jobs`);
                setJobs(response.jobs);
                setMeta(response.meta);
            }
        } catch (err) {
            setError(err.message || 'Error al obtener empleos.');
            setJobs([]);
        } finally {
            setLoading(false);
        }
    }, []);

    return { jobs, loading, error, getJobs, meta };
};

export default useJobs;
