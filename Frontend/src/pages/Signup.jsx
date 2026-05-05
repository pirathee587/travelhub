import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import toast from 'react-hot-toast';

const Signup = () => {
  const { t, i18n } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    telephone: '',
    role: 'TOURIST',
    preferredLanguage: 'en',
    nationality: '',
    agencyName: '',
    licenseNumber: '',
    hotelName: '',
    businessRegistrationId: '',
    businessAddress: '',
    district: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (e.target.name === 'preferredLanguage') {
      i18n.changeLanguage(e.target.value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/auth/register', formData);
      toast.success(response.data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Signup failed');
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow-lg border-0 rounded-lg">
            <div className="card-header bg-primary text-white text-center py-4">
              <h2>{t('signup')}</h2>
            </div>
            <div className="card-body p-5">
              <form onSubmit={handleSubmit}>
                {/* Common Fields */}
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">{t('name')}</label>
                    <input type="text" name="name" className="form-control" onChange={handleChange} required />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">{t('email')}</label>
                    <input type="email" name="email" className="form-control" onChange={handleChange} required />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">{t('password')}</label>
                    <input type="password" name="password" className="form-control" onChange={handleChange} required />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">{t('telephone')}</label>
                    <input 
                      type="tel" 
                      name="telephone" 
                      className="form-control" 
                      placeholder="e.g. 0771234567"
                      pattern="[0-9]*"
                      onKeyPress={(e) => {
                        if (!/[0-9]/.test(e.key)) {
                          e.preventDefault();
                        }
                      }}
                      onChange={handleChange} 
                      required 
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">{t('role')}</label>
                    <select name="role" className="form-select" onChange={handleChange}>
                      <option value="TOURIST">{t('tourist')}</option>
                      <option value="AGENT">{t('agent')}</option>
                      <option value="HOTEL_OWNER">{t('hotel_owner')}</option>
                    </select>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">{t('preferred_language')}</label>
                    <select name="preferredLanguage" className="form-select" onChange={handleChange}>
                      <option value="en">English</option>
                      <option value="si">Sinhala</option>
                      <option value="ta">Tamil</option>
                    </select>
                  </div>
                </div>

                <hr className="my-4" />

                {/* Dynamic Fields */}
                {formData.role === 'TOURIST' && (
                  <div className="mb-3">
                    <label className="form-label">{t('nationality')}</label>
                    <input type="text" name="nationality" className="form-control" onChange={handleChange} required />
                  </div>
                )}

                {formData.role === 'AGENT' && (
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">{t('agency_name')}</label>
                      <input type="text" name="agencyName" className="form-control" onChange={handleChange} required />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">{t('license_number')}</label>
                      <input type="text" name="licenseNumber" className="form-control" onChange={handleChange} required />
                    </div>
                  </div>
                )}

                {formData.role === 'HOTEL_OWNER' && (
                  <>
                    <div className="mb-3">
                      <label className="form-label">{t('hotel_name')}</label>
                      <input type="text" name="hotelName" className="form-control" onChange={handleChange} required />
                    </div>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">{t('business_address')}</label>
                        <input type="text" name="businessAddress" className="form-control" onChange={handleChange} required />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">{t('district')}</label>
                        <input type="text" name="district" className="form-control" onChange={handleChange} required />
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">{t('business_reg_id')}</label>
                      <input type="text" name="businessRegistrationId" className="form-control" onChange={handleChange} required />
                    </div>
                  </>
                )}

                <div className="d-grid gap-2 mt-4">
                  <button type="submit" className="btn btn-primary btn-lg">{t('signup')}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
