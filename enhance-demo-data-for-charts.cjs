/**
 * Enhance Demo Data for Rich Chart Visualizations
 * Adds historical data points and performance metrics for meaningful charts
 */

const { MongoClient, ObjectId } = require('mongodb');

async function enhanceDemoDataForCharts() {
  try {
    console.log('📊 Enhancing Demo Data for Rich Chart Visualizations...\n');

    const client = new MongoClient('mongodb://localhost:27017');
    await client.connect();
    const db = client.db('investment_management');

    // 1. Add Historical Performance Data for Companies
    console.log('1️⃣ Adding Historical Performance Data...');
    await addHistoricalPerformanceData(db);

    // 2. Add Monthly Investment Metrics
    console.log('2️⃣ Adding Monthly Investment Metrics...');
    await addMonthlyInvestmentMetrics(db);

    // 3. Add Portfolio Performance History
    console.log('3️⃣ Adding Portfolio Performance History...');
    await addPortfolioPerformanceHistory(db);

    // 4. Add Market Comparison Data
    console.log('4️⃣ Adding Market Comparison Data...');
    await addMarketComparisonData(db);

    // 5. Add Geographic Distribution Data
    console.log('5️⃣ Adding Geographic Distribution Data...');
    await addGeographicDistributionData(db);

    // 6. Add Sector Performance Trends
    console.log('6️⃣ Adding Sector Performance Trends...');
    await addSectorPerformanceTrends(db);

    console.log('\n✅ Demo data enhancement completed successfully!');
    console.log('📈 Charts will now display rich, meaningful data');

    await client.close();

  } catch (error) {
    console.error('❌ Error enhancing demo data:', error);
  }
}

async function addHistoricalPerformanceData(db) {
  // Add historical valuation data for each company (monthly data for past 24 months)
  const companies = await db.collection('companies').find().toArray();
  
  for (const company of companies) {
    const performanceHistory = [];
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 24); // 24 months ago

    for (let i = 0; i < 24; i++) {
      const date = new Date(startDate);
      date.setMonth(date.getMonth() + i);

      // Generate realistic growth trajectory
      const baseGrowth = company.financialMetrics?.growthRate || 30;
      const monthlyGrowth = (baseGrowth / 100) / 12; // Convert annual to monthly
      const volatility = 0.1; // 10% volatility
      const randomFactor = 1 + (Math.random() - 0.5) * volatility;

      const currentValue = company.currentValuation * Math.pow(1 + monthlyGrowth, i - 24) * randomFactor;
      const revenue = company.financialMetrics?.revenue * Math.pow(1 + monthlyGrowth * 0.8, i - 24) * randomFactor;

      performanceHistory.push({
        date: date,
        valuation: Math.round(currentValue),
        revenue: Math.round(revenue),
        employeeCount: Math.round(company.employeeCount * Math.pow(1.02, i - 24)), // 2% monthly growth
        customers: Math.round(1000 * Math.pow(1.05, i - 24)), // Customer growth
        marketShare: Math.round((5 + Math.random() * 10) * 100) / 100 // 5-15% market share
      });
    }

    await db.collection('companies').updateOne(
      { _id: company._id },
      { $set: { performanceHistory: performanceHistory } }
    );
  }

  console.log(`   ✅ Added historical data for ${companies.length} companies`);
}

async function addMonthlyInvestmentMetrics(db) {
  // Add monthly aggregated investment metrics
  const monthlyMetrics = [];
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 12); // 12 months ago

  for (let i = 0; i < 12; i++) {
    const date = new Date(startDate);
    date.setMonth(date.getMonth() + i);

    // Generate realistic monthly investment data
    const totalInvestments = 5 + Math.floor(Math.random() * 10); // 5-15 investments per month
    const totalAmount = (2000000 + Math.random() * 8000000); // $2M - $10M per month
    const avgROI = 15 + Math.random() * 25; // 15-40% ROI
    const successRate = 70 + Math.random() * 25; // 70-95% success rate

    monthlyMetrics.push({
      _id: new ObjectId(),
      month: date.getMonth() + 1,
      year: date.getFullYear(),
      date: date,
      totalInvestments: totalInvestments,
      totalAmount: Math.round(totalAmount),
      averageInvestmentSize: Math.round(totalAmount / totalInvestments),
      averageROI: Math.round(avgROI * 100) / 100,
      successRate: Math.round(successRate * 100) / 100,
      topSector: ['Technology', 'Healthcare', 'Clean Energy', 'FinTech'][Math.floor(Math.random() * 4)],
      newInvestors: Math.floor(Math.random() * 5) + 1,
      exitedInvestments: Math.floor(Math.random() * 3)
    });
  }

  await db.collection('monthly_metrics').deleteMany({});
  await db.collection('monthly_metrics').insertMany(monthlyMetrics);

  console.log(`   ✅ Added ${monthlyMetrics.length} monthly metric records`);
}

