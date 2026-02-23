import styled from "styled-components"
import { Routes, Route, Navigate } from 'react-router-dom'
import DashboardPage from "./pages/DashboardPage.jsx"
import AuthPage from "./pages/AuthPage.jsx"
import ProtectedRoute from "./Components/ProtectedRoute.jsx"

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<AuthPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
