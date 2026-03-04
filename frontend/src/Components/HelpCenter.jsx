import React, { useState } from 'react';
import styled from 'styled-components';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SendIcon from '@mui/icons-material/Send';
import Typography from '@mui/material/Typography';
import SearchIcon from '@mui/icons-material/Search';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import SecurityIcon from '@mui/icons-material/Security';
import StorageIcon from '@mui/icons-material/Storage';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InsightsIcon from '@mui/icons-material/Insights';
import ViewQuiltIcon from '@mui/icons-material/ViewQuilt';
import EditIcon from '@mui/icons-material/Edit';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ContactSupportIcon from '@mui/icons-material/ContactSupport';
import { submitSupportTicket } from '../services/api';

// --- Styled Components ---

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background-color: #f8f9fa; 
  font-family: 'Inter', sans-serif;
  overflow-y: auto;
`;

// Landing Page Styles
const HeroSection = styled.div`
  background-color: #3457B2;
  color: white;
  padding: 60px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

const HeroTitle = styled.h1`
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 10px;
`;

const HeroSubtitle = styled.p`
  font-size: 16px;
  opacity: 0.9;
  margin-bottom: 30px;
`;

const ContentContainer = styled.div`
  max-width: 1000px;
  width: 100%;
  margin: 0 auto;
  padding: 40px 20px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 50px;
`;

const Card = styled.div`
  background: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  border: 1px solid #eee;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0,0,0,0.1);
    border-color: #3457B2;
  }
`;

const CardIconWrapper = styled.div`
  background-color: #eff6ff;
  color: #3457B2;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 15px;
`;

const CardTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #1C2434;
  margin-bottom: 5px;
`;

const SectionHeader = styled.h2`
  font-size: 22px;
  font-weight: 600;
  color: #1C2434;
  margin-bottom: 20px;
`;

const CommonQuestions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const QuestionLink = styled.div`
  background: white;
  padding: 15px 20px;
  border-radius: 8px;
  border: 1px solid #eee;
  color: #3457B2;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #eff6ff;
  }
`;

// Detail Page Styles
const TopNav = styled.div`
  background: white;
  border-bottom: 1px solid #e0e0e0;
  padding: 20px 25px;
  display: flex;
  flex-direction: column;
  gap: 30px;
  position: sticky;
  top: 0;
  z-index: 10;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #555;
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  padding: 0;
  font-size: 18px;
  width: fit-content;
  
  &:hover {
    color: #3457B2;
  }
`;

const NavList = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  width: 100%;
`;

const NavItem = styled.div`
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  color: ${props => props.active ? 'white' : '#555'};
  background: ${props => props.active ? '#3457B2' : '#f0f2f5'};
  transition: all 0.2s;
  white-space: nowrap;

  &:hover {
    background: ${props => props.active ? '#2a458c' : '#e4e6eb'};
  }
`;

const DetailContent = styled.div`
  max-width: 800px;
  width: 100%;
  margin: 0 auto;
  padding: 40px 20px;
`;

const DetailTitle = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: #1C2434;
  margin-bottom: 30px;
`;

// Form Styles (Reused)
const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 24px;
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: #333;
`;

const Input = styled.input`
  padding: 10px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;

  &:focus {
    border-color: #3457B2;
  }
`;

const Select = styled.select`
  padding: 10px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  outline: none;
  background-color: white;
  transition: border-color 0.2s;

  &:focus {
    border-color: #3457B2;
  }
`;

const TextArea = styled.textarea`
  padding: 10px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  outline: none;
  resize: vertical;
  min-height: 120px;
  font-family: inherit;
  transition: border-color 0.2s;

  &:focus {
    border-color: #3457B2;
  }
`;

const SubmitButton = styled.button`
  background-color: #3457B2;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: background-color 0.2s;
  width: fit-content;

  &:hover {
    background-color: #2a458c;
  }
`;

// --- FAQ Data ---

