import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";
import { usePhotoBoothContext } from '@/context/PhotoBoothContext';
import { Settings, CircleUser, MapPin, Bell, Package, LogOut } from 'lucide-react';
import Header from '@/components/Header';
import { useIsMobile } from "@/hooks/use-mobile";

const ProfilePage = () => {
  const { currentUser, sessions, setCurrentSession, deleteSession, logout } = usePhotoBoothContext();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  // Sample locations that can be added to the system
  const [availableLocations, setAvailableLocations] = useState([
    { id: 'entrance', name: 'Entrance', isActive: true },
    { id: 'castle', name: 'Castle', isActive: true },
    { id: 'waterfall', name: 'Waterfall', isActive: true },
    { id: 'themeRide', name: 'Theme Ride', isActive: true },
  ]);
  
  const [newLocation, setNewLocation] = useState('');
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [role, setRole] = useState(currentUser.role);
  
  const addLocation = () => {
    if (!newLocation.trim()) {
      toast({
        title: "Location Required",
        description: "Please enter a location name.",
        variant: "destructive"
      });
      return;
    }
    
    setAvailableLocations([
      ...availableLocations,
      {
        id: `loc_${Date.now()}`,
        name: newLocation,
        isActive: true
      }
    ]);
    
    setNewLocation('');
    
    toast({
      title: "Location Added",
      description: "The new location has been added successfully."
    });
  };
  
  const toggleLocation = (id) => {
    setAvailableLocations(
      availableLocations.map(loc => 
        loc.id === id ? { ...loc, isActive: !loc.isActive } : loc
      )
    );
  };

  // If no user is logged in, redirect to login page
  React.useEffect(() => {
    if (!currentUser) {
      toast({
        title: "Authentication Required",
        description: "Please log in to access your profile settings.",
        variant: "destructive"
      });
      navigate('/login');
    }
  }, [currentUser, navigate]);

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50 flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-6 justify-between">
            <div className="flex items-center">
              <div className="h-16 w-16 rounded-full bg-photobooth-primary flex items-center justify-center text-white text-xl font-bold mr-4">
                {currentUser.name.substring(0, 1)}
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">{currentUser.name}</h1>
                <p className="text-gray-600">{currentUser.role === 'Photographer' ? 'Photographer' : currentUser.role}</p>
              </div>
            </div>
          </div>
          
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile" className="flex items-center justify-center">
                <CircleUser className="h-4 w-4 mr-2" />
                <span className={isMobile ? 'hidden' : 'inline'}>Profile</span>
              </TabsTrigger>
              <TabsTrigger value="sessions" className="flex items-center justify-center">
                <Package className="h-4 w-4 mr-2" />
                <span className={isMobile ? 'hidden' : 'inline'}>Previous Sessions</span>
              </TabsTrigger>
              <TabsTrigger value="locations" className="flex items-center justify-center">
                <MapPin className="h-4 w-4 mr-2" />
                <span className={isMobile ? 'hidden' : 'inline'}>Locations</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile" className="mt-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center">
                    <CircleUser className="h-5 w-5 mr-2" />
                    Profile Settings
                  </CardTitle>
                  {!editing && (
                    <Button variant="secondary" onClick={() => setEditing(true)}>
                      Edit
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  <form className="space-y-4" onSubmit={e => { e.preventDefault(); setEditing(false); /* Save logic here */ }}>
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" value={name} onChange={e => setName(e.target.value)} disabled={!editing} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} disabled={!editing} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Select value={role} onValueChange={setRole} disabled={!editing}>
                        <SelectTrigger id="role">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Admin">Admin</SelectItem>
                          <SelectItem value="Photographer">Photographer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {editing && (
                      <div className="flex gap-2">
                        <Button type="submit" className="bg-photobooth-primary hover:bg-photobooth-primary-dark">Save Changes</Button>
                        <Button type="button" variant="secondary" onClick={() => { setEditing(false); setName(currentUser.name); setEmail(currentUser.email); setRole(currentUser.role); }}>Cancel</Button>
                      </div>
                    )}
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="sessions" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Package className="h-5 w-5 mr-2" />
                    Previous Sessions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {sessions.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">No sessions found</div>
                  ) : (
                    <div className="space-y-6">
                      {sessions.map(session => (
                        <div key={session.id} className="border rounded-lg p-4 bg-white shadow-sm">
                          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-2">
                            <div>
                              <div className="font-bold text-photobooth-primary text-lg">{session.name}</div>
                              <div className="text-sm text-gray-500 flex items-center gap-2">
                                <span className="font-mono">{session.id.substring(0, 8)}</span>
                                <span>•</span>
                                <span className="capitalize">{session.location}</span>
                                <span>•</span>
                                <span>{new Date(session.date).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 mt-2 md:mt-0">
                              <span className={`inline-block px-2 py-1 text-xs rounded-full ${session.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{session.status}</span>
                              <Button variant="destructive" size="sm" onClick={() => deleteSession(session.id)}>
                                Delete
                              </Button>
                            </div>
                          </div>
                          <div className="mb-2">
                            <span className="font-medium">Bundle:</span> {session.bundle ? `${session.bundle.name} (₹${session.bundle.price})` : 'No bundle selected'}
                          </div>
                          <div>
                            <span className="font-medium">Photos:</span>
                            {session.photos.length === 0 ? (
                              <span className="ml-2 text-gray-500">No photos taken in this session yet.</span>
                            ) : (
                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-2">
                                {session.photos.map((photo, idx) => (
                                  <img key={photo.id} src={photo.editedUrl || photo.url} alt={`Photo ${idx + 1}`} className="aspect-[4/3] bg-gray-100 rounded object-cover w-full" />
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="locations" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    Available Locations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-end gap-2">
                      <div className="flex-grow space-y-2">
                        <Label htmlFor="new-location">Add New Location</Label>
                        <Input 
                          id="new-location" 
                          value={newLocation}
                          onChange={(e) => setNewLocation(e.target.value)}
                          placeholder="Enter location name"
                        />
                      </div>
                      <Button 
                        className="bg-photobooth-primary hover:bg-photobooth-primary-dark"
                        onClick={addLocation}
                      >
                        Add
                      </Button>
                    </div>
                    
                    <div className="border rounded-md divide-y">
                      {availableLocations.map((location) => (
                        <div key={location.id} className="flex items-center justify-between p-3">
                          <div className="font-medium">{location.name}</div>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-medium ${location.isActive ? 'text-green-600' : 'text-gray-500'}`}>
                              {location.isActive ? 'Active' : 'Inactive'}
                            </span>
                            <Switch 
                              checked={location.isActive} 
                              onCheckedChange={() => toggleLocation(location.id)} 
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
