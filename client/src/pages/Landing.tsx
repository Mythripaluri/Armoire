import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Shirt, Camera, Zap, Star, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-fashion.jpg";
import logoIcon from "@/assets/logo-icon.jpg";
import TestConnection from "@/components/TestConnection";

const Landing = () => {
  const features = [
    {
      icon: Sparkles,
      title: "AI-Powered Styling",
      description: "Get personalized outfit recommendations based on your mood, weather, and occasions."
    },
    {
      icon: Camera,
      title: "Virtual Try-On",
      description: "See how outfits look on you with our advanced virtual fitting technology."
    },
    {
      icon: Shirt,
      title: "Digital Wardrobe",
      description: "Upload and organize your clothes in a beautiful digital closet with smart categorization."
    }
  ];

  return (
    <div className="min-h-screen bg-hero-gradient">
      {/* Navigation */}
      <nav className="relative z-10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-elegant">
              <img src={logoIcon} alt="StyleAI" className="w-full h-full object-cover" />
            </div>
            <div className="flex items-center space-x-1">
              <span className="font-bold text-2xl text-foreground">StyleAI</span>
              <Sparkles className="w-6 h-6 text-fashion-gold animate-float" />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="ghost">Log In</Button>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-elegant hover:shadow-hover-lift transition-all duration-300">
              Sign Up
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fade-in">
              <div className="space-y-6">
                <h1 className="text-5xl lg:text-7xl font-bold text-foreground leading-tight">
                  Your AI Stylist &{" "}
                  <span className="text-fashion-gold">Virtual Try-On</span>
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
                  Transform your wardrobe with AI-powered styling. Get personalized outfit recommendations, 
                  organize your digital closet, and see how clothes look on you before you wear them.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/dashboard">
                  <Button size="lg" className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 shadow-elegant hover:shadow-hover-lift transition-all duration-300 text-lg px-8 py-4">
                    Start Styling
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Button variant="outline" size="lg" className="w-full sm:w-auto border-2 text-lg px-8 py-4">
                  Watch Demo
                </Button>
              </div>

              <div className="flex items-center space-x-6 pt-4">
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-5 h-5 fill-fashion-gold text-fashion-gold" />
                  ))}
                </div>
                <span className="text-muted-foreground">Trusted by 50,000+ fashion enthusiasts</span>
              </div>
            </div>

            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-hover-lift bg-card">
                <img 
                  src={heroImage} 
                  alt="Fashion styling" 
                  className="w-full h-[600px] object-cover animate-float"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
              
              {/* Floating elements */}
              <div className="absolute -top-6 -right-6 bg-fashion-gold text-fashion-gold-foreground px-6 py-3 rounded-full shadow-elegant animate-bounce font-semibold">
                AI Powered
              </div>
              <div className="absolute -bottom-6 -left-6 bg-card text-card-foreground px-6 py-3 rounded-full shadow-elegant animate-float border border-border font-semibold">
                Virtual Try-On
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-20 bg-background/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold text-foreground">
              Everything you need for perfect styling
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover the power of AI fashion technology that adapts to your personal style and preferences.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-hover-lift transition-all duration-300 border-0 bg-card/80 backdrop-blur-sm">
                <CardContent className="p-8 space-y-4">
                  <div className="w-12 h-12 bg-fashion-gold/10 rounded-xl flex items-center justify-center group-hover:bg-fashion-gold/20 transition-colors duration-300">
                    <feature.icon className="w-6 h-6 text-fashion-gold" />
                  </div>
                  <h3 className="text-2xl font-semibold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-5xl font-bold text-foreground">
              Ready to revolutionize your wardrobe?
            </h2>
            <p className="text-xl text-muted-foreground">
              Join thousands of fashion-forward individuals who trust AI to elevate their style.
            </p>
          </div>
          
          {/* Debug Component - Remove this after testing */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 text-red-600">🔧 Debug Panel (Temporary)</h3>
            <TestConnection />
          </div>
          
          <Link to="/dashboard">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-elegant hover:shadow-hover-lift transition-all duration-300 text-xl px-12 py-6">
              Get Started Now
              <Zap className="w-6 h-6 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Landing;