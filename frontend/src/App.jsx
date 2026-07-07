import Navbar from "./components/Navbar";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AddEvidence from "./pages/AddEvidence";
import EvidenceList from "./pages/EvidenceList";
import EvidenceDetails from "./pages/EvidenceDetails";
import PrivateRoute from "./components/PrivateRoute";

function App() {
    return (
        <BrowserRouter>
            <Navbar />
            <Routes>
                <Route path="/" element={<Login />} />
                <Route
                    path="/dashboard"
                    element={
                        <PrivateRoute>
                            <Dashboard />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/add"
                    element={
                        <PrivateRoute>
                            <AddEvidence />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/evidences"
                    element={
                        <PrivateRoute>
                            <EvidenceList />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/evidence/:id"
                    element={
                        <PrivateRoute>
                            <EvidenceDetails />
                        </PrivateRoute>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;