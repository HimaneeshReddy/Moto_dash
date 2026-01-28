import { Container } from 'lucide-react'
import React from 'react'
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { useState } from "react";
import RecentCard from "./RecentCard";
import img1 from '../Images/Image1.png'
import img2 from '../Images/Image2.png'
import img3 from '../Images/Image3.png'
import styled from 'styled-components';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';



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


// const Container = styled.div`
//     display: flex;
//     width: 100vw;
//     height: 100vh;
//     overflow: hidden;
// `;

const MainContent = styled.div`
    flex: 1;
    min-height: 100vh;
    background-color: #f4f6f8; 
    overflow-y: scroll;
    /* overflow-x: hidden; */
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
    border-radius: 20px;
    padding: 0 15px;
    gap: 10px;
    height: 45px;
    margin-left: 20px;
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
    align-items: center;
    justify-content: space-around;
`;

const ViewMoreButtonArea = styled.div`
    display: flex;
    justify-content: center;
    margin: 40px 0;
    margin-bottom: 20px;
`;

const ViewMoreButton = styled.button`
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 10px 20px;
    width: fit-content;
    background-color: #ffffff;
    color: #3457B2;
    border: 1px solid #3457B2;
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s;
    font-size: 14px;
    &:hover {
        background-color: #f0f4ff;
    }
`;



const Home = () => {
    const [showFilter, setShowFilter] = useState(false);
    return (
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
                    <ViewMoreButtonArea><ViewMoreButton><ArrowDownwardIcon /> View More</ViewMoreButton></ViewMoreButtonArea>
                    
                </ContentArea>
            </MainContent>
    )
}

export default Home
