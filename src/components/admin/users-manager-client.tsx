"use client"

import * as React from "react"
import { updateUserRoleAction } from "@/app/auth-actions"
import { Users, Search, ShieldAlert, Check, Loader2, Mail, Phone, Shield } from "lucide-react"

interface UserProfile {
  id: string
  name: string
  roll_number: string | null
  email: string | null
  phone: string | null
  role: string
}

interface UsersManagerClientProps {
  initialUsers: UserProfile[]
}

export function UsersManagerClient({ initialUsers }: UsersManagerClientProps) {
  const [users, setUsers] = React.useState<UserProfile[]>(initialUsers)
  const [search, setSearch] = React.useState("")
  const [roleFilter, setRoleFilter] = React.useState("all")
  const [updatingId, setUpdatingId] = React.useState<string | null>(null)
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)

  const filteredUsers = users.filter((u) => {
    const matchesSearch = 
      u.name.toLowerCase().includes(search.toLowerCase()) || 
      (u.roll_number?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      (u.email?.toLowerCase().includes(search.toLowerCase()) ?? false)
    
    const matchesRole = roleFilter === "all" || u.role === roleFilter

    return matchesSearch && matchesRole
  })

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdatingId(userId)
    setSuccessMessage(null)
    setErrorMessage(null)

    const result = await updateUserRoleAction(userId, newRole)

    if (result.error) {
      setErrorMessage(result.error)
      setUpdatingId(null)
    } else {
      setSuccessMessage(result.success || "User role updated successfully!")
      setUsers(
        users.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      )
      setUpdatingId(null)
      // Auto-clear success message
      setTimeout(() => setSuccessMessage(null), 3000)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">User Role Management</h1>
        <p className="text-sm text-zinc-400">Configure administrative access roles, search student roll lists, and inspect contact records.</p>
      </div>

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-900/50 text-emerald-400 text-sm flex items-center gap-2">
          <Check className="h-5 w-5 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-900/50 text-red-400 text-sm flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-red-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Roster Controls */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/20 backdrop-blur-sm p-6 space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search user name, email, roll number..."
              className="pl-10 block w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-white placeholder-zinc-500 focus:border-primary focus:outline-none text-xs transition-all"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-zinc-950 text-xs font-semibold border border-zinc-800 rounded-xl px-3 py-2.5 focus:outline-none focus:border-primary text-zinc-300 w-full sm:w-auto"
            >
              <option value="all">All Roles</option>
              <option value="super_admin">Super Admin</option>
              <option value="department_admin">Department Admin</option>
              <option value="club_admin">Club Admin</option>
              <option value="tournament_admin">Tournament Admin</option>
              <option value="student">Student</option>
            </select>
          </div>
        </div>

        {/* Table */}
        {filteredUsers.length === 0 ? (
          <div className="p-8 text-center text-zinc-500 border border-dashed border-zinc-850 rounded-2xl">
            No users match the search queries.
          </div>
        ) : (
          <div className="overflow-x-auto border border-zinc-850/50 rounded-2xl">
            <table className="w-full text-left text-sm text-zinc-300">
              <thead className="bg-zinc-950/40 text-xs font-bold uppercase text-zinc-400 border-b border-zinc-800">
                <tr>
                  <th className="px-6 py-4 rounded-tl-2xl">User Details</th>
                  <th className="px-6 py-4">Contact Info</th>
                  <th className="px-6 py-4">Linked Roll No</th>
                  <th className="px-6 py-4">Access Role</th>
                  <th className="px-6 py-4 rounded-tr-2xl text-right">Update Role Access</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850/50">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-zinc-900/10 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center text-primary font-bold text-xs uppercase shrink-0">
                          {user.name.substring(0, 2)}
                        </div>
                        <span className="font-semibold text-white truncate max-w-[150px]">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 space-y-0.5 text-xs text-zinc-400">
                      <div className="flex items-center gap-1.5">
                        <Mail className="h-3 w-3 text-zinc-550 shrink-0" />
                        <span className="truncate max-w-[180px]">{user.email || "—"}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Phone className="h-3 w-3 text-zinc-550 shrink-0" />
                        <span>{user.phone || "—"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-zinc-400">
                      {user.roll_number || <span className="text-zinc-600">No Roll No</span>}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        user.role === "super_admin"
                          ? "bg-red-500/10 border border-red-500/20 text-red-400"
                          : user.role === "tournament_admin"
                            ? "bg-purple-500/10 border border-purple-500/20 text-purple-400"
                            : user.role === "student"
                              ? "bg-zinc-950 border border-zinc-800 text-zinc-500"
                              : "bg-primary/10 border border-primary/20 text-primary"
                      }`}>
                        <Shield className="h-3 w-3 shrink-0" />
                        {user.role.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {updatingId === user.id ? (
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        ) : (
                          <select
                            value={user.role}
                            disabled={updatingId !== null}
                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                            className="bg-zinc-950 text-xs font-semibold border border-zinc-800 rounded-lg px-2 py-1 focus:outline-none focus:border-primary text-zinc-300 w-[140px] disabled:opacity-50"
                          >
                            <option value="student">Student</option>
                            <option value="club_admin">Club Admin</option>
                            <option value="department_admin">Dept Admin</option>
                            <option value="tournament_admin">Tourney Admin</option>
                            <option value="super_admin">Super Admin</option>
                          </select>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
