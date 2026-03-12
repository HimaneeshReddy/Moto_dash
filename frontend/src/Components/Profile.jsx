import React from 'react';
import styled from 'styled-components';

const PageWrap = styled.div`
  min-height: 100vh;
  background-color: #f4f6f8;
  padding: 48px 40px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Card = styled.div`
  display: flex;
  width: 100%;
  max-width: 1100px;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
  overflow: hidden;
`;

/* ── Left panel ── */
const LeftPanel = styled.div`
  width: 240px;
  flex-shrink: 0;
  background: linear-gradient(160deg, #3457B2 0%, #1e3a8a 100%);
  padding: 40px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
`;

const Avatar = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid rgba(255,255,255,0.4);
  margin-bottom: 16px;
`;

const UserName = styled.h3`
  color: #ffffff;
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 6px 0;
  text-align: center;
`;

const UserEmail = styled.p`
  color: rgba(255,255,255,0.7);
  font-size: 13px;
  margin: 0 0 14px 0;
  text-align: center;
  word-break: break-all;
`;

const RoleBadge = styled.span`
  background: rgba(255,255,255,0.15);
  color: #ffffff;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 14px;
  border-radius: 20px;
  text-transform: capitalize;
  letter-spacing: 0.5px;
`;

const Divider = styled.div`
  width: 100%;
  height: 1px;
  background: rgba(255,255,255,0.15);
  margin: 24px 0;
`;

const MetaItem = styled.div`
  width: 100%;
  margin-bottom: 12px;
`;
const MetaLabel = styled.div`
  font-size: 10px;
  font-weight: 700;
  color: rgba(255,255,255,0.5);
  text-transform: uppercase;
  letter-spacing: 0.8px;
  margin-bottom: 3px;
`;
const MetaValue = styled.div`
  font-size: 11px;
  color: rgba(255,255,255,0.85);
  word-break: break-all;
  font-family: monospace;
`;

/* ── Right panel ── */
const RightPanel = styled.div`
  flex: 1;
  padding: 36px 40px;
  min-width: 0;
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 6px 0;
`;

const SectionSub = styled.p`
  font-size: 13px;
  color: #94a3b8;
  margin: 0 0 28px 0;
`;

const HR = styled.div`
  height: 1px;
  background: #f1f5f9;
  margin-bottom: 24px;
`;

const Row = styled.div`
  display: flex;
  gap: 18px;
  margin-bottom: 18px;
`;

const Field = styled.div`
  flex: 1;
  min-width: 0;

  label {
    display: block;
    font-size: 12px;
    font-weight: 600;
    color: #64748b;
    margin-bottom: 6px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  input {
    width: 100%;
    padding: 10px 14px;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    font-size: 14px;
    color: #1e293b;
    box-sizing: border-box;
    background: white;
    transition: border-color 0.2s;

    &:focus {
      outline: none;
      border-color: #3457B2;
      box-shadow: 0 0 0 3px rgba(52,87,178,0.08);
    }

    &[readonly], &:read-only {
      background: #f8fafc;
      color: #94a3b8;
      cursor: default;
    }
  }
`;

const SaveButton = styled.button`
  margin-top: 8px;
  padding: 12px 28px;
  border: none;
  border-radius: 9px;
  background-color: #3457B2;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;

  &:hover { background-color: #2a458c; }
`;

const Profile = () => {
  const [user, setUser] = React.useState(null);
  const [profile, setProfile] = React.useState(null);

  React.useEffect(() => {
    import('../services/api.js').then(({ getUser, getProfile }) => {
      const loggedInUser = getUser();
      if (loggedInUser) setUser(loggedInUser);
      getProfile().then(data => setProfile(data)).catch(() => {});
    });
  }, []);

  if (!user) {
    return <PageWrap><p style={{ textAlign: "center", color: "#94a3b8" }}>Loading...</p></PageWrap>;
  }

  return (
    <PageWrap>
      <Card>

        {/* ── Left ── */}
        <LeftPanel>
          <Avatar
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ1zwhySGCEBxRRFYIcQgvOLOpRGqrT3d7Qng&s"
            alt="Profile"
          />
          <UserName>{user.firstName} {user.lastName}</UserName>
          <UserEmail>{user.email}</UserEmail>
          <RoleBadge>{user.role}</RoleBadge>

          <Divider />

          {(profile?.orgName || user.organizationId) && (
            <MetaItem>
              <MetaLabel>Organization</MetaLabel>
              <MetaValue>{profile?.orgName || user.organizationId}</MetaValue>
            </MetaItem>
          )}
          {(profile?.showroomName || user.showroomId) && (
            <MetaItem>
              <MetaLabel>Showroom</MetaLabel>
              <MetaValue>{profile?.showroomName || user.showroomId}</MetaValue>
            </MetaItem>
          )}
        </LeftPanel>

        {/* ── Right ── */}
        <RightPanel>
          <SectionTitle>Profile Details</SectionTitle>
          <SectionSub>Update your personal information below.</SectionSub>
          <HR />

          <Row>
            <Field>
              <label>First Name</label>
              <input type="text" defaultValue={user.firstName} />
            </Field>
            <Field>
              <label>Last Name</label>
              <input type="text" defaultValue={user.lastName} />
            </Field>
          </Row>

          <Row>
            <Field>
              <label>Role</label>
              <input type="text" defaultValue={user.role} readOnly />
            </Field>
            <Field>
              <label>Email Address</label>
              <input type="email" defaultValue={user.email} readOnly />
            </Field>
          </Row>

          <SaveButton>Save Changes</SaveButton>
        </RightPanel>

      </Card>
    </PageWrap>
  );
};

export default Profile;

