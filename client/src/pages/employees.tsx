import EmployeesManagement from "@/components/employees-management";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Employees() {
  const { toast } = useToast();

  const showNotification = (message: string) => {
    toast({
      description: message,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <EmployeesManagement onNotification={showNotification} />
    </div>
  );
}