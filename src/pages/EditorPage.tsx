import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { usePhotoBoothContext } from '@/context/PhotoBoothContext';
import Header from '@/components/Header';
import PhotoEditor from '@/components/PhotoEditor';
import { Camera, Plus, Edit, Trash2, ArrowRight, ArrowLeft, User, MapPin, Images, Clock, Image, Upload, X } from 'lucide-react';
import { useIsMobile } from "@/hooks/use-mobile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Photo } from '@/models/PhotoTypes';
import { compressImage, checkStorageQuota } from '../utils/imageUtils';

const EditorPage = () => {
  const { currentSession, addPhoto, updatePhoto, deletePhoto } = usePhotoBoothContext();
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [editingPhotoIndex, setEditingPhotoIndex] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("photos");
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // If no active session, redirect to home
  useEffect(() => {
    if (!currentSession || !currentSession.bundle) {
      toast({
        title: "Missing Session or Bundle",
        description: "Please start a new session and select a bundle first.",
        variant: "destructive"
      });
      navigate('/');
    } else if (currentSession.photos) {
      // Load existing photos from session
      const sessionPhotos = currentSession.photos.map(p => p.url);
      setUploadedPhotos(sessionPhotos);
    }
  }, [currentSession, navigate, toast]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, startIndex: number) => {
    const files = e.target.files;
    
    if (files && files.length > 0) {
      // Check storage quota first
      const quota = checkStorageQuota();
      console.log('Storage quota before upload:', quota);
      
      if (quota.percentage > 90) {
        toast({
          title: "Storage Full",
          description: "Storage is nearly full. Please clear some sessions or reduce image quality.",
          variant: "destructive"
        });
        return;
      }
      
      // Calculate how many photos we can still upload
      const bundleCount = currentSession.bundle.count;
      const maxPhotos = typeof bundleCount === 'string' && bundleCount === "unlimited" ? 999 : Number(bundleCount);
      const currentPhotoCount = uploadedPhotos.length;
      const availableSlots = maxPhotos - currentPhotoCount;
      
      if (availableSlots <= 0) {
        toast({
          title: "Bundle Limit Reached",
          description: `You have reached the maximum number of photos (${maxPhotos}) for your selected bundle.`,
          variant: "destructive"
        });
        return;
      }
      
      // Limit the number of files to available slots
      const filesToProcess = Math.min(files.length, availableSlots);
      
      if (files.length > availableSlots) {
        toast({
          title: "Some Files Skipped",
          description: `Only ${filesToProcess} photos were uploaded to stay within your bundle limit of ${maxPhotos}.`,
          variant: "default"
        });
      }
      
      // Convert FileList to Array for easier processing
      const fileArray = Array.from(files).slice(0, filesToProcess);
      
      // Filter out non-image files
      const validFiles = fileArray.filter(file => {
        if (!file.type.startsWith('image/')) {
          toast({
            title: "Invalid File Type",
            description: `File "${file.name}" is not an image and was skipped.`,
            variant: "destructive"
          });
          return false;
        }
        return true;
      });
      
      if (validFiles.length === 0) {
        return;
      }
      
      // Show loading toast
      toast({
        title: "Processing Images",
        description: `Compressing and uploading ${validFiles.length} photo${validFiles.length > 1 ? 's' : ''}...`,
      });
      
      try {
        // Compress all files
        const compressedImages = await Promise.all(
          validFiles.map(file => compressImage(file, 0.8, 1920))
        );
        
        // Create new photos array with all uploaded photos
        const newUploadedPhotos = [...uploadedPhotos];
        
        compressedImages.forEach((dataUrl, index) => {
          const targetIndex = currentPhotoCount + index;
          newUploadedPhotos[targetIndex] = dataUrl;
        });
        
        // Update local state first
        setUploadedPhotos(newUploadedPhotos);
        
        // Add all photos to session one by one with delay to avoid overwhelming localStorage
        if (currentSession) {
          for (let i = 0; i < compressedImages.length; i++) {
            const photo = {
              id: `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              url: compressedImages[i],
              edited: false,
              timestamp: new Date().toISOString()
            };
            
            addPhoto(currentSession.id, photo);
            
            // Small delay between adds to prevent overwhelming the system
            if (i < compressedImages.length - 1) {
              await new Promise(resolve => setTimeout(resolve, 100));
            }
          }
        }
        
        // Show success message
        toast({
          title: "Photos Uploaded",
          description: `Successfully uploaded ${compressedImages.length} photo${compressedImages.length > 1 ? 's' : ''}.`,
        });
        
        // Clear the file input
        e.target.value = '';
        
      } catch (error) {
        console.error('Error processing files:', error);
        toast({
          title: "Upload Error",
          description: "Some photos failed to upload. Please try again with smaller images.",
          variant: "destructive"
        });
      }
    }
  };

  const handleEditPhoto = (index: number) => {
    setEditingPhotoIndex(index);
  };
  
  const handleSaveEdit = (editedImageUrl: string) => {
    if (editingPhotoIndex === null || !currentSession) return;
    
    // Update the local state
    const newPhotos = [...uploadedPhotos];
    newPhotos[editingPhotoIndex] = editedImageUrl;
    setUploadedPhotos(newPhotos);
    
    // Update the session photo
    const photoId = currentSession.photos[editingPhotoIndex]?.id;
    if (photoId) {
      updatePhoto(currentSession.id, photoId, {
        url: editedImageUrl,
        edited: true,
        lastEdited: new Date().toISOString()
      });
    }
    
    setEditingPhotoIndex(null);
    
    toast({
      title: "Photo Updated",
      description: "Your edited photo has been saved.",
    });
  };
  
  const handleCancelEdit = () => {
    setEditingPhotoIndex(null);
  };
  
  const handleDeletePhoto = (index: number) => {
    if (!currentSession) return;
    
    // Get the photo ID
    const photoId = currentSession.photos[index]?.id;
    if (photoId) {
      // Remove from session
      deletePhoto(currentSession.id, photoId);
      
      // Update local state
      const newPhotos = [...uploadedPhotos];
      newPhotos.splice(index, 1);
      setUploadedPhotos(newPhotos);
      
      toast({
        title: "Photo Deleted",
        description: "The photo has been removed from your session.",
      });
    }
  };

  const handleProceedToCart = () => {
    if (uploadedPhotos.length === 0) {
      toast({
        title: "No Photos Uploaded",
        description: "Please upload at least one photo before proceeding.",
        variant: "destructive"
      });
      return;
    }
    
    navigate('/cart');
  };

  if (!currentSession || !currentSession.bundle) return null;

  // Create placeholders based on bundle size
  const bundleCount = currentSession.bundle.count;
  let placeholderCount: number;
  
  if (typeof bundleCount === 'string') {
    placeholderCount = bundleCount === "unlimited" ? 999 : parseInt(bundleCount);
  } else {
    placeholderCount = bundleCount;
  }
  
  const placeholders = Array(placeholderCount).fill(null);
  
  // Sort photos by upload time for history view
  const sortedPhotos = currentSession.photos ? 
    [...currentSession.photos].sort((a, b) => {
      // Convert timestamp strings to Date objects for comparison
      const dateA = new Date(a.timestamp || '').getTime();
      const dateB = new Date(b.timestamp || '').getTime();
      return dateB - dateA;
    }) : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50 flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-6 md:py-8">
        {editingPhotoIndex !== null && uploadedPhotos[editingPhotoIndex] ? (
          <div className="fixed inset-0 z-50 bg-white">
            <PhotoEditor
              imageUrl={uploadedPhotos[editingPhotoIndex]}
              onSave={handleSaveEdit}
              onCancel={handleCancelEdit}
            />
          </div>
        ) : (
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row md:justify-between items-center mb-6 md:mb-8">
              <h1 className="text-2xl md:text-3xl font-bold text-photobooth-primary mb-2 md:mb-0">
                {currentSession.bundle.name}
              </h1>
              
              <div className="flex items-center gap-3 flex-wrap justify-center">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-medium shadow-sm">
                  <User className="w-4 h-4" />
                  {currentSession.name}
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 font-medium shadow-sm">
                  <MapPin className="w-4 h-4" />
                  {currentSession.location}
                </span>
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border font-medium shadow-sm ${
                    uploadedPhotos.length >= (bundleCount === "unlimited" ? 999 : bundleCount)
                      ? 'bg-red-50 border-red-200 text-red-700'
                      : 'bg-green-50 border-green-200 text-green-700'
                  }`}>
                  <Images className="w-4 h-4" />
                  {uploadedPhotos.length} / {bundleCount === "unlimited" ? "∞" : bundleCount} Photos
                </span>
              </div>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="photos" className="flex items-center gap-1">
                  <Image className="w-4 h-4" />
                  <span>Upload Photos</span>
                </TabsTrigger>
                <TabsTrigger value="history" className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>Upload History</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="photos">
                {/* Bulk Upload Section */}
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-blue-900">Quick Upload</h3>
                    <span className="text-sm text-blue-600">
                      {uploadedPhotos.length} / {bundleCount === "unlimited" ? "∞" : bundleCount} photos
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <label className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-center px-4 py-3 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-400 hover:bg-blue-100 transition-colors">
                        <div className="text-center">
                          <Upload className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                          <span className="text-sm font-medium text-blue-900">
                            Choose Multiple Photos
                          </span>
                          <p className="text-xs text-blue-600 mt-1">
                            Select up to {bundleCount === "unlimited" ? "unlimited" : (Number(bundleCount) - uploadedPhotos.length)} photos
                          </p>
                        </div>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, uploadedPhotos.length)}
                        disabled={uploadedPhotos.length >= (bundleCount === "unlimited" ? 999 : Number(bundleCount))}
                        key={`bulk-upload-${uploadedPhotos.length}`} // Add key to force re-render
                      />
                    </label>
                  </div>
                </div>

                {/* Individual Photo Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {placeholders.slice(0, Math.max(uploadedPhotos.length + 1, 4)).map((_, index) => (
                    <Card key={index} className="overflow-hidden hover:shadow-lg transition-all">
                      <CardContent className="p-0">
                        <div 
                          className="aspect-[4/3] relative bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center"
                        >
                          {uploadedPhotos[index] ? (
                            <div className="relative w-full h-full group">
                              <img 
                                src={uploadedPhotos[index]} 
                                alt={`Photo ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                                <div className="flex items-center justify-between w-full">
                                  <div className="flex gap-1">
                                    <button
                                      onClick={() => handleEditPhoto(index)}
                                      className="bg-white text-photobooth-primary p-2 rounded-full hover:bg-gray-100"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </button>
                                    <label 
                                      htmlFor={`photo-upload-${index}`}
                                      className="bg-white text-gray-700 p-2 rounded-full hover:bg-gray-100 cursor-pointer"
                                    >
                                      <Image className="h-4 w-4" />
                                    </label>
                                  </div>
                                  <button
                                    onClick={() => handleDeletePhoto(index)}
                                    className="bg-white text-red-500 p-2 rounded-full hover:bg-gray-100"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ) : index < (bundleCount === "unlimited" ? 999 : Number(bundleCount)) ? (
                            <label 
                              htmlFor={`photo-upload-${index}`}
                              className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 transition-colors"
                            >
                              <div className="h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                                <Plus className="h-8 w-8 text-photobooth-primary" />
                              </div>
                              <div className="text-sm font-medium text-photobooth-primary">Upload Photo</div>
                              <div className="text-xs text-gray-500 mt-1">Click to browse</div>
                            </label>
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                              <div className="h-14 w-14 rounded-full bg-gray-100 flex items-center justify-center mb-2">
                                <X className="h-8 w-8" />
                              </div>
                              <div className="text-sm">Bundle limit reached</div>
                            </div>
                          )}
                          <input
                            type="file"
                            id={`photo-upload-${index}`}
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={(e) => handleFileUpload(e, index)}
                            disabled={uploadedPhotos.length >= (bundleCount === "unlimited" ? 999 : Number(bundleCount))}
                            key={`upload-${index}-${uploadedPhotos.length}`} // Add key to force re-render
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="history">
                <div className="bg-white rounded-lg shadow-sm border p-4">
                  <h3 className="text-lg font-medium mb-3">Upload History</h3>
                  {sortedPhotos.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">
                      No photos uploaded yet
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[500px] overflow-auto pr-2">
                      {sortedPhotos.map((photo, index) => (
                        <div key={photo.id} className="flex items-center gap-4 p-3 border rounded-lg hover:bg-gray-50">
                          <div className="w-16 h-12 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                            <img src={photo.url} alt={`Thumbnail ${index}`} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium">Photo {index + 1}</div>
                            <div className="text-xs text-gray-500">
                              {photo.timestamp ? new Date(photo.timestamp).toLocaleString() : 'Unknown date'}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-photobooth-primary p-2 h-auto"
                              onClick={() => {
                                const photoIndex = currentSession.photos.findIndex(p => p.id === photo.id);
                                if (photoIndex !== -1) {
                                  handleEditPhoto(photoIndex);
                                }
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-red-500 p-2 h-auto"
                              onClick={() => {
                                const photoIndex = currentSession.photos.findIndex(p => p.id === photo.id);
                                if (photoIndex !== -1) {
                                  handleDeletePhoto(photoIndex);
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
              <Button 
                variant="outline" 
                onClick={() => navigate('/bundles')}
                className="w-full sm:w-auto flex items-center justify-center"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Bundles
              </Button>
              
              <Button 
                className="w-full sm:w-auto bg-photobooth-primary hover:bg-photobooth-primary-dark flex items-center justify-center"
                onClick={handleProceedToCart}
              >
                Proceed to Cart
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            
            <div className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-md border border-blue-100 shadow-sm">
              <p className="text-sm text-blue-800">
                <strong>Tip:</strong> Upload your photos and click "Edit" to access the photo editor with features like filters, borders, 
                brightness, contrast, and saturation adjustments. Customize the image size with the size options.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default EditorPage;
