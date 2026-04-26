import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:8080/api/auth/login', formData);
      const { token, role, name, id, agentId, hotelId } = res.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({ name, role, id, agentId, hotelId }));
      
      toast.success(t('login_success'));
      
      // Redirect based on role
      if (role === 'AGENT') {
        navigate('/agent-dashboard');
      } else if (role === 'HOTEL_OWNER') {
        navigate('/hotel-dashboard');
      } else if (role === 'ADMIN') {
        navigate('/admin-dashboard');
      } else {
        navigate('/overview'); // Tourist / Default
      }
    } catch (err) {
      toast.error(err.response?.data?.message || t('login_failed'));
    }
  };

  return (
    <div className="min-vh-100 flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-700 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-indigo-900">{t('login')}</CardTitle>
          <CardDescription>Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t('email')}</Label>
              <Input id="email" name="email" type="email" onChange={handleChange} required placeholder="john@example.com" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{t('password')}</Label>
                <Link to="/forgot-password" name="forgotPasswordLink" className="text-xs text-indigo-600 hover:underline">
                  Forgot Password?
                </Link>
              </div>
              <Input id="password" name="password" type="password" onChange={handleChange} required />
            </div>
            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 mt-4">
              {t('submit_login')}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-gray-600">
            {t('dont_have_account')}{' '}
            <Link to="/signup" className="text-indigo-600 font-bold hover:underline">
              {t('submit_signup')}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
