import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePhotoBoothContext } from '@/context/PhotoBoothContext';
import { MapPin, ArrowRight } from 'lucide-react';
import Header from '@/components/Header';

const OperatorDashboard: React.FC = () => {
  const { sessions, setCurrentSession } = usePhotoBoothContext();
  const navigate = useNavigate();

  // Only show sessions ready for operator
  const operatorSessions = sessions.filter(s => s.status === 'ready-for-operator' && !s.deleted);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white flex flex-col">
      <Header />
      <main className="flex-grow flex items-center justify-center w-full">
        <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-3xl w-full">
          <Card className="shadow-lg border border-blue-400/10 rounded-2xl overflow-hidden hover:border-blue-400/30 transition-all w-full mx-auto">
            <CardHeader className="bg-gradient-to-r from-blue-400/10 to-blue-50 border-b border-blue-400/10">
              <CardTitle className="text-2xl font-bold text-blue-600 flex items-center">
                <MapPin className="mr-2 h-6 w-6" />
                Sessions Ready for Editing
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {operatorSessions.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  No sessions are ready for operator.
                </div>
              ) : (
                <div className="space-y-4">
                  {operatorSessions.map(session => (
                    <div key={session.id} className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors">
                      <div>
                        <div className="font-medium text-photobooth-primary">{session.name}</div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <span className="font-mono">{session.sessionKey}</span>
                          <span className="mx-1">•</span>
                          <span className="capitalize">{session.location}</span>
                        </div>
                      </div>
                      <Button
                        onClick={() => {
                          setCurrentSession(session);
                          navigate('/bundles');
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-lg shadow flex items-center"
                      >
                        Edit <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default OperatorDashboard;
