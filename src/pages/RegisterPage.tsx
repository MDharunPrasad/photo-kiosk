import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { usePhotoBoothContext } from '@/context/PhotoBoothContext';

const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const { register } = usePhotoBoothContext();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !username || !password || !role) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields to register.",
        variant: "destructive"
      });
      return;
    }
    const success = register(name, username, password, role);
    if (success) {
      toast({
        title: "Registration Successful",
        description: "Your account has been created successfully."
      });
      navigate('/');
    } else {
      toast({
        title: "Registration Failed",
        description: "This username is already registered.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-extrabold text-photobooth-primary mb-1">Register</CardTitle>
            <CardDescription className="text-base text-gray-700">Create your PhotoBooth account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select onValueChange={setRole}>
                  <SelectTrigger id="role" className="rounded-lg border-gray-300 focus:border-photobooth-primary focus:ring-photobooth-primary">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Photographer">Photographer</SelectItem>
                    <SelectItem value="Operator">Operator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input 
                  id="name" 
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-lg border-gray-300 focus:border-photobooth-primary focus:ring-photobooth-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input 
                  id="username" 
                  type="text" 
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="rounded-lg border-gray-300 focus:border-photobooth-primary focus:ring-photobooth-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="rounded-lg border-gray-300 focus:border-photobooth-primary focus:ring-photobooth-primary"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-photobooth-primary hover:bg-photobooth-primary-dark text-lg py-2 rounded-lg shadow-md"
              >
                Register
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <div className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link to="/login" className="text-photobooth-primary font-medium hover:underline">
                Login here
              </Link>
            </div>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
};

export default RegisterPage;
