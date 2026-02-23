import React, { useState } from "react";
import styled from "styled-components";
import bg from '../Images/background.png';
import { useNavigate } from "react-router-dom";
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import {
  createOrganization,
  registerUser,
  loginUser,
  saveSession
} from "../services/api.js";

// ── Styled Components ──────────────────────────────────────────

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
  overflow-y: auto;
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
  background-position: ${props => (props.isRight ? "right center" : "left center")};
  transition: clip-path 0.8s ease-in-out, background-position 0.8s ease-in-out;
  clip-path: ${props =>
    props.isRight
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
  align-items: center;
  justify-content: ${props => (props.isRight ? "flex-end" : "flex-start")};
  pointer-events: none;
`;

const OverlayPanel = styled.div`
  width: 50%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  color: white;
  pointer-events: auto;
  padding-right: ${props => (props.isRight ? "100px" : "40px")};
  padding-left: ${props => (props.isRight ? "40px" : "100px")};
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 800;
  margin-bottom: 8px;
  color: ${props => props.dark ? "#1C2434" : "#fff"};
  letter-spacing: -0.5px;
`;

const Subtitle = styled.p`
  font-size: 15px;
  margin-bottom: 32px;
  color: ${props => props.dark ? "#64748B" : "#e0e0e0"};
  max-width: 320px;
  text-align: center;
  line-height: 1.5;
`;

const InputGroup = styled.div`
  position: relative;
  width: 100%;
  max-width: 380px;
  margin-bottom: 16px;
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
  border: 1px solid ${props => props.hasError ? "#ef4444" : "#E2E8F0"};
  padding: 14px 15px 14px 45px;
  width: 100%;
  border-radius: 10px;
  outline: none;
  font-size: 15px;
  color: #334155;
  transition: all 0.2s ease;
  box-sizing: border-box;

  &::placeholder { color: #94A3B8; }
  &:focus {
    border-color: #3457B2;
    background-color: #fff;
    box-shadow: 0 0 0 4px rgba(52, 87, 178, 0.1);
  }
`;

const Button = styled.button`
  background-color: ${props => props.disabled ? "#94A3B8" : "#3457B2"};
  color: white;
  border: none;
  border-radius: 10px;
  padding: 14px 40px;
  font-size: 15px;
  font-weight: 600;
  cursor: ${props => props.disabled ? "not-allowed" : "pointer"};
  box-shadow: 0 4px 6px -1px rgba(52, 87, 178, 0.3);
  transition: all 0.2s ease;
  letter-spacing: 0.5px;
  margin-top: 16px;
  width: 100%;
  max-width: 380px;

  &:hover:not(:disabled) {
    background-color: #2a458c;
    transform: translateY(-1px);
  }
  &:active:not(:disabled) { transform: translateY(1px); }
`;

const OutlineButton = styled(Button)`
  background-color: transparent;
  border: 2px solid rgba(255,255,255, 0.7);
  box-shadow: none;
  width: auto;
  max-width: none;
  padding: 12px 30px;

  &:hover:not(:disabled) {
    background-color: rgba(255,255,255,0.1);
    border-color: #fff;
    box-shadow: none;
  }
`;

const TabRow = styled.div`
  display: flex;
  width: 100%;
  max-width: 380px;
  margin-bottom: 28px;
  border-bottom: 2px solid #E2E8F0;
`;

const Tab = styled.button`
  flex: 1;
  background: none;
  border: none;
  padding: 10px 0;
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.active ? "#3457B2" : "#94A3B8"};
  border-bottom: ${props => props.active ? "2px solid #3457B2" : "2px solid transparent"};
  margin-bottom: -2px;
  cursor: pointer;
  transition: all 0.2s;
`;

const ErrorMsg = styled.p`
  color: #ef4444;
  font-size: 13px;
  margin: 4px 0 8px;
  max-width: 380px;
  width: 100%;
  text-align: left;
`;

// ── Component ──────────────────────────────────────────────────

// Modes: "login" | "create-org" | "register"
const AuthPage = () => {
  const [isSignUpSide, setIsSignUpSide] = useState(false);
  const [signUpMode, setSignUpMode] = useState("create-org"); // "create-org" | "register"
  const navigate = useNavigate();

  // ── Form state ──
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [orgForm, setOrgForm] = useState({ organizationName: "", firstName: "", lastName: "", email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({ token: "", email: "", firstName: "", lastName: "", password: "" });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const clearError = () => setError("");

  // ── Handlers ──

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await loginUser(loginForm);
      saveSession(data.token, data.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrg = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await createOrganization(orgForm);
      // After creating org, log them in automatically
      const loginData = await loginUser({ email: orgForm.email, password: orgForm.password });
      saveSession(loginData.token, loginData.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await registerUser(registerForm);
      saveSession(data.token, data.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const switchToSignUp = () => { setIsSignUpSide(true); clearError(); };
  const switchToLogin = () => { setIsSignUpSide(false); clearError(); };

  // ── Render ──
  return (
    <PageContainer>
      <FormsLayer>

        {/* ── SIGN UP SIDE (left) ── */}
        <FormSide style={{ opacity: isSignUpSide ? 1 : 0, transition: 'opacity 0.4s', pointerEvents: isSignUpSide ? 'auto' : 'none' }}>
          <Title dark>Create Account</Title>
          <Subtitle dark>Set up your organisation or join with an invite.</Subtitle>

          {/* Tabs */}
          <TabRow>
            <Tab active={signUpMode === "create-org"} onClick={() => { setSignUpMode("create-org"); clearError(); }}>
              New Organisation
            </Tab>
            <Tab active={signUpMode === "register"} onClick={() => { setSignUpMode("register"); clearError(); }}>
              Join via Invite
            </Tab>
          </TabRow>

          {error && <ErrorMsg>{error}</ErrorMsg>}

          {/* ── Create Organisation form ── */}
          {signUpMode === "create-org" && (
            <form onSubmit={handleCreateOrg} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <InputGroup>
                <IconWrapper><BusinessIcon fontSize="small" /></IconWrapper>
                <Input
                  type="text"
                  placeholder="Organisation Name"
                  value={orgForm.organizationName}
                  onChange={e => setOrgForm({ ...orgForm, organizationName: e.target.value })}
                  required
                />
              </InputGroup>
              <InputGroup>
                <IconWrapper><PersonIcon fontSize="small" /></IconWrapper>
                <Input
                  type="text"
                  placeholder="First Name"
                  value={orgForm.firstName}
                  onChange={e => setOrgForm({ ...orgForm, firstName: e.target.value })}
                  required
                />
              </InputGroup>
              <InputGroup>
                <IconWrapper><PersonIcon fontSize="small" /></IconWrapper>
                <Input
                  type="text"
                  placeholder="Last Name"
                  value={orgForm.lastName}
                  onChange={e => setOrgForm({ ...orgForm, lastName: e.target.value })}
                  required
                />
              </InputGroup>
              <InputGroup>
                <IconWrapper><EmailIcon fontSize="small" /></IconWrapper>
                <Input
                  type="email"
                  placeholder="Email Address"
                  value={orgForm.email}
                  onChange={e => setOrgForm({ ...orgForm, email: e.target.value })}
                  required
                />
              </InputGroup>
              <InputGroup>
                <IconWrapper><LockIcon fontSize="small" /></IconWrapper>
                <Input
                  type="password"
                  placeholder="Password"
                  value={orgForm.password}
                  onChange={e => setOrgForm({ ...orgForm, password: e.target.value })}
                  required
                />
              </InputGroup>
              <Button type="submit" disabled={loading}>{loading ? "Creating..." : "CREATE ORGANISATION"}</Button>
            </form>
          )}

          {/* ── Register via Invite form ── */}
          {signUpMode === "register" && (
            <form onSubmit={handleRegister} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <InputGroup>
                <IconWrapper><VpnKeyIcon fontSize="small" /></IconWrapper>
                <Input
                  type="text"
                  placeholder="Invite Token (from your email)"
                  value={registerForm.token}
                  onChange={e => setRegisterForm({ ...registerForm, token: e.target.value })}
                  required
                />
              </InputGroup>
              <InputGroup>
                <IconWrapper><EmailIcon fontSize="small" /></IconWrapper>
                <Input
                  type="email"
                  placeholder="Your Email (must match invite)"
                  value={registerForm.email}
                  onChange={e => setRegisterForm({ ...registerForm, email: e.target.value })}
                  required
                />
              </InputGroup>
              <InputGroup>
                <IconWrapper><PersonIcon fontSize="small" /></IconWrapper>
                <Input
                  type="text"
                  placeholder="First Name"
                  value={registerForm.firstName}
                  onChange={e => setRegisterForm({ ...registerForm, firstName: e.target.value })}
                  required
                />
              </InputGroup>
              <InputGroup>
                <IconWrapper><PersonIcon fontSize="small" /></IconWrapper>
                <Input
                  type="text"
                  placeholder="Last Name"
                  value={registerForm.lastName}
                  onChange={e => setRegisterForm({ ...registerForm, lastName: e.target.value })}
                  required
                />
              </InputGroup>
              <InputGroup>
                <IconWrapper><LockIcon fontSize="small" /></IconWrapper>
                <Input
                  type="password"
                  placeholder="Create Password"
                  value={registerForm.password}
                  onChange={e => setRegisterForm({ ...registerForm, password: e.target.value })}
                  required
                />
              </InputGroup>
              <Button type="submit" disabled={loading}>{loading ? "Registering..." : "JOIN ORGANISATION"}</Button>
            </form>
          )}
        </FormSide>

        {/* ── LOGIN SIDE (right) ── */}
        <FormSide style={{ opacity: !isSignUpSide ? 1 : 0, transition: 'opacity 0.4s', pointerEvents: !isSignUpSide ? 'auto' : 'none' }}>
          <Title dark>Welcome Back</Title>
          <Subtitle dark>Login to access your dashboard.</Subtitle>

          {error && !isSignUpSide && <ErrorMsg>{error}</ErrorMsg>}

          <form onSubmit={handleLogin} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <InputGroup>
              <IconWrapper><EmailIcon fontSize="small" /></IconWrapper>
              <Input
                type="email"
                placeholder="Email"
                value={loginForm.email}
                onChange={e => setLoginForm({ ...loginForm, email: e.target.value })}
                required
              />
            </InputGroup>
            <InputGroup>
              <IconWrapper><LockIcon fontSize="small" /></IconWrapper>
              <Input
                type="password"
                placeholder="Password"
                value={loginForm.password}
                onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
                required
              />
            </InputGroup>
            <Button type="submit" disabled={loading}>{loading ? "Logging in..." : "LOG IN"}</Button>
          </form>
        </FormSide>
      </FormsLayer>

      {/* ── Sliding Image Overlay ── */}
      <Overlay isRight={isSignUpSide}>
        <BlackTint />
        <OverlayContentContainer isRight={isSignUpSide}>
          <OverlayPanel isRight={isSignUpSide}>
            {isSignUpSide ? (
              <>
                <Title>One of us?</Title>
                <Subtitle>If you already have an account, just sign in. We've missed you!</Subtitle>
                <OutlineButton onClick={switchToLogin}>GO TO LOGIN</OutlineButton>
              </>
            ) : (
              <>
                <Title>New Here?</Title>
                <Subtitle>Create your organisation or join an existing one with an invite!</Subtitle>
                <OutlineButton onClick={switchToSignUp}>GET STARTED</OutlineButton>
              </>
            )}
          </OverlayPanel>
        </OverlayContentContainer>
      </Overlay>

    </PageContainer>
  );
};

export default AuthPage;