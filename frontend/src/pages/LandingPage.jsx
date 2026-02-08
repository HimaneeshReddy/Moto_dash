import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { Download, Play, ArrowRight, Mail, Phone, MapPin, CheckCircle, Zap, Shield, TrendingUp, Target, Award } from 'lucide-react';
import logo from '../Images/logo.png';

const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-50px); }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;

const PageContainer = styled.div`
  scroll-behavior: smooth;
  overflow-x: hidden;
`;

const HeroContainer = styled.section`
  position: relative;
  height: 110vh;
  width: 100vw;
  background-color: #f0f7ff;
  font-family: 'Inter', -apple-system, sans-serif;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const BlueBackgroundShape = styled.div`
  position: absolute;
  right: -5%;
  top: 0;
  height: 100%;
  width: 45%;
  background-color: #3b82f6;
  border-bottom-left-radius: 350px;
  z-index: 0;
  @media (max-width: 1024px) { display: none; }
`;

const Navbar = styled.nav`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 80px;
  height: 90px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);

  @media (max-width: 768px) {
    padding: 0 30px;
    height: 70px;
  }
`;

const LogoWrapper = styled.div`
  display: flex;
  align-items: center;
  font-size: 24px;
  font-weight: 800;
  color: #3b82f6;
`;

const NavLinks = styled.div`
  display: flex;
  gap: 40px;

  @media (max-width: 900px) {
    gap: 20px;
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

const NavLink = styled.a`
  text-decoration: none;
  color: ${props => props.active ? '#3b82f6' : '#64748b'};
  font-weight: ${props => props.active ? '700' : '600'};
  font-size: 16px;
  transition: all 0.3s;
  position: relative;
  padding: 8px 0;
  cursor: pointer;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: ${props => props.active ? '100%' : '0'};
    height: 3px;
    background: #3b82f6;
    border-radius: 2px;
    transition: width 0.3s ease;
  }

  &:hover {
    color: #3b82f6;
    &::after {
      width: 100%;
    }
  }
`;

const ContentWrapper = styled.div`
  position: relative;
  z-index: 5;
  display: flex;
  flex: 1;
  padding: 0 80px;
  align-items: center;
  justify-content: space-between;
  margin-top: 90px;

  @media (max-width: 1024px) {
    flex-direction: column;
    padding: 20px 30px;
    text-align: center;
    justify-content: center;
  }
`;

const LeftSection = styled.div`
  flex: 1;
  max-width: 550px;
  animation: ${fadeIn} 0.8s ease-out forwards;
`;

const Slogan = styled.h1`
  font-size: clamp(40px, 5vw, 72px);
  font-weight: 800;
  color: #0f172a;
  line-height: 1.1;
  margin-bottom: 20px;

  span.depth {
    position: relative;
    display: inline-block;
    &::after {
      content: '';
      position: absolute;
      left: 0;
      bottom: 6px;
      width: 100%;
      height: 12px;
      background: rgba(59, 130, 246, 0.15);
      z-index: -1;
    }
    border-bottom: 6px solid #0f172a;
    padding-bottom: 2px;
  }
`;

const Description = styled.p`
  font-size: 18px;
  color: #475569;
  line-height: 1.6;
  max-width: 480px;
  margin-bottom: 35px;
  @media (max-width: 1024px) { margin-left: auto; margin-right: auto; }
`;

const ActionGroup = styled.div`
  display: flex;
  gap: 15px;
  @media (max-width: 1024px) { justify-content: center; }
  @media (max-width: 600px) { flex-direction: column; }
`;

const PrimaryBtn = styled.button`
  background: #3b82f6;
  color: white;
  padding: 16px 30px;
  border-radius: 14px;
  border: none;
  font-weight: 700;
  font-size: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  box-shadow: 0 10px 25px rgba(59, 130, 246, 0.2);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-3px);
    background: #2563eb;
    svg { transform: translateX(3px); }
  }
  svg { transition: transform 0.3s; }
`;

const SecondaryBtn = styled(PrimaryBtn)`
  background: #dbeafe;
  color: #3b82f6;
  box-shadow: none;
  &:hover { background: #bfdbfe; transform: translateY(-3px); }
`;

const RightSection = styled.div`
  flex: 1;
  display: flex;
  gap: 40px;
  justify-content: flex-end;
  height: 80%;
  align-items: center;

  @media (max-width: 1024px) {
    width: 100%;
    justify-content: center;
    margin-top: 30px;
    height: auto;
  }
`;

const CardColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  animation: ${float} ${props => props.speed || '6s'} ease-in-out infinite;
  margin-top: ${props => props.top || '0px'};
`;

const Card = styled.div`
  width: clamp(180px, 18vw, 250px);
  height: ${props => props.tall ? 'clamp(220px, 22vw, 320px)' : 'clamp(180px, 18vw, 250px)'};
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 28px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.12);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 18px;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const Section = styled.section`
  min-height: 100vh;
  padding: 120px 80px 80px;
  background: ${props => props.bgTheme === 'light' ? '#ffffff' : '#f8fafc'};

  @media (max-width: 768px) {
    padding: 100px 30px 60px;
  }
`;

