/**
 * Comprehensive Demo Data for Investment Management System
 * Hardcoded data for immediate client presentation without backend dependencies
 */

export interface DemoUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: {
    type: 'superadmin' | 'admin' | 'investor';
    id: string;
  };
  avatar?: string;
  joinDate: string;
  lastLogin: string;
  status: 'active' | 'inactive';
}

export interface DemoCompany {
  id: string;
  name: string;
  industry: string;
  description: string;
  logo: string;
  registrationNumber: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  foundedYear: number;
  employees: number;
  revenue: number;
}

export interface DemoInvestment {
  id: string;
  name: string;
  description: string;
  investmentType: string;
  category: string;
  initialAmount: number;
  currentValue: number;
  expectedROI: number;
  actualROI: number;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Very High';
  status: 'Active' | 'Completed' | 'Paused' | 'Cancelled';
  companyId: string;
  companyName: string;
  companyLogo: string;
  investmentDate: string;
  startDate: string;
  endDate?: string;
  notes: string;
  tags: string[];
  minInvestment: number;
  maxInvestment?: number;
  featured: boolean;
  createdBy: string;
  createdByName: string;
  totalInvestors: number;
  totalInvested: number;
}

export interface DemoPerformanceData {
  date: string;
  marketValue: number;
  dailyChange: number;
  dailyChangePercent: number;
  volume?: number;
}

export interface DemoInvestorInvestment {
  id: string;
  userId: string;
  investmentId: string;
  amount: number;
  investmentDate: string;
  currentValue: number;
  profitLoss: number;
  profitLossPercent: number;
  status: 'active' | 'sold' | 'pending';
}

// Demo Users
export const demoUsers: DemoUser[] = [
  {
    id: 'user-1',
    email: 'sarah.johnson@investpro.com',
    firstName: 'Sarah',
    lastName: 'Johnson',
    role: { type: 'superadmin', id: 'superadmin' },
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    joinDate: '2023-01-15',
    lastLogin: '2024-06-21T10:30:00Z',
    status: 'active'
  },
  {
    id: 'user-2',
    email: 'michael.chen@investpro.com',
    firstName: 'Michael',
    lastName: 'Chen',
    role: { type: 'admin', id: 'admin' },
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    joinDate: '2023-03-20',
    lastLogin: '2024-06-21T09:15:00Z',
    status: 'active'
  },
  {
    id: 'user-3',
    email: 'emily.rodriguez@investpro.com',
    firstName: 'Emily',
    lastName: 'Rodriguez',
    role: { type: 'admin', id: 'admin' },
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    joinDate: '2023-05-10',
    lastLogin: '2024-06-21T08:45:00Z',
    status: 'active'
  },
  {
    id: 'user-4',
    email: 'david.thompson@investor.com',
    firstName: 'David',
    lastName: 'Thompson',
    role: { type: 'investor', id: 'investor' },
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    joinDate: '2023-07-22',
    lastLogin: '2024-06-21T11:20:00Z',
    status: 'active'
  },
  {
    id: 'user-5',
    email: 'lisa.wang@investor.com',
    firstName: 'Lisa',
    lastName: 'Wang',
    role: { type: 'investor', id: 'investor' },
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
    joinDate: '2023-09-05',
    lastLogin: '2024-06-21T07:30:00Z',
    status: 'active'
  },
  {
    id: 'user-6',
    email: 'robert.davis@investor.com',
    firstName: 'Robert',
    lastName: 'Davis',
    role: { type: 'investor', id: 'investor' },
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    joinDate: '2023-11-12',
    lastLogin: '2024-06-20T16:45:00Z',
    status: 'active'
  }
];

