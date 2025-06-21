/**
 * Demo Authentication Service
 * Handles hardcoded demo accounts for client presentations
 * Bypasses normal authentication for specific demo credentials
 */

export interface DemoUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: {
    type: 'superadmin' | 'admin' | 'investor';
    id: string;
    permissions: string[];
  };
  avatar?: string;
  joinDate: string;
  lastLogin: string;
  status: 'active';
  isDemo: true;
}

// Demo account credentials and user data
const DEMO_ACCOUNTS = {
  'miksupadmin@gmail.com': {
    password: 'Mik123!',
    user: {
      id: 'demo-superadmin-001',
      email: 'miksupadmin@gmail.com',
      firstName: 'Michael',
      lastName: 'SuperAdmin',
      role: {
        type: 'superadmin' as const,
        id: 'superadmin',
        permissions: [
          'view_all_companies',
          'create_companies',
          'edit_companies',
          'delete_companies',
          'view_all_users',
          'create_users',
          'edit_users',
          'delete_users',
          'view_all_investments',
          'create_investments',
          'edit_investments',
          'delete_investments',
          'view_analytics',
          'system_settings'
        ]
      },
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      joinDate: '2023-01-01',
      lastLogin: new Date().toISOString(),
      status: 'active' as const,
      isDemo: true as const
    }
  },
  'mikadmin@gmail.com': {
    password: 'Mik123!',
    user: {
      id: 'demo-admin-001',
      email: 'mikadmin@gmail.com',
      firstName: 'Michael',
      lastName: 'Admin',
      role: {
        type: 'admin' as const,
        id: 'admin',
        status: 'active' as const, // Ensure demo admin is active
        permissions: [
          'view_assigned_companies',
          'edit_assigned_companies',
          'view_company_investments',
          'create_investments',
          'edit_investments',
          'view_company_users',
          'create_investors',
          'edit_investors',
          'view_company_analytics'
        ]
      },
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      joinDate: '2023-02-15',
      lastLogin: new Date().toISOString(),
      status: 'active' as const,
      isDemo: true as const,
      // Admin-specific data with active status
      subCompanyAdmin: {
        sub_company_id: 'company-1', // Meta Platforms Inc.
        company_name: 'Meta Platforms Inc.',
        status: 'active' as const, // Bypass pending status
        permissions: ['manage_investments', 'manage_investors']
      },
      // Company assignments to bypass pending screen
      companyAssignments: [
        {
          id: 'assignment-1',
          company_id: 'company-1',
          company_name: 'Meta Platforms Inc.',
          status: 'active' as const,
          assigned_at: '2023-02-15',
          permissions: ['manage_investments', 'manage_investors']
        }
      ]
    }
  },
  'mikinvestor@gmail.com': {
    password: 'Mik123!',
    user: {
      id: 'demo-investor-001',
      email: 'mikinvestor@gmail.com',
      firstName: 'Michael',
      lastName: 'Investor',
      role: {
        type: 'investor' as const,
        id: 'investor',
        permissions: [
          'view_own_investments',
          'create_investments',
          'view_marketplace',
          'view_own_analytics'
        ]
      },
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
      joinDate: '2023-06-10',
      lastLogin: new Date().toISOString(),
      status: 'active' as const,
      isDemo: true as const
    }
  }
};

/**
 * Check if the provided credentials match a demo account
 */
export const isDemoAccount = (email: string, password: string): boolean => {
  const normalizedEmail = email.toLowerCase().trim();
  const demoAccount = DEMO_ACCOUNTS[normalizedEmail as keyof typeof DEMO_ACCOUNTS];
  
  return demoAccount ? demoAccount.password === password : false;
};

/**
 * Get demo user data for authenticated demo account
 */
export const getDemoUser = (email: string): DemoUser | null => {
  const normalizedEmail = email.toLowerCase().trim();
  const demoAccount = DEMO_ACCOUNTS[normalizedEmail as keyof typeof DEMO_ACCOUNTS];
  
  return demoAccount ? demoAccount.user : null;
};

/**
 * Generate a demo JWT token (for consistency with normal auth flow)
 */
export const generateDemoToken = (user: DemoUser): string => {
  // Create a simple base64 encoded token with user info
  // Note: This is for demo purposes only, not secure for production
  const tokenData = {
    userId: user.id,
    email: user.email,
    role: user.role.type,
    isDemo: true,
    exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
  };
  
  return btoa(JSON.stringify(tokenData));
};

/**
 * Validate demo token
 */
export const validateDemoToken = (token: string): DemoUser | null => {
  try {
    const tokenData = JSON.parse(atob(token));
    
    if (!tokenData.isDemo || tokenData.exp < Date.now()) {
      return null;
    }
    
    return getDemoUser(tokenData.email);
  } catch (error) {
    return null;
  }
};

/**
 * Demo authentication function
 */
export const authenticateDemo = async (email: string, password: string): Promise<{
  success: boolean;
  user?: DemoUser;
  token?: string;
  message?: string;
}> => {
  const normalizedEmail = email.toLowerCase().trim();
  
  if (!isDemoAccount(normalizedEmail, password)) {
    return {
      success: false,
      message: 'Invalid demo credentials'
    };
  }
  
  const user = getDemoUser(normalizedEmail);
  if (!user) {
    return {
      success: false,
      message: 'Demo user not found'
    };
  }
  
  const token = generateDemoToken(user);
  
  return {
    success: true,
    user,
    token,
    message: 'Demo authentication successful'
  };
};

/**
 * Get demo account information for display purposes
 */
export const getDemoAccountsInfo = () => {
  return [
    {
      role: 'Super Admin',
      email: 'miksupadmin@gmail.com',
      password: 'Mik123!',
      description: 'Full system access with all companies, investments, and analytics'
    },
    {
      role: 'Admin',
      email: 'mikadmin@gmail.com',
      password: 'Mik123!',
      description: 'Company-level access with investment and investor management'
    },
    {
      role: 'Investor',
      email: 'mikinvestor@gmail.com',
      password: 'Mik123!',
      description: 'Personal portfolio access with investment opportunities'
    }
  ];
};

export default {
  isDemoAccount,
  getDemoUser,
  generateDemoToken,
  validateDemoToken,
  authenticateDemo,
  getDemoAccountsInfo
};
