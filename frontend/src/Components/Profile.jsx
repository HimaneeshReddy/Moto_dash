import React from 'react';
import styled from 'styled-components';

const Container_profile = styled.div`
  min-height: 100vh;
  background-color: #f4f6f8;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;


const Content_profile = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
`;

const Content_wrapper = styled.div`
  display: flex;
  width: 100%;
  max-width: 1300px;
  background-color: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.08);
`;

const Content_profile_left = styled.div`
  border-right: 1px solid #e0e0e0;
  padding: 32px;
  flex: 0.4;
  display: flex;
  align-items: center;
  flex-direction: column;
`;

const Content_profile_right = styled.div`
  flex: 0.6;
  padding: 32px 48px;
`;

const ProfilePicture = styled.img`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 16px;
`;

const ProfileInfo = styled.div`
  text-align: center;

  h3 {
    margin: 0;
    font-size: 22px;
  }

  p {
    margin: 6px 0;
    color: #777;
    font-size: 14px;
  }
`;

const Profile_header = styled.h3`
  font-size: 22px;
  margin-bottom: 24px;
  color: #1C2434;
`;

/* -------- FORM STYLES -------- */

const Form = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Row = styled.div`
  display: flex;
  gap: 20px;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;

  label {
    font-size: 14px;
    color: #555;
    margin-bottom: 6px;
  }

  input, select {
    padding: 12px;
    border-radius: 8px;
    border: 1px solid #d1d5db;
    font-size: 14px;

    &:focus {
      outline: none;
      border-color: #3457B2;
    }
  }
`;

const SaveButton = styled.button`
  margin-top: 20px;
  padding: 14px;
  border: none;
  border-radius: 10px;
  background-color: #3457B2;
  color: white;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background-color: #2A458C;
  }
`;

const Profile = () => {
  return (
    <Container_profile>

      <Content_profile>
        <Content_wrapper>

          {/* LEFT PROFILE SUMMARY */}
          <Content_profile_left>
            <ProfilePicture
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ1zwhySGCEBxRRFYIcQgvOLOpRGqrT3d7Qng&s"
              alt="Profile"
            />
            <ProfileInfo>
              <h3>John Doe</h3>
              <p>john.doe@dashflow.ai</p>
              <p>Member since Jan 2025</p>
            </ProfileInfo>
          </Content_profile_left>

          {/* RIGHT PROFILE FORM */}
          <Content_profile_right>
            <Profile_header>Profile Details</Profile_header>

            <Form>
              <Row>
                <Field>
                  <label>First Name</label>
                  <input type="text" placeholder="John" />
                </Field>
                <Field>
                  <label>Last Name</label>
                  <input type="text" placeholder="Doe" />
                </Field>
              </Row>

              <Row>
                <Field>
                  <label>Middle Name (Optional)</label>
                  <input type="text" placeholder="Michael" />
                </Field>
                <Field>
                  <label>Email Address</label>
                  <input type="email" placeholder="john.doe@dashflow.ai" />
                </Field>
              </Row>

              <Row>
                <Field>
                  <label>Phone Number</label>
                  <input type="tel" placeholder="+1 9876543210" />
                </Field>
                <Field>
                  <label>Organization</label>
                  <input type="text" placeholder="DashFlow" />
                </Field>
              </Row>

              <Field>
                <label>Country</label>
                <select>
                  <option>Select country</option>
                  <option>United States</option>
                  <option>India</option>
                  <option>United Kingdom</option>
                </select>
              </Field>

              <SaveButton>Save Changes</SaveButton>
            </Form>
          </Content_profile_right>

        </Content_wrapper>
      </Content_profile>
    </Container_profile>
  );
};

export default Profile;
