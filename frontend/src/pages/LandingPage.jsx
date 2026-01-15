import React from 'react';
import styled, { keyframes, css } from 'styled-components';
import { Download, Play, ArrowRight } from 'lucide-react';

// --- Animations ---
const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-30px); }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

// --- Styled Components ---
const HeroContainer = styled.section`
  position: relative;
  min-height: 100vh;
  background-color: #f0f7ff;
  font-family: 'Inter', sans-serif;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const BlueBackgroundShape = styled.div`
  position: absolute;
  right: -10%;
  top: 0;
  height: 100%;
  width: 50%;
  background-color: #3b82f6;
  border-bottom-left-radius: 400px;
  z-index: 0;
  display: none;
  @media (min-width: 1024px) {
    display: block;
  }
`;

const Navbar = styled.nav`
  position: relative;
  z-index: 10;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 40px 80px;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 24px;
  font-weight: 800;
  color: #1e293b;

  .icon {
    width: 44px;
    height: 44px;
    background: #3b82f6;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    box-shadow: 0 10px 20px rgba(59, 130, 246, 0.3);
  }
`;

const NavLinks = styled.div`
  display: flex;
  gap: 40px;
  a {
    text-decoration: none;
    color: #64748b;
    font-weight: 600;
    font-size: 14px;
    transition: color 0.3s;
    &:hover { color: #3b82f6; }
  }
`;

const ContentWrapper = styled.div`
  position: relative;
  z-index: 5;
  display: flex;
  flex: 1;
  padding: 0 80px;
  align-items: center;
`;

const LeftSection = styled.div`
  flex: 1;
  max-width: 600px;
  animation: ${fadeIn} 1s ease-out;
`;

const Slogan = styled.h1`
  font-size: 72px;
  font-weight: 800;
  color: #1e293b;
  line-height: 1.1;
  margin-bottom: 24px;

  span.depth {
    position: relative;
    display: inline-block;
    padding-bottom: 8px;
    &::after {
      content: '';
      position: absolute;
      left: 0;
      bottom: 12px;
      width: 100%;
      height: 12px;
      background: rgba(59, 130, 246, 0.2);
      z-index: -1;
    }
    border-bottom: 8px solid #1e293b;
  }
`;

const Description = styled.p`
  font-size: 18px;
  color: #64748b;
  line-height: 1.8;
  margin-bottom: 40px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 20px;
`;

const PrimaryButton = styled.button`
  background: #3b82f6;
  color: white;
  padding: 18px 36px;
  border-radius: 14px;
  border: none;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  box-shadow: 0 20px 40px rgba(59, 130, 246, 0.25);
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);

  &:hover {
    transform: translateY(-5px);
    background: #2563eb;
    svg { transform: translateX(5px); }
  }
  
  svg { transition: transform 0.3s; }
`;

const SecondaryButton = styled(PrimaryButton)`
  background: #dbeafe;
  color: #3b82f6;
  box-shadow: none;
  &:hover {
    background: #bfdbfe;
    transform: translateY(-5px);
  }
`;

const RightSection = styled.div`
  flex: 1;
  display: flex;
  gap: 24px;
  justify-content: center;
  perspective: 1000px;
`;

const CardColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  animation: ${float} ${props => props.duration || '6s'} ease-in-out infinite;
  animation-delay: ${props => props.delay || '0s'};
  margin-top: ${props => props.offset || '0px'};
`;

const Card = styled.div`
  width: 240px;
  height: ${props => props.tall ? '300px' : '240px'};
  background: ${props => props.bg || 'white'};
  border-radius: 32px;
  padding: 24px;
  box-shadow: 0 30px 60px rgba(0,0,0,0.12);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  
  ${props => props.dashed && css`
    border: 3px dashed rgba(255,255,255,0.3);
    background: transparent;
  `}
`;

// --- Main Component ---
const DashFlow = () => {
  return (
    <HeroContainer>
      <BlueBackgroundShape />
      
      <Navbar>
        <Logo>
          <div className="icon">D</div>
          DashFlow
        </Logo>
        <NavLinks>
          <a href="#top">Top</a>
          <a href="#everyone">For Everyone</a>
          <a href="#features">Features</a>
          <a href="#preview">Preview</a>
          <a href="#license">License</a>
        </NavLinks>
        <button style={{
          background: 'white', border: 'none', padding: '12px 24px', 
          borderRadius: '12px', fontWeight: 'bold', color: '#3b82f6',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)', cursor: 'pointer'
        }}>
          Download
        </button>
      </Navbar>

      <ContentWrapper>
        <LeftSection>
          <Slogan>
            Better Design <br />
            For <span className="depth">DashFlow Content</span>
          </Slogan>
          <Description>
            DashFlow social media content templates for branding, marketing, 
            insights, and more. Free for personal and commercial use!
          </Description>
          <ButtonGroup>
            <PrimaryButton>
              <Download size={20} />
              Explore Now
              <ArrowRight size={20} />
            </PrimaryButton>
            <SecondaryButton>
              <Play size={20} fill="currentColor" />
              See in Action
            </SecondaryButton>
          </ButtonGroup>
        </LeftSection>

        <RightSection>
          <CardColumn duration="7s">
            <Card bg="#14b8a6" />
            <Card bg="#4338ca" tall />
          </CardColumn>
          <CardColumn duration="9s" offset="60px" delay="-2s">
            <Card bg="#1e293b" tall />
            <Card bg="#fb7185" />
            <Card dashed />
          </CardColumn>
        </RightSection>
      </ContentWrapper>
    </HeroContainer>
  );
};

export default DashFlow;