import { useState } from "react";
import { Check, Star, Users, Building, CreditCard, Clock, Shield, HeadphonesIcon, Menu, X, ChevronRight, Zap, TrendingUp, Smartphone, MessageCircle, FileText, Award, Globe, BarChart3, Sparkles, ArrowRight, Play, Briefcase, Target, DollarSign, Rocket, CheckCircle, Phone, Mail, MapPin, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import logoPath from "@assets/logo demo 2_1757619097947.png";
import dashboardDevicesImage from "@assets/generated_images/3D_floating_tech_devices_with_BillTracky_f6288f1b.png";

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

export default function LandingPage({ onGetStarted, onLogin }: LandingPageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const stats = [
    { label: "Lavanderías activas", value: "500+", icon: Building },
    { label: "Facturas procesadas", value: "50,000+", icon: FileText },
    { label: "Ahorro de tiempo", value: "75%", icon: Clock },
    { label: "Satisfacción del cliente", value: "98%", icon: Award }
  ];

  const plans = [
    {
      name: "Gratis",
      price: "0",
      description: "Perfecto para probar la plataforma",
      features: [
        "Hasta 50 facturas por mes",
        "1 usuario",
        "Gestión básica de clientes",
        "Servicios básicos",
        "Soporte por email"
      ],
      cta: "Empezar gratis",
      popular: false,
      color: "border-gray-200"
    },
    {
      name: "Básico",
      price: "29",
      description: "Para pequeñas lavanderías",
      features: [
        "Hasta 500 facturas por mes",
        "3 usuarios",
        "Gestión avanzada de clientes",
        "Métodos de pago personalizados",
        "Plantillas de mensajes",
        "Reportes básicos",
        "Soporte prioritario"
      ],
      cta: "Elegir Básico",
      popular: true,
      color: "border-secondary ring-2 ring-secondary"
    },
    {
      name: "Pro",
      price: "79",
      description: "Para lavanderías en crecimiento",
      features: [
        "Facturas ilimitadas",
        "Usuarios ilimitados",
        "Dashboard avanzado",
        "Análisis y métricas completas",
        "Integración con WhatsApp",
        "Configuración de empresa personalizada",
        "Multi-sucursales",
        "Soporte dedicado 24/7"
      ],
      cta: "Elegir Pro",
      popular: false,
      color: "border-gray-200"
    }
  ];

  const features = [
    {
      icon: <CreditCard className="w-8 h-8" />,
      title: "Facturación Inteligente",
      description: "Crea facturas profesionales en segundos con cálculos automáticos de ITBIS y totales. Sistema completo de gestión de pagos.",
      category: "Gestión"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Gestión de Clientes",
      description: "Mantén un registro completo de tus clientes con historial de órdenes, preferencias y comunicación automatizada.",
      category: "Clientes"
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Analytics Avanzados",
      description: "Reportes detallados, métricas en tiempo real y análisis de rendimiento para tomar mejores decisiones de negocio.",
      category: "Analytics"
    },
    {
      icon: <Smartphone className="w-8 h-8" />,
      title: "Sistema Móvil",
      description: "Accede desde cualquier dispositivo. Interface optimizada para tablet y móvil con funcionamiento offline.",
      category: "Tecnología"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Datos Seguros",
      description: "Tus datos están protegidos con la más alta seguridad, respaldos automáticos y cumplimiento de normativas.",
      category: "Seguridad"
    }
  ];

  const benefits = [
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Aumenta tus ingresos hasta 40%",
      description: "Optimiza operaciones, reduce tiempos de espera y mejora la experiencia del cliente"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Ahorra 6 horas diarias",
      description: "Automatiza procesos manuales y elimina el papeleo innecesario"
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "100% Profesional",
      description: "Impresiona a tus clientes con un sistema moderno y eficiente"
    }
  ];

  const testimonials = [
    {
      name: "María González",
      business: "Lavandería Express",
      rating: 5,
      text: "Billtracky transformó completamente nuestro negocio. Ahora procesamos el doble de órdenes con la mitad del tiempo."
    },
    {
      name: "Carlos Rodríguez",
      business: "CleanCare Lavandería",
      rating: 5,
      text: "La facilidad de uso es increíble. Mis empleados aprendieron a usarlo en menos de una hora."
    },
    {
      name: "Ana Martínez",
      business: "Lavado Premium",
      rating: 5,
      text: "Los reportes me ayudan a tomar mejores decisiones de negocio. Recomiendo Billtracky al 100%."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-br from-gray-900/95 via-blue-950/95 to-purple-950/95 backdrop-blur-xl border-b border-white/10 tech-glow">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600 rounded-xl flex items-center justify-center tech-glow">
                <img src={logoPath} alt="Billtracky Logo" className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-black bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent tech-text-glow">BillTracky</h1>
                <p className="text-xs text-white/90 font-medium">Sistema de Gestión para Lavanderías</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-sm font-bold text-white/90 hover:text-cyan-400 transition-all duration-300" data-testid="link-features">
                Características
              </a>
              <a href="#pricing" className="text-sm font-bold text-white/90 hover:text-cyan-400 transition-all duration-300" data-testid="link-pricing">
                Precios
              </a>
              <a href="#testimonials" className="text-sm font-bold text-white/90 hover:text-cyan-400 transition-all duration-300" data-testid="link-testimonials">
                Testimonios
              </a>
              <Button 
                variant="ghost" 
                onClick={onLogin}
                className="text-white hover:text-cyan-400 bg-white/5 border border-white/20 hover:border-cyan-400/50 tech-glow shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300"
                data-testid="header-login-button"
              >
                Iniciar Sesión
              </Button>
              <Button 
                onClick={onGetStarted}
                className="bg-gradient-to-r from-cyan-600 to-purple-600 text-white hover:from-cyan-500 hover:to-purple-500 px-6 py-2 rounded-xl tech-glow hover:scale-105 transition-all duration-300 font-bold border-t border-white/20 shadow-lg hover:shadow-2xl"
                data-testid="header-signup-button"
              >
                Empezar Gratis
              </Button>
            </nav>

            {/* Mobile menu button */}
            <button
              className="md:hidden text-white hover:text-cyan-400 transition-colors duration-300"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="mobile-menu-toggle"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-white/10">
              <div className="flex flex-col space-y-4">
                <a href="#features" className="text-sm font-bold text-white/90 hover:text-cyan-400 transition-colors duration-300" data-testid="mobile-link-features">
                  Características
                </a>
                <a href="#pricing" className="text-sm font-bold text-white/90 hover:text-cyan-400 transition-colors duration-300" data-testid="mobile-link-pricing">
                  Precios
                </a>
                <a href="#testimonials" className="text-sm font-bold text-white/90 hover:text-cyan-400 transition-colors duration-300" data-testid="mobile-link-testimonials">
                  Testimonios
                </a>
                <Button variant="ghost" onClick={onLogin} className="justify-start text-white bg-white/5 border border-white/20 hover:border-cyan-400/50 tech-glow shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300" data-testid="mobile-login-button">
                  Iniciar Sesión
                </Button>
                <Button onClick={onGetStarted} className="justify-start bg-gradient-to-r from-cyan-600 to-purple-600 text-white hover:from-cyan-500 hover:to-purple-500 font-bold tech-glow" data-testid="mobile-signup-button">
                  Empezar Gratis
                </Button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section - Tech Style */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden tech-gradient-bg">
        {/* Tech Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_100%_200px,rgba(59,130,246,0.15),transparent)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_600px_at_0%_100%,rgba(147,51,234,0.1),transparent)]"></div>
        
        {/* Tech particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="tech-particle" style={{left: '10%', animationDelay: '0s'}}></div>
          <div className="tech-particle" style={{left: '30%', animationDelay: '3s'}}></div>
          <div className="tech-particle" style={{left: '50%', animationDelay: '6s'}}></div>
          <div className="tech-particle" style={{left: '70%', animationDelay: '9s'}}></div>
          <div className="tech-particle" style={{left: '90%', animationDelay: '2s'}}></div>
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-6xl mx-auto">
            {/* Tech Badge */}
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600/20 to-cyan-600/20 border border-purple-500/30 rounded-full mb-8 tech-glow interactive-badge">
              <Sparkles className="w-5 h-5 text-cyan-400 mr-3" />
              <span className="text-sm font-bold text-white tracking-wide">NUEVO: MENSAJES WHATSAPP AUTOMATIZADOS</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white mb-8 leading-tight tech-text-glow">
              Lleva tu lavandería al
              <span className="block bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                siguiente nivel
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-4xl mx-auto leading-relaxed font-light">
              La plataforma completa que necesitas para automatizar tu negocio, 
              aumentar ingresos y brindar una experiencia excepcional a tus clientes.
            </p>

            {/* Tech CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              <Button 
                onClick={onGetStarted}
                size="lg"
                className="bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white hover:from-cyan-400 hover:via-blue-500 hover:to-purple-500 text-xl px-12 py-6 rounded-2xl tech-glow hover:scale-105 transition-all duration-300 modern-button font-bold"
                data-testid="hero-signup-button"
              >
                <Rocket className="mr-3 w-6 h-6" />
                Probar Gratis 30 Días
                <ArrowRight className="ml-3 w-6 h-6" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={onLogin}
                className="text-xl px-12 py-6 rounded-2xl border-2 border-cyan-500/50 text-cyan-400 hover:border-cyan-400 hover:bg-cyan-500/10 transition-all duration-300 bg-black/30 backdrop-blur-sm font-bold tech-glow"
                data-testid="hero-login-button"
              >
                <Play className="mr-3 w-6 h-6" />
                Ver Demo en Vivo
              </Button>
            </div>

            {/* Tech Trust indicators */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-sm">
              <div className="flex items-center gap-3 bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/30 px-6 py-3 rounded-full tech-glow interactive-badge">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="font-bold text-white">Sin tarjeta de crédito</span>
              </div>
              <div className="flex items-center gap-3 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/30 px-6 py-3 rounded-full tech-glow interactive-badge">
                <Clock className="w-5 h-5 text-blue-400" />
                <span className="font-bold text-white">Configuración en 5 minutos</span>
              </div>
              <div className="flex items-center gap-3 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 px-6 py-3 rounded-full tech-glow interactive-badge">
                <HeadphonesIcon className="w-5 h-5 text-purple-400" />
                <span className="font-bold text-white">Soporte en español 24/7</span>
              </div>
            </div>
          </div>

          {/* Tech Stats Section */}
          <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div key={index} className="text-center group">
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600 rounded-3xl flex items-center justify-center tech-glow hover:scale-110 transition-all duration-300 group-hover:shadow-2xl floating-device">
                    <IconComponent className="w-10 h-10 text-white" />
                  </div>
                  <div className="text-4xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-2 tech-text-glow">{stat.value}</div>
                  <div className="text-sm text-blue-200/80 font-bold">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Modern 3D Tech Devices Section */}
      <section className="py-32 tech-gradient-bg relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left side - Content */}
            <div className="order-2 lg:order-1">
              <div className="inline-flex items-center px-6 py-3 tech-glow bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-full mb-8 interactive-badge">
                <Smartphone className="w-5 h-5 text-blue-400 mr-3" />
                <span className="text-sm font-bold text-white tracking-wide">📱 MULTI-DISPOSITIVO</span>
              </div>
              
              <h2 className="text-5xl md:text-6xl font-black text-white mb-8 leading-tight">
                Tu negocio en
                <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  cualquier dispositivo
                </span>
              </h2>
              
              <p className="text-xl text-white/90 mb-12 leading-relaxed font-light">
                Dashboard completo, gestión de órdenes y facturación. Todo sincronizado 
                en tiempo real entre todos tus dispositivos con tecnología avanzada.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mr-4 mt-1 tech-glow">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white mb-2 text-lg">💻 Dashboard Completo</h3>
                    <p className="text-blue-200">Métricas, acciones rápidas y control total desde laptop</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center flex-shrink-0 mr-4 mt-1 tech-glow">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white mb-2 text-lg">📱 Gestión de Órdenes</h3>
                    <p className="text-blue-200">Administra todas las órdenes desde tablet con interfaz táctil</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0 mr-4 mt-1 tech-glow">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white mb-2 text-lg">📄 Facturación Móvil</h3>
                    <p className="text-blue-200">Crea facturas al instante desde tu móvil en cualquier lugar</p>
                  </div>
                </div>
              </div>
              
              <Button 
                onClick={onGetStarted}
                className="bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white hover:from-cyan-400 hover:via-blue-500 hover:to-purple-500 px-10 py-4 rounded-2xl font-bold text-lg transition-all duration-300 tech-glow hover:scale-105 modern-button"
              >
                <Rocket className="mr-3 w-6 h-6" />
                Experimentar Tecnología
              </Button>
            </div>
            
            {/* Right side - 3D Tech Devices */}
            <div className="order-1 lg:order-2 relative tech-devices-container">
              {/* Tech particles */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="tech-particle" style={{left: '10%', animationDelay: '0s'}}></div>
                <div className="tech-particle" style={{left: '30%', animationDelay: '2s'}}></div>
                <div className="tech-particle" style={{left: '50%', animationDelay: '4s'}}></div>
                <div className="tech-particle" style={{left: '70%', animationDelay: '6s'}}></div>
                <div className="tech-particle" style={{left: '90%', animationDelay: '1s'}}></div>
              </div>
              
              <div className="relative modern-device-showcase">
                {/* 3D Floating Devices */}
                <div className="floating-device device-laptop">
                  <img 
                    src={dashboardDevicesImage} 
                    alt="BillTracky en dispositivos 3D - Dashboard, Gestión de Órdenes, Facturación Móvil" 
                    className="w-full h-auto tech-glow"
                  />
                </div>
                
                {/* Floating tech badges */}
                <div className="absolute top-8 -left-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-2xl text-sm font-bold shadow-2xl interactive-badge">
                  💻 DASHBOARD
                </div>
                <div className="absolute top-1/2 -right-8 bg-gradient-to-r from-purple-500 to-pink-600 text-white px-6 py-3 rounded-2xl text-sm font-bold shadow-2xl interactive-badge" style={{animationDelay: '1s'}}>
                  📱 GESTIÓN DE ÓRDENES
                </div>
                <div className="absolute bottom-8 left-8 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-6 py-3 rounded-2xl text-sm font-bold shadow-2xl interactive-badge" style={{animationDelay: '2s'}}>
                  📄 FACTURACIÓN
                </div>
              </div>
            </div>
          </div>
          
          {/* Complete Features List */}
          <div className="mt-20">
            <div className="text-center mb-16">
              <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600/20 to-cyan-600/20 border border-purple-500/30 rounded-full mb-8">
                <Award className="w-5 h-5 text-purple-400 mr-3" />
                <span className="text-sm font-bold text-white tracking-wide">FUNCIONALIDADES COMPLETAS</span>
              </div>
              
              <h3 className="text-4xl md:text-5xl font-black text-white mb-8 leading-tight">
                Todo lo que necesitas para tu
                <span className="block bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                  lavandería en una sola app
                </span>
              </h3>
              
              <p className="text-xl text-white/90 mb-12 max-w-4xl mx-auto leading-relaxed">
                BillTracky incluye todas las herramientas que necesitas para administrar tu negocio de manera profesional
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {/* Gestión de Clientes */}
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-20 rounded-3xl p-8 border border-white/20 hover:border-cyan-400/50 transition-all duration-300 hover:transform hover:scale-105 group">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-bold text-white mb-4">Gestión de Clientes</h4>
                <p className="text-white/90 leading-relaxed mb-4">Base de datos completa con historial de órdenes, información de contacto y preferencias de cada cliente.</p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded-full text-sm font-medium">Historial completo</span>
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm font-medium">Búsqueda rápida</span>
                </div>
              </div>
              
              {/* Configuración de Servicios */}
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-20 rounded-3xl p-8 border border-white/20 hover:border-purple-400/50 transition-all duration-300 hover:transform hover:scale-105 group">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Settings className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-bold text-white mb-4">Configuración de Servicios</h4>
                <p className="text-white/90 leading-relaxed mb-4">Define precios para lavado, planchado y servicios combinados. Personaliza categorías y tarifas especiales.</p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm font-medium">Precios flexibles</span>
                  <span className="px-3 py-1 bg-pink-500/20 text-pink-300 rounded-full text-sm font-medium">Categorías</span>
                </div>
              </div>
              
              {/* Métodos de Pago */}
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-20 rounded-3xl p-8 border border-white/20 hover:border-green-400/50 transition-all duration-300 hover:transform hover:scale-105 group">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <CreditCard className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-bold text-white mb-4">Métodos de Pago</h4>
                <p className="text-white/90 leading-relaxed mb-4">Acepta efectivo, tarjetas, transferencias y más. Configura comisiones y referencias automáticamente.</p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm font-medium">Múltiples opciones</span>
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-sm font-medium">Sin comisiones</span>
                </div>
              </div>
              
              {/* Cierre de Caja */}
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-20 rounded-3xl p-8 border border-white/20 hover:border-yellow-400/50 transition-all duration-300 hover:transform hover:scale-105 group">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-bold text-white mb-4">Cierre de Caja</h4>
                <p className="text-white/90 leading-relaxed mb-4">Reportes diarios automatizados con resúmenes de ventas, métodos de pago y rendimiento por empleado.</p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-sm font-medium">Reportes diarios</span>
                  <span className="px-3 py-1 bg-orange-500/20 text-orange-300 rounded-full text-sm font-medium">Análisis</span>
                </div>
              </div>
              
              
              {/* Configuración Empresa */}
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-20 rounded-3xl p-8 border border-white/20 hover:border-indigo-400/50 transition-all duration-300 hover:transform hover:scale-105 group">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Building className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-bold text-white mb-4">Configuración Empresa</h4>
                <p className="text-white/90 leading-relaxed mb-4">Personaliza información de tu negocio, horarios, redes sociales y datos que aparecen en las facturas.</p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-sm font-medium">Personalización</span>
                  <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm font-medium">Branding</span>
                </div>
              </div>
            </div>
            
            {/* Call to Action Final */}
            <div className="text-center mt-16">
              <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600/30 to-blue-600/30 border border-green-400/40 rounded-full mb-6">
                <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                <span className="text-sm font-bold text-white">TODO INCLUIDO SIN COSTO ADICIONAL</span>
              </div>
              
              <Button 
                onClick={onGetStarted}
                className="bg-gradient-to-r from-green-500 via-emerald-600 to-cyan-600 text-white hover:from-green-400 hover:via-emerald-500 hover:to-cyan-500 px-12 py-4 rounded-2xl font-bold text-xl transition-all duration-300 tech-glow hover:scale-105 modern-button"
              >
                <Rocket className="mr-3 w-6 h-6" />
                Comenzar Gratis Ahora
              </Button>
              
              <p className="text-white/90 text-sm mt-4 max-w-md mx-auto">
                Sin contratos. Sin pagos ocultos. Todas las funciones desde el primer día.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Benefits Section */}
      <section className="py-24 tech-gradient-bg relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_600px_at_50%_200px,rgba(59,130,246,0.15),transparent)]"></div>
        
        {/* Tech particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="tech-particle" style={{left: '20%', animationDelay: '1s'}}></div>
          <div className="tech-particle" style={{left: '60%', animationDelay: '4s'}}></div>
          <div className="tech-particle" style={{left: '80%', animationDelay: '7s'}}></div>
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-full mb-6 tech-glow interactive-badge">
              <Target className="w-5 h-5 text-green-400 mr-3" />
              <span className="text-sm font-bold text-white tracking-wide">RESULTADOS COMPROBADOS</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-8 leading-tight tech-text-glow">
              Transforma tu negocio en
              <span className="block bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">30 días o menos</span>
            </h2>
            <p className="text-xl text-white/90 max-w-4xl mx-auto font-light">
              Únete a más de 500 lavanderías que ya están viendo resultados extraordinarios
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto mb-20">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center group">
                <div className="w-20 h-20 mx-auto mb-8 bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600 rounded-3xl flex items-center justify-center text-white tech-glow group-hover:scale-110 transition-all duration-300 floating-device">
                  {benefit.icon}
                </div>
                <h3 className="text-2xl md:text-3xl font-black text-white mb-6 group-hover:text-cyan-400 transition-colors duration-300 tech-text-glow">
                  {benefit.title}
                </h3>
                <p className="text-white/90 text-lg leading-relaxed font-light">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Features Section */}
      <section id="features" className="py-24 tech-gradient-bg relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_0%_50%,rgba(147,51,234,0.1),transparent)]"></div>
        
        {/* Tech particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="tech-particle" style={{left: '15%', animationDelay: '2s'}}></div>
          <div className="tech-particle" style={{left: '45%', animationDelay: '5s'}}></div>
          <div className="tech-particle" style={{left: '75%', animationDelay: '8s'}}></div>
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/30 rounded-full mb-6 tech-glow interactive-badge">
              <Briefcase className="w-5 h-5 text-blue-400 mr-3" />
              <span className="text-sm font-bold text-white tracking-wide">FUNCIONALIDADES AVANZADAS</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-8 leading-tight tech-text-glow">
              La plataforma más completa
              <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">para lavanderías</span>
            </h2>
            <p className="text-xl text-white/90 max-w-4xl mx-auto font-light leading-relaxed">
              Cada función está diseñada específicamente para resolver los desafíos diarios de tu lavandería
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-20 p-8 rounded-3xl border border-white/20 hover:border-cyan-400/50 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:scale-105 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 rounded-full -translate-y-16 translate-x-16"></div>
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 relative z-10 tech-glow">
                  <span className="text-white">{feature.icon}</span>
                </div>
                
                <div className="inline-block px-3 py-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 rounded-full text-xs font-bold mb-4 border border-blue-400/30">
                  {feature.category}
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-cyan-400 transition-colors tech-text-glow">
                  {feature.title}
                </h3>
                <p className="text-white/90 leading-relaxed font-light">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Pricing Section */}
      <section id="pricing" className="py-24 tech-gradient-bg relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_-100px,rgba(59,130,246,0.15),transparent)]"></div>
        
        {/* Tech particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="tech-particle" style={{left: '25%', animationDelay: '3s'}}></div>
          <div className="tech-particle" style={{left: '65%', animationDelay: '6s'}}></div>
          <div className="tech-particle" style={{left: '85%', animationDelay: '9s'}}></div>
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-full mb-6 tech-glow interactive-badge">
              <DollarSign className="w-5 h-5 text-green-400 mr-3" />
              <span className="text-sm font-bold text-white tracking-wide">PRECIOS TRANSPARENTES</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-8 leading-tight tech-text-glow">
              Invierte en el crecimiento
              <span className="block bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">de tu lavandería</span>
            </h2>
            <p className="text-xl text-white/90 max-w-4xl mx-auto font-light leading-relaxed">
              Planes diseñados para lavanderías de cualquier tamaño. Comienza gratis y escala conforme creces.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <div 
                key={index} 
                className={`relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-20 p-8 rounded-3xl border-2 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:scale-105 tech-glow ${
                  plan.popular ? 'border-purple-500/50 scale-105 shadow-xl bg-gradient-to-br from-purple-600/20 to-blue-600/20' : 'border-white/20 hover:border-cyan-400/50'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 text-sm font-bold rounded-full shadow-lg tech-glow">
                      ⭐ Más Popular
                    </div>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl md:text-3xl font-black text-white mb-6 tech-text-glow">
                    {plan.name}
                  </h3>
                  <div className="mb-6">
                    <span className="text-5xl md:text-6xl font-black bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent tech-text-glow">
                      RD${plan.price}
                    </span>
                    <span className="text-blue-200/80 text-lg font-bold">/mes</span>
                  </div>
                  <p className="text-white/90 text-lg font-light">
                    {plan.description}
                  </p>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mr-4 mt-0.5 tech-glow">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-white/90 font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  onClick={onGetStarted}
                  className={`w-full py-4 text-lg rounded-xl font-bold transition-all duration-300 tech-glow hover:scale-105 ${
                    plan.popular 
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-500 hover:to-blue-500 shadow-xl hover:shadow-2xl' 
                      : 'bg-gradient-to-r from-gray-700/50 to-gray-600/50 text-white hover:from-gray-600/50 hover:to-gray-500/50 border border-white/20'
                  }`}
                  data-testid={`plan-${plan.name.toLowerCase()}-button`}
                >
                  {plan.cta}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            ))}
          </div>

          <div className="text-center mt-20">
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-20 border border-white/20 rounded-3xl p-10 max-w-3xl mx-auto tech-glow hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <h3 className="text-3xl font-black text-white mb-6 tech-text-glow">¿Empresa con múltiples sucursales?</h3>
              <p className="text-white/90 text-lg mb-8 font-light leading-relaxed">
                Tenemos planes especiales para cadenas de lavanderías con descuentos por volumen y funciones empresariales.
              </p>
              <Button className="bg-gradient-to-r from-cyan-600 to-purple-600 text-white hover:from-cyan-500 hover:to-purple-500 px-8 py-3 rounded-xl font-bold transition-all duration-300 tech-glow hover:scale-105">
                Solicitar Cotización Empresarial
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Testimonials Section */}
      <section id="testimonials" className="py-24 tech-gradient-bg relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_0%_100%,rgba(147,51,234,0.1),transparent)]"></div>
        
        {/* Tech particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="tech-particle" style={{left: '30%', animationDelay: '2s'}}></div>
          <div className="tech-particle" style={{left: '70%', animationDelay: '5s'}}></div>
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-full mb-6 tech-glow interactive-badge">
              <Star className="w-5 h-5 text-green-400 mr-3" />
              <span className="text-sm font-bold text-white tracking-wide">TESTIMONIOS REALES</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-8 leading-tight tech-text-glow">
              Historias de éxito
              <span className="block bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">que nos motivan</span>
            </h2>
            <p className="text-xl text-white/90 max-w-4xl mx-auto font-light leading-relaxed">
              Más de 500 lavanderías han transformado su negocio con BillTracky. Aquí tienes algunas de sus historias.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-20 p-8 rounded-3xl border border-white/20 hover:border-cyan-400/50 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:scale-105 relative overflow-hidden tech-glow">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 rounded-full -translate-y-12 translate-x-12"></div>
                
                {/* Rating Stars */}
                <div className="flex items-center mb-6 relative z-10">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-500 fill-current" />
                  ))}
                </div>
                
                {/* Quote */}
                <blockquote className="text-lg text-white/90 mb-8 italic leading-relaxed font-light relative z-10">
                  "{testimonial.text}"
                </blockquote>
                
                {/* Profile */}
                <div className="flex items-center relative z-10">
                  <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4 tech-glow">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-black text-white text-lg tech-text-glow">
                      {testimonial.name}
                    </p>
                    <p className="text-white/90 font-medium">
                      Propietario, {testimonial.business}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Modern Social Proof */}
          <div className="mt-24 text-center">
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-20 border border-white/20 rounded-3xl p-12 max-w-5xl mx-auto tech-glow hover:scale-105 transition-all duration-300">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div className="text-center">
                  <div className="text-4xl font-black bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-3 tech-text-glow">500+</div>
                  <div className="text-blue-200/80 font-bold">Lavanderías activas</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-black bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent mb-3 tech-text-glow">24/7</div>
                  <div className="text-blue-200/80 font-bold">Soporte</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 tech-gradient-bg relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_-100px,rgba(59,130,246,0.15),transparent)]"></div>
        
        {/* Tech particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="tech-particle" style={{left: '20%', animationDelay: '0s'}}></div>
          <div className="tech-particle" style={{left: '80%', animationDelay: '4s'}}></div>
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-20 rounded-3xl p-12 md:p-16 text-center relative overflow-hidden border border-white/20 tech-glow">
            {/* Tech decorations */}
            <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 rounded-full -translate-x-20 -translate-y-20"></div>
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-full translate-x-20 translate-y-20"></div>
            
            <div className="relative z-10">
              <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-cyan-600/20 to-purple-600/20 border border-cyan-500/30 rounded-full mb-6 tech-glow interactive-badge">
                <Rocket className="w-5 h-5 text-cyan-400 mr-3" />
                <span className="text-sm font-bold text-white tracking-wide">¡Únete a la Revolución Digital!</span>
              </div>
              
              <h2 className="text-4xl md:text-6xl font-black mb-6 tech-text-glow">
                <span className="text-white">¿Listo para </span>
                <span className="block bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">transformar tu lavandería?</span>
              </h2>
              
              <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
                Únete a más de 500 lavanderías que ya están aumentando sus ingresos, 
                ahorrando tiempo y brindando un mejor servicio con BillTracky.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Button 
                  onClick={onGetStarted}
                  size="lg"
                  className="bg-gradient-to-r from-cyan-600 to-purple-600 text-white hover:from-cyan-500 hover:to-purple-500 text-xl px-10 py-6 rounded-2xl tech-glow shadow-2xl hover:shadow-cyan-500/25 transform hover:scale-105 transition-all duration-300 font-bold border-t border-white/20"
                  data-testid="cta-signup-button"
                >
                  <Sparkles className="mr-3 w-6 h-6" />
                  Empezar Gratis Ahora
                  <ArrowRight className="ml-3 w-6 h-6" />
                </Button>
                
                <Button 
                  variant="outline"
                  size="lg"
                  onClick={onLogin}
                  className="border-white/30 text-white hover:bg-white/10 hover:border-cyan-400/50 text-xl px-10 py-6 rounded-2xl backdrop-blur tech-glow hover:shadow-xl hover:scale-105 transition-all duration-300 font-bold"
                  data-testid="cta-demo-button"
                >
                  <Play className="mr-3 w-6 h-6" />
                  Ver Demo
                </Button>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-white/80 mt-8">
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5" />
                  <span>30 días gratis</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5" />
                  <span>Sin tarjeta de crédito</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5" />
                  <span>Cancela cuando quieras</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-white py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            {/* Brand Column */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <img src={logoPath} alt="Billtracky Logo" className="w-10 h-10" />
                <div>
                  <h3 className="text-2xl font-bold text-white">Billtracky</h3>
                  <p className="text-secondary/80">Sistema de Gestión para Lavanderías</p>
                </div>
              </div>
              <p className="text-white/80 leading-relaxed mb-6 max-w-md">
                La plataforma completa que necesitas para automatizar tu lavandería, 
                aumentar ingresos y brindar una experiencia excepcional a tus clientes.
              </p>
              <div className="flex space-x-4">
                <Badge className="bg-secondary/20 text-secondary border-secondary/30">
                  🇩🇴 Hecho en República Dominicana
                </Badge>
              </div>
            </div>
            
            {/* Product Links */}
            <div>
              <h4 className="font-semibold text-white mb-6 text-lg">Producto</h4>
              <ul className="space-y-3">
                <li><a href="#features" className="text-white/70 hover:text-white transition-colors">Características</a></li>
                <li><a href="#pricing" className="text-white/70 hover:text-white transition-colors">Precios</a></li>
                <li><a href="#testimonials" className="text-white/70 hover:text-white transition-colors">Testimonios</a></li>
                <li><a href="#" className="text-white/70 hover:text-white transition-colors">Actualizaciones</a></li>
                <li><a href="#" className="text-white/70 hover:text-white transition-colors">Roadmap</a></li>
              </ul>
            </div>
            
            {/* Support Links */}
            <div>
              <h4 className="font-semibold text-white mb-6 text-lg">Soporte</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-white/70 hover:text-white transition-colors">Centro de ayuda</a></li>
                <li><a href="#" className="text-white/70 hover:text-white transition-colors">Contacto</a></li>
                <li><a href="#" className="text-white/70 hover:text-white transition-colors">WhatsApp: (809) 555-0123</a></li>
                <li><a href="#" className="text-white/70 hover:text-white transition-colors">Estado del servicio</a></li>
                <li><a href="#" className="text-white/70 hover:text-white transition-colors">Documentación</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="border-t border-white/20 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
                <p className="text-white/70 text-sm">
                  © 2025 Billtracky. Todos los derechos reservados.
                </p>
                <div className="flex space-x-4 text-sm">
                  <a href="#" className="text-white/70 hover:text-white transition-colors">Privacidad</a>
                  <span className="text-white/40">•</span>
                  <a href="#" className="text-white/70 hover:text-white transition-colors">Términos</a>
                  <span className="text-white/40">•</span>
                  <a href="#" className="text-white/70 hover:text-white transition-colors">Cookies</a>
                </div>
              </div>
              
              <div className="mt-4 md:mt-0">
                <p className="text-white/70 text-sm">
                  Diseñado con ❤️ para lavanderías dominicanas
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}