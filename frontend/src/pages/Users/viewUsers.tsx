import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectItem,
  SelectContent,
} from '@/components/ui/select';
import {
  UserIcon,
  ShieldAlert,
  UserCog,
  UserCheck,
  UserMinus,
} from 'lucide-react';
import { Roles } from '@/constants/roles';

interface User {
  id: number;
  email: string;
  role: (typeof Roles)[keyof typeof Roles];
}

const roleColors: Record<string, string> = {
  [Roles.ADMIN]: 'bg-red-100 text-red-600',
  [Roles.OWNER]: 'bg-purple-100 text-purple-600',
  [Roles.MANAGER]: 'bg-blue-100 text-blue-600',
  [Roles.DEVELOPER]: 'bg-green-100 text-green-600',
  [Roles.VIEWER]: 'bg-gray-100 text-gray-600',
};

const cardColors: Record<string, string> = {
  [Roles.ADMIN]: 'bg-gradient-to-br from-red-500 to-red-700 hover:shadow-lg',
  [Roles.OWNER]: 'bg-gradient-to-br from-purple-500 to-purple-700 hover:shadow-lg',
  [Roles.MANAGER]: 'bg-gradient-to-br from-blue-500 to-blue-700 hover:shadow-lg',
  [Roles.DEVELOPER]: 'bg-gradient-to-br from-green-500 to-green-700 hover:shadow-lg',
  [Roles.VIEWER]: 'bg-gradient-to-br from-gray-500 to-gray-700 hover:shadow-lg',
};

const ViewUsersPage = () => {
  const queryClient = useQueryClient();
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<keyof typeof Roles>('DEVELOPER');
  const [password, setPassword] = useState('');

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await axios.get('http://localhost:5000/api/auth/profile', {
            headers: { Authorization: `Bearer ${token}` },
          });
          setCurrentUserRole(res.data.user.role);
        } catch (err) {
          console.error('Failed to fetch current user:', err);
        }
      }
    };
    fetchCurrentUser();
  }, []);

  const {
    data: users = [],
    isLoading,
    error,
  } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/auth/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, role, email, password }: { id: number; role: string; email: string; password?: string }) => {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/auth/users/${id}`,
        { role, email, ...(password ? { password } : {}) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id: number) => {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/auth/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const roleCount = (role: string) => users.filter((u) => u.role === role).length;

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="text-3xl font-bold text-gradient bg-gradient-to-r from-purple-600 to-pink-500 text-transparent bg-clip-text">
          User Management
        </div>
        <p className="text-gray-600 mt-1">Manage and organize your users efficiently</p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        {[Roles.ADMIN, Roles.DEVELOPER, Roles.MANAGER, Roles.VIEWER].map((roleKey, idx) => {
          const Icon = [ShieldAlert, UserCog, UserCheck, UserMinus][idx % 4];
          return (
            <Card
              key={roleKey}
              className={`rounded-xl text-white cursor-pointer transition-transform transform hover:scale-105 ${cardColors[roleKey]}`}
            >
              <CardContent className="flex justify-between p-4 items-center">
                <div>
                  <p className="text-2xl font-bold">{roleCount(roleKey)}</p>
                  <p className="text-sm capitalize">{roleKey.toLowerCase()}</p>
                </div>
                <Icon className="w-6 h-6" />
              </CardContent>
            </Card>
          );
        })}
      </div>




      <Card className="rounded-2xl">
        <CardContent className="p-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-600 text-left border-b">
                <th className="py-3">User</th>
                <th>Email</th>
                <th>Role</th>
                {currentUserRole === Roles.ADMIN && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="py-6 text-center">
                    Loading users...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-red-500">
                    Failed to fetch users.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white flex items-center justify-center font-bold">
                        {user.email.charAt(0).toUpperCase()}
                      </div>
                      <p className="font-semibold text-gray-800">
                        {user.email.split('@')[0]}
                      </p>
                    </td>
                    <td className="text-gray-600">{user.email}</td>
                    <td>
                      <span className={`text-xs font-medium px-3 py-1 rounded-full ${roleColors[user.role] || 'bg-gray-100 text-gray-600'}`}>
                        {user.role}
                      </span>
                    </td>
                    {currentUserRole === Roles.ADMIN && (
                      <td className="flex gap-2 mt-2">
                        <Button
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 text-xs"
                          onClick={() => {
                            setEditUser(user);
                            setEmail(user.email);
                            setRole(user.role as keyof typeof Roles);
                            setPassword('');
                          }}
                        >
                          ✏️ Edit
                        </Button>
                        <Button
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 text-xs"
                          onClick={() => deleteUserMutation.mutate(user.id)}
                        >
                          🗑 Delete
                        </Button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {currentUserRole === Roles.ADMIN && editUser && (
        <Dialog open={!!editUser} onOpenChange={(open) => !open && setEditUser(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Email Address</Label>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div>
                <Label>New Password (Optional)</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Leave empty to keep current password"
                />
              </div>
              <div>
                <Label>Role</Label>
                <Select value={role} onValueChange={(value) => setRole(value as keyof typeof Roles)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Role" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(Roles).map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="ghost">Cancel</Button>
              </DialogClose>
              <Button
                className="bg-purple-600 text-white hover:bg-purple-700"
                onClick={() => {
                  if (!editUser) return;
                  updateUserMutation.mutate({
                    id: editUser.id,
                    role,
                    email,
                    password,
                  });
                  setEditUser(null);
                }}
              >
                Update User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ViewUsersPage;
