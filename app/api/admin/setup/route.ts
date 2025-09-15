import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { sequelize } from '@/lib/db/sequelize';
import { AuditLog, AuditAction, User, Role } from '@/lib/db/models';
import { env } from '@/lib/env';
import { supabaseServer } from '@/lib/supabase/server';

// Force Node.js runtime for database operations
export const runtime = 'nodejs';

const execAsync = promisify(exec);

/**
 * POST /api/admin/setup
 * Initialize database schema and seed data
 * Requires service role key to be present (server-only)
 */
export async function POST(request: NextRequest) {
  try {
    // Verify we have service role key (security check)
    if (!env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: 'Setup not available - missing service role key' },
        { status: 403 }
      );
    }

    console.log('🚀 Starting database setup...');

    // Test database connection first
    try {
      await sequelize.authenticate();
      console.log('✅ Database connection verified');
    } catch (connectionError: any) {
      console.error('❌ Database connection failed:', connectionError.message);
      return NextResponse.json(
        { 
          error: 'Database connection failed', 
          message: connectionError.message,
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }

    // Run migrations
    console.log('📊 Running database migrations...');
    try {
      const { stdout: migrateOut, stderr: migrateErr } = await execAsync(
        'npx sequelize-cli db:migrate',
        { cwd: process.cwd() }
      );
      
      if (migrateErr && !migrateErr.includes('INFO')) {
        console.warn('Migration warnings:', migrateErr);
      }
      console.log('✅ Migrations completed');
      
    } catch (migrateError: any) {
      console.error('❌ Migration failed:', migrateError.message);
      return NextResponse.json(
        { error: 'Database migration failed', details: migrateError.message },
        { status: 500 }
      );
    }

    // Run seeders (but don't fail if they already exist)
    console.log('🌱 Running database seeders...');
    try {
      const { stdout: seedOut, stderr: seedErr } = await execAsync(
        'npx sequelize-cli db:seed:all',
        { cwd: process.cwd() }
      );
      
      if (seedErr && !seedErr.includes('INFO')) {
        console.warn('Seeder warnings:', seedErr);
      }
      console.log('✅ Seeders completed');
      
    } catch (seedError: any) {
      console.warn('⚠️ Seeding failed (may already exist):', seedError.message);
      // Continue anyway - seeders might already be applied
      if (seedError.message.includes('already exists')) {
        console.log('📝 Seeders already applied, continuing...');
      } else {
        return NextResponse.json(
          { error: 'Database seeding failed', details: seedError.message },
          { status: 500 }
        );
      }
    }

    // Ensure superadmin user exists
    console.log('👤 Checking for superadmin user...');
    try {
      await createSuperAdminIfNotExists();
      console.log('✅ Superadmin user verified');
    } catch (superAdminError: any) {
      console.error('❌ Failed to create superadmin:', superAdminError.message);
      return NextResponse.json(
        { error: 'Failed to create superadmin user', details: superAdminError.message },
        { status: 500 }
      );
    }

    // Log the setup action in audit logs
    try {
      await AuditLog.create({
        actorUserId: null, // System action
        entity: 'system',
        entityId: null,
        action: AuditAction.SETUP,
        diff: {
          message: 'Database schema initialized',
          timestamp: new Date().toISOString(),
        },
      });
      console.log('✅ Setup logged to audit trail');
    } catch (auditError) {
      console.warn('⚠️ Failed to log setup to audit trail:', auditError);
      // Don't fail the setup for audit log issues
    }

    console.log('🎉 Database setup completed successfully!');
    
    return NextResponse.json({
      ok: true,
      message: 'Database initialized successfully',
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('❌ Setup failed:', error);
    
    return NextResponse.json(
      { 
        error: 'Setup failed',
        message: error.message || 'Unknown error occurred',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * Create superadmin user if it doesn't exist
 */
async function createSuperAdminIfNotExists() {
  const superAdminEmail = 'usmanabid0231@gmail.com';
  const superAdminPassword = 'usman3002';
  
  // Check if superadmin role exists
  const superAdminRole = await Role.findOne({
    where: { name: 'SuperAdmin' }
  });
  
  if (!superAdminRole) {
    throw new Error('SuperAdmin role not found - please run seeders first');
  }
  
  // Check if superadmin user already exists in Supabase
  const { data: existingUsers, error: getUserError } = await supabaseServer.auth.admin.listUsers();
  
  if (getUserError) {
    throw new Error(`Failed to check existing users: ${getUserError.message}`);
  }
  
  const existingSuperAdmin = existingUsers.users.find(user => user.email === superAdminEmail);
  
  if (existingSuperAdmin) {
    console.log('🔍 SuperAdmin user already exists in Supabase');
    
    // Check if user exists in our database
    const dbUser = await User.findOne({
      where: { id: existingSuperAdmin.id }
    });
    
    if (!dbUser) {
      // Create user in database
      await User.create({
        id: existingSuperAdmin.id,
        email: superAdminEmail,
        displayName: 'Usman',
        roleId: superAdminRole.id,
      });
      console.log('✅ SuperAdmin user added to database');
    }
    
    return;
  }
  
  // Create superadmin user in Supabase
  console.log('🚀 Creating SuperAdmin user in Supabase...');
  const { data: newUser, error: createUserError } = await supabaseServer.auth.admin.createUser({
    email: superAdminEmail,
    password: superAdminPassword,
    email_confirm: true,
  });
  
  if (createUserError || !newUser.user) {
    throw new Error(`Failed to create SuperAdmin user: ${createUserError?.message}`);
  }
  
  // Create user in database
  await User.create({
    id: newUser.user.id,
    email: superAdminEmail,
    displayName: 'Usman',
    roleId: superAdminRole.id,
  });
  
  console.log('✅ SuperAdmin user created successfully');
  console.log(`📧 Email: ${superAdminEmail}`);
  console.log(`🔑 Password: ${superAdminPassword}`);
}