import { useState } from "react";
import { Check, Star, Users, Building, CreditCard, Clock, Shield, HeadphonesIcon, Menu, X, ChevronRight, Zap, TrendingUp, Smartphone, MessageCircle, FileText, Award, Globe, BarChart3, Sparkles, ArrowRight, Play, Briefcase, Target, DollarSign, Rocket, CheckCircle, Phone, Mail, MapPin } from "lucide-react";
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
      icon: <MessageCircle className="w-8 h-8" />,
      title: "WhatsApp Automático",
      description: "Envía notificaciones automáticas por WhatsApp: pedidos listos, recordatorios y confirmaciones de pago.",
      category: "Comunicación"
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
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <img src={logoPath} alt="Billtracky Logo" className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Billtracky</h1>
                <p className="text-xs text-gray-600">Sistema de Gestión para Lavanderías</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                Características
              </a>
              <a href="#pricing" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                Precios
              </a>
              <a href="#testimonials" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                Testimonios
              </a>
              <Button 
                variant="ghost" 
                onClick={onLogin}
                className="text-gray-700 hover:text-gray-900"
                data-testid="header-login-button"
              >
                Iniciar Sesión
              </Button>
              <Button 
                onClick={onGetStarted}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                data-testid="header-signup-button"
              >
                Empezar Gratis
              </Button>
            </nav>

            {/* Mobile menu button */}
            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="mobile-menu-toggle"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-border">
              <div className="flex flex-col space-y-4">
                <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                  Características
                </a>
                <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                  Precios
                </a>
                <a href="#testimonials" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                  Testimonios
                </a>
                <Button variant="ghost" onClick={onLogin} className="justify-start">
                  Iniciar Sesión
                </Button>
                <Button onClick={onGetStarted} className="justify-start bg-secondary text-secondary-foreground hover:bg-secondary/90">
                  Empezar Gratis
                </Button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
        {/* Modern Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_100%_200px,rgba(120,119,198,0.3),transparent)]"></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-6xl mx-auto">
            {/* Modern Badge */}
            <div className="inline-flex items-center px-4 py-2 bg-white/60 backdrop-blur-sm border border-purple-200 rounded-full mb-8 shadow-sm">
              <Sparkles className="w-4 h-4 text-purple-600 mr-2" />
              <span className="text-sm font-medium text-purple-700">Nuevo: Mensajes WhatsApp automatizados</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-8 leading-tight">
              Lleva tu lavandería al
              <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                siguiente nivel
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed font-light">
              La plataforma completa que necesitas para automatizar tu negocio, 
              aumentar ingresos y brindar una experiencia excepcional a tus clientes.
            </p>

            {/* Modern CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              <Button 
                onClick={onGetStarted}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 text-xl px-12 py-6 rounded-2xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300"
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
                className="text-xl px-12 py-6 rounded-2xl border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 bg-white/70 backdrop-blur-sm"
                data-testid="hero-login-button"
              >
                <Play className="mr-3 w-6 h-6" />
                Ver Demo en Vivo
              </Button>
            </div>

            {/* Modern Trust indicators */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-gray-600">
              <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full border border-green-200">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium">Sin tarjeta de crédito</span>
              </div>
              <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full border border-blue-200">
                <Clock className="w-5 h-5 text-blue-600" />
                <span className="font-medium">Configuración en 5 minutos</span>
              </div>
              <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full border border-purple-200">
                <HeadphonesIcon className="w-5 h-5 text-purple-600" />
                <span className="font-medium">Soporte en español 24/7</span>
              </div>
            </div>
          </div>

          {/* Modern Stats Section */}
          <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110">
                    <IconComponent className="w-10 h-10 text-white" />
                  </div>
                  <div className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">{stat.value}</div>
                  <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
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
              
              <p className="text-xl text-blue-100/90 mb-12 leading-relaxed font-light">
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
        </div>
      </section>

      {/* Modern Benefits Section */}
      <section className="py-24 bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_600px_at_50%_200px,rgba(120,119,198,0.1),transparent)]"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 bg-white/70 backdrop-blur-sm border border-green-200 rounded-full mb-6 shadow-sm">
              <Target className="w-4 h-4 text-green-600 mr-2" />
              <span className="text-sm font-medium text-green-700">Resultados Comprobados</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-8 leading-tight">
              Transforma tu negocio en
              <span className="block bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">30 días o menos</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto font-light">
              Únete a más de 500 lavanderías que ya están viendo resultados extraordinarios
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto mb-20">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center group">
                <div className="w-20 h-20 mx-auto mb-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl flex items-center justify-center text-white shadow-xl group-hover:shadow-2xl transition-all duration-300 group-hover:scale-110">
                  {benefit.icon}
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 group-hover:text-blue-600 transition-colors duration-300">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed font-light">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modern Features Section */}
      <section id="features" className="py-24 bg-white relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-full mb-6">
              <Briefcase className="w-4 h-4 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-blue-700">Funcionalidades Avanzadas</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-8 leading-tight">
              La plataforma más completa
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">para lavanderías</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto font-light leading-relaxed">
              Cada función está diseñada específicamente para resolver los desafíos diarios de tu lavandería
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group bg-white p-8 rounded-3xl border border-gray-100 hover:border-blue-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full -translate-y-16 translate-x-16"></div>
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 relative z-10">
                  <span className="text-white">{feature.icon}</span>
                </div>
                
                <div className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium mb-4">
                  {feature.category}
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed font-light">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modern Pricing Section */}
      <section id="pricing" className="py-24 bg-gradient-to-br from-gray-50 via-purple-50 to-blue-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_-100px,rgba(120,119,198,0.1),transparent)]"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 bg-white/70 backdrop-blur-sm border border-green-200 rounded-full mb-6 shadow-sm">
              <DollarSign className="w-4 h-4 text-green-600 mr-2" />
              <span className="text-sm font-medium text-green-700">Precios Transparentes</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-8 leading-tight">
              Invierte en el crecimiento
              <span className="block bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">de tu lavandería</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto font-light leading-relaxed">
              Planes diseñados para lavanderías de cualquier tamaño. Comienza gratis y escala conforme creces.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <div 
                key={index} 
                className={`relative bg-white p-8 rounded-3xl border-2 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 ${
                  plan.popular ? 'border-purple-500 scale-105 shadow-xl bg-gradient-to-br from-purple-50 to-blue-50' : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 text-sm font-medium rounded-full shadow-lg">
                      ⭐ Más Popular
                    </div>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                    {plan.name}
                  </h3>
                  <div className="mb-6">
                    <span className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      ${plan.price}
                    </span>
                    <span className="text-gray-600 text-lg">/mes</span>
                  </div>
                  <p className="text-gray-600 text-lg font-light">
                    {plan.description}
                  </p>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mr-4 mt-0.5">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-gray-700 font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  onClick={onGetStarted}
                  className={`w-full py-4 text-lg rounded-xl font-semibold transition-all duration-300 ${
                    plan.popular 
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl' 
                      : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-blue-500 hover:bg-blue-50'
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
            <div className="bg-white/70 backdrop-blur-sm border border-gray-200 rounded-3xl p-10 max-w-3xl mx-auto shadow-lg hover:shadow-xl transition-all duration-300">
              <h3 className="text-3xl font-bold text-gray-900 mb-6">¿Empresa con múltiples sucursales?</h3>
              <p className="text-gray-600 text-lg mb-8 font-light leading-relaxed">
                Tenemos planes especiales para cadenas de lavanderías con descuentos por volumen y funciones empresariales.
              </p>
              <Button className="bg-gradient-to-r from-gray-700 to-gray-900 text-white hover:from-gray-800 hover:to-black px-8 py-3 rounded-xl font-semibold transition-all duration-200">
                Solicitar Cotización Empresarial
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Modern Testimonials Section */}
      <section id="testimonials" className="py-24 bg-white relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 bg-green-50 border border-green-200 rounded-full mb-6">
              <Star className="w-4 h-4 text-green-600 mr-2" />
              <span className="text-sm font-medium text-green-700">Testimonios Reales</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-8 leading-tight">
              Historias de éxito
              <span className="block bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">que nos motivan</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto font-light leading-relaxed">
              Más de 500 lavanderías han transformado su negocio con Billtracky. Aquí tienes algunas de sus historias.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-8 rounded-3xl border border-gray-100 hover:border-blue-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full -translate-y-12 translate-x-12"></div>
                
                {/* Rating Stars */}
                <div className="flex items-center mb-6 relative z-10">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-500 fill-current" />
                  ))}
                </div>
                
                {/* Quote */}
                <blockquote className="text-lg text-gray-700 mb-8 italic leading-relaxed font-light relative z-10">
                  "{testimonial.text}"
                </blockquote>
                
                {/* Profile */}
                <div className="flex items-center relative z-10">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4 shadow-lg">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-lg">
                      {testimonial.name}
                    </p>
                    <p className="text-gray-600 font-medium">
                      Propietario, {testimonial.business}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Modern Social Proof */}
          <div className="mt-24 text-center">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-3xl p-12 max-w-5xl mx-auto shadow-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div className="text-center">
                  <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">500+</div>
                  <div className="text-gray-600 font-medium">Lavanderías activas</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-3">98%</div>
                  <div className="text-gray-600 font-medium">Satisfacción</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">75%</div>
                  <div className="text-gray-600 font-medium">Ahorro de tiempo</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-3">24/7</div>
                  <div className="text-gray-600 font-medium">Soporte</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 laundry-bg">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="hero-gradient rounded-3xl p-12 md:p-16 text-center relative overflow-hidden">
            {/* Background decorations */}
            <div className="absolute top-0 left-0 w-40 h-40 bg-white/10 rounded-full -translate-x-20 -translate-y-20"></div>
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-white/10 rounded-full translate-x-20 translate-y-20"></div>
            
            <div className="relative z-10">
              <Badge className="mb-6 bg-white/20 text-white border-white/30">
                🚀 ¡Únete a la Revolución Digital!
              </Badge>
              
              <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
                ¿Listo para transformar
                <span className="block">tu lavandería?</span>
              </h2>
              
              <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
                Únete a más de 500 lavanderías que ya están aumentando sus ingresos, 
                ahorrando tiempo y brindando un mejor servicio con Billtracky.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Button 
                  onClick={onGetStarted}
                  size="lg"
                  className="bg-white text-primary hover:bg-gray-100 text-xl px-10 py-6 rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-200"
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
                  className="border-white/30 text-white hover:bg-white/10 text-xl px-10 py-6 rounded-2xl backdrop-blur"
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