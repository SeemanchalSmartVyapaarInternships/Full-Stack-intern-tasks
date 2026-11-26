export function getEmployeeWorkspace(req, res) {
  res.status(200).json({
    success: true,
    data: {
      scope: 'Employee Workspace',
      accessedBy: req.user.email,
      role: req.user.role,
      tasks: ['View assigned tasks', 'Update personal profile'],
    },
  });
}

export function getManagerOperations(req, res) {
  res.status(200).json({
    success: true,
    data: {
      scope: 'Manager Operations',
      accessedBy: req.user.email,
      role: req.user.role,
      capabilities: ['Approve team workflows', 'View department analytics'],
    },
  });
}

export function getAdminControlPlane(req, res) {
  res.status(200).json({
    success: true,
    data: {
      scope: 'Admin Control Plane',
      accessedBy: req.user.email,
      role: req.user.role,
      capabilities: ['Manage RBAC policies', 'Audit user directory', 'Configure security'],
    },
  });
}
