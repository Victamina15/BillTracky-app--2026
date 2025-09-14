import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, subDays, subMonths } from "date-fns";
import { es } from "date-fns/locale";
import {
  Calendar,
  Download,
  Filter,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  ArrowLeft,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

interface CashClosure {
  id: string;
  date: string;
  openingCash: string;
  countedCash: string;
  systemCash: string;
  variance: string;
  notes?: string;
  createdAt: string;
  employeeName?: string;
}

interface CashClosuresHistoryProps {
  onBack: () => void;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
};

const getVarianceStatus = (variance: number) => {
  if (Math.abs(variance) < 10) return { status: 'perfect', label: '✅ Cuadrado', color: 'green' };
  if (Math.abs(variance) < 50) return { status: 'minor', label: '⚠️ Diferencia Menor', color: 'yellow' };
  return { status: 'major', label: '❌ Diferencia Mayor', color: 'red' };
};

export default function CashClosuresHistory({ onBack }: CashClosuresHistoryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDateRange, setSelectedDateRange] = useState("last-30");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [sortBy, setSortBy] = useState("date-desc");
  
  const { toast } = useToast();

  // Calculate date range
  const getDateRange = () => {
    const today = new Date();
    switch (selectedDateRange) {
      case "today":
        return { startDate: format(today, "yyyy-MM-dd"), endDate: format(today, "yyyy-MM-dd") };
      case "last-7":
        return { startDate: format(subDays(today, 7), "yyyy-MM-dd"), endDate: format(today, "yyyy-MM-dd") };
      case "last-30":
        return { startDate: format(subDays(today, 30), "yyyy-MM-dd"), endDate: format(today, "yyyy-MM-dd") };
      case "last-90":
        return { startDate: format(subDays(today, 90), "yyyy-MM-dd"), endDate: format(today, "yyyy-MM-dd") };
      default:
        return { startDate: format(subMonths(today, 3), "yyyy-MM-dd"), endDate: format(today, "yyyy-MM-dd") };
    }
  };

  const dateRange = getDateRange();

  // Fetch cash closures history
  const {
    data: closures = [],
    isLoading: closuresLoading,
    error: closuresError
  } = useQuery<CashClosure[]>({
    queryKey: ['/api/cash-closures/history', dateRange.startDate, dateRange.endDate],
    queryFn: async () => {
      const response = await fetch(`/api/cash-closures/history?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`, {
        headers: {
          'x-employee-id': localStorage.getItem('employeeId') || '',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch cash closures history');
      }
      return response.json();
    },
    enabled: true,
  });

  // Filter and sort closures
  const filteredClosures = useMemo(() => {
    let filtered = closures.filter((closure: CashClosure) => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesNotes = closure.notes?.toLowerCase().includes(searchLower);
        const matchesEmployee = closure.employeeName?.toLowerCase().includes(searchLower);
        const matchesDate = (closure as any).closingDate ? format(new Date((closure as any).closingDate), "dd/MM/yyyy", { locale: es }).includes(searchLower) : false;
        
        if (!matchesNotes && !matchesEmployee && !matchesDate) {
          return false;
        }
      }

      // Status filter
      if (selectedStatus !== "all") {
        const variance = parseFloat(closure.variance);
        const status = getVarianceStatus(variance).status;
        if (status !== selectedStatus) {
          return false;
        }
      }

      return true;
    });

    // Sort closures
    filtered.sort((a: CashClosure, b: CashClosure) => {
      switch (sortBy) {
        case "date-asc":
          return new Date((a as any).closingDate).getTime() - new Date((b as any).closingDate).getTime();
        case "date-desc":
          return new Date((b as any).closingDate).getTime() - new Date((a as any).closingDate).getTime();
        case "variance-asc":
          return parseFloat(a.variance) - parseFloat(b.variance);
        case "variance-desc":
          return parseFloat(b.variance) - parseFloat(a.variance);
        default:
          return 0;
      }
    });

    return filtered;
  }, [closures, searchTerm, selectedStatus, sortBy]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    if (!filteredClosures.length) return { perfect: 0, minor: 0, major: 0, totalVariance: 0 };

    const stats = filteredClosures.reduce((acc: any, closure: CashClosure) => {
      const variance = parseFloat(closure.variance);
      const status = getVarianceStatus(variance).status;
      
      acc[status]++;
      acc.totalVariance += variance;
      
      return acc;
    }, { perfect: 0, minor: 0, major: 0, totalVariance: 0 });

    return stats;
  }, [filteredClosures]);

  const sanitizeCSVValue = (value: string) => {
    // Prevent CSV injection by prefixing dangerous characters with single quote
    if (value && (value.startsWith('=') || value.startsWith('+') || value.startsWith('-') || value.startsWith('@'))) {
      return "'" + value;
    }
    return value;
  };

  const handleExportData = () => {
    if (!filteredClosures.length) {
      toast({
        title: "Error",
        description: "No hay datos para exportar",
        variant: "destructive",
      });
      return;
    }

    // Create CSV content
    const headers = ["Fecha", "Empleado", "Dinero Apertura", "Dinero Contado", "Dinero Sistema", "Varianza", "Estado", "Observaciones"];
    const csvContent = [
      headers.join(","),
      ...filteredClosures.map((closure: CashClosure) => {
        const variance = parseFloat(closure.variance);
        const status = getVarianceStatus(variance).label;
        return [
          format(new Date(closure.date), "dd/MM/yyyy"),
          `"${sanitizeCSVValue(closure.employeeName || 'N/A')}"`,
          parseFloat(closure.openingCash).toFixed(2),
          parseFloat(closure.countedCash).toFixed(2),
          parseFloat(closure.systemCash).toFixed(2),
          variance.toFixed(2),
          `"${sanitizeCSVValue(status)}"`,
          `"${sanitizeCSVValue(closure.notes || '')}"`,
        ].join(",");
      }),
    ].join("\n");

    // Download CSV
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `historial-cierres-${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();

    toast({
      title: "Exportación completada",
      description: "El archivo se ha descargado correctamente",
    });
  };

  if (closuresLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-64" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (closuresError) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button
              onClick={onBack}
              variant="outline"
              size="sm"
              className="tech-button-3d"
              data-testid="button-back-to-dashboard"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </div>
          <div className="tech-button-3d bg-gradient-to-br from-red-50 to-rose-100 dark:from-red-900/30 dark:to-rose-800/30 border-2 border-red-300 dark:border-red-500/50 rounded-xl p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-red-600 dark:text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-red-800 dark:text-red-200 mb-2">Error al cargar datos</h3>
            <p className="text-red-700 dark:text-red-300">No se pudieron cargar los cierres de caja. Inténtelo de nuevo.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            onClick={onBack}
            variant="outline"
            size="sm"
            className="tech-button-3d"
            data-testid="button-back-to-dashboard"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
              📊 Historial de Cierres de Caja
            </h1>
            <p className="text-gray-600 dark:text-gray-400">Consulta y analiza el historial de cierres de caja</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="tech-button-3d bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/30 dark:to-emerald-800/30 border-2 border-green-300 dark:border-green-500/50">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                <CardTitle className="text-sm font-bold text-green-700 dark:text-green-300">Cierres Cuadrados</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400" data-testid="perfect-closures-count">
                {summaryStats.perfect}
              </p>
            </CardContent>
          </Card>

          <Card className="tech-button-3d bg-gradient-to-br from-yellow-50 to-amber-100 dark:from-yellow-900/30 dark:to-amber-800/30 border-2 border-yellow-300 dark:border-yellow-500/50">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                <CardTitle className="text-sm font-bold text-yellow-700 dark:text-yellow-300">Diferencias Menores</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400" data-testid="minor-closures-count">
                {summaryStats.minor}
              </p>
            </CardContent>
          </Card>

          <Card className="tech-button-3d bg-gradient-to-br from-red-50 to-rose-100 dark:from-red-900/30 dark:to-rose-800/30 border-2 border-red-300 dark:border-red-500/50">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
                <CardTitle className="text-sm font-bold text-red-700 dark:text-red-300">Diferencias Mayores</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400" data-testid="major-closures-count">
                {summaryStats.major}
              </p>
            </CardContent>
          </Card>

          <Card className="tech-button-3d bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-800/30 border-2 border-blue-300 dark:border-blue-500/50">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                {summaryStats.totalVariance >= 0 ? (
                  <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                )}
                <CardTitle className="text-sm font-bold text-blue-700 dark:text-blue-300">Varianza Total</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className={`text-2xl font-bold ${
                summaryStats.totalVariance >= 0 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`} data-testid="total-variance">
                {formatCurrency(summaryStats.totalVariance)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <Card className="tech-button-3d bg-white dark:bg-gray-800 border-2 mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filtros y Acciones
                </CardTitle>
                <CardDescription>Filtra y exporta los datos según tus necesidades</CardDescription>
              </div>
              <Button
                onClick={handleExportData}
                className="tech-button-3d bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-400 hover:to-cyan-500 text-white"
                data-testid="button-export-data"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div>
                <Label htmlFor="search">Buscar</Label>
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Fecha, empleado, observaciones..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    data-testid="input-search"
                  />
                </div>
              </div>

              {/* Date Range */}
              <div>
                <Label htmlFor="date-range">Período</Label>
                <Select value={selectedDateRange} onValueChange={setSelectedDateRange}>
                  <SelectTrigger data-testid="select-date-range">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Hoy</SelectItem>
                    <SelectItem value="last-7">Últimos 7 días</SelectItem>
                    <SelectItem value="last-30">Últimos 30 días</SelectItem>
                    <SelectItem value="last-90">Últimos 90 días</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div>
                <Label htmlFor="status">Estado</Label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger data-testid="select-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="perfect">Cuadrados</SelectItem>
                    <SelectItem value="minor">Diferencias Menores</SelectItem>
                    <SelectItem value="major">Diferencias Mayores</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort */}
              <div>
                <Label htmlFor="sort">Ordenar por</Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger data-testid="select-sort">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date-desc">Fecha (Más reciente)</SelectItem>
                    <SelectItem value="date-asc">Fecha (Más antigua)</SelectItem>
                    <SelectItem value="variance-desc">Varianza (Mayor)</SelectItem>
                    <SelectItem value="variance-asc">Varianza (Menor)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Closures Table */}
        <Card className="tech-button-3d bg-white dark:bg-gray-800 border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Historial de Cierres ({filteredClosures.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredClosures.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
                  No se encontraron cierres
                </h3>
                <p className="text-gray-500 dark:text-gray-500">
                  Ajusta los filtros para ver más resultados
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Empleado</TableHead>
                      <TableHead>Apertura</TableHead>
                      <TableHead>Contado</TableHead>
                      <TableHead>Sistema</TableHead>
                      <TableHead>Varianza</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Observaciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClosures.map((closure: CashClosure) => {
                      const variance = parseFloat(closure.variance);
                      const status = getVarianceStatus(variance);
                      
                      return (
                        <TableRow key={closure.id} data-testid={`closure-row-${closure.id}`}>
                          <TableCell className="font-medium">
                            {format(new Date(closure.date), "dd/MM/yyyy", { locale: es })}
                          </TableCell>
                          <TableCell>{closure.employeeName || 'N/A'}</TableCell>
                          <TableCell>{formatCurrency(parseFloat(closure.openingCash))}</TableCell>
                          <TableCell>{formatCurrency(parseFloat(closure.countedCash))}</TableCell>
                          <TableCell>{formatCurrency(parseFloat(closure.systemCash))}</TableCell>
                          <TableCell className={variance >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {formatCurrency(variance)}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              className={
                                status.color === 'green' 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                status.color === 'yellow'
                                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                              }
                            >
                              {status.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-xs truncate" title={closure.notes}>
                            {closure.notes || '-'}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}