async function addPortfolioPerformanceHistory(db) {
  // Add portfolio performance history for each investor
  const investors = await db.collection('users').find({ 'role.type': 'investor' }).toArray();
  
  for (const investor of investors) {
    const portfolioHistory = [];
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 18); // 18 months ago

    let cumulativeValue = 100000; // Starting portfolio value

    for (let i = 0; i < 18; i++) {
      const date = new Date(startDate);
      date.setMonth(date.getMonth() + i);

      // Generate realistic portfolio performance
      const monthlyReturn = (Math.random() - 0.4) * 0.1; // -4% to +6% monthly return
      cumulativeValue *= (1 + monthlyReturn);

      portfolioHistory.push({
        date: date,
        totalValue: Math.round(cumulativeValue),
        totalInvested: Math.round(cumulativeValue * 0.85), // Assuming some gains
        totalReturn: Math.round(cumulativeValue * 0.15),
        returnPercentage: Math.round(((cumulativeValue / 100000) - 1) * 10000) / 100,
        activeInvestments: 3 + Math.floor(Math.random() * 5),
        dividendsReceived: Math.round(cumulativeValue * 0.02 * Math.random())
      });
    }

    await db.collection('users').updateOne(
      { _id: investor._id },
      { $set: { portfolioHistory: portfolioHistory } }
    );
  }

  console.log(`   ✅ Added portfolio history for ${investors.length} investors`);
}

async function addMarketComparisonData(db) {
  // Add market benchmark data for comparison charts
  const marketData = [];
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 24);

  let sp500Value = 4000; // Starting S&P 500 value
  let nasdaqValue = 12000; // Starting NASDAQ value
  let portfolioValue = 100; // Starting portfolio index

  for (let i = 0; i < 24; i++) {
    const date = new Date(startDate);
    date.setMonth(date.getMonth() + i);

    // Generate market movements
    sp500Value *= (1 + (Math.random() - 0.45) * 0.08); // Market volatility
    nasdaqValue *= (1 + (Math.random() - 0.45) * 0.12); // Higher volatility for NASDAQ
    portfolioValue *= (1 + (Math.random() - 0.3) * 0.15); // Portfolio performance

    marketData.push({
      date: date,
      sp500: Math.round(sp500Value),
      nasdaq: Math.round(nasdaqValue),
      portfolioIndex: Math.round(portfolioValue * 100) / 100,
      bondIndex: Math.round(100 + Math.sin(i * 0.5) * 5), // Stable bond performance
      goldPrice: Math.round(1800 + Math.sin(i * 0.3) * 200) // Gold price fluctuation
    });
  }

  await db.collection('market_data').deleteMany({});
  await db.collection('market_data').insertMany(marketData);

  console.log(`   ✅ Added ${marketData.length} market comparison data points`);
}

async function addGeographicDistributionData(db) {
  // Add geographic distribution data for world map visualization
  const geographicData = [
    { country: 'United States', code: 'US', investments: 45, totalValue: 125000000, companies: 12 },
    { country: 'United Kingdom', code: 'GB', investments: 18, totalValue: 48000000, companies: 5 },
    { country: 'Germany', code: 'DE', investments: 12, totalValue: 32000000, companies: 4 },
    { country: 'Canada', code: 'CA', investments: 8, totalValue: 22000000, companies: 3 },
    { country: 'France', code: 'FR', investments: 7, totalValue: 18000000, companies: 2 },
    { country: 'Japan', code: 'JP', investments: 6, totalValue: 15000000, companies: 2 },
    { country: 'Australia', code: 'AU', investments: 5, totalValue: 12000000, companies: 2 },
    { country: 'Singapore', code: 'SG', investments: 4, totalValue: 10000000, companies: 1 },
    { country: 'Netherlands', code: 'NL', investments: 3, totalValue: 8000000, companies: 1 },
    { country: 'Sweden', code: 'SE', investments: 2, totalValue: 5000000, companies: 1 }
  ];

  await db.collection('geographic_data').deleteMany({});
  await db.collection('geographic_data').insertMany(geographicData);

  console.log(`   ✅ Added geographic distribution data for ${geographicData.length} countries`);
}

async function addSectorPerformanceTrends(db) {
  // Add sector performance trends for sector analysis charts
  const sectors = ['Technology', 'Healthcare', 'Clean Energy', 'FinTech', 'Education', 'Cybersecurity', 'Agriculture', 'Logistics'];
  const sectorData = [];

  for (const sector of sectors) {
    const performance = [];
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 12);

    let basePerformance = 100;

    for (let i = 0; i < 12; i++) {
      const date = new Date(startDate);
      date.setMonth(date.getMonth() + i);

      // Different growth patterns for different sectors
      let growthRate;
      switch (sector) {
        case 'Technology': growthRate = 0.08; break;
        case 'Healthcare': growthRate = 0.06; break;
        case 'Clean Energy': growthRate = 0.12; break;
        case 'FinTech': growthRate = 0.10; break;
        default: growthRate = 0.05;
      }

      basePerformance *= (1 + growthRate + (Math.random() - 0.5) * 0.1);

      performance.push({
        date: date,
        value: Math.round(basePerformance * 100) / 100,
        volume: Math.round(1000000 + Math.random() * 5000000),
        marketCap: Math.round(basePerformance * 1000000000)
      });
    }

    sectorData.push({
      sector: sector,
      performance: performance,
      totalInvestments: Math.floor(Math.random() * 20) + 5,
      averageROI: Math.round((20 + Math.random() * 30) * 100) / 100,
      riskLevel: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)]
    });
  }

  await db.collection('sector_data').deleteMany({});
  await db.collection('sector_data').insertMany(sectorData);

  console.log(`   ✅ Added sector performance data for ${sectors.length} sectors`);
}

enhanceDemoDataForCharts();
