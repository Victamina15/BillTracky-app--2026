import { useState } from 'react';
import { 
  Building2, 
  Save, 
  X, 
  Check, 
  Mail, 
  Phone, 
  MapPin, 
  Camera, 
  Upload, 
  Settings, 
  AlertCircle, 
  Eye,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface CompanyConfigProps {
  onBack?: () => void;
}

export default function CompanyConfig({ onBack }: CompanyConfigProps) {
  const [configuracion, setConfiguracion] = useState({
    nombre: 'CleanWash Lavandería',
    nombreComercial: 'CleanWash',
    email: 'admin@cleanwash.com',
    telefono: '809-555-0123',
    telefono2: '809-555-0124',
    direccion: 'Av. Principal #123, Santo Domingo',
    sucursal: 'Sucursal Centro',
    ciudad: 'Santo Domingo',
    provincia: 'Distrito Nacional',
    codigoPostal: '10101',
    rnc: '131-12345-6',
    website: 'www.cleanwash.com',
    redesSociales: {
      facebook: '@cleanwashrd',
      instagram: '@cleanwash_rd',
      whatsapp: '8095550123'
    },
    horarios: {
      lunes: { apertura: '08:00', cierre: '18:00', activo: true },
      martes: { apertura: '08:00', cierre: '18:00', activo: true },
      miercoles: { apertura: '08:00', cierre: '18:00', activo: true },
      jueves: { apertura: '08:00', cierre: '18:00', activo: true },
      viernes: { apertura: '08:00', cierre: '18:00', activo: true },
      sabado: { apertura: '08:00', cierre: '16:00', activo: true },
      domingo: { apertura: '09:00', cierre: '14:00', activo: false }
    },
    configuracionFactura: {
      mostrarRnc: true,
      mostrarDireccion: true,
      mostrarTelefono: true,
      mostrarEmail: true,
      mensajePie: 'Gracias por preferirnos - CleanWash Lavandería'
    }
  });

  const [activeTab, setActiveTab] = useState('general');
  const [modalMessage, setModalMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const { toast } = useToast();

  const openModal = (message: string) => {
    setModalMessage(message);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalMessage('');
  };

  const updateField = (field: string, value: string) => {
    setHasChanges(true);
    setConfiguracion(prev => ({ ...prev, [field]: value }));
  };

  const updateSocial = (field: string, value: string) => {
    setHasChanges(true);
    setConfiguracion(prev => ({
      ...prev,
      redesSociales: { ...prev.redesSociales, [field]: value }
    }));
  };

  const updateFactura = (field: string, value: boolean | string) => {
    setHasChanges(true);
    setConfiguracion(prev => ({
      ...prev,
      configuracionFactura: { ...prev.configuracionFactura, [field]: value }
    }));
  };

  const updateHorario = (dia: string, campo: string, valor: boolean | string) => {
    setHasChanges(true);
    setConfiguracion(prev => ({
      ...prev,
      horarios: {
        ...prev.horarios,
        [dia]: { ...prev.horarios[dia as keyof typeof prev.horarios], [campo]: valor }
      }
    }));
  };

  const saveConfig = () => {
    if (!configuracion.nombre || !configuracion.telefono) {
      toast({
        title: "Campos requeridos",
        description: "Complete al menos el nombre y teléfono de la empresa.",
        variant: "destructive",
      });
      return;
    }
    
    setHasChanges(false);
    toast({
      title: "Configuración guardada",
      description: "Configuración actualizada exitosamente.",
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Archivo muy grande",
          description: "El archivo debe ser menor a 5MB.",
          variant: "destructive",
        });
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
        setHasChanges(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const diasSemana = {
    lunes: 'Lunes',
    martes: 'Martes',
    miercoles: 'Miércoles',
    jueves: 'Jueves',
    viernes: 'Viernes',
    sabado: 'Sábado',
    domingo: 'Domingo'
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header con diseño tech-3D */}
        <div className="tech-button-3d bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 border-2 border-slate-200 dark:border-slate-600 rounded-xl shadow-2xl backdrop-blur-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {onBack && (
                <Button
                  onClick={onBack}
                  className="tech-button-3d bg-white border-2 border-slate-300 text-slate-700 dark:from-slate-500/20 dark:to-slate-600/20 dark:text-white dark:border-slate-500/30 rounded-lg shadow-sm p-3 hover:bg-slate-50 hover:border-slate-400 dark:hover:from-slate-400/30 dark:hover:to-slate-500/30 transition-all duration-300 cursor-pointer transform hover:scale-105 hover:-translate-y-1 dark:backdrop-blur-sm font-bold mr-3"
                  data-testid="button-back-company-config"
                >
                  <X className="h-4 w-4 mr-2" />
                  Volver
                </Button>
              )}
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-xl flex items-center justify-center tech-glow shadow-xl transform hover:scale-105 transition-all duration-300">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">🏢 Configuración de Empresa</h1>
                <p className="text-slate-600 dark:text-slate-300 font-semibold">Datos generales y configuración del negocio</p>
              </div>
            </div>
              
            <div className="flex space-x-3">
              <Button
                onClick={() => setShowPreview(true)}
                className="tech-button-3d bg-white border-2 border-blue-300 text-blue-700 dark:from-blue-500/20 dark:to-indigo-600/20 dark:text-white dark:border-blue-500/30 rounded-lg shadow-sm p-3 hover:bg-blue-50 hover:border-blue-400 dark:hover:from-blue-400/30 dark:hover:to-indigo-500/30 transition-all duration-300 cursor-pointer transform hover:scale-105 hover:-translate-y-1 dark:backdrop-blur-sm font-bold"
                data-testid="button-preview-company"
              >
                <Eye className="w-4 h-4 mr-2" />
                Vista Previa
              </Button>
              <Button
                onClick={saveConfig}
                disabled={!hasChanges}
                className="tech-button-3d bg-white border-2 border-green-300 text-green-700 dark:from-green-500/20 dark:to-emerald-600/20 dark:text-white dark:border-green-500/30 rounded-lg shadow-sm p-3 hover:bg-green-50 hover:border-green-400 dark:hover:from-green-400/30 dark:hover:to-emerald-500/30 transition-all duration-300 cursor-pointer transform hover:scale-105 hover:-translate-y-1 dark:backdrop-blur-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                data-testid="button-save-company-config"
              >
                <Save className="w-4 h-4 mr-2" />
                Guardar Cambios
              </Button>
            </div>
          </div>
        </div>

        {/* Navegación de Pestañas con diseño tech-3D */}
        <div className="tech-button-3d bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 border-2 border-slate-200 dark:border-slate-600 rounded-xl shadow-2xl backdrop-blur-sm mb-6">
          <div className="border-b border-slate-200 dark:border-slate-600">
            <nav className="flex space-x-4 p-6">
              <button
                onClick={() => setActiveTab('general')}
                className={`tech-button-3d px-4 py-3 rounded-lg font-bold text-sm flex items-center space-x-2 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 ${
                  activeTab === 'general'
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-2 border-blue-300 shadow-lg tech-glow'
                    : 'bg-white border-2 border-slate-300 text-slate-700 dark:from-slate-500/20 dark:to-slate-600/20 dark:text-white dark:border-slate-500/30 hover:bg-blue-50 hover:border-blue-300 dark:hover:from-blue-400/30 dark:hover:to-indigo-500/30'
                }`}
                data-testid="tab-general-config"
              >
                <Building2 className="w-4 h-4" />
                <span>🏢 Información General</span>
              </button>
              <button
                onClick={() => setActiveTab('contacto')}
                className={`tech-button-3d px-4 py-3 rounded-lg font-bold text-sm flex items-center space-x-2 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 ${
                  activeTab === 'contacto'
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white border-2 border-green-300 shadow-lg tech-glow'
                    : 'bg-white border-2 border-slate-300 text-slate-700 dark:from-slate-500/20 dark:to-slate-600/20 dark:text-white dark:border-slate-500/30 hover:bg-green-50 hover:border-green-300 dark:hover:from-green-400/30 dark:hover:to-emerald-500/30'
                }`}
                data-testid="tab-contact-config"
              >
                <Phone className="w-4 h-4" />
                <span>📞 Contacto y Ubicación</span>
              </button>
              <button
                onClick={() => setActiveTab('horarios')}
                className={`tech-button-3d px-4 py-3 rounded-lg font-bold text-sm flex items-center space-x-2 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 ${
                  activeTab === 'horarios'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white border-2 border-purple-300 shadow-lg tech-glow'
                    : 'bg-white border-2 border-slate-300 text-slate-700 dark:from-slate-500/20 dark:to-slate-600/20 dark:text-white dark:border-slate-500/30 hover:bg-purple-50 hover:border-purple-300 dark:hover:from-purple-400/30 dark:hover:to-pink-500/30'
                }`}
                data-testid="tab-schedule-config"
              >
                <Clock className="w-4 h-4" />
                <span>⏰ Horarios de Atención</span>
              </button>
              <button
                onClick={() => setActiveTab('facturacion')}
                className={`tech-button-3d px-4 py-3 rounded-lg font-bold text-sm flex items-center space-x-2 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 ${
                  activeTab === 'facturacion'
                    ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white border-2 border-orange-300 shadow-lg tech-glow'
                    : 'bg-white border-2 border-slate-300 text-slate-700 dark:from-slate-500/20 dark:to-slate-600/20 dark:text-white dark:border-slate-500/30 hover:bg-orange-50 hover:border-orange-300 dark:hover:from-orange-400/30 dark:hover:to-red-500/30'
                }`}
                data-testid="tab-billing-config"
              >
                <Settings className="w-4 h-4" />
                <span>⚙️ Configuración de Factura</span>
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* General Tab */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre de la Empresa *</Label>
                    <Input
                      id="nombre"
                      value={configuracion.nombre}
                      onChange={(e) => updateField('nombre', e.target.value)}
                      placeholder="CleanWash Lavandería S.R.L."
                      data-testid="input-company-name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="nombreComercial">Nombre Comercial</Label>
                    <Input
                      id="nombreComercial"
                      value={configuracion.nombreComercial}
                      onChange={(e) => updateField('nombreComercial', e.target.value)}
                      placeholder="CleanWash"
                      data-testid="input-trade-name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="rnc">RNC</Label>
                    <Input
                      id="rnc"
                      value={configuracion.rnc}
                      onChange={(e) => updateField('rnc', e.target.value)}
                      placeholder="131-12345-6"
                      data-testid="input-company-rnc"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="website">Sitio Web</Label>
                    <Input
                      id="website"
                      value={configuracion.website}
                      onChange={(e) => updateField('website', e.target.value)}
                      placeholder="www.empresa.com"
                      data-testid="input-company-website"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Logo de la Empresa</Label>
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 bg-muted dark:bg-gray-700/50 rounded-lg flex items-center justify-center border-2 border-dashed border-muted-foreground/25 dark:border-cyan-500/30">
                      {logoPreview ? (
                        <img src={logoPreview} alt="Logo" className="w-full h-full object-contain rounded-lg" />
                      ) : (
                        <Camera className="w-8 h-8 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <input 
                        type="file" 
                        id="logo" 
                        accept="image/*" 
                        onChange={handleFileUpload} 
                        className="hidden" 
                        data-testid="input-logo-upload"
                      />
                      <Button variant="outline" asChild>
                        <label htmlFor="logo" className="cursor-pointer">
                          <Upload className="w-4 h-4 mr-2" />
                          Subir Logo
                        </label>
                      </Button>
                      <p className="text-xs text-muted-foreground dark:text-gray-400 mt-1">PNG, JPG hasta 5MB</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Contact Tab */}
            {activeTab === 'contacto' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Principal *</Label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={configuracion.email}
                        onChange={(e) => updateField('email', e.target.value)}
                        className="pl-10"
                        placeholder="admin@empresa.com"
                        data-testid="input-company-email"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="telefono">Teléfono Principal *</Label>
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="telefono"
                        type="tel"
                        value={configuracion.telefono}
                        onChange={(e) => updateField('telefono', e.target.value)}
                        className="pl-10"
                        placeholder="809-000-0000"
                        data-testid="input-company-phone"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="telefono2">Teléfono Secundario</Label>
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="telefono2"
                        type="tel"
                        value={configuracion.telefono2}
                        onChange={(e) => updateField('telefono2', e.target.value)}
                        className="pl-10"
                        placeholder="809-000-0001"
                        data-testid="input-company-phone2"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="sucursal">Sucursal</Label>
                    <Input
                      id="sucursal"
                      value={configuracion.sucursal}
                      onChange={(e) => updateField('sucursal', e.target.value)}
                      placeholder="Sucursal Centro"
                      data-testid="input-company-branch"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="direccion">Dirección Completa</Label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                    <Textarea
                      id="direccion"
                      value={configuracion.direccion}
                      onChange={(e) => updateField('direccion', e.target.value)}
                      className="pl-10 min-h-[80px]"
                      placeholder="Av. Principal #123, Sector Centro"
                      data-testid="input-company-address"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="ciudad">Ciudad</Label>
                    <Input
                      id="ciudad"
                      value={configuracion.ciudad}
                      onChange={(e) => updateField('ciudad', e.target.value)}
                      placeholder="Santo Domingo"
                      data-testid="input-company-city"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="provincia">Provincia</Label>
                    <Input
                      id="provincia"
                      value={configuracion.provincia}
                      onChange={(e) => updateField('provincia', e.target.value)}
                      placeholder="Distrito Nacional"
                      data-testid="input-company-province"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="codigoPostal">Código Postal</Label>
                    <Input
                      id="codigoPostal"
                      value={configuracion.codigoPostal}
                      onChange={(e) => updateField('codigoPostal', e.target.value)}
                      placeholder="10101"
                      data-testid="input-company-postal"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Redes Sociales</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="facebook">Facebook</Label>
                      <Input
                        id="facebook"
                        value={configuracion.redesSociales.facebook}
                        onChange={(e) => updateSocial('facebook', e.target.value)}
                        placeholder="@empresa"
                        data-testid="input-facebook"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="instagram">Instagram</Label>
                      <Input
                        id="instagram"
                        value={configuracion.redesSociales.instagram}
                        onChange={(e) => updateSocial('instagram', e.target.value)}
                        placeholder="@empresa"
                        data-testid="input-instagram"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="whatsapp">WhatsApp Business</Label>
                      <Input
                        id="whatsapp"
                        value={configuracion.redesSociales.whatsapp}
                        onChange={(e) => updateSocial('whatsapp', e.target.value)}
                        placeholder="8095550000"
                        data-testid="input-whatsapp"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Schedule Tab */}
            {activeTab === 'horarios' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Horarios de Atención</h3>
                  <div className="space-y-4">
                    {Object.entries(configuracion.horarios).map(([dia, horario]) => (
                      <Card key={dia} className="p-4 dark:bg-gray-700/30 dark:border-cyan-500/20 dark:shadow-lg tech-glow">
                        <div className="flex items-center space-x-4">
                          <div className="w-24">
                            <span className="font-medium">{diasSemana[dia as keyof typeof diasSemana]}</span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              checked={horario.activo}
                              onCheckedChange={(checked) => updateHorario(dia, 'activo', checked)}
                              data-testid={`checkbox-${dia}-active`}
                            />
                            <Label className="text-sm">Abierto</Label>
                          </div>
                          
                          {horario.activo && (
                            <div className="flex space-x-4">
                              <div>
                                <Label className="text-xs mb-1">Apertura</Label>
                                <Input
                                  type="time"
                                  value={horario.apertura}
                                  onChange={(e) => updateHorario(dia, 'apertura', e.target.value)}
                                  className="w-28"
                                  data-testid={`input-${dia}-open`}
                                />
                              </div>
                              
                              <div>
                                <Label className="text-xs mb-1">Cierre</Label>
                                <Input
                                  type="time"
                                  value={horario.cierre}
                                  onChange={(e) => updateHorario(dia, 'cierre', e.target.value)}
                                  className="w-28"
                                  data-testid={`input-${dia}-close`}
                                />
                              </div>
                            </div>
                          )}
                          
                          {!horario.activo && (
                            <span className="text-destructive text-sm font-medium">Cerrado</span>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Billing Tab */}
            {activeTab === 'facturacion' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Configuración de Factura</h3>
                  
                  <div className="space-y-4">
                    <Card className="p-4 dark:bg-gray-700/30 dark:border-cyan-500/20 dark:shadow-lg tech-glow">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Mostrar RNC en facturas</p>
                          <p className="text-sm text-muted-foreground">Incluir número de RNC en las facturas impresas</p>
                        </div>
                        <Checkbox
                          checked={configuracion.configuracionFactura.mostrarRnc}
                          onCheckedChange={(checked) => updateFactura('mostrarRnc', checked)}
                          data-testid="checkbox-show-rnc"
                        />
                      </div>
                    </Card>
                    
                    <Card className="p-4 dark:bg-gray-700/30 dark:border-cyan-500/20 dark:shadow-lg tech-glow">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Mostrar dirección en facturas</p>
                          <p className="text-sm text-muted-foreground">Incluir dirección completa en las facturas</p>
                        </div>
                        <Checkbox
                          checked={configuracion.configuracionFactura.mostrarDireccion}
                          onCheckedChange={(checked) => updateFactura('mostrarDireccion', checked)}
                          data-testid="checkbox-show-address"
                        />
                      </div>
                    </Card>
                    
                    <Card className="p-4 dark:bg-gray-700/30 dark:border-cyan-500/20 dark:shadow-lg tech-glow">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Mostrar teléfono en facturas</p>
                          <p className="text-sm text-muted-foreground">Incluir número de teléfono en las facturas</p>
                        </div>
                        <Checkbox
                          checked={configuracion.configuracionFactura.mostrarTelefono}
                          onCheckedChange={(checked) => updateFactura('mostrarTelefono', checked)}
                          data-testid="checkbox-show-phone"
                        />
                      </div>
                    </Card>
                    
                    <Card className="p-4 dark:bg-gray-700/30 dark:border-cyan-500/20 dark:shadow-lg tech-glow">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Mostrar email en facturas</p>
                          <p className="text-sm text-muted-foreground">Incluir email de contacto en las facturas</p>
                        </div>
                        <Checkbox
                          checked={configuracion.configuracionFactura.mostrarEmail}
                          onCheckedChange={(checked) => updateFactura('mostrarEmail', checked)}
                          data-testid="checkbox-show-email"
                        />
                      </div>
                    </Card>

                    <div className="space-y-2">
                      <Label htmlFor="mensajePie">Mensaje al pie de factura</Label>
                      <Textarea
                        id="mensajePie"
                        value={configuracion.configuracionFactura.mensajePie}
                        onChange={(e) => updateFactura('mensajePie', e.target.value)}
                        placeholder="Mensaje personalizado para el pie de la factura"
                        className="min-h-[80px]"
                        data-testid="input-footer-message"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Confirmation Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Configuración</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p>{modalMessage}</p>
            </div>
            <div className="flex justify-end">
              <Button onClick={closeModal} data-testid="button-modal-ok">
                Aceptar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}