// Demo Companies
export const demoCompanies: DemoCompany[] = [
  {
    id: 'company-1',
    name: 'Meta Platforms Inc.',
    industry: 'Technology',
    description: 'Leading social media and virtual reality technology company',
    logo: 'https://logo.clearbit.com/meta.com',
    registrationNumber: 'META-2024-001',
    address: '1 Meta Way, Menlo Park, CA 94025',
    phone: '+1-650-543-4800',
    email: 'investor@meta.com',
    website: 'https://meta.com',
    foundedYear: 2004,
    employees: 86000,
    revenue: 134900000000
  },
  {
    id: 'company-2',
    name: 'ByteDance Ltd.',
    industry: 'Technology',
    description: 'Global technology company operating TikTok and other platforms',
    logo: 'https://logo.clearbit.com/bytedance.com',
    registrationNumber: 'BYTE-2024-002',
    address: '5 Clunies Ross St, Acton ACT 2601, Australia',
    phone: '+61-2-6100-2000',
    email: 'contact@bytedance.com',
    website: 'https://bytedance.com',
    foundedYear: 2012,
    employees: 150000,
    revenue: 85000000000
  },
  {
    id: 'company-3',
    name: 'Brookfield Asset Management',
    industry: 'Real Estate',
    description: 'Global alternative asset manager focused on real estate and infrastructure',
    logo: 'https://logo.clearbit.com/brookfield.com',
    registrationNumber: 'BAM-2024-003',
    address: 'Brookfield Place, 181 Bay Street, Toronto, ON M5J 2T3',
    phone: '+1-416-363-9491',
    email: 'info@brookfield.com',
    website: 'https://brookfield.com',
    foundedYear: 1899,
    employees: 200000,
    revenue: 75000000000
  },
  {
    id: 'company-4',
    name: 'Tesla Inc.',
    industry: 'Automotive',
    description: 'Electric vehicle and clean energy company',
    logo: 'https://logo.clearbit.com/tesla.com',
    registrationNumber: 'TSLA-2024-004',
    address: '1 Tesla Road, Austin, TX 78725',
    phone: '+1-512-516-8177',
    email: 'ir@tesla.com',
    website: 'https://tesla.com',
    foundedYear: 2003,
    employees: 140000,
    revenue: 96773000000
  },
  {
    id: 'company-5',
    name: 'Coinbase Global Inc.',
    industry: 'Cryptocurrency',
    description: 'Leading cryptocurrency exchange and digital asset platform',
    logo: 'https://logo.clearbit.com/coinbase.com',
    registrationNumber: 'COIN-2024-005',
    address: '100 Pine Street, San Francisco, CA 94111',
    phone: '+1-888-908-7930',
    email: 'support@coinbase.com',
    website: 'https://coinbase.com',
    foundedYear: 2012,
    employees: 8000,
    revenue: 7355000000
  },
  {
    id: 'company-6',
    name: 'Vanguard Group',
    industry: 'Financial Services',
    description: 'Investment management company offering mutual funds and ETFs',
    logo: 'https://logo.clearbit.com/vanguard.com',
    registrationNumber: 'VAN-2024-006',
    address: '100 Vanguard Blvd, Malvern, PA 19355',
    phone: '+1-877-662-7447',
    email: 'info@vanguard.com',
    website: 'https://vanguard.com',
    foundedYear: 1975,
    employees: 20000,
    revenue: 8100000000
  }
];

