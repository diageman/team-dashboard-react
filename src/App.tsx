import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { AddEmployee } from './pages/AddEmployee';
import { Manage } from './pages/Manage';
import { Ideas } from './pages/Ideas';

function App() {
    return (
        <HashRouter>
            <Layout>
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/add" element={<AddEmployee />} />
                    <Route path="/manage" element={<Manage />} />
                    <Route path="/ideas" element={<Ideas />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Layout>

            <Toaster
                position="top-right"
                toastOptions={{
                    style: {
                        background: '#1c1c1c',
                        color: '#fff',
                        border: '1px solid #2e2e2e',
                    },
                    success: {
                        iconTheme: {
                            primary: '#FCC419',
                            secondary: '#1c1c1c',
                        },
                    },
                }}
            />
        </HashRouter>
    );
}

export default App;
