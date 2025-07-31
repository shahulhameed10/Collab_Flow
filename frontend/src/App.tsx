import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import LoginPage from "./pages/Login/login";
import DashboardPage from "./pages/Dashboard/dashboard";
import DashboardLayout from "./components/layouts/dashboardLayout";
import ViewUser from "./pages/Users/viewUsers";
import CreateUsers from "./pages/Users/createUser";
import CreateWorkspacePage from "./pages/Workspace/createWorkspace";
import ViewWorkspaces from "./pages/Workspace/viewWorkspaces";
import ViewProjects from "./pages/Project/viewProjects";
import CreateTask from "./pages/Tasks/createTasks";
import ViewTasks from "./pages/Tasks/viewTasks";
import KanbanPage from "./pages/Tasks/kanbanboard";

export const App = () => (
  <BrowserRouter>
    <Routes>
      {/* Public Route */}
      <Route path="/" element={<LoginPage />} />
      <Route path="/login" element={<LoginPage />} />
      {/* Protected Routes under Dashboard Layout */}
      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/dashboard/users/create" element={<CreateUsers />} />
        <Route path="/dashboard/users/view" element={<ViewUser />} />
        <Route path="/dashboard/workspaces" element={<CreateWorkspacePage />} />
        <Route path="/dashboard/workspaces/edit" element={<ViewWorkspaces />} />
        <Route path="/dashboard/workspace/:workspaceId/projects" element={<ViewProjects />} />
        <Route path="/dashboard/project/:projectId/create-task" element={<CreateTask />} />
        <Route path="/dashboard/project/:projectId/view-task" element={<ViewTasks/>} />
        <Route path="/dashboard/project/:projectId/kanban" element={<KanbanPage/>} />
      </Route>
    </Routes>

    {/* Toast notifications using react-hot-toast */}
    <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
  </BrowserRouter>
);
