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
    category: "User Management & Roles",
    icon: <SecurityIcon />,
    questions: [
      { q: "What user roles exist in MotoDash?", a: "MotoDash has three roles: Owner, Manager, and Member. The Owner manages the entire organisation and all showrooms. Managers oversee their assigned showroom and its members. Members can upload data and view dashboards within their showroom." },
      { q: "How do I invite a new member to my showroom?", a: "Owners and Managers can invite users from the Org Console. Go to the Members tab, click 'Invite Member', enter their email and assign them a role. They will receive an invite link to complete registration." },
      { q: "Can a member belong to multiple showrooms?", a: "No. Each user is assigned to exactly one showroom. If they need access to another showroom, a new account must be created for that showroom." },
      { q: "How does the Owner differ from a Manager?", a: "The Owner has full access across all showrooms in the organisation, including billing and Org Console settings. Managers are scoped to a single showroom and cannot manage other showrooms or org-level settings." },
      { q: "How do I remove a member from my organisation?", a: "In the Org Console under the Members tab, find the user and click the delete icon. This deactivates their account and revokes access immediately." },
      { q: "What happens to data when a member is removed?", a: "Datasets and dashboards uploaded by a removed member remain in the system and are still accessible by Managers and Owners." }
    ]
  },
  {
    category: "Data Upload & Datasets",
    icon: <StorageIcon />,
    questions: [
      { q: "How do I upload sales data for my showroom?", a: "Click 'Create' in the sidebar, then select 'Upload CSV'. Choose the CSV file from your computer — MotoDash will automatically parse and store it linked to your showroom." },
      { q: "What file formats are supported for upload?", a: "Currently, MotoDash supports CSV file uploads. Ensure your file has a clear header row, as column names are used to generate insights and chart labels." },
      { q: "Can I upload multiple datasets for the same showroom?", a: "Yes. Each upload creates a separate dataset. You can manage all your showroom's datasets from the Datasets section, where you can view, rename, or delete them." },
      { q: "What happens after I upload a CSV?", a: "MotoDash saves the dataset and triggers the AI analysis pipeline. Within a short time, your dataset will be marked as 'Analyzed' and a full dashboard of insights will be available." },
      { q: "Is there a size limit on CSV uploads?", a: "Files should ideally be under 50 MB for best performance. Very large files may take longer to process through the AI analysis pipeline." },
      { q: "How do I delete a dataset I no longer need?", a: "Go to the Datasets section, find the dataset card, and click the delete icon. Deleting a dataset also removes its associated AI-generated dashboard." }
    ]
  },
  {
    category: "AI-Powered Dashboards",
    icon: <DashboardIcon />,
    questions: [
      { q: "How does MotoDash generate dashboards automatically?", a: "After you upload a CSV, our AI analyses the data columns, detects patterns, and generates a tailored dashboard with the most relevant charts — including sales trends, top performers, inventory breakdowns, and more." },
      { q: "What types of charts are included in auto-generated dashboards?", a: "The AI generates bar charts, line charts, pie charts, scatter plots, and metric summary cards based on what best represents your data. The selection adapts to your specific dataset." },
      { q: "Can I view a dashboard from a previous upload?", a: "Yes. Go to Dashboards in the sidebar to see all analyzed datasets. Clicking any entry opens its full dashboard view with all AI-generated charts." },
      { q: "Can an Owner view dashboards from all showrooms?", a: "Yes. Owners can access dashboards from any showroom either via the Org Console's Showrooms tab or directly from the Owner Home page by clicking a showroom card." },
      { q: "How long does AI analysis take after upload?", a: "Analysis typically completes within a few seconds to a minute depending on file size. The dataset status will change from 'Pending' to 'Analyzed' once ready." },
      { q: "Will my dashboard update if I re-upload data?", a: "Re-uploading creates a new dataset and its own dashboard. Each dataset maintains its own independent AI analysis and dashboard." }
    ]
  },
  {
    category: "AI Insights & Analysis",
    icon: <InsightsIcon />,
    questions: [
      { q: "What kind of insights does the AI provide?", a: "The AI summarises key findings from your data — identifying top-selling models, peak sales periods, underperforming inventory, regional trends, and statistical outliers relevant to automotive showroom operations." },
      { q: "How does the AI know what insights are relevant?", a: "The AI reads your column names and data types to understand the context (e.g. sales figures, dates, vehicle models) and generates insights specific to automotive dealership and showroom data." },
      { q: "Can I see a written summary of my data?", a: "Yes. Each analyzed dashboard includes a natural language summary generated by the AI that highlights the most important takeaways from your dataset." },
      { q: "Does the AI learn from my data over time?", a: "The AI uses pre-trained models that adapt to the structure and context of each uploaded dataset. Your data is never used to train or influence results for other organisations." },
      { q: "What if the AI-generated charts don't look right?", a: "If a chart seems incorrect, it may be due to inconsistent column naming or data formatting in your CSV. Ensure date columns are formatted consistently and numeric columns contain no text values." },
      { q: "Are the AI insights suitable for business decisions?", a: "Yes, insights are designed to support data-driven decisions. However, we recommend validating critical findings against your own records before acting on them." }
    ]
  },
  {
    category: "Organisation & Showroom Management",
    icon: <ViewQuiltIcon />,
    questions: [
      { q: "How do I create a new showroom?", a: "Owners can create showrooms from the Org Console under the Showrooms tab. Click 'Add Showroom', provide a name and location, and it will be immediately available for member assignment." },
      { q: "How do I view all showrooms at a glance?", a: "The Owner Home page (visible only to Owners) displays all showrooms in your organisation with KPIs including member count, dataset count, total data rows, and last upload date." },
      { q: "Can I click a showroom to see its dashboards?", a: "Yes. On the Owner Home page, clicking any showroom card slides open a panel showing all analyzed datasets for that showroom. You can open any dashboard directly from there." },
      { q: "How do I rename or edit a showroom's details?", a: "In the Org Console's Showrooms tab, click the edit (pencil) icon on a showroom card to update its name or location." },
      { q: "What happens if I delete a showroom?", a: "Deleting a showroom removes it and all associated member assignments. Datasets linked to that showroom will also be removed. This action is irreversible — proceed with caution." },
      { q: "Can members see other showrooms in their organisation?", a: "No. Members can only see data and dashboards within their own assigned showroom. Cross-showroom visibility is restricted to Owners." }
    ]
  },
  {
    category: "Navigation & Account",
    icon: <EditIcon />,
    questions: [
      { q: "Where can I view and edit my profile?", a: "Click 'Profile' in the bottom of the sidebar. Your profile page shows your name, role, organisation, and showroom. You can update your first and last name from this page." },
      { q: "How do I log out?", a: "Click 'Logout' at the very bottom of the left sidebar. This clears your session and returns you to the login page." },
      { q: "What does the Home page show for regular members?", a: "The Home page shows your recent dashboard activity, quick-access cards to your latest datasets, and an overview of your showroom's uploads." },
      { q: "How do I navigate to a specific dashboard?", a: "Use the 'Dashboards' link in the sidebar to see a list of all your analyzed datasets. Click any entry to open its full AI-generated dashboard." },
      { q: "What is the Org Console and who can access it?", a: "The Org Console is available to Owners and Managers. It provides tools to manage showrooms, invite and remove members, and oversee the organisation's data activity." },
      { q: "I'm an Owner — why do I see a different Home page?", a: "Owners see a specialised Home page showing an org-wide overview with KPIs and showroom cards. This gives a bird's-eye view of the entire organisation rather than a single showroom." }
    ]
  },
  {
    category: "Reporting & Exporting",
    icon: <AssessmentIcon />,
    questions: [
      { q: "Can I export my dashboard charts?", a: "Each chart on the dashboard can be individually exported. Use the export option on each chart to download it as an image or data file." },
      { q: "Can I share a dashboard with someone outside MotoDash?", a: "Currently dashboards are accessible only to authenticated users within your organisation. Sharing outside requires the recipient to have a user account." },
      { q: "Can I print a dashboard report?", a: "Yes. Use your browser's print function (Ctrl+P or Cmd+P) while viewing a dashboard to print or save it as a PDF." },
      { q: "Does MotoDash keep a history of all uploaded datasets?", a: "Yes. All uploaded datasets are stored and visible in your Datasets section unless manually deleted. You can return to any previous dataset's dashboard at any time." },
      { q: "Can I compare data across two different datasets?", a: "Side-by-side comparison within a single view is not currently supported. Each dataset has its own dashboard, but you can open multiple browser tabs to compare them." },
      { q: "How do I know when a new dataset has been analyzed?", a: "The dataset status in your Datasets list will update from 'Processing' to 'Analyzed'. Refresh the page if the status doesn't update automatically." }
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