const SectionTitle = styled.h2`
  font-size: clamp(36px, 4vw, 56px);
  font-weight: 800;
  color: #0f172a;
  text-align: center;
  margin-bottom: 20px;

  span {
    color: #3b82f6;
  }
`;

const SectionSubtitle = styled.p`
  font-size: 18px;
  color: #64748b;
  text-align: center;
  max-width: 700px;
  margin: 0 auto 60px;
  line-height: 1.6;
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 40px;
  max-width: 1200px;
  margin: 0 auto;
`;

const ProductCard = styled.div`
  background: white;
  padding: 40px;
  border-radius: 24px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 40px rgba(59, 130, 246, 0.15);
  }
`;

const IconWrapper = styled.div`
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;

  svg {
    color: white;
  }
`;

const CardTitle = styled.h3`
  font-size: 24px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 12px;
`;

const CardDescription = styled.p`
  font-size: 16px;
  color: #64748b;
  line-height: 1.6;
`;

const FeaturesList = styled.div`
  max-width: 900px;
  margin: 0 auto;
  display: grid;
  gap: 20px;
`;

const FeatureItem = styled.div`
  background: white;
  padding: 30px;
  border-radius: 20px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.06);
  display: flex;
  align-items: flex-start;
  gap: 20px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateX(10px);
    box-shadow: 0 12px 32px rgba(59, 130, 246, 0.12);
  }
`;

const FeatureIconWrapper = styled.div`
  min-width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    color: white;
  }
`;

const FeatureContent = styled.div`
  flex: 1;
`;

const FeatureTitle = styled.h4`
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 8px;
`;

const FeatureDescription = styled.p`
  font-size: 16px;
  color: #64748b;
  line-height: 1.6;
`;

// UPDATED: Forced 2x2 Grid Layout
const TeamPhotosContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  display: grid;
  // This creates strictly 2 equal columns
  grid-template-columns: repeat(2, 1fr); 
  gap: 30px;

  @media (max-width: 600px) {
    // Stack to 1 column on mobile devices
    grid-template-columns: 1fr;
  }
`;

const TeamPhoto = styled.div`
  width: 100%;
  height: 300px;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 15px 35px rgba(0,0,0,0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 25px 50px rgba(59, 130, 246, 0.2);
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const ContactGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 30px;
  max-width: 1000px;
  margin: 0 auto 60px;
`;

const ContactCard = styled.div`
  background: white;
  padding: 30px;
  border-radius: 20px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.06);
  text-align: center;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 35px rgba(59, 130, 246, 0.2);
  }
`;

const ContactIconWrapper = styled.div`
  width: 50px;
  height: 50px;
  background: #dbeafe;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;

  svg {
    color: #3b82f6;
  }
`;

const ContactTitle = styled.h4`
  font-size: 18px;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 8px;
