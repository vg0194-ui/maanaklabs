import { useEffect, useState } from "react";
import { apiFetch } from "../../api/client";
import { useAuth } from "../../contexts/AuthContext";

function AdminUsersPage() {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    const response = await apiFetch("/admin/users", { token });
    setUsers(response.users);
  };

  useEffect(() => {
    fetchUsers().catch(() => setUsers([]));
  }, [token]);

  const toggleUser = async (user) => {
    await apiFetch(`/admin/users/${user._id}/status`, {
      method: "PATCH",
      token,
      body: { isActive: !user.isActive },
    });
    fetchUsers();
  };

  return (
    <div className="panel overflow-x-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold">Users</h1>
        <p className="mt-2 text-sm text-slate-600">View users, activate or deactivate accounts, and review basic profile details.</p>
      </div>
      <table className="min-w-full text-left text-sm">
        <thead className="text-slate-500">
          <tr>
            <th className="pb-3">User</th>
            <th className="pb-3">Company</th>
            <th className="pb-3">Contact</th>
            <th className="pb-3">Status</th>
            <th className="pb-3">Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id} className="border-t border-slate-100">
              <td className="py-4 font-semibold text-slate-800">{user.name}</td>
              <td className="py-4">{user.companyName || "-"}</td>
              <td className="py-4">
                <div>{user.email}</div>
                <div className="text-slate-500">{user.mobile}</div>
              </td>
              <td className="py-4">{user.isActive ? "Active" : "Inactive"}</td>
              <td className="py-4">
                <button type="button" onClick={() => toggleUser(user)} className="text-sm font-semibold text-brand-blue">
                  {user.isActive ? "Deactivate" : "Activate"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminUsersPage;