// Demo Investments
export const demoInvestments: DemoInvestment[] = [
  {
    id: 'inv-1',
    name: 'Meta Growth Fund Series A',
    description: 'Strategic investment in Meta\'s virtual reality and metaverse initiatives',
    investmentType: 'Stocks',
    category: 'Technology',
    initialAmount: 250000,
    currentValue: 312500,
    expectedROI: 20.0,
    actualROI: 25.0,
    riskLevel: 'Medium',
    status: 'Active',
    companyId: 'company-1',
    companyName: 'Meta Platforms Inc.',
    companyLogo: 'https://logo.clearbit.com/meta.com',
    investmentDate: '2024-01-15',
    startDate: '2024-01-15',
    notes: 'High-growth potential in VR/AR market with strong fundamentals',
    tags: ['technology', 'vr', 'social-media'],
    minInvestment: 10000,
    maxInvestment: 500000,
    featured: true,
    createdBy: 'user-2',
    createdByName: 'Michael Chen',
    totalInvestors: 12,
    totalInvested: 1250000
  },
  {
    id: 'inv-2',
    name: 'TikTok Global Expansion Fund',
    description: 'Investment in ByteDance\'s global expansion and content creation platform',
    investmentType: 'Stocks',
    category: 'Technology',
    initialAmount: 180000,
    currentValue: 234000,
    expectedROI: 25.0,
    actualROI: 30.0,
    riskLevel: 'High',
    status: 'Active',
    companyId: 'company-2',
    companyName: 'ByteDance Ltd.',
    companyLogo: 'https://logo.clearbit.com/bytedance.com',
    investmentDate: '2024-02-01',
    startDate: '2024-02-01',
    notes: 'Rapid user growth and strong monetization potential',
    tags: ['technology', 'social-media', 'global'],
    minInvestment: 15000,
    maxInvestment: 300000,
    featured: true,
    createdBy: 'user-2',
    createdByName: 'Michael Chen',
    totalInvestors: 8,
    totalInvested: 890000
  },
  {
    id: 'inv-3',
    name: 'Manhattan Commercial Real Estate',
    description: 'Premium commercial real estate portfolio in Manhattan financial district',
    investmentType: 'Real Estate',
    category: 'Commercial',
    initialAmount: 500000,
    currentValue: 575000,
    expectedROI: 12.0,
    actualROI: 15.0,
    riskLevel: 'Medium',
    status: 'Active',
    companyId: 'company-3',
    companyName: 'Brookfield Asset Management',
    companyLogo: 'https://logo.clearbit.com/brookfield.com',
    investmentDate: '2023-11-20',
    startDate: '2023-11-20',
    notes: 'Prime location with stable rental income and appreciation potential',
    tags: ['real-estate', 'commercial', 'manhattan'],
    minInvestment: 50000,
    maxInvestment: 1000000,
    featured: true,
    createdBy: 'user-3',
    createdByName: 'Emily Rodriguez',
    totalInvestors: 15,
    totalInvested: 2750000
  },
  {
    id: 'inv-4',
    name: 'Tesla Energy Storage Systems',
    description: 'Investment in Tesla\'s renewable energy and battery storage technology',
    investmentType: 'Stocks',
    category: 'Clean Energy',
    initialAmount: 320000,
    currentValue: 384000,
    expectedROI: 18.0,
    actualROI: 20.0,
    riskLevel: 'Medium',
    status: 'Active',
    companyId: 'company-4',
    companyName: 'Tesla Inc.',
    companyLogo: 'https://logo.clearbit.com/tesla.com',
    investmentDate: '2024-03-10',
    startDate: '2024-03-10',
    notes: 'Leading position in EV market with expanding energy business',
    tags: ['automotive', 'clean-energy', 'technology'],
    minInvestment: 25000,
    maxInvestment: 750000,
    featured: true,
    createdBy: 'user-2',
    createdByName: 'Michael Chen',
    totalInvestors: 20,
    totalInvested: 1680000
  },
  {
    id: 'inv-5',
    name: 'Crypto Portfolio Diversified Fund',
    description: 'Diversified cryptocurrency portfolio including Bitcoin, Ethereum, and altcoins',
    investmentType: 'Cryptocurrency',
    category: 'Digital Assets',
    initialAmount: 150000,
    currentValue: 127500,
    expectedROI: 35.0,
    actualROI: -15.0,
    riskLevel: 'Very High',
    status: 'Active',
    companyId: 'company-5',
    companyName: 'Coinbase Global Inc.',
    companyLogo: 'https://logo.clearbit.com/coinbase.com',
    investmentDate: '2024-01-05',
    startDate: '2024-01-05',
    notes: 'High volatility but strong long-term potential in digital assets',
    tags: ['cryptocurrency', 'bitcoin', 'ethereum'],
    minInvestment: 5000,
    maxInvestment: 200000,
    featured: false,
    createdBy: 'user-3',
    createdByName: 'Emily Rodriguez',
    totalInvestors: 25,
    totalInvested: 980000
  },
  {
    id: 'inv-6',
    name: 'Vanguard S&P 500 ETF Portfolio',
    description: 'Low-cost index fund tracking the S&P 500 for long-term growth',
    investmentType: 'ETF',
    category: 'Index Fund',
    initialAmount: 100000,
    currentValue: 112000,
    expectedROI: 10.0,
    actualROI: 12.0,
    riskLevel: 'Low',
    status: 'Active',
    companyId: 'company-6',
    companyName: 'Vanguard Group',
    companyLogo: 'https://logo.clearbit.com/vanguard.com',
    investmentDate: '2023-12-01',
    startDate: '2023-12-01',
    notes: 'Stable, diversified investment with consistent returns',
    tags: ['etf', 'index-fund', 'diversified'],
    minInvestment: 1000,
    maxInvestment: 500000,
    featured: false,
    createdBy: 'user-2',
    createdByName: 'Michael Chen',
    totalInvestors: 45,
    totalInvested: 3200000
  },
  {
    id: 'inv-7',
    name: 'Green Energy Infrastructure Bond',
    description: 'Government-backed bonds for renewable energy infrastructure projects',
    investmentType: 'Bonds',
    category: 'Government',
    initialAmount: 200000,
    currentValue: 210000,
    expectedROI: 5.0,
    actualROI: 5.0,
    riskLevel: 'Low',
    status: 'Active',
    companyId: 'company-3',
    companyName: 'Brookfield Asset Management',
    companyLogo: 'https://logo.clearbit.com/brookfield.com',
    investmentDate: '2024-02-15',
    startDate: '2024-02-15',
    notes: 'Stable returns with environmental impact focus',
    tags: ['bonds', 'green-energy', 'government'],
    minInvestment: 10000,
    maxInvestment: 1000000,
    featured: false,
    createdBy: 'user-3',
    createdByName: 'Emily Rodriguez',
    totalInvestors: 30,
    totalInvested: 1850000
  },
  {
    id: 'inv-8',
    name: 'Silicon Valley Tech Startup Fund',
    description: 'Early-stage venture capital fund investing in AI and fintech startups',
    investmentType: 'Venture Capital',
    category: 'Technology',
    initialAmount: 400000,
    currentValue: 520000,
    expectedROI: 40.0,
    actualROI: 30.0,
    riskLevel: 'Very High',
    status: 'Active',
    companyId: 'company-1',
    companyName: 'Meta Platforms Inc.',
    companyLogo: 'https://logo.clearbit.com/meta.com',
    investmentDate: '2023-09-01',
    startDate: '2023-09-01',
    notes: 'High-risk, high-reward investments in emerging technologies',
    tags: ['venture-capital', 'ai', 'fintech'],
    minInvestment: 100000,
    maxInvestment: 2000000,
    featured: true,
    createdBy: 'user-2',
    createdByName: 'Michael Chen',
    totalInvestors: 8,
    totalInvested: 2400000
  },
  {
    id: 'inv-9',
    name: 'Luxury Residential Real Estate Fund',
    description: 'High-end residential properties in Los Angeles and Miami markets',
    investmentType: 'Real Estate',
    category: 'Residential',
    initialAmount: 350000,
    currentValue: 385000,
    expectedROI: 8.0,
    actualROI: 10.0,
    riskLevel: 'Medium',
    status: 'Active',
    companyId: 'company-3',
    companyName: 'Brookfield Asset Management',
    companyLogo: 'https://logo.clearbit.com/brookfield.com',
    investmentDate: '2024-01-20',
    startDate: '2024-01-20',
    notes: 'Premium residential market with strong appreciation potential',
    tags: ['real-estate', 'residential', 'luxury'],
    minInvestment: 75000,
    maxInvestment: 1500000,
    featured: true,
    createdBy: 'user-3',
    createdByName: 'Emily Rodriguez',
    totalInvestors: 12,
    totalInvested: 1890000
  },
  {
    id: 'inv-10',
    name: 'Gold and Precious Metals Fund',
    description: 'Physical gold and precious metals investment for portfolio diversification',
    investmentType: 'Commodities',
    category: 'Precious Metals',
    initialAmount: 120000,
    currentValue: 132000,
    expectedROI: 6.0,
    actualROI: 10.0,
    riskLevel: 'Medium',
    status: 'Active',
    companyId: 'company-6',
    companyName: 'Vanguard Group',
    companyLogo: 'https://logo.clearbit.com/vanguard.com',
    investmentDate: '2023-10-15',
    startDate: '2023-10-15',
    notes: 'Hedge against inflation with stable precious metals allocation',
    tags: ['commodities', 'gold', 'precious-metals'],
    minInvestment: 5000,
    maxInvestment: 300000,
    featured: false,
    createdBy: 'user-2',
    createdByName: 'Michael Chen',
    totalInvestors: 35,
    totalInvested: 1450000
  }
];