`;

const ContactDetail = styled.p`
  font-size: 15px;
  color: #64748b;
`;

const DashFlowHero = () => {
  const [activeSection, setActiveSection] = useState('dashboard');

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['dashboard', 'product', 'features', 'about', 'contact'];
      const scrollPosition = window.scrollY + 150;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offsetTop = element.offsetTop - 90;
      window.scrollTo({ top: offsetTop, behavior: 'smooth' });
    }
  };

  return (
    <PageContainer>
      <Navbar>
        <LogoWrapper>
          <img src={logo} alt="DashFlow Logo" style={{ height: '200px' }} />
        </LogoWrapper>

        <NavLinks>
          <NavLink
            active={activeSection === 'dashboard'}
            onClick={() => scrollToSection('dashboard')}
          >
            Dashboard
          </NavLink>
          <NavLink
            active={activeSection === 'product'}
            onClick={() => scrollToSection('product')}
          >
            Product
          </NavLink>
          <NavLink
            active={activeSection === 'features'}
            onClick={() => scrollToSection('features')}
          >
            Features
          </NavLink>
          <NavLink
            active={activeSection === 'about'}
            onClick={() => scrollToSection('about')}
          >
            About Us
          </NavLink>
          <NavLink
            active={activeSection === 'contact'}
            onClick={() => scrollToSection('contact')}
          >
            Contact Us
          </NavLink>
        </NavLinks>
      </Navbar>

      <HeroContainer id="dashboard">
        <BlueBackgroundShape />

        <ContentWrapper>
          <LeftSection>
            <Slogan>
              Visualize. <br />
              Analyze.<span className="depth">Decide.</span>
            </Slogan>
            <Description>
              One upload, endless insights DashFlow reads your data,
              understands it, and instantly creates the perfect dashboard.
            </Description>

            <ActionGroup>
              <PrimaryBtn>
                <Download size={18} />
                Explore Now
                <ArrowRight size={18} />
              </PrimaryBtn>
              <SecondaryBtn>
                <Play size={18} fill="currentColor" />
                See in Action
              </SecondaryBtn>
            </ActionGroup>
          </LeftSection>

          <RightSection>
            <CardColumn speed="7s">
              <Card>Dashboard 1</Card>
            </CardColumn>

            <CardColumn speed="9s" top="30px">
              <Card tall>Analytics</Card>
              <Card>Reports</Card>
            </CardColumn>
          </RightSection>
        </ContentWrapper>
      </HeroContainer>

      <Section id="product" bgTheme="light">
        <SectionTitle>
          Our <span>Product</span>
        </SectionTitle>
        <SectionSubtitle>
          Discover the power of intelligent data visualization with DashFlow's innovative approach to analytics.
        </SectionSubtitle>

        <ProductGrid>
          <ProductCard>
            <IconWrapper>
              <Target size={28} />
            </IconWrapper>
            <CardTitle>Our Mission</CardTitle>
            <CardDescription>
              To democratize data analytics by making powerful insights accessible to businesses
              of all sizes. We believe everyone should be able to make data-driven decisions.
            </CardDescription>
          </ProductCard>

          <ProductCard>
            <IconWrapper>
              <Award size={28} />
            </IconWrapper>
            <CardTitle>Our Values</CardTitle>
            <CardDescription>
              Innovation, simplicity, and reliability drive everything we do. We're committed
              to building tools that are powerful yet easy to use, with your success in mind.
            </CardDescription>
          </ProductCard>
        </ProductGrid>
      </Section>

      <Section id="features" bgTheme="dark">
        <SectionTitle>
          Key <span>Features</span>
        </SectionTitle>
        <SectionSubtitle>
          Everything you need to transform your data into actionable insights.
        </SectionSubtitle>

        <FeaturesList>
          <FeatureItem>
            <FeatureIconWrapper>
              <CheckCircle size={24} />
            </FeatureIconWrapper>
            <FeatureContent>
              <FeatureTitle>Instant Dashboard Generation</FeatureTitle>
              <FeatureDescription>
                Upload your data and watch as DashFlow automatically creates beautiful, insightful dashboards in seconds.
              </FeatureDescription>
            </FeatureContent>
          </FeatureItem>

          <FeatureItem>
            <FeatureIconWrapper>
              <Zap size={24} />
            </FeatureIconWrapper>
            <FeatureContent>
              <FeatureTitle>Smart Data Recognition</FeatureTitle>
              <FeatureDescription>
                Our AI understands your data structure and automatically suggests the most relevant visualizations.
              </FeatureDescription>
            </FeatureContent>
          </FeatureItem>

          <FeatureItem>
            <FeatureIconWrapper>
              <TrendingUp size={24} />
            </FeatureIconWrapper>
            <FeatureContent>
              <FeatureTitle>Real-Time Analytics</FeatureTitle>
              <FeatureDescription>
                Monitor your metrics in real-time with live data updates and dynamic visualizations.
              </FeatureDescription>
            </FeatureContent>
          </FeatureItem>

          <FeatureItem>
            <FeatureIconWrapper>
              <Shield size={24} />
            </FeatureIconWrapper>
            <FeatureContent>
              <FeatureTitle>Enterprise-Grade Security</FeatureTitle>
              <FeatureDescription>
                Your data is protected with bank-level encryption and industry-leading security protocols.
              </FeatureDescription>
            </FeatureContent>
          </FeatureItem>
        </FeaturesList>
      </Section>

      <Section id="about" bgTheme="light">
        <SectionTitle>
          Our <span>Team</span>
        </SectionTitle>
        <SectionSubtitle>
          Meet the passionate team behind DashFlow, working from amazing locations around the world.
        </SectionSubtitle>

        {/* 2x2 Grid Layout for 4 Images */}
        <TeamPhotosContainer>
          <TeamPhoto>
            <img
              src="https://images.pexels.com/photos/380769/pexels-photo-380769.jpeg?auto=compress&cs=tinysrgb&w=800"
              alt="Office space 1"
            />
          </TeamPhoto>
          <TeamPhoto>
            <img
              src="https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=800"
              alt="Office space 2"
            />
          </TeamPhoto>
          <TeamPhoto>
            <img
              src="https://images.pexels.com/photos/1181396/pexels-photo-1181396.jpeg?auto=compress&cs=tinysrgb&w=800"
              alt="Office space 3"
            />
          </TeamPhoto>
          <TeamPhoto>
            <img
              src="https://images.pexels.com/photos/1181622/pexels-photo-1181622.jpeg?auto=compress&cs=tinysrgb&w=800"
              alt="Office space 4"
            />
          </TeamPhoto>
        </TeamPhotosContainer>
      </Section>

      <Section id="contact" bgTheme="dark">
        <SectionTitle>
          Get In <span>Touch</span>
        </SectionTitle>
        <SectionSubtitle>
          Have questions or want to learn more? We'd love to hear from you.
          Reach out and let's start a conversation.
        </SectionSubtitle>

        <ContactGrid>
          <ContactCard>
            <ContactIconWrapper>
              <Mail size={24} />
            </ContactIconWrapper>
            <ContactTitle>Email Us</ContactTitle>
            <ContactDetail>contact@dashflow.com</ContactDetail>
          </ContactCard>

          <ContactCard>
            <ContactIconWrapper>
              <Phone size={24} />
            </ContactIconWrapper>
            <ContactTitle>Call Us</ContactTitle>
            <ContactDetail>+1 (555) 123-4567</ContactDetail>
          </ContactCard>

          <ContactCard>
            <ContactIconWrapper>
              <MapPin size={24} />
            </ContactIconWrapper>
            <ContactTitle>Visit Us</ContactTitle>
            <ContactDetail>123 Innovation Drive, Tech Valley, CA 94000</ContactDetail>
          </ContactCard>
        </ContactGrid>
      </Section>
    </PageContainer>
  );
};

export default DashFlowHero;