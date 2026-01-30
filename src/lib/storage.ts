import { Employee, WeeklyStats } from '../types';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'team_dashboard_v2_data';

export const getEmployees = (): Employee[] => {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Failed to parse employees', error);
        return [];
    }
};

export const saveEmployeeData = (
    name: string,
    team: 'Команда 1' | 'Команда 2',
    avatar: string,
    month: string,
    weekStartDate: string,
    stats: WeeklyStats
) => {
    const employees = getEmployees();

    // Smart update: Find existing employee by name + team
    const existingIndex = employees.findIndex(
        (e) => e.name.trim().toLowerCase() === name.trim().toLowerCase() && e.team === team
    );

    if (existingIndex >= 0) {
        // Update existing
        const emp = employees[existingIndex];
        if (!emp.weeks) emp.weeks = {};
        if (!emp.weeks[month]) emp.weeks[month] = {};

        // Overwrite week data (keyed by Start Date)
        emp.weeks[month][weekStartDate] = stats;
        // Update avatar if provided
        if (avatar) emp.avatar = avatar;

        employees[existingIndex] = emp;
    } else {
        // Create new
        const newEmployee: Employee = {
            id: uuidv4(),
            name,
            team,
            avatar: avatar || '',
            weeks: {
                [month]: {
                    [weekStartDate]: stats
                }
            }
        };
        employees.push(newEmployee);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(employees));
    return employees;
};

export const deleteEmployee = (id: string) => {
    const employees = getEmployees().filter(e => e.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(employees));
    return employees;
};

// Admin auth simulation
const ADMIN_KEY = 'team_dashboard_admin_auth';
export const isAuthenticated = () => {
    return localStorage.getItem(ADMIN_KEY) === 'true';
};

export const login = (password: string) => {
    if (password === '2510') {
        localStorage.setItem(ADMIN_KEY, 'true');
        return true;
    }
    return false;
};

export const logout = () => {
    localStorage.removeItem(ADMIN_KEY);
};
