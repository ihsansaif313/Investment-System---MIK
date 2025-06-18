/**
 * WebSocket Server
 * Real-time communication for live updates across all user interfaces
 */

import { WebSocketServer } from 'ws';
import jwt from 'jsonwebtoken';
import { User, Role, Session } from '../models/index.js';
import { config } from '../config/environment.js';
import logger from '../utils/logger.js';

class WebSocketManager {
  constructor() {
    this.wss = null;
    this.clients = new Map(); // Map of userId -> Set of WebSocket connections
    this.rooms = new Map(); // Map of roomId -> Set of userIds
    this.heartbeatInterval = null;
  }

  /**
   * Initialize WebSocket server
   */
  initialize(server) {
    this.wss = new WebSocketServer({
      server,
      path: '/ws',
      verifyClient: this.verifyClient.bind(this)
    });

    this.wss.on('connection', this.handleConnection.bind(this));
    this.startHeartbeat();

    logger.info('WebSocket server initialized', {
      path: '/ws',
      port: config.WS_PORT
    });
  }

  /**
   * Verify client connection
   */
  async verifyClient(info) {
    try {
      const url = new URL(info.req.url, `http://${info.req.headers.host}`);
      const token = url.searchParams.get('token');

      if (!token) {
        logger.warn('WebSocket connection rejected: No token provided');
        return false;
      }

      // Verify JWT token
      const decoded = jwt.verify(token, config.JWT_SECRET);
      
      if (decoded.type !== 'access') {
        logger.warn('WebSocket connection rejected: Invalid token type');
        return false;
      }

      // Check session
      const session = await Session.findOne({
        token,
        userId: decoded.userId,
        isActive: true,
        expiresAt: { $gt: new Date() }
      });

      if (!session) {
        logger.warn('WebSocket connection rejected: Invalid session');
        return false;
      }

      // Get user
      const user = await User.findById(decoded.userId).select('-password');
      if (!user || !user.isActive) {
        logger.warn('WebSocket connection rejected: User not found or inactive');
        return false;
      }

      // Get role
      const role = await Role.findOne({ userId: user._id, isActive: true });
      if (!role) {
        logger.warn('WebSocket connection rejected: User role not found');
        return false;
      }

      // Store user info for connection handler
      info.req.user = {
        id: user._id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: {
          id: role.type,
          name: role.type,
          permissions: role.permissions || []
        }
      };

      return true;
    } catch (error) {
      logger.error('WebSocket verification error:', error);
      return false;
    }
  }

  /**
   * Handle new WebSocket connection
   */
  handleConnection(ws, req) {
    const user = req.user;
    const userId = user.id;

    // Add client to connections map
    if (!this.clients.has(userId)) {
      this.clients.set(userId, new Set());
    }
    this.clients.get(userId).add(ws);

    // Set up WebSocket properties
    ws.userId = userId;
    ws.user = user;
    ws.isAlive = true;
    ws.lastActivity = new Date();

    // Join user to appropriate rooms based on role
    this.joinUserToRooms(userId, user.role.id);

    // Send welcome message
    this.sendToUser(userId, {
      type: 'connection',
      message: 'Connected to real-time updates',
      timestamp: new Date().toISOString()
    });

    // Handle incoming messages
    ws.on('message', (data) => {
      this.handleMessage(ws, data);
    });

    // Handle connection close
    ws.on('close', () => {
      this.handleDisconnection(ws);
    });

    // Handle pong response for heartbeat
    ws.on('pong', () => {
      ws.isAlive = true;
      ws.lastActivity = new Date();
    });

    logger.info('WebSocket client connected', {
      userId,
      email: user.email,
      role: user.role.id,
      totalConnections: this.getTotalConnections()
    });
  }

