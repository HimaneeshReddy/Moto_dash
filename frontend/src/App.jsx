import styled from "styled-components"
import { Routes, Route, Navigate } from 'react-router-dom'
import DashboardPage from "./pages/DashboardPage.jsx"
import AuthPage from "./pages/AuthPage.jsx"

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<AuthPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
