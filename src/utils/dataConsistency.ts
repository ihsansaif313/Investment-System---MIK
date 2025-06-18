import { InvestmentWithDetails, InvestorInvestmentWithDetails, UserWithRole } from '../types/database';

/**
 * Data consistency utilities for cross-platform synchronization
 * Ensures data integrity across admin, superadmin, and investor views
 */

export interface DataConsistencyCheck {
  isConsistent: boolean;
  errors: string[];
  warnings: string[];
}

export interface CrossPlatformData {
  investments: InvestmentWithDetails[];
  investorInvestments: InvestorInvestmentWithDetails[];
  users: UserWithRole[];
  lastSync: Date;
}

/**
 * Validates data consistency across different user role views
 */
export const validateDataConsistency = (data: CrossPlatformData): DataConsistencyCheck => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check investment totals consistency
  const investmentTotalCheck = validateInvestmentTotals(data);
  errors.push(...investmentTotalCheck.errors);
  warnings.push(...investmentTotalCheck.warnings);

  // Check user role consistency
  const userRoleCheck = validateUserRoles(data);
  errors.push(...userRoleCheck.errors);
  warnings.push(...userRoleCheck.warnings);

  // Check investor investment consistency
  const investorInvestmentCheck = validateInvestorInvestments(data);
  errors.push(...investorInvestmentCheck.errors);
  warnings.push(...investorInvestmentCheck.warnings);

  return {
    isConsistent: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Validates that investment totals match across different views
 */
const validateInvestmentTotals = (data: CrossPlatformData): DataConsistencyCheck => {
  const errors: string[] = [];
  const warnings: string[] = [];

  data.investments.forEach(investment => {
    // Get all investor investments for this investment
    const relatedInvestorInvestments = data.investorInvestments.filter(
      ii => ii.investment_id === investment.id
    );

    // Calculate total invested amount
    const totalInvested = relatedInvestorInvestments.reduce(
      (sum, ii) => sum + ii.amount_invested, 0
    );

    // Check if investment's totalInvested matches calculated total
    if (Math.abs(investment.totalInvested - totalInvested) > 0.01) {
      errors.push(
        `Investment ${investment.name} has inconsistent total invested: ` +
        `recorded ${investment.totalInvested}, calculated ${totalInvested}`
      );
    }

    // Check if investor count matches
    const uniqueInvestors = new Set(relatedInvestorInvestments.map(ii => ii.user_id));
    if (investment.totalInvestors !== uniqueInvestors.size) {
      errors.push(
        `Investment ${investment.name} has inconsistent investor count: ` +
        `recorded ${investment.totalInvestors}, calculated ${uniqueInvestors.size}`
      );
    }

    // Warn if current value seems inconsistent
    if (investment.current_value < totalInvested * 0.5) {
      warnings.push(
        `Investment ${investment.name} current value (${investment.current_value}) ` +
        `is significantly lower than total invested (${totalInvested})`
      );
    }
  });

  return { isConsistent: errors.length === 0, errors, warnings };
};

/**
 * Validates user role assignments and permissions
 */
const validateUserRoles = (data: CrossPlatformData): DataConsistencyCheck => {
  const errors: string[] = [];
  const warnings: string[] = [];

  data.users.forEach(user => {
    // Check if user has valid role
    if (!user.role || !user.role.id) {
      errors.push(`User ${user.email} has no valid role assigned`);
      return;
    }

    // Check admin role consistency
    if (user.role.id === 'admin') {
      if (!user.subCompanyAdmin?.sub_company_id) {
        errors.push(`Admin user ${user.email} has no sub-company assigned`);
      }
    }

    // Check investor role consistency
    if (user.role.id === 'investor') {
      const userInvestments = data.investorInvestments.filter(ii => ii.user_id === user.id);
      if (userInvestments.length === 0) {
        warnings.push(`Investor ${user.email} has no investments`);
      }
    }

    // Check superadmin role consistency
    if (user.role.id === 'superadmin') {
      if (user.subCompanyAdmin?.sub_company_id) {
        warnings.push(`Superadmin user ${user.email} should not have sub-company assignment`);
      }
    }
  });

  return { isConsistent: errors.length === 0, errors, warnings };
};

/**
 * Validates investor investment data consistency
 */
const validateInvestorInvestments = (data: CrossPlatformData): DataConsistencyCheck => {
  const errors: string[] = [];
  const warnings: string[] = [];

  data.investorInvestments.forEach(ii => {
    // Check if referenced investment exists
    const investment = data.investments.find(inv => inv.id === ii.investment_id);
    if (!investment) {
      errors.push(`Investor investment ${ii.id} references non-existent investment ${ii.investment_id}`);
      return;
    }

    // Check if referenced user exists
    const user = data.users.find(u => u.id === ii.user_id);
    if (!user) {
      errors.push(`Investor investment ${ii.id} references non-existent user ${ii.user_id}`);
      return;
    }

    // Check if user is actually an investor
    if (user.role?.id !== 'investor') {
      errors.push(`Investor investment ${ii.id} references user ${user.email} who is not an investor`);
    }

    // Check investment amount constraints
    if (investment.min_investment && ii.amount_invested < investment.min_investment) {
      errors.push(
        `Investor investment ${ii.id} amount (${ii.amount_invested}) ` +
        `is below minimum (${investment.min_investment})`
      );
    }

    if (investment.max_investment && ii.amount_invested > investment.max_investment) {
      errors.push(
        `Investor investment ${ii.id} amount (${ii.amount_invested}) ` +
        `exceeds maximum (${investment.max_investment})`
      );
    }

    // Warn about unusual current values
    if (ii.currentValue < ii.amount_invested * 0.3) {
      warnings.push(
        `Investor investment ${ii.id} has very low current value ` +
        `(${ii.currentValue}) compared to invested amount (${ii.amount_invested})`
      );
    }
  });

  return { isConsistent: errors.length === 0, errors, warnings };
};

/**
 * Synchronizes data across different user role views
 */
export const synchronizeDataAcrossRoles = (data: CrossPlatformData): CrossPlatformData => {
  const synchronized = { ...data };

  // Recalculate investment totals
  synchronized.investments = synchronized.investments.map(investment => {
    const relatedInvestorInvestments = synchronized.investorInvestments.filter(
      ii => ii.investment_id === investment.id
    );

    const totalInvested = relatedInvestorInvestments.reduce(
      (sum, ii) => sum + ii.amount_invested, 0
    );

    const uniqueInvestors = new Set(relatedInvestorInvestments.map(ii => ii.user_id));

    return {
      ...investment,
      totalInvested,
      totalInvestors: uniqueInvestors.size
    };
  });

  // Update last sync timestamp
  synchronized.lastSync = new Date();

  return synchronized;
};

/**
 * Generates a data consistency report
 */
export const generateConsistencyReport = (data: CrossPlatformData): string => {
  const check = validateDataConsistency(data);
  
  let report = `Data Consistency Report - ${new Date().toISOString()}\n`;
  report += `=================================================\n\n`;
  
  report += `Overall Status: ${check.isConsistent ? 'CONSISTENT' : 'INCONSISTENT'}\n`;
  report += `Total Errors: ${check.errors.length}\n`;
  report += `Total Warnings: ${check.warnings.length}\n\n`;

  if (check.errors.length > 0) {
    report += `ERRORS:\n`;
    check.errors.forEach((error, index) => {
      report += `${index + 1}. ${error}\n`;
    });
    report += `\n`;
  }

  if (check.warnings.length > 0) {
    report += `WARNINGS:\n`;
    check.warnings.forEach((warning, index) => {
      report += `${index + 1}. ${warning}\n`;
    });
    report += `\n`;
  }

  // Data summary
  report += `DATA SUMMARY:\n`;
  report += `- Total Investments: ${data.investments.length}\n`;
  report += `- Total Investor Investments: ${data.investorInvestments.length}\n`;
  report += `- Total Users: ${data.users.length}\n`;
  report += `- Last Sync: ${data.lastSync.toISOString()}\n`;

  return report;
};

/**
 * Validates that admin can only see their sub-company data
 */
export const validateAdminDataScope = (
  adminUserId: string,
  subCompanyId: string,
  data: CrossPlatformData
): DataConsistencyCheck => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check that all investments belong to the admin's sub-company
  const invalidInvestments = data.investments.filter(
    inv => inv.sub_company_id !== subCompanyId
  );

  if (invalidInvestments.length > 0) {
    errors.push(
      `Admin ${adminUserId} has access to ${invalidInvestments.length} investments ` +
      `outside their sub-company ${subCompanyId}`
    );
  }

  return { isConsistent: errors.length === 0, errors, warnings };
};

export default {
  validateDataConsistency,
  synchronizeDataAcrossRoles,
  generateConsistencyReport,
  validateAdminDataScope
};
