import { Trash2 } from "lucide-react";

interface NumericKeypadProps {
  isOpen: boolean;
  onClose: () => void;
  onCodeChange: (code: string) => void;
  onSubmit: () => void;
  currentCode: string;
}

export default function NumericKeypad({ 
  isOpen, 
  onClose, 
  onCodeChange, 
  onSubmit, 
  currentCode 
}: NumericKeypadProps) {
  if (!isOpen) return null;

  const addNumber = (num: string) => {
    if (currentCode.length < 6) {
      onCodeChange(currentCode + num);
    }
  };

  const deleteNumber = () => {
    onCodeChange(currentCode.slice(0, -1));
  };

  const clearCode = () => {
    onCodeChange("");
  };

  const handleSubmit = () => {
    onClose();
    onSubmit();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-2xl max-w-sm w-full p-6 shadow-2xl fade-in">
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-card-foreground">Teclado Numérico</h3>
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <span className="text-2xl font-mono tracking-widest text-card-foreground">
              {currentCode.replace(/./g, '•').padEnd(6, '_')}
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => addNumber(num.toString())}
              className="h-14 bg-muted hover:bg-accent rounded-lg text-xl font-semibold transition-colors"
              data-testid={`keypad-${num}`}
            >
              {num}
            </button>
          ))}
          <button
            onClick={() => addNumber('0')}
            className="h-14 bg-muted hover:bg-accent rounded-lg text-xl font-semibold transition-colors"
            data-testid="keypad-0"
          >
            0
          </button>
          <button
            onClick={deleteNumber}
            className="h-14 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-lg font-semibold transition-colors flex items-center justify-center"
            data-testid="keypad-delete"
          >
            <Trash2 className="w-5 h-5" />
          </button>
          <button
            onClick={clearCode}
            className="h-14 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded-lg font-semibold transition-colors text-sm"
            data-testid="keypad-clear"
          >
            Limpiar
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onClose}
            className="py-3 bg-muted text-muted-foreground rounded-lg hover:bg-accent font-medium transition-colors"
            data-testid="keypad-cancel"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 font-medium transition-colors"
            data-testid="keypad-submit"
          >
            Ingresar
          </button>
        </div>
      </div>
    </div>
  );
}
