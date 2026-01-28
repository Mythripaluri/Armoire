import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/api";
import { useToast } from "@/hooks/use-toast";
import { User, Settings, LogOut } from "lucide-react";

interface Profile {
  id: string;
  user_id: string;
  email: string | null;
  style_preference: string;
}

const Profile = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stylePreference, setStylePreference] = useState("casual");

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      });
    } else if (data) {
      setProfile(data);
      setStylePreference(data.style_preference || 'casual');
    }

    setLoading(false);
  };

  const handleSavePreferences = async () => {
    if (!user) return;
    setSaving(true);

    const { error } = await supabase
      .from('profiles')
      .update({ style_preference: stylePreference })
      .eq('user_id', user.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to save preferences",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Preferences saved successfully",
      });
      fetchProfile();
    }

    setSaving(false);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-8">
          <User className="w-8 h-8 text-fashion-gold" />
          <h1 className="text-4xl font-bold text-foreground">Profile</h1>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* User Information */}
          <Card className="shadow-elegant border-0 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="bg-muted/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="joined">Member Since</Label>
                <Input
                  id="joined"
                  value={user?.created_at ? new Date(user.created_at).toLocaleDateString() : ''}
                  disabled
                  className="bg-muted/50"
                />
              </div>
            </CardContent>
          </Card>

          {/* Style Preferences */}
          <Card className="shadow-elegant border-0 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Style Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="style">Default Style</Label>
                <Select value={stylePreference} onValueChange={setStylePreference}>
                  <SelectTrigger className="bg-card/60">
                    <SelectValue placeholder="Select your style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="formal">Formal</SelectItem>
                    <SelectItem value="bold">Bold</SelectItem>
                    <SelectItem value="comfy">Comfy</SelectItem>
                    <SelectItem value="streetwear">Streetwear</SelectItem>
                    <SelectItem value="elegant">Elegant</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                onClick={handleSavePreferences} 
                disabled={saving}
                className="w-full"
              >
                {saving ? "Saving..." : "Save Preferences"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Sign Out */}
        <Card className="shadow-elegant border-0 bg-card/80 backdrop-blur-sm mt-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Sign Out</h3>
                <p className="text-muted-foreground">Sign out of your account</p>
              </div>
              <Button
                variant="outline"
                onClick={handleSignOut}
                className="flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;