import { useAuth } from "../context/AuthContext";
import ProfileSection from "../components/settings/ProfileSection";
import PasswordSection from "../components/settings/PasswordSection";
import UserManagement from "../components/settings/UserManagement";

export default function Settings() {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl space-y-6">
      <h2 className="text-xl font-semibold">Settings</h2>
      <ProfileSection />
      <PasswordSection />
      {user.role === "admin" && <UserManagement />}
    </div>
  );
}