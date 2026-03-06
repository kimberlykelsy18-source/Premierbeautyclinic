const express = require('express');
const path    = require('path');
const { createServiceClient } = require('../config/supabase');

const LOGO_PATH = path.join(__dirname, '../../src/assets/logo.png');

// Employee and admin-only flows
module.exports = ({ supabase, authenticate, requireEmployeePermission, transporter }) => {
  const router = express.Router();

  // Employee login (separate from customers)
  router.post('/employee/login', async (req, res) => {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return res.status(400).json({ error: error.message });

    const { data: employee } = await supabase
      .from('employees')
      .select('role, permissions, is_temporary_password')
      .eq('id', data.user.id)
      .single();

    if (!employee) {
      return res.status(403).json({ error: 'You are not registered as an employee' });
    }

    // Force password reset if temporary
    if (employee.is_temporary_password) {
      return res.json({
        success: true,
        requiresPasswordReset: true,
        message: 'Please change your password on first login',
        user: data.user,
        session: data.session,
        role: employee.role,
        permissions: employee.permissions
      });
    }

    res.json({
      success: true,
      user: data.user,
      session: data.session,
      role: employee.role,
      permissions: employee.permissions
    });
  });

  // CEO forces password reset email for himself
  router.post('/admin/reset-my-password', authenticate, requireEmployeePermission('manage_staff'), async (req, res) => {
    const adminClient = createServiceClient();

    const { error } = await adminClient.auth.admin.generateLink({
      type: 'recovery',
      email: 'seanzuri12@gmail.com'
    });

    if (error) return res.status(400).json({ error: error.message });

    res.json({ success: true, message: 'Password reset email has been sent to you.' });
  });

  // Invite employee + send onboarding email
  router.post('/admin/invite-employee', authenticate, requireEmployeePermission('manage_staff'), async (req, res) => {
    const { email, name, role, permissions: reqPermissions } = req.body;

    // Generate a random 10-char temp password (no confusable chars)
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#!';
    const tempPassword = Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');

    const adminClient = createServiceClient();

    // ── Resolve auth user ID ─────────────────────────────────────────────────
    // Try creating a new auth user. If the email already exists in auth.users
    // (e.g. user was deleted from the DB but not from Supabase Auth, or this is
    // a re-invite), we find the existing auth user and reset their password instead.
    let authUserId;

    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { full_name: name },
    });

    if (createError) {
      const isAlreadyExists = createError.message.toLowerCase().includes('already');
      if (!isAlreadyExists) {
        return res.status(400).json({ error: createError.message });
      }

      // Email exists in auth.users — find the user and reset their credentials
      const { data: userList, error: listError } = await adminClient.auth.admin.listUsers({ page: 1, perPage: 1000 });
      if (listError) return res.status(400).json({ error: listError.message });

      const existingAuthUser = userList?.users?.find(
        u => u.email?.toLowerCase() === email.toLowerCase()
      );
      if (!existingAuthUser) {
        return res.status(400).json({ error: createError.message });
      }

      authUserId = existingAuthUser.id;

      // Reset their password so the new temp credentials work
      await adminClient.auth.admin.updateUserById(authUserId, {
        password: tempPassword,
        email_confirm: true,
        user_metadata: { full_name: name },
      });

      // Remove any stale employees row so we can do a clean re-insert below
      await supabase.from('employees').delete().eq('id', authUserId);
    } else {
      authUserId = newUser.user.id;
    }

    // ── Determine permissions ────────────────────────────────────────────────
    const defaultPerms = role === 'admin'
      ? ['all']
      : ['view_orders', 'view_appointments', 'complete_appointment', 'create_walkin'];
    const permissions = Array.isArray(reqPermissions) && reqPermissions.length > 0
      ? reqPermissions
      : defaultPerms;

    await supabase.from('employees').insert({
      id: authUserId,
      full_name: name,
      email,
      role: role || 'staff',
      permissions,
      is_temporary_password: true,
    });

    // Send the single onboarding email with credentials
    // ?portal=employee pre-selects the Employee tab so they don't land on the customer form
    const loginUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?portal=employee`;
    await transporter.sendMail({
      from: `"Premier Beauty Clinic" <${process.env.GMAIL_EMAIL}>`,
      to: email,
      subject: 'Welcome to Premier Beauty Clinic — Your Login Details',
      attachments: [{
        filename: 'logo.png',
        path: LOGO_PATH,
        cid: 'premier_logo',
      }],
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #eee">
          <!-- Header -->
          <div style="background:#1A1A1A;padding:28px 32px;text-align:center">
            <img src="cid:premier_logo" alt="Premier Beauty Clinic" style="height:48px;object-fit:contain" />
          </div>

          <!-- Body -->
          <div style="padding:36px 32px">
            <h2 style="color:#1A1A1A;margin:0 0 8px">Welcome, ${name}!</h2>
            <p style="color:#555;margin:0 0 24px">
              You've been added to the Premier Beauty Clinic team as <strong style="color:#6D4C91">${role || 'staff'}</strong>.
              Here are your temporary login credentials:
            </p>

            <table style="background:#FDFBF7;border-radius:10px;padding:20px;width:100%;border-collapse:collapse">
              <tr>
                <td style="padding:8px 12px;color:#888;font-size:13px;width:100px">Email</td>
                <td style="padding:8px 12px;font-weight:bold;font-size:14px">${email}</td>
              </tr>
              <tr>
                <td style="padding:8px 12px;color:#888;font-size:13px">Password</td>
                <td style="padding:8px 12px">
                  <code style="background:#eee;padding:4px 10px;border-radius:6px;font-size:15px;letter-spacing:1px">${tempPassword}</code>
                </td>
              </tr>
            </table>

            <p style="margin:28px 0 20px;text-align:center">
              <a href="${loginUrl}" style="background:#6D4C91;color:white;padding:14px 36px;border-radius:30px;text-decoration:none;font-weight:bold;font-size:14px;display:inline-block">
                Login to Dashboard →
              </a>
            </p>

            <p style="background:#fff8e1;border-left:4px solid #f59e0b;padding:12px 16px;border-radius:4px;color:#92400e;font-size:13px;margin:0">
              <strong>Important:</strong> You will be prompted to set a new password on your very first login. Keep these credentials safe until then.
            </p>
          </div>

          <!-- Footer -->
          <div style="background:#FDFBF7;padding:20px 32px;text-align:center;border-top:1px solid #eee">
            <p style="color:#aaa;font-size:12px;margin:0">© ${new Date().getFullYear()} Premier Beauty Clinic · Nairobi, Kenya</p>
          </div>
        </div>
      `,
    });

    res.json({
      success: true,
      message: `Employee invited. Login credentials sent to ${email}`,
    });
  });

  // ── Developer-only: Create admin account ─────────────────────────────────
  // This endpoint is NOT linked from the frontend. It is only callable by the
  // developer using a tool like curl or Postman with the DEVELOPER_SECRET key.
  //
  // Usage:
  //   curl -X POST http://localhost:3000/developer/create-admin \
  //     -H "Content-Type: application/json" \
  //     -H "x-developer-key: <DEVELOPER_SECRET from .env>" \
  //     -d '{"name": "Jane Admin", "email": "jane@premierbeauty.com"}'
  router.post('/developer/create-admin', async (req, res) => {
    // ── Guard: verify developer secret ──────────────────────────────────────
    const secret = req.headers['x-developer-key'];
    if (!secret || secret !== process.env.DEVELOPER_SECRET) {
      return res.status(403).json({ error: 'Forbidden — invalid or missing developer key.' });
    }

    const { name, email, phone } = req.body;
    if (!name?.trim())  return res.status(400).json({ error: 'name is required.' });
    if (!email?.trim()) return res.status(400).json({ error: 'email is required.' });

    // ── Generate temporary password ──────────────────────────────────────────
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#!';
    const tempPassword = Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');

    const adminClient = createServiceClient();

    // ── Create Supabase Auth user ────────────────────────────────────────────
    let authUserId;

    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
      email: email.trim(),
      password: tempPassword,
      email_confirm: true,
      user_metadata: { full_name: name.trim() },
    });

    if (createError) {
      // If the email already exists in Supabase Auth, reset their credentials
      const isAlreadyExists = createError.message.toLowerCase().includes('already');
      if (!isAlreadyExists) {
        return res.status(400).json({ error: createError.message });
      }

      const { data: userList, error: listError } = await adminClient.auth.admin.listUsers({ page: 1, perPage: 1000 });
      if (listError) return res.status(400).json({ error: listError.message });

      const existingAuthUser = userList?.users?.find(u => u.email?.toLowerCase() === email.toLowerCase());
      if (!existingAuthUser) return res.status(400).json({ error: createError.message });

      authUserId = existingAuthUser.id;
      await adminClient.auth.admin.updateUserById(authUserId, {
        password: tempPassword,
        email_confirm: true,
        user_metadata: { full_name: name.trim() },
      });

      // Clear any stale employees row so we re-insert cleanly as admin
      await adminClient.from('employees').delete().eq('id', authUserId);
    } else {
      authUserId = newUser.user.id;
    }

    // ── Insert into employees table as admin ─────────────────────────────────
    const { error: dbError } = await adminClient.from('employees').insert({
      id:                   authUserId,
      full_name:            name.trim(),
      email:                email.trim().toLowerCase(),
      phone:                phone?.trim() || null,
      role:                 'admin',
      permissions:          ['all'],
      is_temporary_password: true,
    });

    if (dbError) return res.status(500).json({ error: dbError.message });

    // ── Send welcome email ───────────────────────────────────────────────────
    const dashboardUrl = `${process.env.DASHBOARD_URL || 'http://localhost:5174'}/login`;

    try {
      await transporter.sendMail({
        from: `"Premier Beauty Clinic" <${process.env.GMAIL_EMAIL}>`,
        to: email.trim(),
        subject: 'Premier Beauty Clinic — Your Admin Account is Ready',
        attachments: [{
          filename: 'logo.png',
          path: LOGO_PATH,
          cid: 'premier_logo',
        }],
        html: `
          <div style="font-family:sans-serif;max-width:540px;margin:auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #eee">

            <!-- Header -->
            <div style="background:#1A1A1A;padding:28px 32px;text-align:center">
              <img src="cid:premier_logo" alt="Premier Beauty Clinic" style="height:48px;object-fit:contain" />
            </div>

            <!-- Body -->
            <div style="padding:36px 32px">
              <h2 style="color:#1A1A1A;margin:0 0 8px">Welcome, ${name.trim()}!</h2>
              <p style="color:#555;margin:0 0 8px">
                Your <strong style="color:#6D4C91">Administrator</strong> account for Premier Beauty Clinic has been created.
                You have full access to the dashboard — orders, appointments, inventory, staff management, and settings.
              </p>
              <p style="color:#888;font-size:13px;margin:0 0 24px">Use the credentials below to log in for the first time.</p>

              <!-- Credentials box -->
              <table style="background:#FDFBF7;border-radius:10px;padding:20px;width:100%;border-collapse:collapse;margin-bottom:24px">
                <tr>
                  <td style="padding:8px 12px;color:#888;font-size:13px;width:110px">Email</td>
                  <td style="padding:8px 12px;font-weight:bold;font-size:14px">${email.trim().toLowerCase()}</td>
                </tr>
                <tr>
                  <td style="padding:8px 12px;color:#888;font-size:13px">Password</td>
                  <td style="padding:8px 12px">
                    <code style="background:#eee;padding:4px 12px;border-radius:6px;font-size:15px;letter-spacing:1.5px">${tempPassword}</code>
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 12px;color:#888;font-size:13px">Access Level</td>
                  <td style="padding:8px 12px">
                    <span style="background:#6D4C91;color:#fff;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:bold">ADMIN — Full Access</span>
                  </td>
                </tr>
              </table>

              <!-- CTA button -->
              <p style="text-align:center;margin:0 0 24px">
                <a href="${dashboardUrl}" style="background:#6D4C91;color:white;padding:14px 40px;border-radius:30px;text-decoration:none;font-weight:bold;font-size:14px;display:inline-block">
                  Open Dashboard →
                </a>
              </p>

              <!-- Warning -->
              <p style="background:#fff8e1;border-left:4px solid #f59e0b;padding:12px 16px;border-radius:4px;color:#92400e;font-size:13px;margin:0">
                <strong>Security:</strong> You will be required to set a new password on your first login.
                Do not share these credentials. The temporary password expires once changed.
              </p>
            </div>

            <!-- Footer -->
            <div style="background:#FDFBF7;padding:20px 32px;text-align:center;border-top:1px solid #eee">
              <p style="color:#aaa;font-size:12px;margin:0">© ${new Date().getFullYear()} Premier Beauty Clinic · Nairobi, Kenya</p>
              <p style="color:#ccc;font-size:11px;margin:6px 0 0">This message was generated by the system. Please do not reply.</p>
            </div>
          </div>
        `,
      });
    } catch (mailErr) {
      // Account created — email failed. Still return success with credentials so the developer can send manually.
      console.error('[create-admin] Email failed:', mailErr.message);
      return res.status(201).json({
        success: true,
        warning: 'Admin account created but welcome email failed to send.',
        credentials: { email: email.trim().toLowerCase(), tempPassword },
      });
    }

    console.log(`[create-admin] Admin account created for ${email} (id: ${authUserId})`);
    res.status(201).json({
      success: true,
      message: `Admin account created and welcome email sent to ${email}.`,
      id: authUserId,
    });
  });

  return router;
};
