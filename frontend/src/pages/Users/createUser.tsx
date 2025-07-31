import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

import {
  Crown,
  Briefcase,
  Laptop,
  Search,
  ShieldCheck,
  UserPlus,
  FilePlus
} from "lucide-react";

const roles = [
  {
    label: "Admin",
    description: "Full access with all permissions",
    icon: <Crown className="w-5 h-5" />,
    value: "Admin",
    bg: "from-yellow-200 to-yellow-500",
  },
  {
    label: "Manager",
    description: "Oversees projects and teams",
    icon: <Briefcase className="w-5 h-5" />,
    value: "ProjectManager",
    bg: "from-blue-200 to-blue-500",
  },
  {
    label: "Developer",
    description: "Creates and maintains code",
    icon: <Laptop className="w-5 h-5" />,
    value: "Developer",
    bg: "from-green-200 to-green-500",
  },
  {
    label: "Viewer",
    description: "Can view but not edit anything",
    icon: <Search className="w-5 h-5" />,
    value: "Viewer",
    bg: "from-purple-200 to-purple-500",
  },
];

export default function CreateUser() {
  const queryClient = useQueryClient();

  const initialForm = {
    name: "",
    email: "",
    password: "",
    role: "",
  };

  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    setForm(initialForm);
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const registerUser = useMutation({
    mutationFn: () => {
      console.log("Submitting form to backend:", form); // ✅ debug log
      return axios.post("http://localhost:5000/api/auth/register", form);
    },
    onSuccess: () => {
      toast.success("User registered successfully!");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setForm(initialForm);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Registration failed");
    },
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4 border-[1.5px] border-gray-200 rounded-xl p-5 shadow-sm bg-white">
        <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-violet-600 text-white shadow">
          <UserPlus className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            <span className="text-gray-800">Create </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-violet-500">
              New User
            </span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Add a new user to your system
          </p>
        </div>
      </div>

      {/* Form */}
      <Card className="p-6 bg-white/80 backdrop-blur-md shadow-lg space-y-6 border">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow">
            <FilePlus className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 tracking-tight">
            Registration Form
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="name">Full Name *</Label>
            <Input
              name="name"
              placeholder="Enter full name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="email">Email Address *</Label>
            <Input
              name="email"
              type="email"
              placeholder="Enter email address"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="password">Password *</Label>
            <Input
              name="password"
              type="password"
              placeholder="Enter password"
              value={form.password}
              onChange={handleChange}
              required
            />
            <p className="text-xs text-muted-foreground mt-2">
              8–15 characters, one uppercase, one lowercase, one special character.
            </p>
          </div>

          <div>
            <Label htmlFor="role">Selected Role *</Label>
            <Input
              name="role"
              value={form.role}
              placeholder="Click a role card below"
              readOnly
              className="cursor-not-allowed bg-muted"
            />
          </div>
        </div>

        {/* Role Cards */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <ShieldCheck className="w-5 h-5 text-green-600" /> Choose a Role
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {roles.map((role) => (
              <Card
                key={role.value}
                onClick={() => setForm((prev) => ({ ...prev, role: role.value }))}
                className={`
                  p-4 cursor-pointer rounded-xl text-center transition-all border-2
                  ${form.role === role.value
                    ? "border-blue-600 bg-white shadow-md"
                    : "border-muted bg-white"}
                  hover:bg-gradient-to-br ${role.bg} hover:text-white
                `}
              >
                <div className="flex flex-col items-center gap-2">
                  {role.icon}
                  <p className="font-semibold">{role.label}</p>
                  <p className="text-xs">{role.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <Button
            onClick={() => registerUser.mutate()}
            disabled={registerUser.isPending}
          >
            {registerUser.isPending ? "Registering..." : "Register User"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
