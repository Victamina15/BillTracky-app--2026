import { Check } from "lucide-react";

interface NotificationModalProps {
  message: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationModal({ message, isOpen, onClose }: NotificationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-2xl max-w-md w-full p-6 dark:shadow-2xl fade-in">
        <div className="text-center">
          <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-secondary" />
          </div>
          <h3 className="text-lg font-semibold text-card-foreground mb-2">Billtracky</h3>
          <p className="text-muted-foreground mb-6" data-testid="notification-message">
            {message}
          </p>
          <button
            onClick={onClose}
            className="w-full bg-secondary text-secondary-foreground py-3 rounded-lg hover:bg-secondary/90 font-medium transition-colors"
            data-testid="button-close-notification"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}
