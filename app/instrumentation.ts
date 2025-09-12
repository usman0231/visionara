// app/instrumentation.ts
import 'server-only';
import { getSequelize } from '@/lib/sequelize';
import User from '@/models/User';

let synced = false;

export async function register() {
  if (synced) return;
  synced = true;

  const sequelize = getSequelize();

  try {
    // connect
    await sequelize.authenticate();

    // create/update tables (safe for dev; prod me migrations better)
    await sequelize.sync({ alter: true });

    // default superadmin agar missing ho
    const email = 'usmanabid0231@gmail.com';
    const exists = await User.findOne({ where: { email } });
    if (!exists) {
      await User.create({
        name: 'Usman',
        email,
        pass: 'usman',          // NOTE: prod me hash karna (bcrypt)
        role: 'superadmin',
      });
      console.log('✅ Seeded default superadmin.');
    } else {
      console.log('ℹ️ Superadmin exists.');
    }
  } catch (e) {
    console.error('❌ DB boot sync failed:', e);
  }
}
