import User from '../models/User.js';

/**
 * Seed the initial administrator user if one does not exist
 */
export const seedAdmin = async () => {
  try {
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@reshmagallery.com').toLowerCase().trim();
    const adminName = process.env.ADMIN_NAME || 'Gallery Admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@12345';

    // Check if user with admin email exists
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log(`👤 Admin user exists: ${existingAdmin.email} (${existingAdmin.role})`);
      return;
    }

    // Check if any admin exists
    const anyAdmin = await User.findOne({ role: 'ADMIN' });
    if (anyAdmin) {
      console.log(`👤 Admin user account already configured: ${anyAdmin.email}`);
      return;
    }

    // Create initial admin
    await User.create({
      name: adminName,
      email: adminEmail,
      password: adminPassword, // will be hashed automatically by pre-save hook
      role: 'ADMIN',
      isActive: true,
    });

    console.log(`✨ Initial Admin account seeded successfully: ${adminEmail}`);
  } catch (error) {
    console.error(`⚠️ Error during admin seeding: ${error.message}`);
  }
};
