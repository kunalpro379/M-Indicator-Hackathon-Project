/**
 * Create Admin User Script
 * 
 * Creates an admin user with:
 * - Email: admin@kunalpatil.me
 * - Password: admin (hashed with bcrypt)
 * - Role: admin
 */

import bcrypt from 'bcrypt';
import pool from '../src/config/database.js';

async function createAdminUser() {
  const client = await pool.connect();
  
  try {
    console.log('\n🔐 Creating Admin User...\n');

    const email = 'admin@kunalpatil.me';
    const password = 'admin';
    const fullName = 'System Administrator';
    const role = 'admin';

    // Check if admin already exists
    const existingUser = await client.query(
      'SELECT id, email, role FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      console.log('⚠️  Admin user already exists:');
      console.log(`   Email: ${existingUser.rows[0].email}`);
      console.log(`   Role: ${existingUser.rows[0].role}`);
      console.log(`   ID: ${existingUser.rows[0].id}`);
      
      // Update password
      console.log('\n🔄 Updating password...');
      const hashedPassword = await bcrypt.hash(password, 10);
      
      await client.query(
        'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE email = $2',
        [hashedPassword, email]
      );
      
      console.log('✅ Password updated successfully!');
      console.log('\n📋 Login Credentials:');
      console.log(`   Email: ${email}`);
      console.log(`   Password: ${password}`);
      
      return;
    }

    // Hash password
    console.log('🔒 Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('✅ Password hashed');

    // Create admin user
    console.log('👤 Creating admin user in database...');
    const result = await client.query(
      `INSERT INTO users (
        full_name, 
        email, 
        password_hash, 
        role, 
        status, 
        created_at, 
        updated_at
      ) VALUES ($1, $2, $3, $4, 'active', NOW(), NOW())
      RETURNING id, email, full_name, role`,
      [fullName, email, hashedPassword, role]
    );

    const user = result.rows[0];

    console.log('✅ Admin user created successfully!\n');
    console.log('📋 User Details:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Name: ${user.full_name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log('\n🔑 Login Credentials:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log('\n⚠️  IMPORTANT: Change this password after first login!\n');

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the script
createAdminUser()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
