import styled from "styled-components"
import LandingPage from './pages/LandingPage.jsx'
import DashboardPage from "./pages/DashboardPage.jsx"
import AuthPage from "./pages/AuthPage.jsx"

const Conaitner = styled.div`
  height: 100vh;
  width: 100vw;
  padding: 0;
  margin: 0;
`

const App = () => {
  return (
    <AuthPage/>
  )
}

export default App