const faqData = [
  {
    category: "User Management & Security",
    icon: <SecurityIcon />,
    questions: [
      { q: "How do I reset my password?", a: "You can request a password reset from the login page. Follow the link sent to your email to set a new password." },
      { q: "How do I manage user roles?", a: "Admins can manage user roles (Admin, Editor, Viewer) in the User Management settings." },
      { q: "Is my data secure?", a: "Yes, we use industry-standard encryption and role-based access control to protect your data." },
      { q: "Can I restrict access to specific dashboards?", a: "Yes, you can set permissions for individual dashboards to control who can view or edit them." },
      { q: "How does the signup process work?", a: "New users can sign up via the registration form. Admins can also invite users to their organization." },
      { q: "What are organization-level permissions?", a: "These permissions apply across the entire organization, managed by the organization owner." }
    ]
  },
  {
    category: "Data Ingestion & Connections",
    icon: <StorageIcon />,
    questions: [
      { q: "How do I upload a CSV file?", a: "Go to the 'Create' page, select 'Upload CSV', and drag & drop your file or browse to select it." },
      { q: "How do I connect to a MongoDB database?", a: "In the 'Connect Database' section, choose MongoDB and provide your connection string and credentials." },
      { q: "What data formats are supported?", a: "We currently support CSV, JSON, and direct connections to SQL (MySQL, PostgreSQL) and NoSQL (MongoDB) databases." },
      { q: "How does data validation work?", a: "Uploaded data is automatically validated against schema rules to identify type mismatches or missing values." },
      { q: "Can I schedule data refreshes?", a: "Yes, for database connections, you can set up a schedule to automatically refresh the data." },
      { q: "How do I handle connection errors?", a: "Check your credentials and firewall settings. If issues persist, contact support via this Help Center." }
    ]
  },
  {
    category: "Dashboard Generation",
    icon: <DashboardIcon />,
    questions: [
      { q: "How do I create a new dashboard?", a: "Click 'Create New' on the dashboard, select your dataset, and use the AI or manual tools to build charts." },
      { q: "How does the AI dashboard generation work?", a: "Our AI analyzes your data schema and recommends the best visualizations to highlight key insights." },
      { q: "Can I customize AI-generated dashboards?", a: "Absolutely. You can edit, resize, and rearrange any widget created by the AI." },
      { q: "How do I ensure consistency in my dashboards?", a: "Use the built-in templates and style guides to maintain a consistent look and feel." },
      { q: "What chart types are available?", a: "We support bar, line, pie, scatter, area charts, tables, and metric cards." },
      { q: "How do I delete a dashboard?", a: "Go to the dashboard settings and select 'Delete'. Warning: This action cannot be undone." }
    ]
  },
  {
    category: "AI Insights & Chatbot",
    icon: <InsightsIcon />,
    questions: [
      { q: "How do I ask questions to the chatbot?", a: "Use the natural language chat interface to ask questions about your data, like 'Show me sales trend'." },
      { q: "What kind of insights can the AI provide?", a: "The AI provides trends, anomaly detection, correlation analysis, and summary statistics." },
      { q: "How does the recommendation engine work?", a: "It looks at data patterns to suggest charts and filters that are most relevant to your analysis." },
      { q: "Can I save chat results to a dashboard?", a: "Yes, you can pin any chart or answer generated by the chatbot directly to your dashboard." },
      { q: "Does the AI learn from my data?", a: "The AI models are pre-trained but adapt to your schema context. We do not use your data for training public models." },
      { q: "How accurate are the AI predictions?", a: "Predictions are based on statistical models. While generally accurate, they should be used as guidance." }
    ]
  },
  {
    category: "Interaction & Layout",
    icon: <ViewQuiltIcon />,
    questions: [
      { q: "How do I rearrange charts on the dashboard?", a: "Simply drag and drop charts to your desired position using the drag handle." },
      { q: "How do I apply filters?", a: "Use the filter panel on the right to apply global filters to all charts on the dashboard." },
      { q: "Can I use pre-built templates?", a: "Yes, we offer a library of industry-specific templates to get you started quickly." },
      { q: "How do I resize widgets?", a: "Click and drag the bottom-right corner of any widget to resize it." },
      { q: "How do I save my layout changes?", a: "Layout changes are saved automatically as you make them." },
      { q: "Can I create drill-down views?", a: "Yes, you can configure charts to drill down into more detailed data upon interaction." }
    ]
  },
  {
    category: "Data Editing & Management",
    icon: <EditIcon />,
    questions: [
      { q: "How do I edit data directly?", a: "Use the Data Editor view to modify cell values. Changes are logged for audit purposes." },
      { q: "How do I add or delete columns?", a: "You can add calculated columns or remove existing ones via the Column Manager." },
      { q: "How do I search and filter my dataset?", a: "The Data View provides a powerful search bar and column-specific filters." },
      { q: "Can I undo data changes?", a: "Yes, simple edits can be undone. Major schema changes may require restoring from a backup." },
      { q: "How do I create calculated fields?", a: "Use the formula editor to create new fields based on existing data." },
      { q: "What happens if I delete a row?", a: "The row is soft-deleted initially and can be recovered within 30 days." }
    ]
  },
  {
    category: "Reporting & Exporting",
    icon: <AssessmentIcon />,
    questions: [
      { q: "How do I export a dashboard as PDF?", a: "Click the 'Export' button and select PDF. You can customize the layout before downloading." },
      { q: "Can I export raw data as CSV?", a: "Yes, each chart allows you to export its underlying data as a CSV file." },
      { q: "What does the Usage Activity Report show?", a: "It shows who viewed your dashboards, when, and what interactions they performed." },
      { q: "How do I view the Data Change Report?", a: "Admins can access the Audit Log to see a history of all data modifications." },
      { q: "Can I schedule email reports?", a: "Yes, you can schedule automated email delivery of dashboard snapshots." },
      { q: "Where can I find the Dashboard Summary Report?", a: "It is available in the 'Reports' tab for each dashboard." }
    ]
  }
];

