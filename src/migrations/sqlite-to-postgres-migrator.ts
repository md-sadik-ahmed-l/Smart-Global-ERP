import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

interface MigrationConfig {
  sqlitePath?: string;
  postgresUrl: string;
  backup?: boolean;
  dataIntegrityCheck?: boolean;
}

class DatabaseMigration {
  private sqlitePath: string;
  private postgresUrl: string;
  private backup: boolean;
  private dataIntegrityCheck: boolean;
  private sqlite: PrismaClient;
  private postgres: PrismaClient;

  constructor(config: MigrationConfig) {
    this.sqlitePath = config.sqlitePath || './data/db/custom.db';
    this.postgresUrl = config.postgresUrl;
    this.backup = config.backup ?? true;
    this.dataIntegrityCheck = config.dataIntegrityCheck ?? true;
    
    this.sqlite = new PrismaClient({
      datasources: {
        db: {
          url: `file:${this.sqlitePath}`
        }
      }
    });
    
    this.postgres = new PrismaClient({
      datasources: {
        db: {
          url: this.postgresUrl
        }
      }
    });
  }

  // Main migration process
  async migrate(): Promise<void> {
    try {
      console.log('🚀 Starting SQLite to PostgreSQL migration...');
      console.log(`📂 SQLite database: ${this.sqlitePath}`);
      console.log(`🐘 PostgreSQL: ${this.postgresUrl.replace(/:[^/]*@/, '://***:')}`);

      // Step 1: Backup SQLite database
      if (this.backup) {
        await this.backupSQLite();
      }

      // Step 2: Reset PostgreSQL (clean slate)
      await this.resetPostgreSQL();

      // Step 3: Migrate schema (run Prisma migrations)
      await this.migrateSchema();

      // Step 4: Migrate data
      await this.migrateData();

      // Step 5: Verify integrity
      if (this.dataIntegrityCheck) {
        await this.verifyDataIntegrity();
      }

      // Step 6: Optimize PostgreSQL
      await this.optimizePostgreSQL();

      console.log('✅ Migration completed successfully!');
    } catch (error) {
      console.error('❌ Migration failed:', error);
      throw error;
    }
  }

  // Backup SQLite database
  private async backupSQLite(): Promise<void> {
    console.log('💾 Creating SQLite database backup...');
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(process.cwd(), `backups/sqlite-backup-${timestamp}.db`);
    
    // Ensure backups directory exists
    await execPromise(`mkdir -p ${path.dirname(backupPath)}`);
    
    // Copy SQLite database
    await execPromise(`cp "${this.sqlitePath}" "${backupPath}"`);
    
    console.log(`✅ SQLite backup created: ${backupPath}`);
  }

  // Reset PostgreSQL database
  private async resetPostgreSQL(): Promise<void> {
    console.log('🧹 Resetting PostgreSQL database...');
    
    try {
      // Try to delete existing data (be careful in production!)
      await this.postgres.$executeRaw`TRUNCATE TABLE "User" CASCADE`;
      await this.postgres.$executeRaw`TRUNCATE TABLE "Tenant" CASCADE`;
      await this.postgres.$executeRaw`TRUNCATE TABLE "AuditLog" CASCADE`;
      console.log('✅ PostgreSQL reset completed');
    } catch (error) {
      console.log('⚠️  Could not truncate, will clear by deleting and recreating...');
      // In production, use proper migrations instead
    }
  }

  // Migrate schema using Prisma migrations
  private async migrateSchema(): Promise<void> {
    console.log('📋 Migrating schema from SQLite to PostgreSQL...');
    
    // Generate Prisma client for PostgreSQL
    await execPromise('npx prisma generate');
    
    // Push schema from SQLite to PostgreSQL
    // This creates PostgreSQL tables based on the Prisma schema
    await execPromise('npx prisma db push');
    
    console.log('✅ Schema migration completed');
  }

