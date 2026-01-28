import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/api";
import { useToast } from "@/hooks/use-toast";
import { virtualTryOnService } from "@/services/virtualTryOn";
import {
  Camera,
  Upload,
  RefreshCw,
  Shirt,
  Eye,
  Download,
  Zap,
  Sparkles,
  Play,
  Square,
  Loader2
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

const TryOn = () => {
  const [wardrobeItems, setWardrobeItems] = useState<WardrobeItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<WardrobeItem | null>(null);
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [tryOnResult, setTryOnResult] = useState<string | null>(null);
  const [tryOnHistory, setTryOnHistory] = useState<Array<{id: string; result: string; itemName: string; timestamp: Date}>>([]);
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchWardrobeItems = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('wardrobe_items')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setWardrobeItems(data || []);
  }, [user]);

  useEffect(() => {
    fetchWardrobeItems();
  }, [fetchWardrobeItems]);

  // Start webcam
  const startWebcam = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 }
      });
      setStream(mediaStream);
      setIsWebcamActive(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Error accessing webcam:', error);
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  // Stop webcam
  const stopWebcam = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsWebcamActive(false);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Capture photo from webcam
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');

    if (context) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);
      
      const dataURL = canvas.toDataURL('image/jpeg', 0.8);
      setUserPhoto(dataURL);
      stopWebcam();
      
      toast({
        title: "Photo Captured!",
        description: "Now select a clothing item to try on.",
      });
    }
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUserPhoto(e.target?.result as string);
        toast({
          title: "Photo Uploaded!",
          description: "Now select a clothing item to try on.",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Enhanced virtual try-on using the service
  const performVirtualTryOn = async () => {
    if (!userPhoto || !selectedItem) {
      toast({
        title: "Missing Requirements",
        description: "Please upload a photo and select a clothing item.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedItem.image_url) {
      toast({
        title: "Item Image Missing",
        description: "The selected clothing item doesn't have an image.",
        variant: "destructive",
      });
      return;
    }

    console.log('Starting virtual try-on...', {
      userPhotoLength: userPhoto.length,
      clothingImageUrl: selectedItem.image_url,
      clothingType: selectedItem.type,
      itemName: selectedItem.name
    });

    setIsProcessing(true);
    
    try {
      toast({
        title: "Processing...",
        description: "Creating your virtual try-on. This may take a few seconds.",
      });

      const result = await virtualTryOnService.performTryOn({
        userImage: userPhoto,
        clothingImage: selectedItem.image_url,
        clothingType: selectedItem.type
      });

      console.log('Virtual try-on result:', result);

      if (result.success && result.resultImage) {
        setTryOnResult(result.resultImage);
        
        // Add to history
        const historyItem = {
          id: Date.now().toString(),
          result: result.resultImage,
          itemName: selectedItem.name,
          timestamp: new Date()
        };
        setTryOnHistory(prev => [historyItem, ...prev.slice(0, 4)]); // Keep last 5 results
        
        toast({
          title: "Virtual Try-On Complete!",
          description: `You're now virtually wearing ${selectedItem.name}`,
        });
      } else {
        throw new Error(result.error || 'Virtual try-on failed - no result image');
      }
    } catch (error) {
      console.error('Virtual try-on error:', error);
      toast({
        title: "Try-On Failed",
        description: error instanceof Error ? error.message : "Something went wrong during virtual try-on. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Download try-on result
  const downloadResult = () => {
    if (!tryOnResult || !selectedItem) return;

    const link = document.createElement('a');
    link.download = `virtual-tryon-${selectedItem.name.replace(/\s+/g, '-').toLowerCase()}.jpg`;
    link.href = tryOnResult;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Downloaded!",
      description: "Your virtual try-on result has been saved.",
    });
  };

  // Reset everything
  const resetTryOn = () => {
    setUserPhoto(null);
    setSelectedItem(null);
    setTryOnResult(null);
    setTryOnHistory([]);
    setShowComparison(false);
    stopWebcam();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Camera className="w-8 h-8 text-fashion-gold" />
          <h1 className="text-4xl font-bold text-foreground">Virtual Try-On</h1>
          <Sparkles className="w-6 h-6 text-fashion-gold animate-pulse" />
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left Side - Photo Capture */}
          <div className="space-y-6">
            <Card className="shadow-elegant border-0 bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="w-5 h-5 text-fashion-gold" />
                  Your Photo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!userPhoto && !isWebcamActive && (
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <Button
                        onClick={startWebcam}
                        className="flex-1 bg-fashion-gold text-white hover:bg-fashion-gold/90"
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        Use Camera
                      </Button>
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        variant="outline"
                        className="flex-1"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Photo
                      </Button>
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                )}

                {isWebcamActive && (
                  <div className="space-y-4">
                    <div className="relative bg-black rounded-lg overflow-hidden">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-full h-64 object-cover"
                      />
                    </div>
                    <div className="flex gap-4">
                      <Button
                        onClick={capturePhoto}
                        className="flex-1 bg-fashion-gold text-white hover:bg-fashion-gold/90"
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        Capture Photo
                      </Button>
                      <Button
                        onClick={stopWebcam}
                        variant="outline"
                        className="flex-1"
                      >
                        <Square className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {userPhoto && !isWebcamActive && (
                  <div className="space-y-4">
                    <div className="relative bg-muted rounded-lg overflow-hidden">
                      <img
                        src={userPhoto}
                        alt="Your photo"
                        className="w-full h-64 object-cover"
                      />
                    </div>
                    <Button
                      onClick={resetTryOn}
                      variant="outline"
                      className="w-full"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Take New Photo
                    </Button>
                  </div>
                )}

                <canvas ref={canvasRef} className="hidden" />
              </CardContent>
            </Card>

            {/* Try-On Result */}
            {tryOnResult && (
              <Card className="shadow-elegant border-0 bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-fashion-gold" />
                      Virtual Try-On Result
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowComparison(!showComparison)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      {showComparison ? 'Result Only' : 'Compare'}
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {showComparison ? (
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Original</p>
                        <div className="relative bg-muted rounded-lg overflow-hidden">
                          <img
                            src={userPhoto}
                            alt="Original photo"
                            className="w-full h-32 object-cover"
                          />
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Virtual Try-On</p>
                        <div className="relative bg-muted rounded-lg overflow-hidden">
                          <img
                            src={tryOnResult}
                            alt="Try-on result"
                            className="w-full h-32 object-cover"
                          />
                          <div className="absolute top-1 right-1">
                            <Badge className="bg-fashion-gold text-white text-xs">
                              AI
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="relative bg-muted rounded-lg overflow-hidden mb-4">
                      <img
                        src={tryOnResult}
                        alt="Try-on result"
                        className="w-full h-64 object-cover"
                      />
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-fashion-gold text-white">
                          Virtual Try-On
                        </Badge>
                      </div>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button 
                      className="flex-1" 
                      variant="outline"
                      onClick={downloadResult}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Save Result
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={() => performVirtualTryOn()}
                      disabled={isProcessing}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Try Again
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Side - Clothing Selection */}
          <div className="space-y-6">
            <Card className="shadow-elegant border-0 bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shirt className="w-5 h-5 text-fashion-gold" />
                  Select Clothing
                </CardTitle>
              </CardHeader>
              <CardContent>
                {wardrobeItems.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Shirt className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No clothing items found.</p>
                    <p className="text-sm">Add items to your wardrobe first.</p>
                  </div>
                ) : (
                  <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                    {wardrobeItems.map((item) => (
                      <Card
                        key={item.id}
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          selectedItem?.id === item.id
                            ? 'ring-2 ring-fashion-gold bg-fashion-gold/10 shadow-lg'
                            : 'hover:shadow-lg hover:ring-1 hover:ring-fashion-gold/30'
                        }`}
                        onClick={() => {
                          console.log('Selected clothing item:', item);
                          setSelectedItem(item);
                          toast({
                            title: "Item Selected",
                            description: `Selected ${item.name} for virtual try-on`,
                          });
                        }}
                      >
                        <CardContent className="p-3">
                          <div className="w-full h-24 bg-muted/20 rounded-lg flex items-center justify-center overflow-hidden mb-2 relative">
                            {item.image_url ? (
                              <>
                                <img
                                  src={item.image_url}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute top-1 right-1">
                                  <Badge className="bg-green-500 text-white text-xs px-1 py-0">
                                    ✓
                                  </Badge>
                                </div>
                              </>
                            ) : (
                              <>
                                <Shirt className="w-6 h-6 text-muted-foreground" />
                                <div className="absolute top-1 right-1">
                                  <Badge variant="secondary" className="text-xs px-1 py-0">
                                    No Img
                                  </Badge>
                                </div>
                              </>
                            )}
                          </div>
                          <h4 className="font-medium text-sm mb-1">{item.name}</h4>
                          <div className="flex gap-1">
                            <Badge variant="outline" className="text-xs capitalize">
                              {item.type}
                            </Badge>
                            {item.color && (
                              <Badge variant="secondary" className="text-xs">
                                {item.color}
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Try-On Controls */}
            <Card className="shadow-elegant border-0 bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-fashion-gold" />
                  Virtual Try-On
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Status Indicators */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${userPhoto ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className="text-sm">Photo {userPhoto ? 'uploaded' : 'needed'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${selectedItem ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className="text-sm">Clothing {selectedItem ? 'selected' : 'needed'}</span>
                  </div>
                  {selectedItem && (
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${selectedItem.image_url ? 'bg-green-500' : 'bg-yellow-500'}`} />
                      <span className="text-sm">
                        Item image {selectedItem.image_url ? 'available' : 'missing (demo mode)'}
                      </span>
                    </div>
                  )}
                </div>

                {selectedItem && (
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Selected item:</p>
                    <p className="font-medium">{selectedItem.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{selectedItem.type}</p>
                  </div>
                )}
                
                <Button
                  onClick={performVirtualTryOn}
                  disabled={!userPhoto || !selectedItem || isProcessing}
                  className="w-full bg-fashion-gold text-white hover:bg-fashion-gold/90"
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing Virtual Try-On...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Play className="w-4 h-4" />
                      Try On Virtually
                    </div>
                  )}
                </Button>

                {userPhoto && selectedItem && !isProcessing && (
                  <div className="text-center">
                    <Button
                      onClick={resetTryOn}
                      variant="outline"
                      className="w-full"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Start Over
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Try-On History */}
        {tryOnHistory.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Eye className="w-6 h-6 text-fashion-gold" />
              Recent Try-Ons
            </h2>
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-5">
              {tryOnHistory.map((item) => (
                <Card
                  key={item.id}
                  className="shadow-elegant border-0 bg-card/80 backdrop-blur-sm cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => {
                    setTryOnResult(item.result);
                    toast({
                      title: "History Loaded",
                      description: `Viewing previous try-on: ${item.itemName}`,
                    });
                  }}
                >
                  <CardContent className="p-3">
                    <div className="relative bg-muted rounded-lg overflow-hidden mb-2">
                      <img
                        src={item.result}
                        alt={`Try-on with ${item.itemName}`}
                        className="w-full h-24 object-cover"
                      />
                      <div className="absolute bottom-1 left-1">
                        <Badge className="bg-fashion-gold text-white text-xs">
                          History
                        </Badge>
                      </div>
                    </div>
                    <p className="text-xs font-medium truncate">{item.itemName}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.timestamp.toLocaleTimeString()}
                    </p>
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

export default TryOn;