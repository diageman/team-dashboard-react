import { useState, useEffect, useCallback } from 'react';
import { Employee } from '../types';
import { fetchEmployees } from '../lib/storage';

/**
 * Custom hook для загрузки и управления данными сотрудников.
 * Централизует логику fetching, устраняя дублирование в компонентах.
 */
export function useEmployees() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const load = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await fetchEmployees();
            setEmployees(data);
        } catch (err) {
            setError(err as Error);
            console.error('Error loading employees:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    return {
        employees,
        loading,
        error,
        refetch: load
    };
}
