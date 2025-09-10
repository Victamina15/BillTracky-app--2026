import { useState } from "react";
import { Check, Star, Users, Building, CreditCard, Clock, Shield, HeadphonesIcon, Menu, X, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

export default function LandingPage({ onGetStarted, onLogin }: LandingPageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      icon: <CreditCard className="w-6 h-6" />,
      title: "Facturación Inteligente",
      description: "Crea facturas profesionales en segundos con cálculos automáticos de ITBIS y totales."
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Gestión de Clientes",
      description: "Mantén un registro completo de tus clientes con historial de órdenes y preferencias."
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Seguimiento en Tiempo Real",
      description: "Monitorea el estado de todas las órdenes desde recepción hasta entrega."
    },
    {
      icon: <Building className="w-6 h-6" />,
      title: "Multi-sucursales",
      description: "Gestiona múltiples ubicaciones desde una sola plataforma centralizada."
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Datos Seguros",
      description: "Tus datos están protegidos con la más alta seguridad y respaldos automáticos."
    },
    {
      icon: <HeadphonesIcon className="w-6 h-6" />,
      title: "Soporte 24/7",
      description: "Equipo de soporte dedicado para ayudarte en cualquier momento que lo necesites."
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
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-md">
                <CreditCard className="w-6 h-6 text-primary-foreground" />
              </div>
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
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Gestiona tu lavandería
              <span className="text-secondary block">de manera inteligente</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Automatiza facturación, controla inventario y mejora la experiencia de tus clientes
              con la plataforma más completa para lavanderías en República Dominicana.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={onGetStarted}
                size="lg"
                className="bg-secondary text-secondary-foreground hover:bg-secondary/90 text-lg px-8 py-4"
                data-testid="hero-signup-button"
              >
                Empezar gratis por 30 días
                <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={onLogin}
                className="text-lg px-8 py-4"
                data-testid="hero-login-button"
              >
                Ver Demo
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              ✅ Sin tarjeta de crédito requerida • ✅ Configuración en 5 minutos • ✅ Soporte en español
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Todo lo que necesitas en una sola plataforma
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Diseñado específicamente para lavanderías en República Dominicana
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-background p-6 rounded-xl shadow-sm border border-border hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4 text-secondary">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Planes que se adaptan a tu negocio
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Comienza gratis y actualiza cuando tu negocio crezca
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, index) => (
              <div 
                key={index} 
                className={`bg-background p-8 rounded-xl shadow-sm border-2 ${plan.color} relative hover:shadow-lg transition-shadow`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-secondary text-secondary-foreground px-4 py-1 rounded-full text-sm font-medium">
                      Más Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-foreground mb-2">
                    {plan.name}
                  </h3>
                  <div className="mb-2">
                    <span className="text-4xl font-bold text-foreground">
                      ${plan.price}
                    </span>
                    <span className="text-muted-foreground">/mes</span>
                  </div>
                  <p className="text-muted-foreground">
                    {plan.description}
                  </p>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-sm text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  onClick={onGetStarted}
                  className={`w-full ${plan.popular 
                    ? 'bg-secondary text-secondary-foreground hover:bg-secondary/90' 
                    : 'bg-primary text-primary-foreground hover:bg-primary/90'
                  }`}
                  data-testid={`plan-${plan.name.toLowerCase()}-button`}
                >
                  {plan.cta}
                </Button>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-muted-foreground">
              ¿Necesitas más? <a href="#" className="text-secondary hover:underline">Contáctanos para planes empresariales</a>
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-muted/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Lo que dicen nuestros clientes
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Más de 100 lavanderías confían en Billtracky
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-background p-6 rounded-xl shadow-sm border border-border">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-foreground mb-4 italic">
                  "{testimonial.text}"
                </p>
                <div>
                  <p className="font-semibold text-foreground">
                    {testimonial.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.business}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-secondary/10 rounded-2xl p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              ¿Listo para transformar tu lavandería?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Únete a cientos de lavanderías que ya están aumentando sus ingresos con Billtracky
            </p>
            <Button 
              onClick={onGetStarted}
              size="lg"
              className="bg-secondary text-secondary-foreground hover:bg-secondary/90 text-lg px-8 py-4"
              data-testid="cta-signup-button"
            >
              Empezar prueba gratuita
              <ChevronRight className="ml-2 w-5 h-5" />
            </Button>
            <p className="text-sm text-muted-foreground mt-4">
              30 días gratis • Sin compromiso • Cancela cuando quieras
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t border-border py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold text-foreground mb-4">Producto</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Características</a></li>
                <li><a href="#" className="hover:text-foreground">Precios</a></li>
                <li><a href="#" className="hover:text-foreground">Actualizaciones</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Empresa</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Acerca de</a></li>
                <li><a href="#" className="hover:text-foreground">Blog</a></li>
                <li><a href="#" className="hover:text-foreground">Carreras</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Soporte</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Centro de ayuda</a></li>
                <li><a href="#" className="hover:text-foreground">Contacto</a></li>
                <li><a href="#" className="hover:text-foreground">Estado del servicio</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Privacidad</a></li>
                <li><a href="#" className="hover:text-foreground">Términos</a></li>
                <li><a href="#" className="hover:text-foreground">Cookies</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground">Billtracky</span>
            </div>
            <p className="text-sm text-muted-foreground mt-4 md:mt-0">
              © 2025 Billtracky. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}