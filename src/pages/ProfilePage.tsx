import React, { useState, useEffect } from 'react';
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
  const { currentUser, sessions, setCurrentSession, deleteSession, recoverSession, logout, deleteAllSessions, deleteSessionsByMonth, autoDeleteOldSessions, locations, addLocation, toggleLocation } = usePhotoBoothContext();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const [newLocation, setNewLocation] = useState('');
  const [previewSession, setPreviewSession] = useState(null);
  const [showConfirm, setShowConfirm] = useState<{ type: string, payload?: any } | null>(null);
  const [autoDeleteChecked, setAutoDeleteChecked] = useState(false);
  
  // Auto-delete sessions older than 1 month if checked
  useEffect(() => {
    if (autoDeleteChecked) {
      autoDeleteOldSessions();
    }
  }, [autoDeleteChecked, sessions]);
  
  const handleAddLocation = () => {
    if (!newLocation.trim()) {
      toast({
        title: "Location Required",
        description: "Please enter a location name.",
        variant: "destructive"
      });
      return;
    }
    addLocation(newLocation);
    setNewLocation('');
    toast({
      title: "Location Added",
      description: "The new location has been added successfully."
    });
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
                    Profile
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" value={currentUser.name} disabled readOnly />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" value={currentUser.email} disabled readOnly />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Input id="role" value={currentUser.role} disabled readOnly />
                    </div>
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
                  {/* Auto-delete Checkbox */}
                  <div className="mb-4 flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="auto-delete"
                      checked={autoDeleteChecked}
                      onChange={e => setAutoDeleteChecked(e.target.checked)}
                      className="accent-blue-600 h-4 w-4"
                    />
                    <label htmlFor="auto-delete" className="text-sm select-none cursor-pointer">
                      Auto-delete sessions older than 1 month
                    </label>
                    <span title="If checked, sessions older than 1 month will be automatically deleted.">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 16v-4m0-4h.01" /></svg>
                    </span>
                  </div>
                  {/* Bulk Actions Dropdown */}
                  <div className="mb-6 relative inline-block">
                    <button
                      className="bg-gray-200 text-gray-800 rounded px-3 py-1 text-sm hover:bg-gray-300 focus:outline-none"
                      onClick={e => {
                        e.currentTarget.nextSibling.classList.toggle('hidden');
                      }}
                    >
                      Bulk Actions ▾
                    </button>
                    <div className="hidden absolute left-0 mt-1 w-56 bg-white border border-gray-200 rounded shadow-lg z-10">
                      <button
                        onClick={() => setShowConfirm({ type: 'deleteAll' })}
                        className="block w-full text-left px-4 py-2 text-sm hover:bg-red-100 text-red-700"
                      >
                        Delete All Sessions
                      </button>
                      <button
                        onClick={() => {
                          const now = new Date();
                          setShowConfirm({ type: 'deleteMonth', payload: { month: now.getMonth(), year: now.getFullYear() } });
                        }}
                        className="block w-full text-left px-4 py-2 text-sm hover:bg-yellow-100 text-yellow-700"
                      >
                        Delete This Month's Sessions
                      </button>
                    </div>
                  </div>
                  {/* Active Sessions */}
                  <h3 className="text-base font-semibold mb-2">Active Sessions</h3>
                  {sessions.filter(session => !session.deleted).length === 0 ? (
                    <div className="text-center py-10 text-gray-500">No sessions found</div>
                  ) : (
                    <div className="space-y-6">
                      {sessions.filter(session => !session.deleted).map(session => (
                        <div key={session.id} className="border rounded-lg p-4 bg-white shadow-sm flex flex-col md:flex-row md:justify-between md:items-center">
                          <div>
                            <div className="font-bold text-photobooth-primary text-lg">{session.name}</div>
                            <div className="text-sm text-gray-500 flex items-center gap-2">
                              <span className="font-mono">{session.id.substring(0, 8)}</span>
                              <span>•</span>
                              <span className="capitalize">{session.location}</span>
                              <span>•</span>
                              <span>{new Date(session.date).toLocaleDateString()}</span>
                            </div>
                            <div className="mb-2">
                              <span className="font-medium">Bundle:</span> {session.bundle ? `${session.bundle.name} (₹${session.bundle.price})${session.bundle.description ? ' - ' + session.bundle.description : ''}` : 'No bundle selected'}
                            </div>
                            <div>
                              <span className="font-medium">Photos:</span>
                              {session.photos.length === 0 ? (
                                <span className="ml-2 text-gray-500">No photos taken in this session yet.</span>
                              ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-2">
                                  {session.photos.map((photo, idx) => (
                                    <img key={photo.id} src={photo.url} alt={`Photo ${idx + 1}`} className="aspect-[4/3] bg-gray-100 rounded object-cover w-full" />
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col gap-2 mt-4 md:mt-0 md:ml-4">
                            <button
                              onClick={() => setPreviewSession(session)}
                              className="bg-blue-500 text-white rounded px-3 py-1 text-xs hover:bg-blue-600"
                            >
                              Preview
                            </button>
                            <button
                              onClick={() => setShowConfirm({ type: 'deleteOne', payload: session.id })}
                              className="bg-red-500 text-white rounded px-3 py-1 text-xs hover:bg-red-600"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {/* Recently Deleted Sessions */}
                  <h3 className="text-base font-semibold mt-8 mb-2 text-red-600">Recently Deleted Sessions</h3>
                  {sessions.filter(session => session.deleted).length === 0 ? (
                    <div className="text-center py-6 text-gray-400">No recently deleted sessions</div>
                  ) : (
                    <div className="space-y-4">
                      {sessions.filter(session => session.deleted).map(session => (
                        <div key={session.id} className="border rounded-lg p-4 bg-red-50 flex flex-col md:flex-row md:justify-between md:items-center">
                          <div>
                            <div className="font-bold text-photobooth-primary text-lg">{session.name}</div>
                            <div className="text-sm text-gray-500 flex items-center gap-2">
                              <span className="font-mono">{session.id.substring(0, 8)}</span>
                              <span>•</span>
                              <span className="capitalize">{session.location}</span>
                              <span>•</span>
                              <span>{new Date(session.date).toLocaleDateString()}</span>
                            </div>
                            <div className="mb-2">
                              <span className="font-medium">Bundle:</span> {session.bundle ? `${session.bundle.name} (₹${session.bundle.price})${session.bundle.description ? ' - ' + session.bundle.description : ''}` : 'No bundle selected'}
                            </div>
                            <div>
                              <span className="font-medium">Photos:</span>
                              {session.photos.length === 0 ? (
                                <span className="ml-2 text-gray-500">No photos taken in this session yet.</span>
                              ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-2">
                                  {session.photos.map((photo, idx) => (
                                    <img key={photo.id} src={photo.url} alt={`Photo ${idx + 1}`} className="aspect-[4/3] bg-gray-100 rounded object-cover w-full" />
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col gap-2 mt-4 md:mt-0 md:ml-4">
                            <button
                              onClick={() => setPreviewSession(session)}
                              className="bg-blue-500 text-white rounded px-3 py-1 text-xs hover:bg-blue-600"
                            >
                              Preview
                            </button>
                            <button
                              onClick={() => setShowConfirm({ type: 'deleteOne', payload: session.id })}
                              className="bg-red-500 text-white rounded px-3 py-1 text-xs hover:bg-red-600"
                            >
                              Delete
                            </button>
                            <button
                              onClick={() => recoverSession(session.id)}
                              className="bg-green-500 text-white rounded px-3 py-1 text-xs hover:bg-green-600"
                            >
                              Recover
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {/* Preview Modal */}
                  {previewSession && (
                    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                      <div className="bg-white rounded-lg shadow-lg p-8 max-w-lg w-full relative">
                        <button
                          onClick={() => setPreviewSession(null)}
                          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
                        >
                          ×
                        </button>
                        <h2 className="text-xl font-bold mb-2">Session Preview</h2>
                        <div className="mb-2"><b>Name:</b> {previewSession.name}</div>
                        <div className="mb-2"><b>ID:</b> {previewSession.id}</div>
                        <div className="mb-2"><b>Location:</b> {previewSession.location}</div>
                        <div className="mb-2"><b>Date:</b> {new Date(previewSession.date).toLocaleDateString()}</div>
                        <div className="mb-2"><b>Status:</b> {previewSession.status}</div>
                        <div className="mb-2"><b>Bundle:</b> {previewSession.bundle ? `${previewSession.bundle.name} (₹${previewSession.bundle.price})${previewSession.bundle.description ? ' - ' + previewSession.bundle.description : ''}` : 'No bundle selected'}</div>
                        <div className="mb-2"><b>Photos:</b></div>
                        {previewSession.photos.length === 0 ? (
                          <div className="text-gray-500 mb-2">No photos taken in this session yet.</div>
                        ) : (
                          <div className="grid grid-cols-2 gap-2 mb-2">
                            {previewSession.photos.map((photo, idx) => (
                              <img key={photo.id} src={photo.url} alt={`Photo ${idx + 1}`} className="aspect-[4/3] bg-gray-100 rounded object-cover w-full" />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {/* Confirm Dialogs */}
                  {showConfirm && (
                    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                      <div className="bg-white rounded-lg shadow-lg p-8 max-w-xs w-full relative">
                        <button
                          onClick={() => setShowConfirm(null)}
                          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
                        >
                          ×
                        </button>
                        {showConfirm.type === 'deleteAll' && (
                          <>
                            <div className="mb-4">Are you sure you want to <b>delete all sessions</b>?</div>
                            <button className="bg-red-600 text-white rounded px-3 py-1 mr-2" onClick={() => { deleteAllSessions(); setShowConfirm(null); }}>Delete All</button>
                            <button className="bg-gray-300 rounded px-3 py-1" onClick={() => setShowConfirm(null)}>Cancel</button>
                          </>
                        )}
                        {showConfirm.type === 'deleteMonth' && (
                          <>
                            <div className="mb-4">Delete all sessions from this month?</div>
                            <button className="bg-yellow-600 text-white rounded px-3 py-1 mr-2" onClick={() => { deleteSessionsByMonth(showConfirm.payload.month, showConfirm.payload.year); setShowConfirm(null); }}>Delete Month</button>
                            <button className="bg-gray-300 rounded px-3 py-1" onClick={() => setShowConfirm(null)}>Cancel</button>
                          </>
                        )}
                        {showConfirm.type === 'deleteOne' && (
                          <>
                            <div className="mb-4">Delete this session permanently?</div>
                            <button className="bg-red-600 text-white rounded px-3 py-1 mr-2" onClick={() => { deleteSession(showConfirm.payload); setShowConfirm(null); }}>Delete</button>
                            <button className="bg-gray-300 rounded px-3 py-1" onClick={() => setShowConfirm(null)}>Cancel</button>
                          </>
                        )}
                      </div>
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
                        onClick={handleAddLocation}
                      >
                        Add
                      </Button>
                    </div>
                    <div className="border rounded-md divide-y">
                      {locations.map((location) => (
                        <div key={location.id} className="flex items-center justify-between p-3">
                          <div className="font-medium">{location.name}</div>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-medium ${location.isActive ? 'text-green-600' : 'text-gray-500'}`}>{location.isActive ? 'Active' : 'Inactive'}</span>
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
