import React from 'react';
import styled, { keyframes, css } from 'styled-components';
import { Download, Play, ArrowRight } from 'lucide-react';
import img1 from '../Images/Image1.png'
import img2 from '../Images/Image2.png'
import img3 from '../Images/Image3.png'
import DashFlowLogo from '../Images/logo.png'; 

// --- Animations ---
const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); } /* Reduced for tighter fit */
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

// --- Styled Components ---
const HeroContainer = styled.section`
  position: relative;
  height: 100vh; /* Fixed height to prevent scrolling */
  width: 100vw;
  background-color: #f0f7ff;
  font-family: 'Inter', -apple-system, sans-serif;
  overflow: hidden; /* Strict overflow control */
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
  position: relative;
  z-index: 10;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 80px; /* Removed vertical padding, controlled by LogoWrapper */
  height: 120px; /* Fixed nav height */
  @media (max-width: 768px) { padding: 0 30px; height: 80px; }
`;

const LogoWrapper = styled.div`
  display: flex;
  align-items: center;
  height: 150px; /* Scaled down slightly to save vertical space */
  
  img {
    height: 100%;
    width: auto;
    object-fit: contain;
  }
`;

const NavLinks = styled.div`
  display: flex;
  gap: 35px;
  @media (max-width: 900px) { display: none; }
  
  a {
    text-decoration: none;
    color: #ffffff; /* Contrast against blue background shape */
    font-weight: 620;
    font-size: 16px;
    transition: color 0.4s;
    &:hover { color: #0f172a; }
  }
`;

const ContentWrapper = styled.div`
  position: relative;
  z-index: 5;
  display: flex;
  flex: 1; /* Takes up remaining height */
  padding: 0 80px;
  align-items: center;
  justify-content: space-between;
  margin-top: -40px; /* Visual centering */
  
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
  font-size: clamp(40px, 5vw, 72px); /* Responsive font size */
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
  gap: 20px;
  justify-content: flex-end;
  height: 80%; /* Limit card area height */
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
  background: white;
  border-radius: 28px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.12);
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const DashFlowHero = () => {
  return (
    <HeroContainer>
      <BlueBackgroundShape />
      
      <Navbar>
        <LogoWrapper>
          <img src={DashFlowLogo} alt="DashFlow" />
        </LogoWrapper>
        
        <NavLinks>
          {['Top', 'For Everyone', 'Features', 'Preview', 'License'].map(link => (
            <a key={link} href={`#${link.toLowerCase()}`}>{link}</a>
          ))}
        </NavLinks>
      </Navbar>

      <ContentWrapper>
        <LeftSection>
          <Slogan>
           Visualize. <br />
           Analyze.<span className="depth">Decide.</span>
          </Slogan>
          <Description>
            One upload, endless insights — DashFlow reads your data, 
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
          {/* Column 1 with 1 image */}
          <CardColumn speed="7s">
            <Card>
              <img src={img1} alt="Feature 1" />
            </Card>
          </CardColumn>
          
          {/* Column 2 with 2 images */}
          <CardColumn speed="9s" top="30px">
            <Card tall>
              <img src={img2} alt="Feature 2" />
            </Card>
            <Card>
              <img src={img3} alt="Feature 3" />
            </Card>
          </CardColumn>
        </RightSection>
      </ContentWrapper>
    </HeroContainer>
  );
};

export default DashFlowHero;