import { useState } from "react";
import { type Employee } from "@shared/schema";
import LoginScreen from "@/components/login-screen";
import Dashboard from "@/components/dashboard";
import NotificationModal from "@/components/notification-modal";

export default function Home() {
  const [currentUser, setCurrentUser] = useState<Employee | null>(null);
  const [notification, setNotification] = useState<string>("");

  const showNotification = (message: string) => {
    setNotification(message);
  };

  const closeNotification = () => {
    setNotification("");
  };

  const logout = () => {
    setCurrentUser(null);
    showNotification("Sesión cerrada correctamente.");
  };

  if (!currentUser) {
    return (
      <>
        <LoginScreen 
          onLogin={setCurrentUser} 
          onNotification={showNotification} 
        />
        <NotificationModal
          message={notification}
          isOpen={!!notification}
          onClose={closeNotification}
        />
      </>
    );
  }

  return (
    <>
      <Dashboard 
        user={currentUser} 
        onLogout={logout} 
        onNotification={showNotification} 
      />
      <NotificationModal
        message={notification}
        isOpen={!!notification}
        onClose={closeNotification}
      />
    </>
  );
}
