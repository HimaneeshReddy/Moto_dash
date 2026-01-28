import styled from 'styled-components';
import React from 'react';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
  transition: transform 0.2s;

  min-width: 500px;
  height: 360px;

  &:hover {
    transform: translateY(-4px);
  }
`;

const Image = styled.img`
  width: 100ox;
  object-fit: cover;
`;

const Title = styled.h3`
  margin: 12px 12px 4px;
  font-size: 16px;        
  color: #1C2434;
`;

const Description = styled.p`
  margin: 0 12px 12px;
  font-size: 13px;
  color: #64748B;
`;

const RecentCard = ({ item }) => {
  return (
    <Container>
      <Image src={item.image} alt={item.title} />
      <Title>{item.title}</Title>
      <Description>{item.description}</Description>
    </Container>
  );
};

export default RecentCard;