// Generate performance data for the last 90 days
const generatePerformanceData = (investmentId: string, initialValue: number, currentValue: number): DemoPerformanceData[] => {
  const data: DemoPerformanceData[] = [];
  const days = 90;
  const totalChange = currentValue - initialValue;
  const dailyTrend = totalChange / days;

  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    // Add some randomness to make it realistic
    const randomFactor = (Math.random() - 0.5) * 0.1;
    const trendValue = initialValue + (dailyTrend * (days - i));
    const marketValue = Math.max(0, trendValue + (trendValue * randomFactor));

    const previousValue = i === days ? initialValue : data[data.length - 1]?.marketValue || initialValue;
    const dailyChange = marketValue - previousValue;
    const dailyChangePercent = previousValue > 0 ? (dailyChange / previousValue) * 100 : 0;

    data.push({
      date: date.toISOString().split('T')[0],
      marketValue: Math.round(marketValue * 100) / 100,
      dailyChange: Math.round(dailyChange * 100) / 100,
      dailyChangePercent: Math.round(dailyChangePercent * 100) / 100,
      volume: Math.floor(Math.random() * 1000000) + 100000
    });
  }

  return data;
};

// Demo Performance Data for each investment
export const demoPerformanceData: Record<string, DemoPerformanceData[]> = {
  'inv-1': generatePerformanceData('inv-1', 250000, 312500),
  'inv-2': generatePerformanceData('inv-2', 180000, 234000),
  'inv-3': generatePerformanceData('inv-3', 500000, 575000),
  'inv-4': generatePerformanceData('inv-4', 320000, 384000),
  'inv-5': generatePerformanceData('inv-5', 150000, 127500),
  'inv-6': generatePerformanceData('inv-6', 100000, 112000),
  'inv-7': generatePerformanceData('inv-7', 200000, 210000),
  'inv-8': generatePerformanceData('inv-8', 400000, 520000),
  'inv-9': generatePerformanceData('inv-9', 350000, 385000),
  'inv-10': generatePerformanceData('inv-10', 120000, 132000)
};

