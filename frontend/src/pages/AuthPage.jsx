import React, { useState } from "react";
import styled from "styled-components";
import bg from '../Images/background.png';
import { useNavigate } from "react-router-dom";
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import PersonIcon from '@mui/icons-material/Person';
import InputAdornment from '@mui/material/InputAdornment';

const PageContainer = styled.div`
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
  background-color: #ffffff;
  display: flex;
  font-family: 'Inter', sans-serif;
`;

const FormsLayer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  z-index: 1;
`;

const FormSide = styled.div`
  width: 50%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 0 80px; 
  box-sizing: border-box;
  background-color: #fff;
`;

const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 10;
  background-image: url(${bg});
  background-size: cover;
  background-position: ${props => (props.isSignUp ? "right center" : "left center")};
  transition: clip-path 0.8s ease-in-out, background-position 0.8s ease-in-out;
  clip-path: ${props =>
    props.isSignUp
      ? "polygon(57.5% 0, 100% 0, 100% 100%, 48.5% 100%)"
      : "polygon(0 0, 51.5% 0, 42.5% 100%, 0 100%)"
  };
`;

const BlackTint = styled.div`
  position: absolute;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.4);
  z-index: 1;
`;


const OverlayContentContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
  display: flex;
  /* This centers the content vertically */
  align-items: center; 
  /* This moves the content block left or right based on state */
  justify-content: ${props => (props.isSignUp ? "flex-end" : "flex-start")};
  pointer-events: none; /* Let clicks pass through to the form behind if needed, but button needs pointer-events auto */
`;

const OverlayPanel = styled.div`
  width: 50%; /* It occupies the half where the image is */
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  color: white;
  padding: 0 40px;
  pointer-events: auto; /* Re-enable clicks for the button */
  
  /* Padding adjustment to keep text centered visually within the slant */
  padding-right: ${props => (props.isSignUp ? "100px" : "40px")};
  padding-left: ${props => (props.isSignUp ? "40px" : "100px")};
`;

// --- Components ---
const Title = styled.h1`
  font-size: 36px;
  font-weight: 800;
  margin-bottom: 12px;
  color: ${props => props.dark ? "#1C2434" : "#fff"};
  letter-spacing: -0.5px;
`;

const Subtitle = styled.p`
  font-size: 16px;
  margin-bottom: 40px;
  color: ${props => props.dark ? "#64748B" : "#e0e0e0"};
  max-width: 320px;
  text-align: center;
  line-height: 1.5;
`;

const InputGroup = styled.div`
  position: relative;
  width: 100%;
  max-width: 380px;
  margin-bottom: 20px;
`;

const IconWrapper = styled.div`
  position: absolute;
  top: 50%;
  left: 15px;
  transform: translateY(-50%);
  color: #94A3B8;
  display: flex;
  align-items: center;
  pointer-events: none;
`;

const Input = styled.input`
  background-color: #F8FAFC;
  border: 1px solid #E2E8F0;
  padding: 14px 15px 14px 45px; /* Left padding for icon */
  width: 100%;
  border-radius: 10px;
  outline: none;
  font-size: 15px;
  color: #334155;
  transition: all 0.2s ease;

  &::placeholder {
    color: #94A3B8;
  }

  &:focus { 
    border-color: #3457B2; 
    background-color: #fff;
    box-shadow: 0 0 0 4px rgba(52, 87, 178, 0.1);
  }
`;

const Button = styled.button`
  background-color: #3457B2;
  color: white;
  border: none;
  border-radius: 10px;
  padding: 14px 40px;
  font-size: 15px;
  font-weight: 600;   
  cursor: pointer;
  box-shadow: 0 4px 6px -1px rgba(52, 87, 178, 0.3);
  transition: all 0.2s ease;
  letter-spacing: 0.5px;
  margin-top: 20px;
  width: 100%;
  max-width: 380px;

  &:hover { 
    background-color: #2a458c; 
    transform: translateY(-1px);
    box-shadow: 0 6px 10px -1px rgba(52, 87, 178, 0.4);
  }
  
  &:active { 
    transform: translateY(1px);
    box-shadow: 0 2px 4px -1px rgba(52, 87, 178, 0.3);
  }
`;

const OutlineButton = styled(Button)`
  background-color: transparent;
  border: 2px solid rgba(255,255,255, 0.7);
  box-shadow: none;
  width: auto;
  max-width: none;
  padding: 12px 30px;
  margin-top: 20px;

  &:hover { 
    background-color: rgba(255,255,255,0.1); 
    border-color: #fff;
    box-shadow: none;
    transform: translateY(-2px);
  }
`;


const AuthPage = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    navigate("/dashboard");
  };

  return (
    <PageContainer>

      <FormsLayer>
        <FormSide style={{ opacity: isSignUp ? 1 : 0, transition: 'opacity 0.4s', pointerEvents: isSignUp ? 'auto' : 'none' }}>
          <Title dark>Create Account</Title>
          <Subtitle dark>Join us today and start your journey.</Subtitle>

          <InputGroup>
            <IconWrapper><PersonIcon fontSize="small" /></IconWrapper>
            <Input type="text" placeholder="Full Name" />
          </InputGroup>

          <InputGroup>
            <IconWrapper><EmailIcon fontSize="small" /></IconWrapper>
            <Input type="email" placeholder="Email Address" />
          </InputGroup>

          <InputGroup>
            <IconWrapper><LockIcon fontSize="small" /></IconWrapper>
            <Input type="password" placeholder="Password" />
          </InputGroup>

          <Button>SIGN UP</Button>
        </FormSide>

        <FormSide style={{ opacity: !isSignUp ? 1 : 0, transition: 'opacity 0.4s', pointerEvents: !isSignUp ? 'auto' : 'none' }}>
          <Title dark>Welcome Back</Title>
          <Subtitle dark>Login to access your dashboard.</Subtitle>

          <InputGroup>
            <IconWrapper><EmailIcon fontSize="small" /></IconWrapper>
            <Input type="email" placeholder="Email" />
          </InputGroup>

          <InputGroup>
            <IconWrapper><LockIcon fontSize="small" /></IconWrapper>
            <Input type="password" placeholder="Password" />
          </InputGroup>

          <Button onClick={handleLogin}>LOG IN</Button>
        </FormSide>
      </FormsLayer>

      <Overlay isSignUp={isSignUp}>
        <BlackTint />
        <OverlayContentContainer isSignUp={isSignUp}>
          <OverlayPanel isSignUp={isSignUp}>
            {isSignUp ? (
              <>
                <Title>One of us?</Title>
                <Subtitle>If you already have an account, just sign in. We've missed you!</Subtitle>
                <OutlineButton onClick={() => setIsSignUp(false)}>
                  GO TO LOGIN
                </OutlineButton>
              </>
            ) : (
              <>
                <Title>New Here?</Title>
                <Subtitle>Create an account and discover a great amount of new opportunities!</Subtitle>
                <OutlineButton onClick={() => setIsSignUp(true)}>
                  GO TO SIGN UP
                </OutlineButton>
              </>
            )}
          </OverlayPanel>
        </OverlayContentContainer>
      </Overlay>

    </PageContainer>
  );
};

export default AuthPage;