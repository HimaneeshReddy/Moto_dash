import styled from "styled-components";
import logo from '../Images/logo.png';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import FolderOpenOutlinedIcon from '@mui/icons-material/FolderOpenOutlined';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import ManageAccountsOutlinedIcon from '@mui/icons-material/ManageAccountsOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined';
import { useState } from "react";
import RecentCard from "../Components/RecentCard";
import img1 from '../Images/Image1.png'
import img2 from '../Images/Image2.png'
import img3 from '../Images/Image3.png'

//Dummy Data

const dashboardData = [
  {
    id: 1,
    image: img1,
    title: "Marketing Overview",
    description: "Last edited 2 hours ago",
  },
  {
    id: 2,
    image: img2,
    title: "Sales Performance",
    description: "Last edited yesterday",
  },
  {
    id: 3,
    image: img3,
    title: "User Analytics",
    description: "Last edited 3 days ago",
  },
  {
    id: 4,
    image: img1,
    title: "Revenue Dashboard",
    description: "Last edited 5 hours ago",
  },
  {
    id: 5,
    image: img2,
    title: "Product Insights",
    description: "Last edited last week",
  },
  {
    id: 6,
    image: img3,
    title: "Campaign Tracking",
    description: "Last edited 10 minutes ago",
  },
];

//Styled Components

const Container = styled.div`
    display: flex;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
`;

const LeftSideBar = styled.div`
    width: 260px;
    height: 100vh;
    background-color: #ffffff;
    display: flex;
    flex-direction: column;
    border-right: 1px solid #e0e0e0;
`

const MainContent = styled.div`
    flex: 1;
    height: 100vh;
    background-color: #f4f6f8; 
    overflow-y: auto;
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

const Header = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 80px; 
    width: 100%;
    border-bottom: 1px solid #ececec;
    background-color: #ffffff;
`

const HeaderLeft = styled.div`
    display: flex;
    align-items: center;
    background-color: #f4f6f8;
    border-radius: 8px;
    padding: 0 15px;
    gap: 10px;
    height: 45px;
`

const HeaderRight = styled.div`
    display: flex;
    align-items: center;
    gap: 20px;
    transform: translateX(-20px);
`

const SearchBar = styled.input`
    width: 300px;
    height: 100%;
    background-color: transparent; 
    border: none;
    font-size: 15px;
    color: #555;

    &:focus {
        outline: none;
    }
    &::placeholder {
        color: #879ec7;
    }
`

const ContentArea = styled.div`
    display: flex;
    flex-direction: column;
    padding: 30px 40px;
    height: 100%;
`

const ContentHeader = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between; 
    align-items: center;
    width: 100%;
    margin-bottom: 50px;
`

const Options = styled.div`
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 15px;
`

const SectionTitle = styled.h2`
    color: #1C2434;
    font-size: 24px;
    font-weight: 600;
    margin: 0;
`

const PrimaryButton = styled.button`
    padding: 10px 20px;
    background-color: #3457B2;
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 8px;

    &:hover {
        background-color: #2A458C;
    }
`;

const FilterWrapper = styled.div`
    position: relative;
    display: flex;
    align-items: center;
`

const FilterButton = styled.button`
    display: flex;
    align-items: center;    
    justify-content: space-between;
    gap: 8px;
    padding: 10px 16px;
    background-color: #ffffff;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    color: #555;
    min-width: 100px;
    transition: all 0.2s;

    &:hover {
        background-color: #f9fafb;
        border-color: #d1d5db;
    }
`;

const FilterDropDown = styled.div`
    position: absolute;
    top: 48px;
    right: 0; 
    background-color: #ffffff;      
    border: 1px solid #eff3f9;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    z-index: 1000;
    width: 160px;
    overflow: hidden;
    padding: 4px;
`;

const FilterItem = styled.div`
    padding: 10px 12px;
    cursor: pointer;
    font-size: 14px;
    color: #555;
    border-radius: 4px;
    transition: background 0.1s;

    &:hover {
        background-color: #eff3f9;
        color: #3457B2;
    }
`;

const RecentCardArea = styled.div`
    display: flex;
    gap: 40px;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
`;


//DashboardPage Component

const DashboardPage = () => {
    const [showFilter, setShowFilter] = useState(false);
    
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
                    <OptionCard><IconCard><ManageAccountsOutlinedIcon /></IconCard>Profile</OptionCard> 
                    <OptionCard><IconCard><PowerSettingsNewIcon /></IconCard>Logout</OptionCard>  
                </SideBarOptionsBottom>
            </SideBarOptions>
        </LeftSideBar>
        
        <MainContent>
            <Header>
                <HeaderLeft>
                    <SearchOutlinedIcon sx={{ color: '#879ec7' }} />
                    <SearchBar placeholder="Search..." />
                </HeaderLeft>
                <HeaderRight>
                    <NotificationsNoneOutlinedIcon sx={{ color: '#64748B', cursor: 'pointer' }} />
                    <AccountCircleOutlinedIcon sx={{ color: '#64748B', cursor: 'pointer', fontSize: '32px' }} />
                </HeaderRight>
            </Header>
            <ContentArea>
                <ContentHeader>
                    <SectionTitle>Recent Work</SectionTitle>
                    <Options>
                        <PrimaryButton>
                            <AddCircleOutlineIcon sx={{fontSize: 18}}/> Create New
                        </PrimaryButton>
                        <FilterWrapper>
                            <FilterButton onClick={()=>setShowFilter(!showFilter)}>
                                Filter <KeyboardArrowDownOutlinedIcon sx={{fontSize: 18}} />
                            </FilterButton>
                            {showFilter && (
                                <FilterDropDown>
                                    <FilterItem onClick={()=>setShowFilter(false)}>All Projects</FilterItem>
                                    <FilterItem onClick={()=>setShowFilter(false)}>Recent</FilterItem>
                                    <FilterItem onClick={()=>setShowFilter(false)}>Last 7 Days</FilterItem>
                                    <FilterItem onClick={()=>setShowFilter(false)}>Last 30 Days</FilterItem>
                                </FilterDropDown>
                            )}
                        </FilterWrapper>
                    </Options>
                </ContentHeader> 
                <RecentCardArea>
                    {dashboardData
                        .map((item) => (
                            <RecentCard 
                            key={item.id}
                            item={item}
                            />
                    ))}         
                </RecentCardArea>
                
            </ContentArea>
        </MainContent>
    </Container>
  )
}

export default DashboardPage