import React, { useState, createContext, useContext } from 'react';
import apiService from '../services/api';
interface MarketData {
  stockMarketIndex: number;
  stockMarketChange: number;
  cryptoMarketIndex: number;
  cryptoMarketChange: number;
  realEstateIndex: number;
  realEstateChange: number;
}
interface MarketDataContextType {
  marketData: MarketData | null;
  loading: boolean;
  fetchMarketData: () => Promise<void>;
}
const MarketDataContext = createContext<MarketDataContextType>({
  marketData: null,
  loading: false,
  fetchMarketData: async () => {}
});
export const useMarketData = () => useContext(MarketDataContext);
export const MarketDataProvider: React.FC<{
  children: React.ReactNode;
}> = ({
  children
}) => {
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(false);
  const fetchMarketData = async () => {
    setLoading(true);
    try {
      // Fetch market data from API service
      const data = await apiService.getMarketData();

      // Transform API response to MarketData format
      const transformedData: MarketData = {
        stockMarketIndex: data.stockMarketIndex || 0,
        stockMarketChange: data.stockMarketChange || 0,
        cryptoMarketIndex: data.cryptoMarketIndex || 0,
        cryptoMarketChange: data.cryptoMarketChange || 0,
        realEstateIndex: data.realEstateIndex || 0,
        realEstateChange: data.realEstateChange || 0
      };

      setMarketData(transformedData);
    } catch (error) {
      console.error('Failed to fetch market data:', error);
      // Set default values on error
      setMarketData({
        stockMarketIndex: 0,
        stockMarketChange: 0,
        cryptoMarketIndex: 0,
        cryptoMarketChange: 0,
        realEstateIndex: 0,
        realEstateChange: 0
      });
    } finally {
      setLoading(false);
    }
  };
  return <MarketDataContext.Provider value={{
    marketData,
    loading,
    fetchMarketData
  }}>
      {children}
    </MarketDataContext.Provider>;
};