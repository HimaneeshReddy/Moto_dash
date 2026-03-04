import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { analyzeDataset } from '../services/api.js';

const pulse = keyframes`
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(52, 87, 178, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 20px rgba(52, 87, 178, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(52, 87, 178, 0); }
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

const Overlay = styled.div`
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 100;
  backdrop-filter: blur(5px);
`;

const Spinner = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 4px solid #eff6ff;
  border-top-color: #3457B2;
  animation: ${spin} 1.5s linear infinite;
`;

const PulseRing = styled.div`
  position: absolute;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 2px solid rgba(52, 87, 178, 0.2);
  animation: ${pulse} 2s infinite;
`;

const LoadingText = styled.h2`
  color: #1e293b;
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
`;

const SubText = styled.p`
  color: #64748b;
  font-size: 1rem;
  margin: 0;
  max-width: 400px;
  text-align: center;
`;

const SkeletonBar = styled.div`
  width: ${props => props.width || '200px'};
  height: 12px;
  border-radius: 6px;
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 1000px 100%;
  animation: ${shimmer} 2s infinite linear;
  margin-top: 1rem;
`;

const STEPS = [
  { msg: "Reading dataset structure...", sub: "Mapping columns and inferring data types..." },
  { msg: "Profiling metadata...", sub: "Calculating min, max, averages, and detecting categories..." },
  { msg: "Consulting Llama3 LLM...", sub: "Passing context to local docker container safely..." },
  { msg: "Generating Dashboard...", sub: "Designing optimal charts, filters, and insights based on data flow..." },
  { msg: "Finalizing layout...", sub: "Almost there! Preparing your insight cards..." }
];

export default function AnalyzingLoader({ datasetId, onAnalysisComplete, onError }) {
  const [stepIdx, setStepIdx] = useState(0);

  useEffect(() => {
    // Cycle through the fake "steps" just to keep the user engaged
    // since Ollama might take 10-30 seconds to answer locally
    const timer = setInterval(() => {
      setStepIdx(current => Math.min(current + 1, STEPS.length - 1));
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Trigger the actual backend analysis API call once when component mounts
    let isMounted = true;

    analyzeDataset(datasetId)
      .then(res => {
        if (isMounted) onAnalysisComplete(res.analysis);
      })
      .catch(err => {
        if (isMounted) onError(err.message);
      });

    return () => { isMounted = false; };
  }, [datasetId, onAnalysisComplete, onError]);

  const activeStep = STEPS[stepIdx];

  return (
    <Overlay>
      <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '2rem' }}>
        <PulseRing />
        <Spinner />
      </div>
      <LoadingText>{activeStep.msg}</LoadingText>
      <SubText>{activeStep.sub}</SubText>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '2rem' }}>
        <SkeletonBar width="300px" />
        <SkeletonBar width="240px" />
      </div>
    </Overlay>
  );
}
