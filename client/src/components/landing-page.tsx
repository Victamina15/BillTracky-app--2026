import { useState } from "react";
import { Check, Star, Users, Building, CreditCard, Clock, Shield, HeadphonesIcon, Menu, X, ChevronRight, Zap, TrendingUp, Smartphone, MessageCircle, FileText, Award, Globe, BarChart3, Sparkles, ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import logoPath from "@assets/logo demo 2_1757619097947.png";

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
      <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 border-b border-border/40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <img src={logoPath} alt="Billtracky Logo" className="w-10 h-10" />
              <div>
                <h1 className="text-xl font-bold text-foreground">Billtracky</h1>
                <p className="text-xs text-muted-foreground">Sistema de Gestión para Lavanderías</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Características
              </a>
              <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Precios
              </a>
              <a href="#testimonials" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Testimonios
              </a>
              <Button 
                variant="ghost" 
                onClick={onLogin}
                data-testid="header-login-button"
              >
                Iniciar Sesión
              </Button>
              <Button 
                onClick={onGetStarted}
                className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
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
      <section className="relative py-20 lg:py-32 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 hero-gradient opacity-5"></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-5xl mx-auto">
            {/* Badge */}
            <Badge className="mb-6 bg-secondary/10 text-secondary border-secondary/20 hover:bg-secondary/20">
              🚀 Nuevo: Mensajes WhatsApp automatizados
            </Badge>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-foreground mb-8 leading-tight">
              Lleva tu lavandería al
              <span className="text-transparent bg-gradient-to-r from-primary to-secondary bg-clip-text block">
                siguiente nivel
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
              La plataforma completa que necesitas para automatizar tu negocio, 
              aumentar ingresos y brindar una experiencia excepcional a tus clientes.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
              <Button 
                onClick={onGetStarted}
                size="lg"
                className="hero-gradient text-white hover:opacity-90 text-xl px-10 py-6 rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-200"
                data-testid="hero-signup-button"
              >
                <Sparkles className="mr-3 w-6 h-6" />
                Probar Gratis 30 Días
                <ArrowRight className="ml-3 w-6 h-6" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={onLogin}
                className="text-xl px-10 py-6 rounded-2xl border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all duration-200"
                data-testid="hero-login-button"
              >
                <Play className="mr-3 w-6 h-6" />
                Ver Demo en Vivo
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500" />
                <span>Sin tarjeta de crédito</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500" />
                <span>Configuración en 5 minutos</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500" />
                <span>Soporte en español 24/7</span>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-secondary/10 rounded-2xl flex items-center justify-center floating-card">
                    <IconComponent className="w-8 h-8 text-secondary" />
                  </div>
                  <div className="text-3xl font-bold text-foreground mb-2">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 laundry-bg">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              🎯 Resultados Comprobados
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Transforma tu negocio en
              <span className="text-primary block">30 días o menos</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Únete a más de 500 lavanderías que ya están viendo resultados extraordinarios
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-20">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center text-white">
                  {benefit.icon}
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">
                  {benefit.title}
                </h3>
                <p className="text-muted-foreground text-lg">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              La plataforma más completa
              <span className="text-secondary block">para lavanderías</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Cada función está diseñada específicamente para resolver los desafíos diarios de tu lavandería
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group feature-card p-8 rounded-3xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white">{feature.icon}</span>
                </div>
                
                <Badge className="mb-4 bg-secondary/10 text-secondary border-secondary/20 text-xs">
                  {feature.category}
                </Badge>
                
                <h3 className="text-2xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 laundry-bg">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-secondary/10 text-secondary border-secondary/20">
              💰 Precios Transparentes
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Invierte en el crecimiento
              <span className="text-secondary block">de tu lavandería</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Planes diseñados para lavanderías de cualquier tamaño. Comienza gratis y escala conforme creces.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <div 
                key={index} 
                className={`relative feature-card p-8 rounded-3xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 ${
                  plan.popular ? 'ring-2 ring-secondary ring-opacity-50 scale-105' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-primary to-secondary text-white px-4 py-2 text-sm font-medium rounded-full shadow-lg">
                      ⭐ Más Popular
                    </Badge>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-foreground mb-4">
                    {plan.name}
                  </h3>
                  <div className="mb-4">
                    <span className="text-5xl font-bold text-transparent bg-gradient-to-r from-primary to-secondary bg-clip-text">
                      ${plan.price}
                    </span>
                    <span className="text-muted-foreground text-lg">/mes</span>
                  </div>
                  <p className="text-muted-foreground text-lg">
                    {plan.description}
                  </p>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mr-3 mt-0.5">
                        <Check className="w-4 h-4 text-green-600" />
                      </div>
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  onClick={onGetStarted}
                  className={`w-full py-4 text-lg rounded-xl font-semibold transition-all duration-200 ${
                    plan.popular 
                      ? 'hero-gradient text-white hover:opacity-90 shadow-lg hover:shadow-xl' 
                      : 'bg-background border-2 border-primary text-primary hover:bg-primary hover:text-white'
                  }`}
                  data-testid={`plan-${plan.name.toLowerCase()}-button`}
                >
                  {plan.cta}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            ))}
          </div>

          <div className="text-center mt-16">
            <div className="bg-background/80 backdrop-blur rounded-2xl p-8 max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-foreground mb-4">¿Empresa con múltiples sucursales?</h3>
              <p className="text-muted-foreground mb-6">
                Tenemos planes especiales para cadenas de lavanderías con descuentos por volumen y funciones empresariales.
              </p>
              <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
                Solicitar Cotización Empresarial
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-green-100 text-green-700 border-green-200">
              🌟 Testimonios Reales
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Historias de éxito
              <span className="text-secondary block">que nos motivan</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Más de 500 lavanderías han transformado su negocio con Billtracky. Aquí tienes algunas de sus historias.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="feature-card p-8 rounded-3xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                {/* Rating Stars */}
                <div className="flex items-center mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                  ))}
                </div>
                
                {/* Quote */}
                <blockquote className="text-lg text-foreground mb-6 italic leading-relaxed">
                  "{testimonial.text}"
                </blockquote>
                
                {/* Profile */}
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-foreground text-lg">
                      {testimonial.name}
                    </p>
                    <p className="text-muted-foreground">
                      Propietario, {testimonial.business}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Social Proof */}
          <div className="mt-20 text-center">
            <div className="bg-background/80 backdrop-blur rounded-2xl p-8 max-w-4xl mx-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-secondary mb-2">500+</div>
                  <div className="text-muted-foreground">Lavanderías activas</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-secondary mb-2">98%</div>
                  <div className="text-muted-foreground">Satisfacción</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-secondary mb-2">75%</div>
                  <div className="text-muted-foreground">Ahorro de tiempo</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-secondary mb-2">24/7</div>
                  <div className="text-muted-foreground">Soporte</div>
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