import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import toast from 'react-hot-toast';
import { createWorker } from 'tesseract.js';
import { validateNIC } from '../utils/nicValidation';
import { useRef } from 'react';

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
    nic: '',
  });

  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (e.target.name === 'preferredLanguage') {
      i18n.changeLanguage(e.target.value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // --- Strict NIC Validation ---
    // For business roles (Agent or Hotel Owner), we must ensure the NIC is valid before submission.
    // The validateNIC utility checks against both the classic 9-character format and the modern 12-digit format.
    if ((formData.role === 'AGENT' || formData.role === 'HOTEL_OWNER') && formData.nic) {
      const validation = validateNIC(formData.nic);
      if (!validation.isValid) {
        toast.error(t('nic_invalid_format') || 'Please enter a valid 9-digit or 12-digit Sri Lankan NIC.');
        return; // Block submission immediately if invalid
      }
    }

    try {
      const response = await api.post('/auth/register', formData);
      toast.success(response.data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Signup failed');
    }
  };

  const handleScanNIC = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsScanning(true);
    const toastId = toast.loading(t('scanning_nic') || 'Scanning NIC...');

    try {
      // Initialize Tesseract.js worker for in-browser OCR (Optical Character Recognition)
      // This ensures the user's sensitive ID card photo never leaves their device.
      const worker = await createWorker('eng');
      const { data: { text } } = await worker.recognize(file);
      await worker.terminate();

      // Look for Sri Lankan NIC patterns in the extracted raw OCR text
      // oldNicMatch: 9 digits followed by 'v', 'V', 'x', or 'X'
      // newNicMatch: exactly 12 digits
      const oldNicMatch = text.match(/[0-9]{9}[vVxX]/);
      const newNicMatch = text.match(/[0-9]{12}/);
      const extractedNic = (newNicMatch ? newNicMatch[0] : (oldNicMatch ? oldNicMatch[0] : '')).toUpperCase();

      if (extractedNic) {
        // Perform algorithmic validation on the extracted string
        const validation = validateNIC(extractedNic);
        if (validation.isValid) {
          // Auto-fill the form state with the valid NIC
          setFormData(prev => ({ ...prev, nic: extractedNic }));
          toast.success(t('nic_scanned_success') || 'NIC scanned and validated successfully!', { id: toastId });
        } else {
          toast.error(t('nic_invalid_format') || 'NIC detected but format is invalid.', { id: toastId });
        }
      } else {
        toast.error(t('nic_not_detected') || 'Could not detect NIC number. Please try a clearer photo or enter manually.', { id: toastId });
      }
    } catch (error) {
      console.error('OCR Error:', error);
      toast.error(t('scan_error') || 'Error scanning image. Please enter NIC manually.', { id: toastId });
    } finally {
      setIsScanning(false);
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
                  <>
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
                  
                  <div className="mb-3">
                    <label className="form-label">{t('nic_number') || 'NIC Number'}</label>
                    <div className="input-group">
                      <input 
                        type="text" 
                        name="nic" 
                        className="form-control" 
                        value={formData.nic}
                        onChange={handleChange} 
                        placeholder="e.g. 199012345678 or 123456789V"
                        required 
                      />
                      <button 
                        className="btn btn-outline-secondary" 
                        type="button"
                        onClick={() => fileInputRef.current.click()}
                        disabled={isScanning}
                      >
                        {isScanning ? (
                          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        ) : (
                          <i className="bi bi-camera"></i>
                        )}
                        {' '}{t('scan') || 'Scan'}
                      </button>
                    </div>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      style={{ display: 'none' }} 
                      accept="image/*"
                      onChange={handleScanNIC}
                    />
                    <small className="text-muted">{t('nic_hint') || 'Format: 9 digits + V/X or 12 digits'}</small>
                  </div>
                  </>
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

                    <div className="mb-3">
                      <label className="form-label">{t('nic_number') || 'NIC Number'}</label>
                      <div className="input-group">
                        <input 
                          type="text" 
                          name="nic" 
                          className="form-control" 
                          value={formData.nic}
                          onChange={handleChange} 
                          placeholder="e.g. 199012345678 or 123456789V"
                          required 
                        />
                        <button 
                          className="btn btn-outline-secondary" 
                          type="button"
                          onClick={() => fileInputRef.current.click()}
                          disabled={isScanning}
                        >
                          {isScanning ? (
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                          ) : (
                            <i className="bi bi-camera"></i>
                          )}
                          {' '}{t('scan') || 'Scan'}
                        </button>
                      </div>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        style={{ display: 'none' }} 
                        accept="image/*"
                        onChange={handleScanNIC}
                      />
                      <small className="text-muted">{t('nic_hint') || 'Format: 9 digits + V/X or 12 digits'}</small>
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
