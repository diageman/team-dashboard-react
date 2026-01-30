import { Employee, WeeklyStats } from '../types';
import { db } from './firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';

const COLLECTION_NAME = 'employees';

export const fetchEmployees = async (): Promise<Employee[]> => {
    try {
        const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
        return querySnapshot.docs.map(doc => doc.data() as Employee);
    } catch (error) {
        console.error("Error fetching employees: ", error);
        return [];
    }
};

export const saveEmployeeData = async (
    id: string | null,
    name: string,
    team: string,
    avatar: string,
    month: string,
    weekStartDate: string,
    weekEndDate: string,
    stats: WeeklyStats,
    mode: 'week' | 'day' = 'week'
): Promise<void> => {
    try {
        let employee: Employee | null = null;
        let employeeId = id;

        // If no ID provided, try to find existing employee by name + team
        if (!id) {
            const allEmployees = await fetchEmployees();
            const existing = allEmployees.find(
                e => e.name.toLowerCase() === name.toLowerCase() && e.team === team
            );
            if (existing) {
                employee = existing;
                employeeId = existing.id;
            }
        }

        // If ID provided or found by name, try to load existing data
        if (employeeId) {
            const employeeRef = doc(db, COLLECTION_NAME, employeeId);
            const docSnap = await getDoc(employeeRef);
            if (docSnap.exists()) {
                employee = docSnap.data() as Employee;
            }
        }

        // If still no employee, create new
        if (!employee) {
            employeeId = crypto.randomUUID();
            employee = {
                id: employeeId,
                name,
                team: team as any,
                avatar,
                weeks: {},
                days: {}
            };
        }

        // Update fields
        employee.name = name;
        employee.team = team as any;
        if (avatar) employee.avatar = avatar;

        if (!employee.weeks) employee.weeks = {};
        if (!employee.days) employee.days = {};
        if (month && !employee.weeks[month]) employee.weeks[month] = {};

        // Save stats
        if (mode === 'day') {
            // Daily mode: key is the specific date (passed as weekStartDate for simplicity of args reuse, or we treat start date as the day)
            if (weekStartDate) {
                employee.days[weekStartDate] = {
                    ...stats,
                    startDate: weekStartDate,
                    endDate: weekStartDate // Same day
                };
            }
        } else {
            // Weekly mode
            if (month && weekStartDate) {
                employee.weeks[month][weekStartDate] = {
                    ...stats,
                    startDate: weekStartDate,
                    endDate: weekEndDate
                };
            }
        }

        // Save to Firestore
        const employeeRef = doc(db, COLLECTION_NAME, employeeId as string);
        await setDoc(employeeRef, employee);
    } catch (e) {
        console.error("Error saving employee: ", e);
        throw e;
    }
};

export const deleteEmployee = async (id: string): Promise<void> => {
    try {
        await deleteDoc(doc(db, COLLECTION_NAME, id));
    } catch (e) {
        console.error("Error deleting employee: ", e);
        throw e;
    }
};

// Admin auth simulation (remains local for simplicity, or could move to Firebase Auth later)
const ADMIN_KEY = 'team_dashboard_admin_auth';

export const isAuthenticated = (): boolean => {
    return localStorage.getItem(ADMIN_KEY) === 'true';
};

export const login = (password: string): boolean => {
    // Keep the same password or change as needed
    if (password === '2510') {
        localStorage.setItem(ADMIN_KEY, 'true');
        return true;
    }
    return false;
};

export const logout = (): void => {
    localStorage.removeItem(ADMIN_KEY);
};