  /**
   * Handle incoming WebSocket messages
   */
  handleMessage(ws, data) {
    try {
      const message = JSON.parse(data);
      ws.lastActivity = new Date();

      switch (message.type) {
        case 'ping':
          ws.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
          break;

        case 'join_room':
          this.joinRoom(ws.userId, message.roomId);
          break;

        case 'leave_room':
          this.leaveRoom(ws.userId, message.roomId);
          break;

        case 'subscribe':
          this.handleSubscription(ws, message);
          break;

        default:
          logger.warn('Unknown WebSocket message type:', message.type);
      }
    } catch (error) {
      logger.error('Error handling WebSocket message:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Invalid message format',
        timestamp: new Date().toISOString()
      }));
    }
  }

  /**
   * Handle WebSocket disconnection
   */
  handleDisconnection(ws) {
    const userId = ws.userId;

    if (userId && this.clients.has(userId)) {
      this.clients.get(userId).delete(ws);
      
      // Remove user from clients map if no more connections
      if (this.clients.get(userId).size === 0) {
        this.clients.delete(userId);
        this.removeUserFromAllRooms(userId);
      }
    }

    logger.info('WebSocket client disconnected', {
      userId,
      totalConnections: this.getTotalConnections()
    });
  }

  /**
   * Join user to appropriate rooms based on role
   */
  joinUserToRooms(userId, roleId) {
    // All users join global room
    this.joinRoom(userId, 'global');

    // Role-specific rooms
    switch (roleId) {
      case 'superadmin':
        this.joinRoom(userId, 'superadmin');
        this.joinRoom(userId, 'admin');
        break;
      case 'admin':
        this.joinRoom(userId, 'admin');
        break;
      case 'investor':
        this.joinRoom(userId, 'investor');
        break;
    }
  }

  /**
   * Join user to a room
   */
  joinRoom(userId, roomId) {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Set());
    }
    this.rooms.get(roomId).add(userId);

    logger.debug('User joined room', { userId, roomId });
  }

  /**
   * Remove user from a room
   */
  leaveRoom(userId, roomId) {
    if (this.rooms.has(roomId)) {
      this.rooms.get(roomId).delete(userId);
      
      // Remove room if empty
      if (this.rooms.get(roomId).size === 0) {
        this.rooms.delete(roomId);
      }
    }

    logger.debug('User left room', { userId, roomId });
  }

  /**
   * Remove user from all rooms
   */
  removeUserFromAllRooms(userId) {
    for (const [roomId, users] of this.rooms.entries()) {
      users.delete(userId);
      if (users.size === 0) {
        this.rooms.delete(roomId);
      }
    }
  }

  /**
   * Send message to specific user
   */
  sendToUser(userId, message) {
    const userConnections = this.clients.get(userId);
    if (userConnections) {
      const messageStr = JSON.stringify(message);
      userConnections.forEach(ws => {
        if (ws.readyState === ws.OPEN) {
          ws.send(messageStr);
        }
      });
    }
  }

  /**
   * Send message to all users in a room
   */
  sendToRoom(roomId, message) {
    const roomUsers = this.rooms.get(roomId);
    if (roomUsers) {
      roomUsers.forEach(userId => {
        this.sendToUser(userId, message);
      });
    }
  }

  /**
   * Broadcast message to all connected clients
   */
  broadcast(message) {
    const messageStr = JSON.stringify(message);
    this.clients.forEach(userConnections => {
      userConnections.forEach(ws => {
        if (ws.readyState === ws.OPEN) {
          ws.send(messageStr);
        }
      });
    });
  }

  /**
   * Send investment update
   */
  sendInvestmentUpdate(investmentData, subCompanyId = null) {
    const message = {
      type: 'investment_update',
      data: investmentData,
      timestamp: new Date().toISOString()
    };

    // Send to superadmin
    this.sendToRoom('superadmin', message);

    // Send to relevant admin
    if (subCompanyId) {
      this.sendToRoom(`admin_${subCompanyId}`, message);
    }

    // Send to global room for investors
    this.sendToRoom('investor', message);
  }

  /**
   * Send user update
   */
  sendUserUpdate(userData) {
    const message = {
      type: 'user_update',
      data: userData,
      timestamp: new Date().toISOString()
    };

    this.sendToRoom('superadmin', message);
    this.sendToRoom('admin', message);
  }

  /**
   * Send analytics update
   */
  sendAnalyticsUpdate(analyticsData, targetRole = 'all') {
    const message = {
      type: 'analytics_update',
      data: analyticsData,
      timestamp: new Date().toISOString()
    };

    if (targetRole === 'all') {
      this.broadcast(message);
    } else {
      this.sendToRoom(targetRole, message);
    }
  }

  /**
   * Start heartbeat to detect dead connections
   */
  startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      this.clients.forEach(userConnections => {
        userConnections.forEach(ws => {
          if (!ws.isAlive) {
            ws.terminate();
            return;
          }
          
          ws.isAlive = false;
          ws.ping();
        });
      });
    }, 30000); // 30 seconds
  }

  /**
   * Stop heartbeat
   */
  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Get total number of connections
   */
  getTotalConnections() {
    let total = 0;
    this.clients.forEach(userConnections => {
      total += userConnections.size;
    });
    return total;
  }

  /**
   * Get connection statistics
   */
  getStats() {
    return {
      totalConnections: this.getTotalConnections(),
      totalUsers: this.clients.size,
      totalRooms: this.rooms.size,
      rooms: Array.from(this.rooms.entries()).map(([roomId, users]) => ({
        roomId,
        userCount: users.size
      }))
    };
  }

  /**
   * Close all connections and cleanup
   */
  close() {
    this.stopHeartbeat();
    
    if (this.wss) {
      this.wss.close();
    }
    
    this.clients.clear();
    this.rooms.clear();
    
    logger.info('WebSocket server closed');
  }
}

// Create singleton instance
const webSocketManager = new WebSocketManager();

export default webSocketManager;
