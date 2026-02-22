import styled from "styled-components";
import logo from '../Images/logo.png';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import FolderOpenOutlinedIcon from '@mui/icons-material/FolderOpenOutlined';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ManageAccountsOutlinedIcon from '@mui/icons-material/ManageAccountsOutlined';
import { useState } from "react";
import Home from '../Components/Home.jsx';
import Profile from "../Components/Profile.jsx";
import CreateOptions from "../Components/CreateOptions.jsx";
import HelpCenter from "../Components/HelpCenter.jsx";

/* ---------------- STYLES ---------------- */

const Container = styled.div`
  display: flex;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
`;

const LeftSideBar = styled.div`
  width: 260px;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #e0e0e0;
`;

const OptionCard = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  height: 50px;
  padding-left: 40px;
  margin: 0 10px;
  border-radius: 8px;
  cursor: pointer;
  color: ${({ active }) => (active ? "#3457B2" : "#555")};
  background-color: ${({ active }) => (active ? "#eff3f9" : "#ffffff")};
  border-left: 4px solid ${({ active }) => (active ? "#3457B2" : "transparent")};
  font-weight: 500;

  &:hover {
    background-color: #eff3f9;
    color: #3457B2;
  }
`;

const LogoCard = styled.div`
  display: flex;
  justify-content: center;
  padding: 20px 0;
`;

const Logo = styled.img`
  width: 160px;
`;

const IconCard = styled.div`
  min-width: 24px;
  display: flex;
  justify-content: center;
`;

const SideBarOptions = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  justify-content: space-between;
  padding-bottom: 20px;
`;

const SideBarOptionsTop = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const SideBarOptionsBottom = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const Contents = styled.div`
  flex: 1;
  overflow-y: auto;
`;

/* ---------------- COMPONENT ---------------- */

import { useNavigate } from "react-router-dom";

const DashboardPage = () => {
  const [activePage, setActivePage] = useState("home");
  const navigate = useNavigate();

  const handleLogout = () => {
    // Here you would typically clear auth tokens
    navigate("/");
  };

  return (
    <Container>
      <LeftSideBar>
        <LogoCard>
          <Logo src={logo} alt="Logo" />
        </LogoCard>

        <SideBarOptions>
          <SideBarOptionsTop>
            <OptionCard
              active={activePage === "home"}
              onClick={() => setActivePage("home")}
            >
              <IconCard><HomeOutlinedIcon /></IconCard>
              Home
            </OptionCard>

            <OptionCard>
              <IconCard><FolderOpenOutlinedIcon /></IconCard>
              Projects
            </OptionCard>

            <OptionCard
              active={activePage === "create"}
              onClick={() => setActivePage("create")}
            >
              <IconCard><AddCircleOutlineIcon /></IconCard>
              Create
            </OptionCard>

            <OptionCard
              active={activePage === "help"}
              onClick={() => setActivePage("help")}
            >
              <IconCard><HelpOutlineIcon /></IconCard>
              Help Center
            </OptionCard>
          </SideBarOptionsTop>

          <SideBarOptionsBottom>
            <OptionCard
              active={activePage === "profile"}
              onClick={() => setActivePage("profile")}
            >
              <IconCard><ManageAccountsOutlinedIcon /></IconCard>
              Profile
            </OptionCard>

            <OptionCard onClick={handleLogout}>
              <IconCard><PowerSettingsNewIcon /></IconCard>
              Logout
            </OptionCard>
          </SideBarOptionsBottom>
        </SideBarOptions>
      </LeftSideBar>

      <Contents>
        {activePage === "home" && <Home setActivePage={setActivePage} />}
        {activePage === "profile" && <Profile />}
        {activePage === "create" && <CreateOptions />}
        {activePage === "help" && <HelpCenter />}
      </Contents>
    </Container>
  );
};

export default DashboardPage;
