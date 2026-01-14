import styled from "styled-components"
import LandingPage from './pages/LandingPage.jsx'

const Conaitner = styled.div`
  height: 100vh;
  width: 100vw;
`

const App = () => {
  return (
    <Conaitner>
      <LandingPage />
    </Conaitner>
  )
}

export default App
