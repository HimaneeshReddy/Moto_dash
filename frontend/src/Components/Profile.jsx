import React from 'react';
import styled from 'styled-components';

const Container_profile = styled.div`
  min-height: 100vh;
  background-color: #f4f6f8;
  display: flex;
  flex-direction: column;
`;

const Header_profile = styled.h2`
  font-size: 32px;
  margin: 0;
  padding: 32px 0;
  text-align: center;
`;

const Content_profile = styled.div`
  display: flex;
  justify-content: center;   
  width: 100%;
  height: 70%;
`;

const Content_wrapper = styled.div`
  display: flex;
  width: 100%;
  max-width: 1300px;        
  background-color: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.08);
  height: auto;
`;

const Content_profile_left = styled.div`
  border-right: 1px solid #e0e0e0;
  padding: 24px;
  flex: 0.5;
`;

const Content_profile_right = styled.div`
  flex: 1;                   
  padding: 32px;
`;

const Profile = () => {
  return (
    <Container_profile>
      <Header_profile>Profile Details</Header_profile>

      <Content_profile>
        <Content_wrapper>
          <Content_profile_left>
            Left content
          </Content_profile_left>

          <Content_profile_right>
            Right content
          </Content_profile_right>
        </Content_wrapper>
      </Content_profile>
    </Container_profile>
  );
};

export default Profile;
