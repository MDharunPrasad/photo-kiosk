import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { usePhotoBoothContext } from '@/context/PhotoBoothContext';
import { ArrowRight, Trash, Search, Camera, MapPin } from 'lucide-react';
import Header from '@/components/Header';

const HomePage: React.FC = () => {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const { createSession, sessions, deleteSession, setCurrentSession } = usePhotoBoothContext();
  const navigate = useNavigate();

  const handleStartSession = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name) {
      toast({
        title: "Name Required",
        description: "Please enter a customer name to start a session.",
        variant: "destructive"
      });
      return;
    }
    
    if (!location) {
      toast({
        title: "Location Required",
        description: "Please select a location for the session.",
        variant: "destructive"
      });
      return;
    }
    
    const newSession = createSession(name, location);
    navigate('/bundles');
  };

  const handleOpenSession = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setCurrentSession(session);
      if (session.bundle) {
        navigate('/editor');
      } else {
        navigate('/bundles');
      }
    }
  };

  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteSession(sessionId);
    toast({
      title: "Session Deleted",
      description: "The photo session has been deleted."
    });
  };

  const getStatusBadge = (status: string) => {
    if (status === 'Active') {
      return <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">Active</span>;
    }
    return <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">Completed</span>;
  };

  const filteredSessions = (searchTerm
    ? sessions.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.location.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : sessions
  ).filter(s => s.status === 'Completed');

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white flex flex-col">
      <Header />
      
      <main className="flex-grow flex items-center justify-center w-full">
        <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-16">
          {/* New Session Card */}
          <Card className="shadow-lg border border-photobooth-primary/10 rounded-2xl overflow-hidden hover:border-photobooth-primary/30 transition-all min-w-[340px] w-full max-w-lg mx-auto">
            <CardHeader className="bg-gradient-to-r from-photobooth-primary/10 to-blue-50 border-b border-photobooth-primary/10">
              <CardTitle className="text-2xl font-bold text-photobooth-primary flex items-center">
                <Camera className="mr-2 h-6 w-6" />
                Start New Photo Session
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleStartSession} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-700 font-medium">Customer Name</Label>
                  <Input 
                    id="name" 
                    placeholder="Enter customer name" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="border-gray-300 focus-visible:ring-photobooth-primary"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-gray-700 font-medium">Location in Park</Label>
                  <Select onValueChange={setLocation}>
                    <SelectTrigger id="location" className="border-gray-300">
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entrance">Entrance</SelectItem>
                      <SelectItem value="castle">Castle</SelectItem>
                      <SelectItem value="waterfall">Waterfall</SelectItem>
                      <SelectItem value="themeRide">Theme Ride</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-photobooth-primary hover:bg-photobooth-primary-dark font-bold shadow-md transition-all"
                >
                  Start Session <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </CardContent>
          </Card>
          
          {/* Previous Sessions Card */}
          <Card className="shadow-lg border border-blue-400/10 rounded-2xl overflow-hidden hover:border-blue-400/30 transition-all min-w-[340px] w-full max-w-lg mx-auto">
            <CardHeader className="bg-gradient-to-r from-blue-400/10 to-blue-50 border-b border-blue-400/10">
              <CardTitle className="text-2xl font-bold text-blue-600 flex items-center">
                <MapPin className="mr-2 h-6 w-6" />
                Previous Sessions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    placeholder="Search by name, tag or location"
                    className="pl-9 mb-4 border-gray-300"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                {filteredSessions.length === 0 ? (
                  <div className="text-center py-10 text-gray-500">
                    {searchTerm ? "No matching sessions found" : "No sessions found"}
                  </div>
                ) : (
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden max-h-[400px] overflow-auto shadow-inner">
                    {filteredSessions.map(session => (
                      <div 
                        key={session.id}
                        className="p-4 hover:bg-blue-50 cursor-pointer flex items-center justify-between border-b border-gray-100 last:border-b-0 transition-colors"
                        onClick={() => handleOpenSession(session.id)}
                      >
                        <div className="space-y-1">
                          <div className="font-medium text-photobooth-primary">{session.name}</div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <span className="font-mono">{session.id.substring(0, 8)}</span>
                            <span className="mx-1">•</span>
                            <span className="capitalize">{session.location}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div>{getStatusBadge(session.status)}</div>
                          <button
                            onClick={(e) => handleDeleteSession(session.id, e)}
                            className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded-full transition-colors"
                          >
                            <Trash size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
