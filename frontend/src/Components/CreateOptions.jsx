import React from 'react';
import styled from 'styled-components';
import StorageRoundedIcon from '@mui/icons-material/StorageRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import TableChartIcon from '@mui/icons-material/TableChart';
import PieChartIcon from '@mui/icons-material/PieChart';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  padding: 40px;
  box-sizing: border-box; 
  gap: 40px;
  position: relative;
  overflow: hidden;
  background-color: #f4f6f8;
`;

const BackgroundIcon = styled.div`
  position: absolute;
  color: #e2e8f0;
  z-index: 0;
  opacity: 0.6;
  
  svg {
    font-size: ${props => props.size || '100px'};
    transform: rotate(${props => props.rotate || '0deg'});
  }
`;

const Header = styled.div`
  text-align: center;
  position: relative;
  z-index: 1;
`;

const Title = styled.h2`
  color: #1C2434;
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 12px 0;
`;

const Subtitle = styled.p`
  color: #64748B;
  font-size: 16px;
  margin: 0;
`;

const OptionsContainer = styled.div`
  display: flex;
  gap: 40px;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  width: 100%;
  max-width: 900px;
  position: relative;
  z-index: 1;
`;

const OptionCard = styled.div`
  flex: 1;
  min-width: 280px;
  max-width: 360px;
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 40px 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);

  &:hover {
    transform: translateY(-8px);
    border-color: #3457B2;
    box-shadow: 0 20px 25px -5px rgba(52, 87, 178, 0.1), 0 10px 10px -5px rgba(52, 87, 178, 0.04);

    .icon-wrapper {
      background-color: #eff6ff;
      color: #3457B2;
    }
    
    h3 {
      color: #3457B2;
    }
  }
`;

const IconWrapper = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 20px;
  background-color: #f1f5f9;
  color: #64748B;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  
  svg {
    font-size: 40px;
  }
`;

const CardTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
  transition: color 0.3s ease;
`;

const CardDescription = styled.p`
  text-align: center;
  color: #64748B;
  font-size: 14px;
  margin: 0;
  line-height: 1.6;
`;

const CreateOptions = () => {
    return (
        <Container>
            {/* Background Icons */}
            <BackgroundIcon style={{ top: '10%', left: '5%' }} size="120px" rotate="-15deg">
                <CloudUploadIcon />
            </BackgroundIcon>
            <BackgroundIcon style={{ bottom: '15%', left: '10%' }} size="150px" rotate="20deg">
                <AnalyticsIcon />
            </BackgroundIcon>
            <BackgroundIcon style={{ top: '15%', right: '10%' }} size="100px" rotate="10deg">
                <TableChartIcon />
            </BackgroundIcon>
            <BackgroundIcon style={{ bottom: '10%', right: '5%' }} size="130px" rotate="-25deg">
                <PieChartIcon />
            </BackgroundIcon>

            <Header>
                <Title>Create New Project</Title>
                <Subtitle>Select a data source to get started</Subtitle>
            </Header>

            <OptionsContainer>
                <OptionCard>
                    <IconWrapper className="icon-wrapper">
                        <DescriptionRoundedIcon />
                    </IconWrapper>
                    <CardTitle>Upload CSV</CardTitle>
                    <CardDescription>
                        Import data directly from a CSV file. Perfect for quick analysis and static datasets.
                    </CardDescription>
                </OptionCard>

                <OptionCard>
                    <IconWrapper className="icon-wrapper">
                        <StorageRoundedIcon />
                    </IconWrapper>
                    <CardTitle>Connect Database</CardTitle>
                    <CardDescription>
                        Link your existing database securely. Supports MySQL, PostgreSQL, and more.
                    </CardDescription>
                </OptionCard>
            </OptionsContainer>
        </Container>
    );
};

export default CreateOptions;
