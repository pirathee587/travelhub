import { useState, useEffect } from 'react';
import adminProfileApi from '../services/adminProfileApi';

export const useAdminProfile = () => {

    // ── Profile State ──────────────────────────────
    const [profile, setProfile]     = useState(null);
    const [loading, setLoading]     = useState(true);
    const [error, setError]         = useState(null);

    // ── Save States ────────────────────────────────
    const [saving, setSaving]       = useState(false);
    const [saveSuccess, setSaveSuccess] = useState('');
    const [saveError, setSaveError] = useState('');

    // ── Upload State ───────────────────────────────
    const [uploading, setUploading] = useState(false);

    // ── Load Profile on Mount ──────────────────────
    // Only runs when the modal is actually opened (AdminProfileModal is lazy-mounted in ModalContext)
    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const res = await adminProfileApi.getProfile();
            setProfile(res);
        } catch (err) {
            setError(
                err.response?.data?.message
                || 'Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    // ── Update Profile (Profile Tab) ───────────────
    // Name + Profile Image Save changes button
    const updateProfile = async (name, email, profileImage) => {
        try {
            setSaving(true);
            setSaveError('');
            setSaveSuccess('');

            const res = await adminProfileApi.updateProfile(name, email, profileImage || profile?.profileImage);
            setProfile(res);

            // Update localStorage user info
            const stored = localStorage.getItem('travelhub_user');
            if (stored) {
                const user = JSON.parse(stored);
                user.name  = name;
                if (email || res.email) {
                    user.email = email || res.email;
                }
                if (profileImage || res.profileImage) {
                    user.profileImage = profileImage || res.profileImage;
                }
                localStorage.setItem('travelhub_user', JSON.stringify(user));
            }

            setSaveSuccess('Profile updated successfully!');
            window.dispatchEvent(new Event('user-profile-updated'));
            return true;
        } catch (err) {
            setSaveError(
                err.response?.data?.message
                || 'Failed to update profile');
            return false;
        } finally {
            setSaving(false);
        }
    };

    // ── Upload Profile Photo ───────────────────────
    // Upload button click
    const uploadProfilePhoto = async (file) => {

        // Validate file size — max 1MB
        if (file.size > 1024 * 1024) {
            setSaveError('File size must be less than 1MB');
            return null;
        }

        // Validate file type — JPG, PNG
        const allowed = ['image/jpeg', 'image/png', 'image/jpg'];
        if (!allowed.includes(file.type)) {
            setSaveError('Only JPG and PNG files allowed');
            return null;
        }

        try {
            setUploading(true);
            setSaveError('');
            setSaveSuccess('');

            const res = await adminProfileApi.uploadProfilePhoto(file);

            // Update profile with new image URL
            const imageUrl = res.data?.imageUrl;
            if (imageUrl) {
                // Update profile on backend
                const updatedUser = await adminProfileApi.updateProfile(
                    profile?.name,
                    profile?.email,
                    imageUrl
                );
                setProfile(updatedUser);

                // Update localStorage
                const stored = localStorage.getItem('travelhub_user');
                if (stored) {
                    const user = JSON.parse(stored);
                    user.profileImage = imageUrl;
                    localStorage.setItem('travelhub_user', JSON.stringify(user));
                }
                setSaveSuccess('Photo uploaded successfully!');
                window.dispatchEvent(new Event('user-profile-updated'));
                return imageUrl;   // ← return URL so modal can sync preview immediately
            } else {
                setSaveError('Failed to parse uploaded image URL');
                return null;
            }
        } catch (err) {
            setSaveError(
                err.response?.data?.message
                || 'Failed to upload photo');
            return null;
        } finally {
            setUploading(false);
        }
    };

    // ── Change Password (Password Tab) ────────────
    // Old/New/Confirm password Save changes button
    const changePassword = async (
        oldPassword,
        newPassword,
        confirmPassword
    ) => {
        // Frontend validation
        if (!oldPassword || !newPassword || !confirmPassword) {
            setSaveError('All fields are required');
            return false;
        }

        if (newPassword !== confirmPassword) {
            setSaveError('New password and confirm password do not match');
            return false;
        }

        if (oldPassword === newPassword) {
            setSaveError('New password cannot be the same as the old password');
            return false;
        }

        if (newPassword.length < 8) {
            setSaveError('Password must be at least 8 characters');
            return false;
        }

        try {
            setSaving(true);
            setSaveError('');
            setSaveSuccess('');

            await adminProfileApi.changePassword(
                oldPassword,
                newPassword
            );

            setSaveSuccess('Password changed successfully!');
            return true;
        } catch (err) {
            setSaveError(
                err.response?.data?.message
                || 'Failed to change password');
            return false;
        } finally {
            setSaving(false);
        }
    };

    // ── Clear Messages ─────────────────────────────
    const clearMessages = () => {
        setSaveSuccess('');
        setSaveError('');
    };

    return {
        // Profile data
        profile,
        loading,
        error,

        // Save states
        saving,
        uploading,
        saveSuccess,
        saveError,

        // Actions
        updateProfile,
        uploadProfilePhoto,
        changePassword,
        clearMessages,
        refetch: fetchProfile,
    };
};
