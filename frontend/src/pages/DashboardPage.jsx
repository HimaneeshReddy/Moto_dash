import styled from "styled-components";
import logo from '../Images/logo.png';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import FolderOpenOutlinedIcon from '@mui/icons-material/FolderOpenOutlined';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import ManageAccountsOutlinedIcon from '@mui/icons-material/ManageAccountsOutlined';
import { useState } from "react";
import Home from '../Components/Home.jsx';
import Profile from "../Components/Profile.jsx";



//Styled Components

const Container = styled.div`
    display: flex;
    width: 100vw;
    overflow-y: hidden;
`;

const LeftSideBar = styled.div`
    width: 260px;
    height: 100vh;
    background-color: #ffffff;
    display: flex;
    flex-direction: column;
    border-right: 1px solid #e0e0e0;
`



const OptionCard = styled.div`
  display: flex;
  align-items: center;          
  gap: 12px;                    
  height: 50px;
  background-color: #ffffff;
  border-left: 4px solid transparent; 
  cursor: pointer;
  padding-left: 40px; 
  margin: 0 10px; 
  border-radius: 8px; 
  color: #555;
  font-weight: 500;

  transition: all 0.2s ease-in-out;

  &:hover {
    background-color: #eff3f9;
    transform: translateY(-2px); 
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    border-left-color: #3457B2; 
    color: #3457B2;
  }

  &:active {
    transform: translateY(0);
  }
`;

const LogoCard = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px 0; 
    width: 100%;
`

const Logo = styled.img`
    width: 160px; 
    object-fit: contain;
`

const IconCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;   
  color: inherit; 
`;

const SideBarOptions = styled.div`
    display: flex;
    flex-direction: column;
    flex: 1; 
    justify-content: space-between; 
    padding-bottom: 20px;
`

const SideBarOptionsTop = styled.div`
    display: flex;
    flex-direction: column;
    gap: 5px; 
`

const SideBarOptionsBottom = styled.div`
    display: flex;
    flex-direction: column;
    gap: 5px;
`
const Contents = styled.div`
    flex: 1;
    height: 100vh;
    overflow-y: auto;
`


//DashboardPage Component



const DashboardPage = () => {
    const [settingsOpen, setSettingsOpen] = useState(false);    
    return (
    <Container>
        <LeftSideBar>
            <LogoCard><Logo src={logo} alt="Logo" /></LogoCard>
            <SideBarOptions>
                <SideBarOptionsTop>
                    <OptionCard><IconCard><HomeOutlinedIcon /></IconCard>Home</OptionCard> 
                    <OptionCard><IconCard><FolderOpenOutlinedIcon /></IconCard>Projects</OptionCard>
                    <OptionCard><IconCard><AddCircleOutlineIcon /></IconCard>Create</OptionCard> 
                    <OptionCard><IconCard><ChatBubbleOutlineOutlinedIcon /></IconCard>Feedback</OptionCard>  
                </SideBarOptionsTop>      
                <SideBarOptionsBottom>
                    <OptionCard onClick={() => setSettingsOpen(!settingsOpen)}><IconCard><ManageAccountsOutlinedIcon /></IconCard>Profile</OptionCard> 
                    <OptionCard><IconCard><PowerSettingsNewIcon /></IconCard>Logout</OptionCard>  
                </SideBarOptionsBottom>
            </SideBarOptions>
        </LeftSideBar>
        
        <Contents>
            {settingsOpen ? <Profile/>: <Home />}
        </Contents>
        
    </Container>
  )
}

export default DashboardPage