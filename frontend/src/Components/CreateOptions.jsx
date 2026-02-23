import React, { useState } from 'react';
import styled from 'styled-components';
import StorageRoundedIcon from '@mui/icons-material/StorageRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import TableChartIcon from '@mui/icons-material/TableChart';
import PieChartIcon from '@mui/icons-material/PieChart';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { uploadCsv } from '../services/api.js';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  padding: 40px;
  box-sizing: border-box; 
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

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 40px;
  width: 100%;
  max-width: 900px;
  z-index: 1;
`;

const Header = styled.div`
  text-align: center;
  position: relative;
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

const FormContainer = styled.form`
  width: 100%;
  max-width: 500px;
  background: white;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.08);
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  label {
    font-size: 14px;
    font-weight: 600;
    color: #334155;
  }

  input, select {
    padding: 12px 16px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-size: 15px;
    outline: none;
    transition: all 0.2s;

    &:focus {
      border-color: #3457B2;
      box-shadow: 0 0 0 3px rgba(52, 87, 178, 0.1);
    }
  }
  
  input[type="file"] {
    padding: 10px;
    background-color: #f8fafc;
    cursor: pointer;
  }
`;

const FormRow = styled.div`
  display: flex;
  gap: 16px;
  > * {
    flex: 1;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 10px;
`;

