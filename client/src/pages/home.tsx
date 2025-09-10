import { useState } from "react";
import { type Employee, type User } from "@shared/schema";
import LandingPage from "@/components/landing-page";
import RegisterModal from "@/components/register-modal";
import LoginModal from "@/components/login-modal";
import Dashboard from "@/components/dashboard";
import NotificationModal from "@/components/notification-modal";
import { useToast } from "@/hooks/use-toast";

type AuthenticatedUser = Employee | User;

export default function Home() {
  const [currentUser, setCurrentUser] = useState<AuthenticatedUser | null>(null);
  const [userType, setUserType] = useState<"employee" | "user" | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const { toast } = useToast();

  const showNotification = (message: string) => {
    toast({
      title: "Billtracky",
      description: message,
    });
  };

  const handleGetStarted = () => {
    setShowRegisterModal(true);
  };

  const handleLogin = () => {
    setShowLoginModal(true);
  };

  const handleUserLogin = (user: User) => {
    setCurrentUser(user);
    setUserType("user");
    setShowLoginModal(false);
    showNotification(`Bienvenido ${user.firstName}!`);
  };

  const handleEmployeeLogin = (employee: Employee) => {
    // Store employee ID in localStorage for authenticated requests
    localStorage.setItem('employeeId', employee.id);
    setCurrentUser(employee);
    setUserType("employee");
    setShowLoginModal(false);
    showNotification(`Bienvenido ${employee.name}!`);
  };

  const handleRegisterSuccess = () => {
    setShowRegisterModal(false);
    showNotification("¡Cuenta creada exitosamente! Revisa tu email para activar tu cuenta.");
  };

  const logout = () => {
    // Clear stored employee ID from localStorage
    localStorage.removeItem('employeeId');
    setCurrentUser(null);
    setUserType(null);
    showNotification("Sesión cerrada correctamente.");
  };

  const switchToLogin = () => {
    setShowRegisterModal(false);
    setShowLoginModal(true);
  };

  const switchToRegister = () => {
    setShowLoginModal(false);
    setShowRegisterModal(true);
  };

  // Si no hay usuario autenticado, mostrar landing page
  if (!currentUser) {
    return (
      <>
        <LandingPage 
          onGetStarted={handleGetStarted}
          onLogin={handleLogin}
        />
        <RegisterModal
          isOpen={showRegisterModal}
          onClose={() => setShowRegisterModal(false)}
          onLoginClick={switchToLogin}
          onSuccess={handleRegisterSuccess}
        />
        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onRegisterClick={switchToRegister}
          onUserLogin={handleUserLogin}
          onEmployeeLogin={handleEmployeeLogin}
        />
      </>
    );
  }

  // Si hay usuario autenticado, mostrar dashboard
  return (
    <Dashboard 
      user={currentUser as Employee} // Temporal hasta que adaptemos el dashboard para usuarios
      onLogout={logout} 
      onNotification={showNotification} 
    />
  );
}