// Demo Investor Investments (for investor dashboard)
export const demoInvestorInvestments: DemoInvestorInvestment[] = [
  {
    id: 'ii-1',
    userId: 'user-4', // David Thompson
    investmentId: 'inv-1',
    amount: 50000,
    investmentDate: '2024-01-20',
    currentValue: 62500,
    profitLoss: 12500,
    profitLossPercent: 25.0,
    status: 'active'
  },
  {
    id: 'ii-2',
    userId: 'user-4',
    investmentId: 'inv-2',
    amount: 30000,
    investmentDate: '2024-02-05',
    currentValue: 39000,
    profitLoss: 9000,
    profitLossPercent: 30.0,
    status: 'active'
  },
  {
    id: 'ii-3',
    userId: 'user-4',
    investmentId: 'inv-3',
    amount: 75000,
    investmentDate: '2023-12-01',
    currentValue: 86250,
    profitLoss: 11250,
    profitLossPercent: 15.0,
    status: 'active'
  },
  {
    id: 'ii-4',
    userId: 'user-4',
    investmentId: 'inv-6',
    amount: 25000,
    investmentDate: '2023-12-15',
    currentValue: 28000,
    profitLoss: 3000,
    profitLossPercent: 12.0,
    status: 'active'
  },
  {
    id: 'ii-5',
    userId: 'user-5', // Lisa Wang
    investmentId: 'inv-1',
    amount: 40000,
    investmentDate: '2024-01-25',
    currentValue: 50000,
    profitLoss: 10000,
    profitLossPercent: 25.0,
    status: 'active'
  },
  {
    id: 'ii-6',
    userId: 'user-5',
    investmentId: 'inv-4',
    amount: 60000,
    investmentDate: '2024-03-15',
    currentValue: 72000,
    profitLoss: 12000,
    profitLossPercent: 20.0,
    status: 'active'
  },
  {
    id: 'ii-7',
    userId: 'user-5',
    investmentId: 'inv-5',
    amount: 20000,
    investmentDate: '2024-01-10',
    currentValue: 17000,
    profitLoss: -3000,
    profitLossPercent: -15.0,
    status: 'active'
  },
  {
    id: 'ii-8',
    userId: 'user-6', // Robert Davis
    investmentId: 'inv-8',
    amount: 150000,
    investmentDate: '2023-09-15',
    currentValue: 195000,
    profitLoss: 45000,
    profitLossPercent: 30.0,
    status: 'active'
  },
  {
    id: 'ii-9',
    userId: 'user-6',
    investmentId: 'inv-9',
    amount: 100000,
    investmentDate: '2024-02-01',
    currentValue: 110000,
    profitLoss: 10000,
    profitLossPercent: 10.0,
    status: 'active'
  },
  {
    id: 'ii-10',
    userId: 'user-6',
    investmentId: 'inv-10',
    amount: 35000,
    investmentDate: '2023-11-01',
    currentValue: 38500,
    profitLoss: 3500,
    profitLossPercent: 10.0,
    status: 'active'
  }
];

