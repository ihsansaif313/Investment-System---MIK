/**
 * Production-ready MongoDB Connection Configuration
 * Includes connection pooling, optimization, and error handling
 */

import mongoose from 'mongoose';
import { config } from './environment.js';

class DatabaseConnection {
  constructor() {
    this.isConnected = false;
    this.connectionAttempts = 0;
    this.maxRetries = 5;
    this.retryDelay = 5000; // 5 seconds
  }

  /**
   * Connect to MongoDB with production-ready configuration
   */
  async connect() {
    // Check if we should use mock database
    if (config.USE_MOCK_DB === 'true') {
      console.log('🔄 Using mock database mode...');
      this.isConnected = true;
      console.log('✅ Mock database connected successfully');
      console.log('💡 To use real MongoDB:');
      console.log('   1. Start MongoDB: mongod --dbpath mongodb-data');
      console.log('   2. Set USE_MOCK_DB=false in backend/.env');
      return true;
    }

    try {
      // MongoDB connection options for production
      const options = {
        // Connection Pool Settings
        maxPoolSize: 10, // Maximum number of connections in the pool
        minPoolSize: 2,  // Minimum number of connections in the pool
        maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
        
        // Timeout Settings
        serverSelectionTimeoutMS: 5000, // How long to try selecting a server
        socketTimeoutMS: 45000, // How long a send or receive on a socket can take
        connectTimeoutMS: 10000, // How long to wait for a connection to be established
        
        // Buffering Settings
        bufferMaxEntries: 0, // Disable mongoose buffering
        bufferCommands: false, // Disable mongoose buffering
        
        // Heartbeat Settings
        heartbeatFrequencyMS: 10000, // How often to check the server status
        
        // Write Concern
        w: 'majority', // Wait for majority of replica set members to acknowledge
        wtimeoutMS: 5000, // Timeout for write operations
        
        // Read Preference
        readPreference: 'primary', // Read from primary replica set member
        
        // Compression
        compressors: ['zlib'], // Enable compression
        
        // SSL/TLS (enable in production)
        ssl: config.NODE_ENV === 'production',
        sslValidate: config.NODE_ENV === 'production',
        
        // Authentication
        authSource: 'admin',
        
        // Application Name (for monitoring)
        appName: 'InvestmentManagementSystem'
      };

      // Add authentication if credentials are provided
      if (config.DB_USERNAME && config.DB_PASSWORD) {
        options.auth = {
          username: config.DB_USERNAME,
          password: config.DB_PASSWORD
        };
      }

      console.log('🔄 Connecting to MongoDB...');
      console.log(`📍 Database: ${config.MONGODB_URI.replace(/\/\/.*@/, '//***:***@')}`);

      await mongoose.connect(config.MONGODB_URI, options);

      this.isConnected = true;
      this.connectionAttempts = 0;

      console.log('✅ MongoDB connected successfully');
      console.log(`📊 Connection pool: ${options.minPoolSize}-${options.maxPoolSize} connections`);
      
      // Set up connection event listeners
      this.setupEventListeners();
      
      // Create indexes
      await this.createIndexes();
      
      return true;
    } catch (error) {
      this.isConnected = false;
      this.connectionAttempts++;
      
      console.error('❌ MongoDB connection failed:', error.message);
      console.log('⚠️  Running in limited mode without database');
      console.log('💡 To fix this:');
      console.log('   1. Start MongoDB: run start-mongodb.ps1');
      console.log('   2. Or use MongoDB Atlas: https://www.mongodb.com/atlas');
      console.log('   3. Update MONGODB_URI in backend/.env');

      // Don't exit, just continue without database
      this.isConnected = false;
      
      return false;
    }
  }

  /**
   * Set up MongoDB connection event listeners
   */
  setupEventListeners() {
    const db = mongoose.connection;

    db.on('connected', () => {
      console.log('📡 MongoDB connection established');
      this.isConnected = true;
    });

    db.on('disconnected', () => {
      console.log('📡 MongoDB disconnected');
      this.isConnected = false;
    });

    db.on('reconnected', () => {
      console.log('📡 MongoDB reconnected');
      this.isConnected = true;
    });

    db.on('error', (error) => {
      console.error('❌ MongoDB connection error:', error);
      this.isConnected = false;
    });

    db.on('close', () => {
      console.log('📡 MongoDB connection closed');
      this.isConnected = false;
    });

    // Handle application termination
    process.on('SIGINT', async () => {
      await this.disconnect();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      await this.disconnect();
      process.exit(0);
    });
  }

