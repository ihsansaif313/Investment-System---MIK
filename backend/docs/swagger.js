/**
 * Swagger API Documentation Configuration
 * Comprehensive API documentation with OpenAPI 3.0 specification
 */

import swaggerJsdoc from 'swagger-jsdoc';
import { config } from '../config/environment.js';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Investment Management System API',
      version: config.APP_VERSION || '1.0.0',
      description: 'A comprehensive investment management platform with real-time synchronization and role-based access control.',
      contact: {
        name: 'API Support',
        email: 'support@investmentmanagement.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: `http://localhost:${config.PORT}`,
        description: 'Development server'
      },
      {
        url: 'https://api.investmentmanagement.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token for authentication'
        }
      },
      schemas: {
        User: {
          type: 'object',
          required: ['firstName', 'lastName', 'email', 'password', 'phone', 'dateOfBirth', 'address'],
          properties: {
            id: {
              type: 'string',
              description: 'User unique identifier'
            },
            firstName: {
              type: 'string',
              minLength: 2,
              maxLength: 50,
              description: 'User first name'
            },
            lastName: {
              type: 'string',
              minLength: 2,
              maxLength: 50,
              description: 'User last name'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address'
            },
            phone: {
              type: 'string',
              description: 'User phone number'
            },
            dateOfBirth: {
              type: 'string',
              format: 'date',
              description: 'User date of birth'
            },
            address: {
              type: 'string',
              minLength: 10,
              maxLength: 200,
              description: 'User address'
            },
            profileImage: {
              type: 'string',
              description: 'URL to user profile image'
            },
            isActive: {
              type: 'boolean',
              description: 'User account status'
            },
            emailVerified: {
              type: 'boolean',
              description: 'Email verification status'
            },
            role: {
              $ref: '#/components/schemas/Role'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'User creation timestamp'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'User last update timestamp'
            }
          }
        },
        Role: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              enum: ['superadmin', 'admin', 'investor'],
              description: 'Role identifier'
            },
            name: {
              type: 'string',
              description: 'Role display name'
            },
            permissions: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Permission'
              }
            }
          }
        },
        Permission: {
          type: 'object',
          properties: {
            resource: {
              type: 'string',
              description: 'Resource name'
            },
            actions: {
              type: 'array',
              items: {
                type: 'string',
                enum: ['create', 'read', 'update', 'delete', 'manage']
              }
            }
          }
        },
        Investment: {
          type: 'object',
          required: ['name', 'subCompanyId', 'assetId', 'targetAmount', 'minInvestment', 'riskLevel', 'startDate', 'endDate'],
          properties: {
            id: {
              type: 'string',
              description: 'Investment unique identifier'
            },
            name: {
              type: 'string',
              minLength: 3,
              maxLength: 100,
              description: 'Investment name'
            },
            description: {
              type: 'string',
              maxLength: 2000,
              description: 'Investment description'
            },
            subCompanyId: {
              type: 'string',
              description: 'Sub-company identifier'
            },
            assetId: {
              type: 'string',
              description: 'Asset identifier'
            },
            targetAmount: {
              type: 'number',
              minimum: 1000,
              maximum: 1000000000,
              description: 'Target investment amount'
            },
            minInvestment: {
              type: 'number',
              minimum: 100,
              maximum: 1000000,
              description: 'Minimum investment amount'
            },
            maxInvestment: {
              type: 'number',
              minimum: 1000,
              maximum: 1000000000,
              description: 'Maximum investment amount'
            },
            currentValue: {
              type: 'number',
              minimum: 0,
              description: 'Current investment value'
            },
            totalInvested: {
              type: 'number',
              minimum: 0,
              description: 'Total amount invested'
            },
            totalInvestors: {
              type: 'number',
              minimum: 0,
              description: 'Total number of investors'
            },
            expectedROI: {
              type: 'number',
              minimum: -100,
              maximum: 1000,
              description: 'Expected return on investment percentage'
            },
            actualROI: {
              type: 'number',
              description: 'Actual return on investment percentage'
            },
            riskLevel: {
              type: 'string',
              enum: ['low', 'medium', 'high'],
              description: 'Investment risk level'
            },
            status: {
              type: 'string',
              enum: ['draft', 'active', 'closed', 'cancelled'],
              description: 'Investment status'
            },
            startDate: {
              type: 'string',
              format: 'date',
              description: 'Investment start date'
            },
            endDate: {
              type: 'string',
              format: 'date',
              description: 'Investment end date'
            },
            currency: {
              type: 'string',
              default: 'USD',
              description: 'Investment currency'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Investment creation timestamp'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Investment last update timestamp'
            }
          }
        },
        InvestorInvestment: {
          type: 'object',
          required: ['userId', 'investmentId', 'amountInvested'],
          properties: {
            id: {
              type: 'string',
              description: 'Investor investment unique identifier'
            },
            userId: {
              type: 'string',
              description: 'Investor user identifier'
            },
            investmentId: {
              type: 'string',
              description: 'Investment identifier'
            },
            amountInvested: {
              type: 'number',
              minimum: 0,
              description: 'Amount invested by the investor'
            },
            currentValue: {
              type: 'number',
              minimum: 0,
              description: 'Current value of the investment'
            },
            status: {
              type: 'string',
              enum: ['pending', 'approved', 'active', 'withdrawn', 'matured'],
              description: 'Investment status'
            },
            investmentDate: {
              type: 'string',
              format: 'date-time',
              description: 'Date of investment'
            },
            approvedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Date of approval'
            }
          }
        },
        Company: {
          type: 'object',
          required: ['name', 'address', 'contactEmail', 'contactPhone', 'establishedDate', 'registrationNumber', 'taxId'],
          properties: {
            id: {
              type: 'string',
              description: 'Company unique identifier'
            },
            name: {
              type: 'string',
              minLength: 2,
              maxLength: 100,
              description: 'Company name'
            },
            address: {
              type: 'string',
              minLength: 10,
              maxLength: 200,
              description: 'Company address'
            },
            contactEmail: {
              type: 'string',
              format: 'email',
              description: 'Company contact email'
            },
            contactPhone: {
              type: 'string',
              description: 'Company contact phone'
            },
            website: {
              type: 'string',
              format: 'uri',
              description: 'Company website URL'
            },
            establishedDate: {
              type: 'string',
              format: 'date',
              description: 'Company establishment date'
            },
            registrationNumber: {
              type: 'string',
              minLength: 5,
              maxLength: 50,
              description: 'Company registration number'
            },
            taxId: {
              type: 'string',
              minLength: 5,
              maxLength: 50,
              description: 'Company tax ID'
            },
            description: {
              type: 'string',
              maxLength: 1000,
              description: 'Company description'
            },
            isActive: {
              type: 'boolean',
              description: 'Company status'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            error: {
              type: 'object',
              properties: {
                message: {
                  type: 'string',
                  description: 'Error message'
                },
                errors: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      field: {
                        type: 'string',
                        description: 'Field name with error'
                      },
                      message: {
                        type: 'string',
                        description: 'Field error message'
                      }
                    }
                  }
                }
              }
            }
          }
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              description: 'Success message'
            },
            data: {
              type: 'object',
              description: 'Response data'
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and authorization endpoints'
      },
      {
        name: 'Users',
        description: 'User management endpoints'
      },
      {
        name: 'Investments',
        description: 'Investment management endpoints'
      },
      {
        name: 'Companies',
        description: 'Company management endpoints'
      },
      {
        name: 'Analytics',
        description: 'Analytics and reporting endpoints'
      },
      {
        name: 'System',
        description: 'System health and monitoring endpoints'
      }
    ]
  },
  apis: [
    './routes/*.js',
    './controllers/*.js'
  ]
};

const specs = swaggerJsdoc(options);

export default specs;
