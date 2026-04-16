import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ChannelPage from "./pages/ChannelPage";
import { useAuth } from "./context/AuthContext";

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
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
          path="/channel/:id"
          element={
            <PrivateRoute>
              <ChannelPage />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