  /**
   * Create database indexes for optimal performance
   */
  async createIndexes() {
    try {
      console.log('🔍 Creating database indexes...');
      
      const db = mongoose.connection.db;
      
      // User collection indexes
      await db.collection('users').createIndex({ email: 1 }, { unique: true });
      await db.collection('users').createIndex({ isActive: 1 });
      await db.collection('users').createIndex({ emailVerified: 1 });
      await db.collection('users').createIndex({ createdAt: -1 });
      
      // Role collection indexes
      await db.collection('roles').createIndex({ userId: 1, type: 1 });
      await db.collection('roles').createIndex({ type: 1, isActive: 1 });
      
      // Investment collection indexes
      await db.collection('investments').createIndex({ subCompanyId: 1 });
      await db.collection('investments').createIndex({ assetId: 1 });
      await db.collection('investments').createIndex({ status: 1 });
      await db.collection('investments').createIndex({ startDate: 1, endDate: 1 });
      
      // Investor Investment collection indexes
      await db.collection('investorinvestments').createIndex({ userId: 1 });
      await db.collection('investorinvestments').createIndex({ investmentId: 1 });
      await db.collection('investorinvestments').createIndex({ userId: 1, investmentId: 1 }, { unique: true });
      
      // Activity Log collection indexes
      await db.collection('activitylogs').createIndex({ userId: 1 });
      await db.collection('activitylogs').createIndex({ createdAt: -1 });
      await db.collection('activitylogs').createIndex({ entity: 1, entityId: 1 });
      
      // Audit Trail collection indexes
      await db.collection('audittrails').createIndex({ collection: 1, documentId: 1 });
      await db.collection('audittrails').createIndex({ timestamp: -1 });
      
      // Session collection indexes (with TTL)
      await db.collection('sessions').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
      await db.collection('sessions').createIndex({ token: 1 }, { unique: true });
      await db.collection('sessions').createIndex({ refreshToken: 1 }, { unique: true });
      
      console.log('✅ Database indexes created successfully');
    } catch (error) {
      console.error('❌ Error creating indexes:', error);
    }
  }

  /**
   * Gracefully disconnect from MongoDB
   */
  async disconnect() {
    try {
      console.log('🔄 Disconnecting from MongoDB...');
      await mongoose.connection.close();
      this.isConnected = false;
      console.log('✅ MongoDB disconnected successfully');
    } catch (error) {
      console.error('❌ Error disconnecting from MongoDB:', error);
    }
  }

  /**
   * Get connection status
   */
  getStatus() {
    return {
      isConnected: this.isConnected,
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      name: mongoose.connection.name
    };
  }

  /**
   * Health check for the database connection
   */
  async healthCheck() {
    try {
      if (!this.isConnected) {
        return { status: 'disconnected', message: 'Database not connected' };
      }

      // Ping the database
      await mongoose.connection.db.admin().ping();
      
      // Get database stats
      const stats = await mongoose.connection.db.stats();
      
      return {
        status: 'healthy',
        message: 'Database connection is healthy',
        stats: {
          collections: stats.collections,
          dataSize: stats.dataSize,
          indexSize: stats.indexSize,
          storageSize: stats.storageSize
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: error.message
      };
    }
  }

  /**
   * Get database performance metrics
   */
  async getMetrics() {
    try {
      const db = mongoose.connection.db;
      
      // Get server status
      const serverStatus = await db.admin().serverStatus();
      
      // Get database stats
      const dbStats = await db.stats();
      
      return {
        connections: {
          current: serverStatus.connections.current,
          available: serverStatus.connections.available,
          totalCreated: serverStatus.connections.totalCreated
        },
        memory: {
          resident: serverStatus.mem.resident,
          virtual: serverStatus.mem.virtual,
          mapped: serverStatus.mem.mapped
        },
        operations: {
          insert: serverStatus.opcounters.insert,
          query: serverStatus.opcounters.query,
          update: serverStatus.opcounters.update,
          delete: serverStatus.opcounters.delete
        },
        database: {
          collections: dbStats.collections,
          dataSize: dbStats.dataSize,
          indexSize: dbStats.indexSize,
          storageSize: dbStats.storageSize
        }
      };
    } catch (error) {
      console.error('Error getting database metrics:', error);
      return null;
    }
  }
}

// Create singleton instance
const databaseConnection = new DatabaseConnection();

export default databaseConnection;