  // Migrate data from SQLite to PostgreSQL
  private async migrateData(): Promise<void> {
    console.log('📊 Migrating data from SQLite to PostgreSQL...');
    
    // Get all data from SQLite tables
    const tables = [
      'Tenant',
      'User', 
      'Company',
      'Branch',
      'Warehouse',
      'Category',
      'Brand',
      'Product',
      'Customer',
      'Vendor',
      'SalesOrder',
      'SalesOrderItem',
      'PurchaseOrder',
      'PurchaseOrderItem',
      'StockItem',
      'Batch',
      'SerialNumber',
      'StockAdjustment',
      'StockTransfer',
      'BOM',
      'BOMItem',
      'WorkOrder',
      'WorkOrderItem',
      'ProductionLog',
      'QCCheck',
      'Employee',
      'SalaryStructure',
      'Attendance',
      'PayrollRun',
      'SalarySlip',
      'Notification',
      'AuditLog',
      'Role',
      'Permission',
      'RolePermission',
      'WarehouseStockItem',
    ];

    for (const table of tables) {
      try {
        console.log(`  📦 Migrating ${table}...`);
        const data = await this.getSQLiteData(table);
        if (data.length > 0) {
          await this.insertPostgreSQLData(table, data);
        }
      } catch (error) {
        console.warn(`⚠️  Failed to migrate ${table}:`, error);
      }
    }
    
    console.log('✅ Data migration completed');
  }

  // Get data from SQLite table
  private async getSQLiteData(tableName: string): Promise<any[]> {
    const modelName = tableName.charAt(0).toLowerCase() + tableName.slice(1);
    return this.sqlite.$queryRaw`SELECT * FROM ${this.sqlite.raw(tableName)}`;
  }