// Helper functions for dashboard calculations
export const getDashboardMetrics = () => {
  const totalInvestments = demoInvestments.length;
  const totalValue = demoInvestments.reduce((sum, inv) => sum + inv.currentValue, 0);
  const totalInitialValue = demoInvestments.reduce((sum, inv) => sum + inv.initialAmount, 0);
  const totalProfitLoss = totalValue - totalInitialValue;
  const totalROI = (totalProfitLoss / totalInitialValue) * 100;
  const activeInvestments = demoInvestments.filter(inv => inv.status === 'Active').length;
  const totalInvestors = demoUsers.filter(user => user.role.type === 'investor').length;

  return {
    totalInvestments,
    totalValue,
    totalInitialValue,
    totalProfitLoss,
    totalROI,
    activeInvestments,
    totalInvestors,
    totalCompanies: demoCompanies.length,
    totalUsers: demoUsers.length
  };
};

export const getInvestorPortfolio = (userId: string) => {
  // For demo investor account, use specific demo data
  if (userId === 'demo-investor-001') {
    const demoInvestorData = [
      {
        id: 'demo-ii-1',
        userId: 'demo-investor-001',
        investmentId: 'inv-1',
        amount: 75000,
        investmentDate: '2024-01-20',
        currentValue: 93750,
        profitLoss: 18750,
        profitLossPercent: 25.0,
        status: 'active' as const
      },
      {
        id: 'demo-ii-2',
        userId: 'demo-investor-001',
        investmentId: 'inv-3',
        amount: 100000,
        investmentDate: '2023-12-01',
        currentValue: 115000,
        profitLoss: 15000,
        profitLossPercent: 15.0,
        status: 'active' as const
      },
      {
        id: 'demo-ii-3',
        userId: 'demo-investor-001',
        investmentId: 'inv-4',
        amount: 50000,
        investmentDate: '2024-03-15',
        currentValue: 60000,
        profitLoss: 10000,
        profitLossPercent: 20.0,
        status: 'active' as const
      },
      {
        id: 'demo-ii-4',
        userId: 'demo-investor-001',
        investmentId: 'inv-6',
        amount: 25000,
        investmentDate: '2023-12-20',
        currentValue: 28000,
        profitLoss: 3000,
        profitLossPercent: 12.0,
        status: 'active' as const
      }
    ];

    const totalInvested = demoInvestorData.reduce((sum, ii) => sum + ii.amount, 0);
    const totalCurrentValue = demoInvestorData.reduce((sum, ii) => sum + ii.currentValue, 0);
    const totalProfitLoss = totalCurrentValue - totalInvested;
    const totalROI = totalInvested > 0 ? (totalProfitLoss / totalInvested) * 100 : 0;

    const portfolioBreakdown = demoInvestorData.map(ii => {
      const investment = demoInvestments.find(inv => inv.id === ii.investmentId);
      return {
        ...ii,
        investment
      };
    });

    return {
      totalInvested,
      totalCurrentValue,
      totalProfitLoss,
      totalROI,
      investments: portfolioBreakdown,
      investmentCount: demoInvestorData.length
    };
  }

  // For other users, use existing logic
  const userInvestments = demoInvestorInvestments.filter(ii => ii.userId === userId);
  const totalInvested = userInvestments.reduce((sum, ii) => sum + ii.amount, 0);
  const totalCurrentValue = userInvestments.reduce((sum, ii) => sum + ii.currentValue, 0);
  const totalProfitLoss = totalCurrentValue - totalInvested;
  const totalROI = totalInvested > 0 ? (totalProfitLoss / totalInvested) * 100 : 0;

  const portfolioBreakdown = userInvestments.map(ii => {
    const investment = demoInvestments.find(inv => inv.id === ii.investmentId);
    return {
      ...ii,
      investment
    };
  });

  return {
    totalInvested,
    totalCurrentValue,
    totalProfitLoss,
    totalROI,
    investments: portfolioBreakdown,
    investmentCount: userInvestments.length
  };
};
