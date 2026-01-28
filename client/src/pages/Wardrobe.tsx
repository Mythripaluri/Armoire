import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/hooks/useAuth";
import { supabase, WeatherService } from "@/api";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Search,
  Filter,
  Shirt,
  Users,
  Zap,
  Grid3X3,
  List,
  Heart,
  Tag,
  Upload,
  Trash2,
  Edit,
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

const Wardrobe = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const [weatherData, setWeatherData] = useState<any>(null);
  const [loadingWeather, setLoadingWeather] = useState(false);

  useEffect(() => {
    if (user) {
      fetchWardrobeItems();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchWardrobeItems = async () => {
    if (!user) return;

    setLoading(true);
    const { data, error } = await supabase
      .from("wardrobe_items")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load wardrobe items",
        variant: "destructive",
      });
    } else {
      setItems((data as WardrobeItem[]) || []);
    }
    setLoading(false);
  };

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    const formData = new FormData(e.currentTarget);
    const file = formData.get("image") as File;
    const name = formData.get("name") as string;
    const type = formData.get("type") as string;
    const color = formData.get("color") as string;

    if (!file || !name || !type) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      // Upload image to Supabase storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("wardrobe")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("wardrobe").getPublicUrl(fileName);

      // Save to database
      // @ts-ignore
      const { error: dbError } = await supabase.from("wardrobe_items").insert([
        {
          user_id: user.id,
          name,
          type: type as "tops" | "bottoms" | "shoes" | "accessories",
          color: color || null,
          tags: [] as string[],
          image_url: publicUrl,
        },
      ]);

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: "Item added to wardrobe!",
      });

      setUploadDialogOpen(false);
      fetchWardrobeItems();
    } catch (error) {
      if (error instanceof Error) {
        toast({
          title: "Upload failed",
          description: error.message,
          variant: "destructive",
        });
      }
    }

    setUploading(false);
  };

  const handleDeleteItem = async (itemId: string, imageUrl: string | null) => {
    if (!user) return;

    try {
      // Delete from database
      const { error: dbError } = await supabase
        .from("wardrobe_items")
        .delete()
        .eq("id", itemId)
        .eq("user_id", user.id);

      if (dbError) throw dbError;

      // Delete image from storage if it exists
      if (imageUrl) {
        const fileName = imageUrl.split("/").pop();
        if (fileName) {
          await supabase.storage
            .from("wardrobe")
            .remove([`${user.id}/${fileName}`]);
        }
      }

      toast({
        title: "Success",
        description: "Item removed from wardrobe",
      });

      fetchWardrobeItems();
    } catch (error: any) {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const categories = [
    { id: "all", name: "All Items", count: items.length },
    {
      id: "tops",
      name: "Tops",
      count: items.filter((item) => item.type === "tops").length,
    },
    {
      id: "bottoms",
      name: "Bottoms",
      count: items.filter((item) => item.type === "bottoms").length,
    },
    {
      id: "shoes",
      name: "Shoes",
      count: items.filter((item) => item.type === "shoes").length,
    },
    {
      id: "accessories",
      name: "Accessories",
      count: items.filter((item) => item.type === "accessories").length,
    },
  ];

  const filteredItems = items.filter((item) => {
    const matchesCategory =
      activeCategory === "all" || item.type === activeCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.color &&
        item.color.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const getStyleColor = (style: string) => {
    switch (style) {
      case "Casual":
        return "bg-blue-100 text-blue-800";
      case "Professional":
        return "bg-purple-100 text-purple-800";
      case "Elegant":
        return "bg-pink-100 text-pink-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Weather Test Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">Weather Test</h2>
          <div className="flex gap-4 items-center mb-4">
            <Button
              className="bg-blue-600 text-white hover:bg-blue-700"
              onClick={async () => {
                setLoadingWeather(true);
                try {
                  const weather = await WeatherService.getCurrentLocationWeather();
                  setWeatherData(weather);
                  toast({
                    title: "Weather Loaded",
                    description: `${weather.temperature}°C, ${weather.condition}`,
                  });
                } catch (error) {
                  toast({
                    title: "Error",
                    description: "Failed to load weather data",
                    variant: "destructive",
                  });
                }
                setLoadingWeather(false);
              }}
              disabled={loadingWeather}
            >
              {loadingWeather ? "Loading..." : "Test Weather API"}
            </Button>
            {weatherData && (
              <div className="text-sm bg-muted p-3 rounded-lg">
                <div className="font-semibold">{weatherData.location}</div>
                <div>{weatherData.temperature}°C - {weatherData.condition}</div>
                <div>{weatherData.description} {weatherData.icon}</div>
                {weatherData.humidity && <div>Humidity: {weatherData.humidity}%</div>}
              </div>
            )}
          </div>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground">My Wardrobe</h1>
            <p className="text-muted-foreground">
              Organize and discover your fashion pieces
            </p>
          </div>

          <Button
            className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-elegant hover:shadow-hover-lift transition-all duration-300"
            onClick={() => setUploadDialogOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Item
          </Button>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search items by name, color, or style..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card/60 backdrop-blur-sm"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>

            <div className="flex rounded-lg border border-border bg-card/60">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="rounded-r-none"
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="rounded-l-none"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Categories Sidebar */}
          <div className="lg:col-span-1">
            <Card className="shadow-elegant border-0 bg-card/80 backdrop-blur-sm sticky top-24">
              <CardContent className="p-6 space-y-2">
                <h3 className="font-semibold text-foreground mb-4">
                  Categories
                </h3>
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={
                      activeCategory === category.id ? "default" : "ghost"
                    }
                    className="w-full justify-between"
                    onClick={() => setActiveCategory(category.id)}
                  >
                    <span>{category.name}</span>
                    <Badge variant="secondary" className="ml-2">
                      {category.count}
                    </Badge>
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Items Grid */}
          <div className="lg:col-span-4">
            {loading ? (
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {[...Array(6)].map((_, i) => (
                  <Card
                    key={i}
                    className="shadow-elegant border-0 bg-card/80 backdrop-blur-sm"
                  >
                    <CardContent className="p-4 space-y-3">
                      <div className="w-full h-48 bg-muted/20 rounded-lg animate-pulse"></div>
                      <div className="h-4 bg-muted/20 rounded animate-pulse"></div>
                      <div className="h-3 bg-muted/20 rounded animate-pulse w-1/2"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredItems.length === 0 ? (
              <Card className="shadow-elegant border-0 bg-card/80 backdrop-blur-sm">
                <CardContent className="p-12 text-center">
                  <Shirt className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    No items found
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {searchQuery || activeCategory !== "all"
                      ? "Try adjusting your search or filter."
                      : "Start building your digital wardrobe!"}
                  </p>
                  <Button onClick={() => setUploadDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Item
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div
                className={`grid gap-4 ${
                  viewMode === "grid"
                    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                    : "grid-cols-1"
                }`}
              >
                {filteredItems.map((item) => (
                  <Card
                    key={item.id}
                    className="group hover:shadow-hover-lift transition-all duration-300 border-0 bg-card/80 backdrop-blur-sm cursor-pointer"
                  >
                    <CardContent
                      className={`p-4 ${
                        viewMode === "list"
                          ? "flex items-center space-x-4"
                          : "space-y-3"
                      }`}
                    >
                      {/* Item Image */}
                      <div
                        className={`${
                          viewMode === "grid"
                            ? "w-full h-48"
                            : "w-20 h-20 flex-shrink-0"
                        } bg-muted/20 rounded-lg flex items-center justify-center border-2 border-dashed border-muted-foreground/30 group-hover:border-fashion-gold/50 transition-colors overflow-hidden`}
                      >
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Shirt
                            className={`${
                              viewMode === "grid" ? "w-12 h-12" : "w-8 h-8"
                            } text-muted-foreground`}
                          />
                        )}
                      </div>

                      <div
                        className={`${
                          viewMode === "list" ? "flex-1" : ""
                        } space-y-2`}
                      >
                        <div className="flex items-start justify-between">
                          <h4 className="font-semibold text-foreground group-hover:text-fashion-gold transition-colors">
                            {item.name}
                          </h4>
                          <div className="flex items-center space-x-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteItem(item.id, item.image_url);
                              }}
                            >
                              <Trash2 className="w-3 h-3 text-destructive" />
                            </Button>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {item.color && (
                            <Badge variant="outline" className="text-xs">
                              {item.color}
                            </Badge>
                          )}
                          <Badge
                            variant="outline"
                            className="text-xs capitalize"
                          >
                            {item.type}
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>
                            Added{" "}
                            {new Date(item.created_at).toLocaleDateString()}
                          </span>
                        </div>

                        {viewMode === "list" && (
                          <div className="flex items-center space-x-2 pt-2">
                            <Button size="sm" variant="outline">
                              <Edit className="w-3 h-3 mr-1" />
                              Edit
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Upload Dialog */}
            <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Item</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleUpload} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="image">Image *</Label>
                    <Input
                      id="image"
                      name="image"
                      type="file"
                      accept="image/*"
                      required
                      className="bg-card/60"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="e.g., Blue Denim Jacket"
                      required
                      className="bg-card/60"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Category *</Label>
                    <Select name="type" required>
                      <SelectTrigger className="bg-card/60">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tops">Tops</SelectItem>
                        <SelectItem value="bottoms">Bottoms</SelectItem>
                        <SelectItem value="shoes">Shoes</SelectItem>
                        <SelectItem value="accessories">Accessories</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="color">Color</Label>
                    <Input
                      id="color"
                      name="color"
                      placeholder="e.g., Navy Blue"
                      className="bg-card/60"
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setUploadDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={uploading}>
                      {uploading ? "Adding..." : "Add Item"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wardrobe;
