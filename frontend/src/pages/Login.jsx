import { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { apiClient } from '@/api/apiClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Login() {
  const { setUser, setIsAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('login');

  const [loginData, setLoginData] = useState({
    username: '',
    password: '',
  });

  const [signupData, setSignupData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({ ...prev, [name]: value }));
  };

  const handleSignupChange = (e) => {
    const { name, value } = e.target;
    setSignupData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (!loginData.username || !loginData.password) {
        throw new Error('Please enter username and password');
      }

      const user = await apiClient.request('/users/login', {
        method: 'POST',
        body: JSON.stringify({
          username: loginData.username,
          password: loginData.password,
        }),
      });

      setUser(user);
      setIsAuthenticated(true);
      apiClient.setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (!signupData.username || !signupData.email || !signupData.password) {
        throw new Error('Please fill in all fields');
      }

      if (signupData.password !== signupData.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      if (signupData.password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      const newUser = await apiClient.createUser({
        username: signupData.username,
        email: signupData.email,
        password: signupData.password,
      });

      const userWithoutPassword = { ...newUser };
      delete userWithoutPassword.password;

      setUser(userWithoutPassword);
      setIsAuthenticated(true);
      apiClient.setCurrentUser(userWithoutPassword);
      localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Signup failed';
      setError(message);
      console.error('Signup error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative">
      
      {/* Optional subtle background accent */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />

      <Card className="w-full max-w-md bg-card border-border text-card-foreground shadow-xl relative">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl">MessagingApp</CardTitle>
          <CardDescription className="text-muted-foreground">
            Create an account or login to continue
          </CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <Alert className="mb-4 border-destructive/50 text-destructive bg-destructive/10">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            
            <TabsList className="grid w-full grid-cols-2 bg-muted">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            {/* Login */}
            <TabsContent value="login" className="space-y-4 mt-4">
              <form onSubmit={handleLogin} className="space-y-4">

                <div className="space-y-2">
                  <Label htmlFor="login-username" className="text-muted-foreground">
                    Username
                  </Label>
                  <Input
                    id="login-username"
                    name="username"
                    type="text"
                    placeholder="Enter your username"
                    value={loginData.username}
                    onChange={handleLoginChange}
                    disabled={isLoading}
                    className="bg-input border-border text-foreground placeholder-muted-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-muted-foreground">
                    Password
                  </Label>
                  <Input
                    id="login-password"
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                    value={loginData.password}
                    onChange={handleLoginChange}
                    disabled={isLoading}
                    className="bg-input border-border text-foreground placeholder-muted-foreground"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground hover:opacity-90"
                  disabled={isLoading}
                >
                  {isLoading ? 'Logging in...' : 'Login'}
                </Button>

              </form>
            </TabsContent>

            {/* Signup */}
            <TabsContent value="signup" className="space-y-4 mt-4">
              <form onSubmit={handleSignup} className="space-y-4">

                <div className="space-y-2">
                  <Label htmlFor="signup-username" className="text-muted-foreground">
                    Username
                  </Label>
                  <Input
                    id="signup-username"
                    name="username"
                    type="text"
                    placeholder="Choose a username"
                    value={signupData.username}
                    onChange={handleSignupChange}
                    disabled={isLoading}
                    className="bg-input border-border text-foreground placeholder-muted-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-muted-foreground">
                    Email
                  </Label>
                  <Input
                    id="signup-email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={signupData.email}
                    onChange={handleSignupChange}
                    disabled={isLoading}
                    className="bg-input border-border text-foreground placeholder-muted-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-muted-foreground">
                    Password
                  </Label>
                  <Input
                    id="signup-password"
                    name="password"
                    type="password"
                    placeholder="Create a password"
                    value={signupData.password}
                    onChange={handleSignupChange}
                    disabled={isLoading}
                    className="bg-input border-border text-foreground placeholder-muted-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-confirm" className="text-muted-foreground">
                    Confirm Password
                  </Label>
                  <Input
                    id="signup-confirm"
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={signupData.confirmPassword}
                    onChange={handleSignupChange}
                    disabled={isLoading}
                    className="bg-input border-border text-foreground placeholder-muted-foreground"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-accent text-accent-foreground hover:opacity-90"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating Account...' : 'Sign Up'}
                </Button>

              </form>
            </TabsContent>

          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}