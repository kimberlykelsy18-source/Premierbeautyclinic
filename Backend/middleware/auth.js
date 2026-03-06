// Authentication and authorization helpers shared across routes
module.exports = function createAuthMiddleware(supabase) {
  // Verify Supabase JWT and attach user to request
  async function authenticate(req, res, next) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'No token provided' });

    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return res.status(401).json({ error: 'Invalid token' });

    req.user = user; 
    next();
  }

  // Optional auth: attach user if token is valid, otherwise continue as guest
  async function authenticateOptional(req, res, next) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return next();

    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return res.status(401).json({ error: 'Invalid token' });

    req.user = user;
    next();
  }

  // Ensure employee has the required permission (admins bypass)
  function requireEmployeePermission(requiredPermission) {
    return async (req, res, next) => {
      if (!req.user) return res.status(401).json({ error: 'No token provided' });

      const { data: employee, error } = await supabase
        .from('employees')
        .select('role, permissions')
        .eq('id', req.user.id)
        .single();

      if (error || !employee) {
        return res.status(403).json({ error: 'You are not registered as an employee' });
      }

      const isAdmin = employee.role === 'admin';
      const perms = employee.permissions || [];
      const hasAll = perms.includes('all');
      const hasPerm = perms.includes(requiredPermission);

      if (isAdmin || hasAll || hasPerm) {
        req.employee = employee;
        return next();
      }

      res.status(403).json({ error: "You don't have permission to view this page" });
    };
  }

  return { authenticate, authenticateOptional, requireEmployeePermission };
};