// --- Main Component ---

const HelpCenter = () => {
  // view: 'landing' or 'detail'
  const [view, setView] = useState('landing');
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [isContactForm, setIsContactForm] = useState(false);

  // Form State
  const [formData, setFormData] = useState({ name: '', email: '', type: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleCategoryClick = (index) => {
    setSelectedCategory(index);
    setIsContactForm(false);
    setView('detail');
  };

  const handleContactClick = () => {
    setIsContactForm(true);
    setView('detail');
  };

  const handleBackClick = () => {
    setView('landing');
  };

  const handleNavClick = (index) => {
    setSelectedCategory(index);
    setIsContactForm(false);
  };

  const handleNavContactClick = () => {
    setIsContactForm(true);
  };

  const handleSupportSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.type || !formData.subject || !formData.message) {
      setSubmitStatus({ type: 'error', text: 'Please fill in all fields.' });
      return;
    }
    setIsSubmitting(true);
    setSubmitStatus(null);
    try {
      const res = await submitSupportTicket(formData);
      if (res.success) {
        setSubmitStatus({ type: 'success', text: res.message });
        setFormData({ name: '', email: '', type: '', subject: '', message: '' });
      }
    } catch (err) {
      setSubmitStatus({ type: 'error', text: err.message || 'Failed to submit ticket.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container>
      {view === 'landing' ? (
        <>
          <HeroSection>
            <HelpOutlineIcon sx={{ fontSize: 64, marginBottom: 2 }} />
            <HeroTitle>How can we help you today?</HeroTitle>
            <HeroSubtitle>Explore our guides and FAQs to get the most out of your dashboard.</HeroSubtitle>
          </HeroSection>

          <ContentContainer>
            <SectionHeader>Browse by Category</SectionHeader>
            <Grid>
              {faqData.map((section, index) => (
                <Card key={index} onClick={() => handleCategoryClick(index)}>
                  <CardIconWrapper>
                    {section.icon}
                  </CardIconWrapper>
                  <CardTitle>{section.category}</CardTitle>
                </Card>
              ))}
              <Card onClick={handleContactClick}>
                <CardIconWrapper>
                  <ContactSupportIcon />
                </CardIconWrapper>
                <CardTitle>Contact Support</CardTitle>
              </Card>
            </Grid>

            <SectionHeader>Common Questions</SectionHeader>
            <CommonQuestions>
              <QuestionLink onClick={() => { setSelectedCategory(0); setView('detail'); }}>
                How do I reset my password?
              </QuestionLink>
              <QuestionLink onClick={() => { setSelectedCategory(1); setView('detail'); }}>
                How do I upload a CSV file?
              </QuestionLink>
              <QuestionLink onClick={() => { setSelectedCategory(2); setView('detail'); }}>
                How do I create a new dashboard?
              </QuestionLink>
            </CommonQuestions>
          </ContentContainer>
        </>
      ) : (
        <>
          <TopNav>
            <BackButton onClick={handleBackClick}>
              <ArrowBackIcon /> Back
            </BackButton>
            <NavList>
              {faqData.map((section, index) => (
                <NavItem
                  key={index}
                  active={!isContactForm && selectedCategory === index}
                  onClick={() => handleNavClick(index)}
                >
                  {section.category}
                </NavItem>
              ))}
              <NavItem
                active={isContactForm}
                onClick={handleNavContactClick}
              >
                Contact Support
              </NavItem>
            </NavList>
          </TopNav>

          <DetailContent>
            {isContactForm ? (
              <>
                <DetailTitle>Contact Support</DetailTitle>

                {submitStatus && (
                  <div style={{
                    padding: '12px 16px',
                    borderRadius: '6px',
                    marginBottom: '20px',
                    backgroundColor: submitStatus.type === 'success' ? '#f0fdf4' : '#fef2f2',
                    color: submitStatus.type === 'success' ? '#16a34a' : '#ef4444',
                    border: `1px solid ${submitStatus.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
                    fontWeight: 500
                  }}>
                    {submitStatus.text}
                  </div>
                )}

                <Form onSubmit={handleSupportSubmit}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <InputGroup>
                      <Label>Name</Label>
                      <Input type="text" placeholder="Your name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} disabled={isSubmitting} />
                    </InputGroup>
                    <InputGroup>
                      <Label>Email</Label>
                      <Input type="email" placeholder="your@email.com" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} disabled={isSubmitting} />
                    </InputGroup>
                  </div>

                  <InputGroup>
                    <Label>Type of Mail</Label>
                    <Select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} disabled={isSubmitting}>
                      <option value="" disabled>Select an option</option>
                      <option value="bug">Bug Report</option>
                      <option value="feature">Feature Request</option>
                      <option value="billing">Billing Inquiry</option>
                      <option value="general">General Inquiry</option>
                    </Select>
                  </InputGroup>

                  <InputGroup>
                    <Label>Subject</Label>
                    <Input type="text" placeholder="What can we help you with?" value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })} disabled={isSubmitting} />
                  </InputGroup>

                  <InputGroup>
                    <Label>Message</Label>
                    <TextArea placeholder="Describe your issue or question in detail..." value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })} disabled={isSubmitting} />
                  </InputGroup>

                  <SubmitButton type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Sending...' : 'Send Message'} <SendIcon sx={{ fontSize: 16 }} />
                  </SubmitButton>
                </Form>
              </>
            ) : (
              <>
                <DetailTitle>{faqData[selectedCategory].category}</DetailTitle>
                {faqData[selectedCategory].questions.map((faq, index) => (
                  <Accordion key={`${selectedCategory}-${index}`} disableGutters elevation={0} sx={{
                    '&:before': { display: 'none' },
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px !important',
                    marginBottom: '15px',
                    '&:last-child': { marginBottom: '0' }
                  }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#999' }} />}>
                      <Typography sx={{ fontWeight: 600, color: '#1C2434', fontSize: '15px' }}>{faq.q}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography sx={{ color: '#555', fontSize: '14px', lineHeight: 1.6 }}>{faq.a}</Typography>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </>
            )}
          </DetailContent>
        </>
      )}
    </Container>
  );
};

export default HelpCenter;