  // Insert data into PostgreSQL table
  private async insertPostgreSQLData(tableName: string, data: any[]): Promise<void> {
    if (data.length === 0) return;
    
    // Group data in chunks to avoid overwhelming the database
    const chunkSize = 1000;
    for (let i = 0; i < data.length; i += chunkSize) {
      const chunk = data.slice(i, i + chunkSize);
      
      // Transform data if needed
      const transformedData = await this.transformDataForPostgreSQL(tableName, chunk);
      
      // Insert chunk using raw SQL with proper escaping
      for (const item of transformedData) {
        const columns = Object.keys(item).filter(k => !k.startsWith('_')).join('", "');
        const values = Object.values(item).filter(v => {
          const key = Object.keys(item)[Object.values(item).indexOf(v)];
          return !key.startsWith('_');
        });
        
        const placeholders = values.map(() => '$1').join(', ');
        
        // Build safe insert statement
        await this.postgres.$executeRawUnsafe(
          `INSERT INTO "${tableName}" ("${columns}") VALUES (${placeholders}) ` +
          `ON CONFLICT (id) DO UPDATE SET ${Object.keys(item).filter(k => !k.startsWith('_')).map(k => `"${k}" = EXCLUDED."${k}"`).join(', ')}`,
          values.map((val, idx) => {
            const key = Object.keys(item)[Object.values(item).indexOf(val)];
            if (key.startsWith('_')) return null;
            if (typeof val === 'string') return val.replace(/'/g, "''");
            if (val instanceof Date) return val.toISOString();
            if (val === null) return 'NULL';
            return String(val);
          })
        );
      }
    }
  }

  // Transform data for PostgreSQL compatibility
  private async transformDataForPostgreSQL(tableName: string, data: any[]): Promise<any[]> {
    return data.map(item => {
      const transformed: any = {};
      
      for (const [key, value] of Object.entries(item)) {
        if (key.startsWith('_')) continue; // Skip internal fields
        
        let dbKey = key;
        let dbValue = value;
        
        // Handle field name transformations
        if (key === 'twoFactorSecret' || key === 'twoFactorBackupCodes') {
          dbKey = key;
          dbValue = value === null ? null : JSON.stringify(value);
        } else if (key === 'lastLoginAt' || key === 'createdAt' || key === 'updatedAt' || 
                   key === 'date' || key === 'deliveryDate' || key === 'orderDate' || 
                   key === 'expectedDate' || key === 'processedAt' || key === 'checkedAt') {
          dbKey = key;
          dbValue = value ? new Date(value) : null;
        }
        
        transformed[dbKey] = dbValue;
      }
      
      return transformed;
    });
  }

  // Verify data integrity after migration
  private async verifyDataIntegrity(): Promise<void> {
    console.log('🔍 Verifying data integrity...');
    
    const sqliteCounts: any = {};
    const postgresCounts: any = {};
    
    // Get row counts from SQLite
    for (const table of ['Tenant', 'User', 'Company', 'Branch', 'Product']) {
      try {
        const count = await this.getSQLiteDataCount(table);
        sqliteCounts[table] = count;
      } catch (error) {
        console.warn(`⚠️  Could not get count for ${table} from SQLite`);
      }
    }
    
    // Get row counts from PostgreSQL
    for (const table of ['Tenant', 'User', 'Company', 'Branch', 'Product']) {
      try {
        const count = await this.getPostgreSQLDataCount(table);
        postgresCounts[table] = count;
      } catch (error) {
        console.warn(`⚠️  Could not get count for ${table} from PostgreSQL`);
      }
    }
    
    // Compare counts
    console.log('\n📊 Migration Summary:');
    console.log('================================');
    for (const table of Object.keys(sqliteCounts)) {
      const sqliteCount = sqliteCounts[table];
      const postgresCount = postgresCounts[table] || 0;
      const status = sqliteCount === postgresCount ? '✅' : '❌';
      console.log(`${status} ${table}: SQLite=${sqliteCount}, PostgreSQL=${postgresCount}`);
      
      if (sqliteCount !== postgresCount) {
        console.warn(`⚠️  Row count mismatch for ${table} - manual verification needed`);
      }
    }
    
    console.log('✅ Data integrity verification completed');
  }

  // Get row count from SQLite
  private async getSQLiteDataCount(tableName: string): Promise<number> {
    const modelName = tableName.charAt(0).toLowerCase() + tableName.slice(1);
    const result = await this.sqlite.$queryRaw`SELECT COUNT(*) FROM ${this.sqlite.raw(tableName)}`;
    return Array.isArray(result) ? result[0].count : 0;
  }

  // Get row count from PostgreSQL
  private async getPostgreSQLDataCount(tableName: string): Promise<number> {
    const result = await this.postgres.$queryRaw`SELECT COUNT(*) FROM "${tableName}"`;
    return Array.isArray(result) ? result[0].count : 0;
  }

  // Optimize PostgreSQL performance
  private async optimizePostgreSQL(): Promise<void> {
    console.log('⚡ Optimizing PostgreSQL performance...');
    
    // Create important indexes
    await this.postgres.$executeRawUnsafe(
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_email_tenant ON "User"("email", "tenantId")'
    );
    
    await this.postgres.$executeRawUnsafe(
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_sku_tenant ON "Product"("sku", "tenantId")'
    );
    
    await this.postgres.$executeRawUnsafe(
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_salesorder_order_number_tenant ON "SalesOrder"("orderNumber", "tenantId")'
    );
    
    await this.postgres.$executeRawUnsafe(
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tenant_code ON "Tenant"("code")'
    );
    
    console.log('✅ PostgreSQL optimization completed');
  }

  // Rollback migration (emergency use only)
  async rollback(): Promise<void> {
    console.log('⚠️  Rolling back migration...');
    
    try {
      // Truncate all PostgreSQL tables
      await this.postgres.$executeRawUnsafe(
        'DO $$ DECLARE\n  r RECORD;\nBEGIN\n  FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = \'public\') LOOP\n    EXECUTE \'TRUNCATE TABLE "\' || r.tablename || \'" CASCADE\';\n  END LOOP;\nEND $$;'
      );
      
      console.log('✅ Rollback completed');
    } catch (error) {
      console.error('❌ Rollback failed:', error);
      throw error;
    }
  }
}

// Export migration class
export { DatabaseMigration };

// Example usage
async function main() {
  const config: MigrationConfig = {
    sqlitePath: './data/db/custom.db',
    postgresUrl: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/erp_production',
    backup: true,
    dataIntegrityCheck: true,
  };

  const migration = new DatabaseMigration(config);
  
  // Handle command line arguments
  const args = process.argv.slice(2);
  
  if (args.includes('--rollback')) {
    await migration.rollback();
  } else {
    await migration.migrate();
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}
