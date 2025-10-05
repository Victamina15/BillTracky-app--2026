import { useState } from "react";
import { FileText } from "lucide-react";
import { type Employee } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import NumericKeypad from "./numeric-keypad";

interface LoginScreenProps {
  onLogin: (user: Employee, accessCode?: string) => void;
  onNotification: (message: string) => void;
}

export default function LoginScreen({ onLogin, onNotification }: LoginScreenProps) {
  const [accessCode, setAccessCode] = useState("");
  const [showKeypad, setShowKeypad] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

 const handleLogin = async () => {
  if (!accessCode) {
    onNotification("Por favor ingrese su código de acceso.");
    return;
  }

  setIsLoading(true);
  try {
    const response = await apiRequest("POST", "/api/auth/login", { accessCode });
    const data = await response.json();
    
    // Guardar en localStorage para persistir la sesión
    localStorage.setItem("accessCode", accessCode);
    localStorage.setItem("employee", JSON.stringify(data.employee));
    
    onLogin(data.employee, accessCode);
    onNotification(`¡Bienvenido, ${data.employee.name}!`);
    setAccessCode("");
  } catch (error) {
    onNotification("Código de acceso incorrecto.");
    setAccessCode("");
  } finally {
    setIsLoading(false);
  }
};

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl shadow-2xl max-w-md w-full p-8 fade-in">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <FileText className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-card-foreground">Billtracky</h1>
          <p className="text-muted-foreground mt-2 font-medium">CleanWash Lavandería</p>
          <p className="text-sm text-muted-foreground">Sistema de Gestión Completo</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">
              Código de Acceso
            </label>
            <div className="relative">
              <input
                type="password"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent pr-12 transition-all"
                placeholder="Ingresa tu código"
                maxLength={6}
                data-testid="input-access-code"
              />
              <button
                onClick={() => setShowKeypad(true)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 text-muted-foreground hover:text-secondary transition-colors"
                title="Teclado numérico"
                data-testid="button-show-keypad"
              >
                <div className="w-5 h-5 grid grid-cols-3 gap-0.5">
                  {[...Array(9)].map((_, i) => (
                    <div key={i} className="w-1 h-1 bg-current rounded-full"></div>
                  ))}
                </div>
              </button>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => setShowKeypad(true)}
              className="flex-1 bg-muted text-muted-foreground py-3 rounded-lg hover:bg-accent font-medium flex items-center justify-center space-x-2 transition-colors"
              data-testid="button-keypad"
            >
              <div className="w-4 h-4 grid grid-cols-3 gap-0.5">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="w-1 h-1 bg-current rounded-full"></div>
                ))}
              </div>
              <span>Teclado</span>
            </button>
            <button
              onClick={handleLogin}
              disabled={isLoading}
              className="flex-1 bg-secondary text-secondary-foreground py-3 rounded-lg hover:bg-secondary/90 font-medium transition-colors disabled:opacity-50"
              data-testid="button-login"
            >
              {isLoading ? "Iniciando..." : "Iniciar Sesión"}
            </button>
          </div>
        </div>
       
       
      </div>

      <NumericKeypad
        isOpen={showKeypad}
        onClose={() => setShowKeypad(false)}
        onCodeChange={setAccessCode}
        onSubmit={handleLogin}
        currentCode={accessCode}
      />
    </div>
  );
}