const Button = styled.button`
  flex: 1;
  padding: 14px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  ${props => props.primary ? `
    background-color: #3457B2;
    color: white;
    border: none;
    &:hover { background-color: #2a458c; }
  ` : `
    background-color: white;
    color: #64748B;
    border: 1px solid #e2e8f0;
    &:hover { background-color: #f1f5f9; }
  `}
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: #64748B;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  padding: 0;
  margin-bottom: 20px;
  align-self: flex-start;
  transition: color 0.2s;

  &:hover {
    color: #3457B2;
  }
`;

const Msg = styled.p`
  color: ${props => props.error ? '#ef4444' : '#10b981'};
  font-size: 14px;
  background: ${props => props.error ? '#fef2f2' : '#ecfdf5'};
  padding: 12px;
  border-radius: 8px;
  border: 1px solid ${props => props.error ? '#fecaca' : '#a7f3d0'};
  margin: 0;
  text-align: center;
`;

const CreateOptions = () => {
  // "selection" | "upload_csv" | "connect_db"
  const [view, setView] = useState("selection");

  // CSV Form State
  const [csvForm, setCsvForm] = useState({ datasetName: "", file: null });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // DB Form State
  const [dbForm, setDbForm] = useState({
    datasetName: "",
    dbType: "postgresql",
    host: "",
    port: "",
    username: "",
    password: "",
    databaseName: ""
  });

  const handleCsvSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const data = await uploadCsv(csvForm);
      setSuccessMsg(data.message || "CSV Uploaded and parsed successfully!");
      setCsvForm({ datasetName: "", file: null });

      // Optionally, reset view back to selection after 2s:
      // setTimeout(() => setView("selection"), 2000);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDbSubmit = (e) => {
    e.preventDefault();
    console.log("Submitting DB Connection:", dbForm);
    // TODO: Call API
  };

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

      <ContentWrapper>
        {view === "selection" && (
          <>
            <Header>
              <Title>Create New Project</Title>
              <Subtitle>Select a data source to get started</Subtitle>
            </Header>

            <OptionsContainer>
              <OptionCard onClick={() => setView("upload_csv")}>
                <IconWrapper className="icon-wrapper">
                  <DescriptionRoundedIcon />
                </IconWrapper>
                <CardTitle>Upload CSV</CardTitle>
                <CardDescription>
                  Import data directly from a CSV file. Perfect for quick analysis and static datasets.
                </CardDescription>
              </OptionCard>

              <OptionCard onClick={() => setView("connect_db")}>
                <IconWrapper className="icon-wrapper">
                  <StorageRoundedIcon />
                </IconWrapper>
                <CardTitle>Connect Database</CardTitle>
                <CardDescription>
                  Link your existing database securely. Supports MySQL, PostgreSQL, and more.
                </CardDescription>
              </OptionCard>
            </OptionsContainer>
          </>
        )}

        {view === "upload_csv" && (
          <FormContainer onSubmit={handleCsvSubmit}>
            <BackButton type="button" onClick={() => setView("selection")}>
              <ArrowBackIcon fontSize="small" /> Back to options
            </BackButton>

            <Header style={{ textAlign: 'left' }}>
              <Title style={{ fontSize: '24px' }}>Upload CSV Data</Title>
              <Subtitle>Import your spreadsheet to create a dataset</Subtitle>
            </Header>

            {errorMsg && <Msg error>{errorMsg}</Msg>}
            {successMsg && <Msg>{successMsg}</Msg>}

            <InputGroup>
              <label>Dataset Name</label>
              <input
                type="text"
                placeholder="e.g. Q4 Sales Data"
                required
                value={csvForm.datasetName}
                onChange={e => setCsvForm({ ...csvForm, datasetName: e.target.value })}
              />
            </InputGroup>

            <InputGroup>
              <label>CSV File</label>
              <input
                type="file"
                accept=".csv"
                required
                onChange={e => setCsvForm({ ...csvForm, file: e.target.files[0] })}
              />
            </InputGroup>

            <Button primary type="submit">Upload and Create</Button>
          </FormContainer>
        )}

        {view === "connect_db" && (
          <FormContainer onSubmit={handleDbSubmit}>
            <BackButton type="button" onClick={() => setView("selection")}>
              <ArrowBackIcon fontSize="small" /> Back to options
            </BackButton>

            <Header style={{ textAlign: 'left' }}>
              <Title style={{ fontSize: '24px' }}>Connect Database</Title>
              <Subtitle>Link an external database to query directly</Subtitle>
            </Header>

            <InputGroup>
              <label>Dataset Name (Label)</label>
              <input
                type="text"
                placeholder="e.g. Production Database DB"
                required
                value={dbForm.datasetName}
                onChange={e => setDbForm({ ...dbForm, datasetName: e.target.value })}
              />
            </InputGroup>

            <InputGroup>
              <label>Database Type</label>
              <select
                value={dbForm.dbType}
                onChange={e => setDbForm({ ...dbForm, dbType: e.target.value })}
              >
                <option value="postgresql">PostgreSQL</option>
                <option value="mysql">MySQL</option>
              </select>
            </InputGroup>

            <FormRow>
              <InputGroup>
                <label>Host</label>
                <input
                  type="text"
                  placeholder="localhost"
                  required
                  value={dbForm.host}
                  onChange={e => setDbForm({ ...dbForm, host: e.target.value })}
                />
              </InputGroup>
              <InputGroup>
                <label>Port</label>
                <input
                  type="text"
                  placeholder="5432"
                  required
                  value={dbForm.port}
                  onChange={e => setDbForm({ ...dbForm, port: e.target.value })}
                />
              </InputGroup>
            </FormRow>

            <InputGroup>
              <label>Database Name</label>
              <input
                type="text"
                placeholder="e.g. dashflow_db"
                required
                value={dbForm.databaseName}
                onChange={e => setDbForm({ ...dbForm, databaseName: e.target.value })}
              />
            </InputGroup>

            <FormRow>
              <InputGroup>
                <label>Username</label>
                <input
                  type="text"
                  placeholder="db_user"
                  required
                  value={dbForm.username}
                  onChange={e => setDbForm({ ...dbForm, username: e.target.value })}
                />
              </InputGroup>
              <InputGroup>
                <label>Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  required
                  value={dbForm.password}
                  onChange={e => setDbForm({ ...dbForm, password: e.target.value })}
                />
              </InputGroup>
            </FormRow>

            <ButtonGroup>
              <Button type="button" onClick={() => console.log("Test Connection")}>Test Connection</Button>
              <Button primary type="submit">Connect Data</Button>
            </ButtonGroup>
          </FormContainer>
        )}
      </ContentWrapper>
    </Container>
  );
};

export default CreateOptions;
