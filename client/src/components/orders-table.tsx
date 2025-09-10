import { useState } from "react";
import { Search, Eye, Edit3, Printer } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { type Invoice } from "@shared/schema";

interface OrdersTableProps {
  onNotification: (message: string) => void;
}

export default function OrdersTable({ onNotification }: OrdersTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: orders = [], isLoading } = useQuery<Invoice[]>({
    queryKey: ["/api/invoices"],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await apiRequest("PUT", `/api/invoices/${id}`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      queryClient.invalidateQueries({ queryKey: ["/api/metrics/dashboard"] });
      onNotification("Estado actualizado correctamente");
    },
    onError: () => {
      onNotification("Error al actualizar el estado");
    },
  });

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerPhone.includes(searchTerm);
    
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'received': return 'bg-blue-100 text-blue-800';
      case 'in_process': return 'bg-yellow-100 text-yellow-800';
      case 'ready': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'received': return 'Recibido';
      case 'in_process': return 'En Proceso';
      case 'ready': return 'Listo';
      case 'delivered': return 'Entregado';
      default: return status;
    }
  };

  const handleStatusChange = (orderId: string, newStatus: string) => {
    updateStatusMutation.mutate({ id: orderId, status: newStatus });
  };

  if (isLoading) {
    return (
      <div className="bg-card rounded-xl shadow-sm border border-border p-6">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Cargando órdenes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl shadow-sm border border-border p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h2 className="text-xl font-semibold text-card-foreground mb-4 md:mb-0">
          Gestión de Órdenes
        </h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por cliente o número..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent w-full sm:w-64"
              data-testid="input-search-orders"
            />
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
            data-testid="select-status-filter"
          >
            <option value="all">Todos los estados</option>
            <option value="received">Recibido</option>
            <option value="in_process">En Proceso</option>
            <option value="ready">Listo</option>
            <option value="delivered">Entregado</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 font-medium text-muted-foreground">Número</th>
              <th className="text-left py-3 px-4 font-medium text-muted-foreground">Cliente</th>
              <th className="text-left py-3 px-4 font-medium text-muted-foreground">Teléfono</th>
              <th className="text-left py-3 px-4 font-medium text-muted-foreground">Total</th>
              <th className="text-left py-3 px-4 font-medium text-muted-foreground">Estado</th>
              <th className="text-left py-3 px-4 font-medium text-muted-foreground">Fecha</th>
              <th className="text-left py-3 px-4 font-medium text-muted-foreground">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredOrders.map((order) => (
              <tr key={order.id} className="hover:bg-muted/50 transition-colors" data-testid={`order-row-${order.id}`}>
                <td className="py-4 px-4">
                  <span className="font-medium text-card-foreground">{order.number}</span>
                </td>
                <td className="py-4 px-4">
                  <span className="text-card-foreground">{order.customerName}</span>
                </td>
                <td className="py-4 px-4">
                  <span className="text-muted-foreground">{order.customerPhone}</span>
                </td>
                <td className="py-4 px-4">
                  <span className="font-medium text-card-foreground">
                    RD${parseFloat(order.total).toFixed(2)}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <select
                    value={order.status || 'received'}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    className={`inline-block px-2 py-1 text-xs font-medium rounded-full border-none ${getStatusColor(order.status || 'received')}`}
                    data-testid={`select-status-${order.id}`}
                  >
                    <option value="received">Recibido</option>
                    <option value="in_process">En Proceso</option>
                    <option value="ready">Listo</option>
                    <option value="delivered">Entregado</option>
                  </select>
                </td>
                <td className="py-4 px-4">
                  <span className="text-muted-foreground">
                    {new Date(order.date || 0).toLocaleDateString('es-ES')}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => onNotification(`Viendo detalles de ${order.number}`)}
                      className="p-1 text-secondary hover:bg-secondary/10 rounded"
                      title="Ver detalles"
                      data-testid={`button-view-${order.id}`}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => onNotification(`Editando orden ${order.number}`)}
                      className="p-1 text-muted-foreground hover:bg-muted rounded"
                      title="Editar"
                      data-testid={`button-edit-${order.id}`}
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => onNotification(`Imprimiendo ${order.number}`)}
                      className="p-1 text-green-600 hover:bg-green-100 rounded"
                      title="Imprimir"
                      data-testid={`button-print-${order.id}`}
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>No se encontraron órdenes que coincidan con los filtros.</p>
        </div>
      )}
    </div>
  );
}
