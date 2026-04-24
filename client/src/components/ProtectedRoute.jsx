import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute({ allowedRole, redirectPath }) {
  const role = localStorage.getItem('sentinel_role');

  if (role !== allowedRole) {
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
}
