import styled from "styled-components";
import logo from '../Images/logo.png';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import DashboardIcon from '@mui/icons-material/Dashboard';
import TableRowsIcon from '@mui/icons-material/TableRows';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
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
import DashboardView from "../Components/DashboardView.jsx";
import DashboardList from "../Components/DashboardList.jsx";
import DatasetManager from "../Components/DatasetManager.jsx";
import OrgConsole from "../Components/OrgConsole.jsx";
import { getUser } from "../services/api.js";

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
  const user = getUser();
  const [activePage, setActivePage] = useState("home");
  const [activeAnalysis, setActiveAnalysis] = useState(null);
  const [activeDatasetName, setActiveDatasetName] = useState("");
  const [activeDatasetId, setActiveDatasetId] = useState(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    // Here you would typically clear auth tokens
    navigate("/");
  };

  // Called after upload + analysis completes (new dataset flow)
  const handleAnalysisSuccess = (analysisData, datasetName, datasetId) => {
    setActiveAnalysis(analysisData);
    setActiveDatasetName(datasetName);
    setActiveDatasetId(datasetId || null);
    setActivePage("dashboard");
  };

  // Called when opening a saved dashboard from the DashboardList
  const handleOpenSavedDashboard = (analysisData, datasetName, datasetId) => {
    setActiveAnalysis(analysisData);
    setActiveDatasetName(datasetName);
    setActiveDatasetId(datasetId);
    setActivePage("dashboard");
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

            <OptionCard
              active={activePage === "dashboards" || activePage === "dashboard"}
              onClick={() => setActivePage("dashboards")}
            >
              <IconCard><DashboardIcon /></IconCard>
              Dashboards
            </OptionCard>

            {user?.role !== "analyst" && (
              <OptionCard
                active={activePage === "orgconsole"}
                onClick={() => setActivePage("orgconsole")}
              >
                <IconCard><AdminPanelSettingsIcon /></IconCard>
                Org Console
              </OptionCard>
            )}

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
        {activePage === "home" && <Home setActivePage={setActivePage} onOpenDashboard={handleOpenSavedDashboard} />}
        {activePage === "profile" && <Profile />}
        {activePage === "create" && <CreateOptions onAnalysisSuccess={handleAnalysisSuccess} />}
        {activePage === "help" && <HelpCenter />}
        {activePage === "datasets" && <DatasetManager />}
        {activePage === "orgconsole" && <OrgConsole />}
        {activePage === "dashboards" && (
          <DashboardList
            onOpenDashboard={handleOpenSavedDashboard}
            setActivePage={setActivePage}
          />
        )}

        {/* Dynamic AI Dashboard View */}
        {activePage === "dashboard" && (
          <DashboardView
            analysisData={activeAnalysis}
            datasetName={activeDatasetName}
            datasetId={activeDatasetId}
          />
        )}
      </Contents>
    </Container >
  );
};

export default DashboardPage;
