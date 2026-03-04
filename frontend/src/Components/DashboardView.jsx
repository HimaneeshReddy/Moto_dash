import React from "react";
import styled from "styled-components";
import FilterListIcon from '@mui/icons-material/FilterList';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import BarChartIcon from '@mui/icons-material/BarChart';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import PieChartIcon from '@mui/icons-material/PieChart';
import InsertChartOutlinedIcon from '@mui/icons-material/InsertChartOutlined';

const Container = styled.div`
  padding: 30px 40px;
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
`;

const Title = styled.h1`
  font-size: 28px;
  color: #1a1a24;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const FilterSection = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 24px;
  flex-wrap: wrap;
`;

const Pill = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 14px;
  color: #475569;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);

  &:hover {
    background: #f8fafc;
    border-color: #cbd5e1;
    transform: translateY(-1px);
  }
`;

const InsightsBanner = styled.div`
  background: linear-gradient(to right, #eef2ff, #f8fafc);
  border: 1px solid #e0e7ff;
  border-radius: 12px;
  padding: 20px 24px;
  margin-bottom: 30px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Substring = styled.span`
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #3457B2;
`;

const InsightItem = styled.div`
  color: #334155;
  font-size: 15px;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:before {
    content: "•";
    color: #3457B2;
    font-size: 20px;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 40px;
`;

const PrimaryCard = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 24px;
  grid-column: 1 / -1; /* spans full width */
  min-height: 400px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
`;

const SecondaryCard = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 24px;
  min-height: 350px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
`;

const ChartHeader = styled.div`
  margin-bottom: 20px;
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 15px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const ChartDesc = styled.p`
  color: #64748b;
  font-size: 14px;
  margin: 6px 0 0 0;
  max-width: 80%;
  line-height: 1.4;
`;

const ChartPlaceholder = styled.div`
  flex: 1;
  background: #f8fafc;
  border: 1px dashed #cbd5e1;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #94a3b8;
  gap: 12px;
`;

const getIconForType = (type) => {
    switch (type.toLowerCase()) {
        case 'bar': return <BarChartIcon style={{ color: '#3457B2' }} />;
        case 'line': return <ShowChartIcon style={{ color: '#3457B2' }} />;
        case 'pie': return <PieChartIcon style={{ color: '#3457B2' }} />;
        default: return <InsertChartOutlinedIcon style={{ color: '#3457B2' }} />;
    }
};

export default function DashboardView({ analysisData, datasetName }) {
    if (!analysisData) return null;

    const { charts, filters, insights } = analysisData;

    // We expect exactly 3 charts by prompt design. 1 primary, 2 secondary.
    const primaryChart = charts[0];
    const secondaryCharts = charts.slice(1, 3);

    return (
        <Container>
            <Header>
                <Title>
                    <AutoAwesomeIcon style={{ color: '#3457B2', fontSize: '32px' }} />
                    {datasetName || "AI Generated Dashboard"}
                </Title>
            </Header>

            <FilterSection>
                <FilterListIcon style={{ color: '#64748b', marginRight: '5px' }} />
                <span style={{ color: '#64748b', fontSize: '14px', marginRight: '10px' }}>Detected Dimensions:</span>
                {filters?.map((filter, i) => (
                    <Pill key={i}>{filter}</Pill>
                ))}
            </FilterSection>

            {insights?.length > 0 && (
                <InsightsBanner>
                    <Substring>
                        <AutoAwesomeIcon fontSize="small" /> Key Insights Discovered
                    </Substring>
                    {insights.map((insight, i) => (
                        <InsightItem key={i}>{insight}</InsightItem>
                    ))}
                </InsightsBanner>
            )}

            <Grid>
                {primaryChart && (
                    <PrimaryCard>
                        <ChartHeader>
                            <div>
                                <h3 style={{ margin: 0, color: '#1e293b', fontSize: '18px' }}>
                                    {primaryChart.title}
                                </h3>
                                <ChartDesc>{primaryChart.description}</ChartDesc>
                            </div>
                            {getIconForType(primaryChart.chart_type)}
                        </ChartHeader>
                        <ChartPlaceholder>
                            {getIconForType(primaryChart.chart_type)}
                            <span>{primaryChart.chart_type.toUpperCase()} CHART PLACEHOLDER</span>
                            <span style={{ fontSize: '12px' }}>
                                X: {primaryChart.x_axis_column} | Y: {JSON.stringify(primaryChart.y_axis_column)}
                            </span>
                        </ChartPlaceholder>
                    </PrimaryCard>
                )}

                {secondaryCharts?.map((chart, i) => (
                    <SecondaryCard key={i}>
                        <ChartHeader>
                            <div>
                                <h3 style={{ margin: 0, color: '#1e293b', fontSize: '16px' }}>
                                    {chart.title}
                                </h3>
                                <ChartDesc style={{ fontSize: '13px' }}>{chart.description}</ChartDesc>
                            </div>
                            {getIconForType(chart.chart_type)}
                        </ChartHeader>
                        <ChartPlaceholder>
                            {getIconForType(chart.chart_type)}
                            <span>{chart.chart_type.toUpperCase()} CHART PLACEHOLDER</span>
                            <span style={{ fontSize: '12px' }}>
                                X: {chart.x_axis_column} | Y: {JSON.stringify(chart.y_axis_column)}
                            </span>
                        </ChartPlaceholder>
                    </SecondaryCard>
                ))}
            </Grid>
        </Container>
    );
}
