import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Signup = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', telephone: '',
    role: 'TOURIST', preferredLanguage: 'en',
    nationality: '', agencyName: '', licenseNumber: '',
    hotelName: '', businessRegistrationId: '', businessAddress: '', district: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'preferredLanguage') i18n.changeLanguage(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:8080/api/auth/register', formData);
      toast.success(res.data.message);
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-vh-100 flex items-center justify-center bg-gradient-to-br from-teal-500 to-blue-600 p-4">
      <Card className="w-full max-w-2xl shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-teal-900">{t('signup')}</CardTitle>
          <CardDescription>Join TravelHub and start your journey</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t('name')}</Label>
                <Input id="name" name="name" onChange={handleChange} required placeholder="John Doe" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t('email')}</Label>
                <Input id="email" name="email" type="email" onChange={handleChange} required placeholder="john@example.com" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">{t('password')}</Label>
                <Input id="password" name="password" type="password" onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telephone">{t('telephone')}</Label>
                <Input id="telephone" name="telephone" onChange={handleChange} required placeholder="+94 77 123 4567" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('role')}</Label>
                <Select onValueChange={(v) => handleSelectChange('role', v)} defaultValue="TOURIST">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TOURIST">{t('tourist')}</SelectItem>
                    <SelectItem value="AGENT">{t('agent')}</SelectItem>
                    <SelectItem value="HOTEL_OWNER">{t('hotel_owner')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('preferred_language')}</Label>
                <Select onValueChange={(v) => handleSelectChange('preferredLanguage', v)} defaultValue="en">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="si">සිංහල (Sinhala)</SelectItem>
                    <SelectItem value="ta">தமிழ் (Tamil)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="border-t pt-4 mt-4">
              {formData.role === 'TOURIST' && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  <Label htmlFor="nationality">{t('nationality')}</Label>
                  <Input id="nationality" name="nationality" onChange={handleChange} required />
                </div>
              )}
              
              {formData.role === 'AGENT' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="space-y-2">
                    <Label htmlFor="agencyName">{t('agency_name')}</Label>
                    <Input id="agencyName" name="agencyName" onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="licenseNumber">{t('license_number')}</Label>
                    <Input id="licenseNumber" name="licenseNumber" onChange={handleChange} required />
                  </div>
                </div>
              )}

              {formData.role === 'HOTEL_OWNER' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="hotelName">{t('hotel_name')}</Label>
                      <Input id="hotelName" name="hotelName" onChange={handleChange} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="businessRegistrationId">{t('business_reg_id')}</Label>
                      <Input id="businessRegistrationId" name="businessRegistrationId" onChange={handleChange} required />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="businessAddress">{t('business_address')}</Label>
                      <Input id="businessAddress" name="businessAddress" onChange={handleChange} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="district">{t('district')}</Label>
                      <Input id="district" name="district" onChange={handleChange} required />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 mt-6">
              {t('submit_signup')}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-gray-600">
            {t('already_have_account')}{' '}
            <Link to="/login" className="text-teal-600 font-bold hover:underline">
              {t('submit_login')}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Signup;
