import { useState, useEffect } from "react";
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

  // Cargar sesión guardada al iniciar
  useEffect(() => {
    const savedAccessCode = localStorage.getItem('employeeAccessCode');
    const savedEmployeeId = localStorage.getItem('employeeId');
    
    if (savedAccessCode && savedEmployeeId) {
      // Verificar que la sesión sigue siendo válida
      fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessCode: savedAccessCode })
      })
      .then(res => res.json())
      .then(data => {
        if (data.employee && data.employee.id === savedEmployeeId) {
          setCurrentUser(data.employee);
          setUserType("employee");
        } else {
          localStorage.removeItem('employeeAccessCode');
          localStorage.removeItem('employeeId');
        }
      })
      .catch(() => {
        localStorage.removeItem('employeeAccessCode');
        localStorage.removeItem('employeeId');
      });
    }
  }, []);

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

  const handleEmployeeLogin = (employee: Employee, accessCode?: string) => {
    // Store employee ID and access code in localStorage for authenticated requests
    localStorage.setItem('employeeId', employee.id);
    if (accessCode) {
      localStorage.setItem('employeeAccessCode', accessCode);
    }
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
    // Clear stored employee data from localStorage
    localStorage.removeItem('employeeId');
    localStorage.removeItem('employeeAccessCode');
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
