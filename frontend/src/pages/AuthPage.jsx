import React, { useState } from "react";
import styled from "styled-components";
import bg from '../Images/background.png';

const PageContainer = styled.div`
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
  background-color: #ffffff;
  display: flex;
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
  background-color: rgba(0, 0, 0, 0.5);
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
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 10px;
  color: ${props => props.dark ? "#333" : "#fff"};
`;

const Subtitle = styled.p`
  font-size: 16px;
  margin-bottom: 30px;
  color: ${props => props.dark ? "#666" : "#e0e0e0"};
  max-width: 300px;
  text-align: center;
`;

const Input = styled.input`
  background-color: #f3f4f6;
  border: 1px solid #ddd;
  padding: 12px 15px;
  margin: 8px 0;
  width: 100%;
  max-width: 350px;
  border-radius: 8px;
  outline: none;
  &:focus { border-color: #2563EB; }
`;

const Button = styled.button`
  background-color: #2563EB;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 40px;
  font-size: 14px;
  font-weight: 600;   
  cursor: pointer;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: transform 0.1s;
  &:hover { background-color: #1D4ED8; }
  &:active { transform: scale(0.98); }
`;

const OutlineButton = styled(Button)`
  background-color: transparent;
  border: 2px solid white;
  &:hover { background-color: rgba(255,255,255,0.1); }
`;


const AuthPage = () => {
  const [isSignUp, setIsSignUp] = useState(false);

  return (
    <PageContainer>
      
      <FormsLayer>
        <FormSide style={{ opacity: isSignUp ? 1 : 0, transition: 'opacity 0.4s' }}>
          <Title dark>Create Account</Title>
          <Subtitle dark>Join us today and start your journey.</Subtitle>
          <Input type="text" placeholder="Full Name" />
          <Input type="email" placeholder="Email Address" />
          <Input type="password" placeholder="Password" />
          <Button style={{marginTop: '20px', width: '100%', maxWidth: '350px'}}>SIGN UP</Button>
        </FormSide>
        <FormSide style={{ opacity: !isSignUp ? 1 : 0, transition: 'opacity 0.4s' }}>
          <Title dark>Welcome Back</Title>
          <Subtitle dark>Login to access your dashboard.</Subtitle>
          <Input type="email" placeholder="Email" />
          <Input type="password" placeholder="Password" />
          <Button style={{marginTop: '20px', width: '100%', maxWidth: '350px'}}>LOG IN</Button>
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
                <Subtitle>Sign up and discover a great amount of new opportunities!</Subtitle>
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