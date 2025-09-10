import { useState } from "react";
import PaymentMethodsConfig from "@/components/payment-methods-config";
import { useToast } from "@/hooks/use-toast";

export default function PaymentMethodsPage() {
  const { toast } = useToast();

  const handleNotification = (message: string) => {
    toast({
      title: "Métodos de Pago",
      description: message,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <PaymentMethodsConfig onNotification={handleNotification} />
    </div>
  );
}