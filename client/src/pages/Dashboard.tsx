import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/api";
import { WeatherService } from "@/api";
import { useToast } from "@/hooks/use-toast";
import { 
  Sun, 
  Heart, 
  Zap, 
  Cloud,
  CloudRain,
  Snowflake,
  Thermometer,
  MapPin,
  Shirt,
  Shuffle,
  Eye,
  Sparkles
} from "lucide-react";

interface WardrobeItem {
  id: string;
  user_id: string;
  name: string;
  type: "tops" | "bottoms" | "shoes" | "accessories";
  color: string | null;
  tags: string[] | null;
  image_url: string | null;
  created_at: string;
}

const Dashboard = () => {
  const [mood, setMood] = useState("");
  const [weather, setWeather] = useState<{temperature: number; condition: string} | null>(null);
  const [wardrobeItems, setWardrobeItems] = useState<WardrobeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [recommendation, setRecommendation] = useState<WardrobeItem[] | null>(null);
  const [recommending, setRecommending] = useState(false);
  const [recommendError, setRecommendError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchWardrobeItems = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('wardrobe_items')
      .select('*')
      .eq('user_id', user.id);
    setWardrobeItems(data || []);
  }, [user]);

  const fetchWeather = useCallback(async () => {
    try {
      const weatherData = await WeatherService.getCurrentLocationWeather();
      setWeather(weatherData);
    } catch (error) {
      console.error('Failed to fetch weather:', error);
    }
  }, []);

  const generateRecommendation = async (currentMood: string) => {
    if (!user || !currentMood.trim()) return;
    
    setRecommending(true);
    setRecommendError(null);
    setRecommendation(null);
    
    try {
      // Get the current session token
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error("No valid session found");
      }

      // Call recommendation Edge Function directly
      const response = await fetch(
        'https://mfsjbqwnxodmtyhizwpn.supabase.co/functions/v1/recommendation',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            userId: user.id,
            mood: currentMood.toLowerCase(),
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Recommendation API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Recommendation request mood:', currentMood);
      console.log('Recommendation response:', data);
      setRecommendation(data?.recommendations?.[0]?.items || null);
      
      if (!data?.recommendations?.[0]?.items || data.recommendations[0].items.length === 0) {
        setRecommendError("No outfit recommendations found. Try adding more items to your wardrobe!");
      } else {
        toast({
          title: "Outfit Ready!",
          description: `Generated a ${currentMood} outfit based on your mood`,
        });
      }
    } catch (err) {
      if (err instanceof Error) {
        setRecommendError(err.message || "Failed to get recommendation");
      }
    }
    setRecommending(false);
  };

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      
      try {
        await Promise.all([
          fetchWardrobeItems(),
          fetchWeather()
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [user, fetchWardrobeItems, fetchWeather]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-bold text-foreground mb-8">Dashboard</h1>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="shadow-elegant border-0 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-fashion-gold" />
                How are you feeling?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                placeholder="Confident, relaxed, professional..."
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                className="bg-card/60"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && mood.trim()) {
                    generateRecommendation(mood);
                  }
                }}
              />
              
              {/* Quick mood buttons */}
              <div className="flex flex-wrap gap-2">
                {['confident', 'relaxed', 'professional', 'elegant', 'fun', 'romantic'].map((moodOption) => (
                  <Button
                    key={moodOption}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setMood(moodOption);
                      generateRecommendation(moodOption);
                    }}
                    disabled={recommending}
                    className="text-xs capitalize"
                  >
                    {moodOption}
                  </Button>
                ))}
              </div>
              
              <Button 
                className="w-full bg-fashion-gold text-white hover:bg-fashion-gold/90"
                onClick={() => generateRecommendation(mood)}
                disabled={!mood.trim() || recommending}
              >
                {recommending ? (
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 animate-spin" />
                    Generating Outfit...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Get Outfit Recommendation
                  </div>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-elegant border-0 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Thermometer className="w-5 h-5 text-fashion-gold" />
                Today's Weather
              </CardTitle>
            </CardHeader>
            <CardContent>
              {weather ? (
                <div>
                  <p className="text-2xl font-bold">{weather.temperature}°F</p>
                  <p className="text-sm text-muted-foreground">{weather.condition}</p>
                </div>
              ) : (
                <div className="animate-pulse">Loading...</div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-elegant border-0 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Wardrobe Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{wardrobeItems.length}</p>
              <p className="text-sm text-muted-foreground">Total Items</p>
            </CardContent>
          </Card>
        </div>

        {/* Outfit Recommendation Results */}
        {recommendError && (
          <div className="mt-8">
            <Card className="shadow-elegant border-0 bg-destructive/10 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="text-destructive">{recommendError}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {recommendation && recommendation.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-fashion-gold" />
                <h2 className="text-2xl font-bold text-foreground">
                  Your {mood} Outfit Recommendation
                </h2>
              </div>
              <Button
                variant="outline"
                onClick={() => generateRecommendation(mood)}
                disabled={recommending}
                className="flex items-center gap-2"
              >
                <Shuffle className="w-4 h-4" />
                Try Another
              </Button>
            </div>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
              {recommendation.map((item) => (
                <Card
                  key={item.id}
                  className="shadow-elegant border-0 bg-card/80 backdrop-blur-sm hover:shadow-lg transition-shadow"
                >
                  <CardContent className="p-4 space-y-3">
                    <div className="w-full h-32 bg-muted/20 rounded-lg flex items-center justify-center overflow-hidden">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Shirt className="w-8 h-8 text-muted-foreground" />
                      )}
                    </div>
                    <h4 className="font-semibold text-foreground">
                      {item.name}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {item.color && (
                        <Badge variant="outline" className="text-xs">
                          {item.color}
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs capitalize">
                        {item.type}
                      </Badge>
                      {item.tags?.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;