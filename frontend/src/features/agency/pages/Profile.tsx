import { useState, useRef, useEffect } from 'react';
import {
  Mail, Phone, MapPin, Star, CheckCircle, Calendar,
  Edit, Camera, Globe, MessageCircle, X, Map,
} from 'lucide-react';
import { DashboardLayout } from '@/features/agency/components/dashboard/DashboardLayout';
import { Button } from '@/components/common/ui/button';
import { Input } from '@/components/common/ui/input';
import { Label } from '@/components/common/ui/label';
import { Textarea } from '@/components/common/ui/textarea';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/common/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/common/ui/select';
import { toast } from 'sonner';
import { api } from '@/features/agency/services/api';
import { Skeleton } from '@/components/common/ui/skeleton';

// ── Upload helper ──────────────────────────────────────────────
const uploadImage = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8080';
  const response = await fetch(`${apiBase}/api/upload/image`, {
    method: 'POST',
    body: formData,
  });
  const result = await response.json();
  if (result.success && result.data?.imageUrl) return result.data.imageUrl;
  throw new Error('Upload failed');
};

const Profile = () => {
  /* Agent Profile State */
  const [profile, setProfile] = useState<any>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* Customer Reviews State */
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [ratingFilter, setRatingFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
  const [activeReplyId, setActiveReplyId] = useState<string | number | null>(null);
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await api.getProfile();
        setProfile(data);
        setEditForm(data);
      } catch (error) {
        console.error('Failed to load profile:', error);
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    const fetchReviews = async () => {
      try {
        const data = await api.getReviews();
        setReviews(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to load reviews:', error);
      } finally {
        setReviewsLoading(false);
      }
    };

    /* DATA FETCHING: Load Profile and Reviews on component mount */
    fetchProfile();
    fetchReviews();
  }, []);

  const filteredReviews = reviews
    .filter(r => ratingFilter === 'all' || r.rating === parseInt(ratingFilter))
    .sort((a, b) => {
      const dateA = new Date(a.date ?? 0).getTime();
      const dateB = new Date(b.date ?? 0).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

  const handleEditOpen = () => {
    setEditForm({ ...profile });
    setIsEditDialogOpen(true);
  };

  // ── Profile photo upload → agents/profile folder ───────────
  const handleProfileImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const url = await uploadImage(file); 
      setEditForm(prev => ({ ...prev, profileImage: url }));
      toast.success('Photo uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload photo');
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeProfileImage = () => {
    setEditForm(prev => ({ ...prev, profileImage: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ── Removed NIC Image upload logic ───────────
  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const payload = {
        agencyName: editForm.agencyName,
        whatsappNumber: editForm.whatsappNumber,
        location: editForm.location,
        bio: editForm.bio,
        languages: editForm.languages,
        operatingDistricts: editForm.operatingDistricts,
        websiteUrl: editForm.websiteUrl,
        profileImage: editForm.profileImage,
      };
      const updated = await api.updateProfile(payload);
      setProfile(updated);
      setIsEditDialogOpen(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleSendReply = async (reviewId: string | number) => {
    const replyText = replyInputs[reviewId]?.trim();
    if (!replyText) return;
    try {
      const updated = await api.replyToReview(reviewId, replyText);
      setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, reply: updated.reply } : r));
      setActiveReplyId(null);
      toast.success('Reply sent successfully');
    } catch (error) {
      toast.error('Failed to send reply');
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Profile" subtitle="Manage your profile and view performance" showSearch={false}>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1 space-y-6 min-w-0">
            <div className="rounded-xl border border-border bg-card p-6 flex flex-col items-center space-y-4">
              <Skeleton className="h-24 w-24 rounded-full" />
              <Skeleton className="h-6 w-36" />
              <Skeleton className="h-4 w-24" />
              <div className="w-full space-y-3 pt-4 border-t border-border">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          </div>
          <div className="lg:col-span-2 min-w-0">
            <div className="rounded-xl border border-border bg-card p-6 space-y-4">
              <div className="flex justify-between items-center">
                <div className="space-y-2">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-64" />
                </div>
                <Skeleton className="h-8 w-32 rounded-full" />
              </div>
              <div className="space-y-4 pt-4 border-t border-border">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="p-4 rounded-lg bg-muted/30 space-y-3">
                    <div className="flex justify-between">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const displayName = profile?.agencyName || 'Agency';
  const initials = displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <DashboardLayout title="Profile" subtitle="Manage your profile and view performance" showSearch={false}>
      <div className="grid gap-6 lg:grid-cols-3">

        {/* 1. LEFT COLUMN: Profile Sidebar (Summary, Contacts, Stats) */}
        {/* Profile Card */}
        <div className="lg:col-span-1 space-y-6 min-w-0">
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="relative mx-auto w-fit group">
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center overflow-hidden border-2 border-primary/20">
                {profile?.profileImage ? (
                  <img src={profile.profileImage} alt={displayName} className="h-full w-full object-cover" />
                ) : (
                  <div className="text-3xl font-bold text-primary-foreground uppercase">{initials}</div>
                )}
              </div>
              <button
                className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-110"
                onClick={handleEditOpen}
              >
                <Edit className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 text-center">
              <h2 className="text-xl font-semibold text-foreground">{displayName}</h2>
              {profile?.agentName && (
                <p className="text-sm text-muted-foreground mt-0.5">{profile.agentName}</p>
              )}
              <div className="mt-2 flex items-center justify-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < Math.floor(profile?.rating ?? 0) ? 'fill-warning text-warning' : 'text-muted-foreground/30'}`} />
                ))}
                <span className="ml-1 text-sm font-medium text-foreground">{profile?.rating ?? '-'}</span>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {profile?.email && (
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-foreground truncate">{profile.email}</span>
                </div>
              )}
              {profile?.whatsappNumber && (
                <div className="flex items-center gap-3 text-sm">
                  <MessageCircle className="h-4 w-4 text-success shrink-0" />
                  <span className="text-foreground">{profile.whatsappNumber} (WhatsApp)</span>
                </div>
              )}
              {profile?.location && (
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-foreground">{profile.location}</span>
                </div>
              )}
              {profile?.operatingDistricts && (
                <div className="flex items-center gap-3 text-sm">
                  <Map className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-foreground">{profile.operatingDistricts}</span>
                </div>
              )}
              {profile?.websiteUrl && (
                <div className="flex items-center gap-3 text-sm">
                  <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
                  <a href={profile.websiteUrl.startsWith('http') ? profile.websiteUrl : `https://${profile.websiteUrl}`}
                    target="_blank" rel="noreferrer" className="text-primary hover:underline truncate">
                    {profile.websiteUrl}
                  </a>
                </div>
              )}
              {profile?.memberSince && (
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-foreground">Member since {profile.memberSince}</span>
                </div>
              )}
            </div>

            {profile?.languages && (
              <div className="mt-6 pt-6 border-t border-border">
                <h4 className="text-sm font-semibold text-foreground mb-2">Languages</h4>
                <p className="text-sm text-muted-foreground">{profile.languages}</p>
              </div>
            )}

            {profile?.bio && (
              <div className="mt-6 pt-6 border-t border-border">
                <h4 className="text-sm font-semibold text-foreground mb-2">About</h4>
                <p className="text-sm leading-relaxed text-muted-foreground">{profile.bio}</p>
              </div>
            )}



            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="mt-6 w-full gap-2" onClick={handleEditOpen}>
                  <Edit className="h-4 w-4" />Edit Profile
                </Button>
              </DialogTrigger>
              {/* --- EDIT PROFILE DIALOG: Popup form for updating details --- */}
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader><DialogTitle>Edit Profile</DialogTitle></DialogHeader>
                <div className="space-y-4 py-4">
                  {/* Profile Photo */}
                  <div className="flex flex-col items-center gap-4 mb-4">
                    <Label className="text-muted-foreground text-xs font-semibold">Agency Profile Picture</Label>
                    <div
                      className="relative h-24 w-24 rounded-full border-2 border-dashed border-input flex items-center justify-center overflow-hidden hover:bg-muted/50 transition-colors cursor-pointer group"
                      onClick={() => !uploadingPhoto && fileInputRef.current?.click()}
                    >
                      {uploadingPhoto ? (
                        <div className="flex flex-col items-center gap-1">
                          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                          <span className="text-[10px] text-muted-foreground">Uploading...</span>
                        </div>
                      ) : editForm.profileImage ? (
                        <>
                          <img src={editForm.profileImage} alt="Preview" className="h-full w-full object-cover opacity-80 group-hover:opacity-60 transition-opacity" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Camera className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" />
                          </div>
                        </>
                      ) : (
                        <div className="text-center p-2">
                          <Camera className="h-6 w-6 mx-auto text-muted-foreground mb-1" />
                          <span className="text-[10px] text-muted-foreground">Upload</span>
                        </div>
                      )}
                      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleProfileImageChange} />
                    </div>
                    {editForm.profileImage && (
                      <Button variant="ghost" size="sm" onClick={removeProfileImage} className="text-xs text-destructive h-6 mt-1">
                        Remove Photo
                      </Button>
                    )}
                  </div>

                  {/* NIC Photo moved to Settings */}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Agency Name</Label>
                      <Input value={editForm.agencyName || ''} onChange={e => setEditForm({ ...editForm, agencyName: e.target.value })} placeholder="Your agency name" />
                    </div>
                    <div className="space-y-2">
                      <Label>WhatsApp Number</Label>
                      <Input value={editForm.whatsappNumber || ''} onChange={e => setEditForm({ ...editForm, whatsappNumber: e.target.value })} placeholder="e.g. +94771234567" />
                    </div>
                    <div className="space-y-2">
                      <Label>Location (City/District)</Label>
                      <Input value={editForm.location || ''} onChange={e => setEditForm({ ...editForm, location: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Website URL</Label>
                      <Input value={editForm.websiteUrl || ''} onChange={e => setEditForm({ ...editForm, websiteUrl: e.target.value })} placeholder="https://..." />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <Label>Languages</Label>
                      <Input value={editForm.languages || ''} onChange={e => setEditForm({ ...editForm, languages: e.target.value })} placeholder="e.g. English, Sinhala, Tamil" />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <Label>Operating Districts</Label>
                      <Input value={editForm.operatingDistricts || ''} onChange={e => setEditForm({ ...editForm, operatingDistricts: e.target.value })} placeholder="e.g. Colombo, Galle, Kandy" />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <Label>Bio</Label>
                      <Textarea value={editForm.bio || ''} onChange={e => setEditForm({ ...editForm, bio: e.target.value })} rows={4} />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end gap-3 border-t mt-6">
                    <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleSaveProfile} disabled={saving}>
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* 2. RIGHT COLUMN: Reviews and Feedback Section */}
        {/* Reviews Section */}
        <div className="lg:col-span-2 min-w-0">
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Customer Reviews</h3>
                <p className="text-sm text-muted-foreground">What your customers are saying</p>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-success/10 px-4 py-2">
                <CheckCircle className="h-4 w-4 text-success" />
                <span className="text-sm font-medium text-success">
                  {reviews.filter(r => r.rating >= 4).length} positive reviews
                </span>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger className="w-[140px]"><SelectValue placeholder="Sort by Date" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                </SelectContent>
              </Select>
              <Select value={ratingFilter} onValueChange={setRatingFilter}>
                <SelectTrigger className="w-[140px]"><SelectValue placeholder="Rating" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ratings</SelectItem>
                  <SelectItem value="5">5 Stars</SelectItem>
                  <SelectItem value="4">4 Stars</SelectItem>
                  <SelectItem value="3">3 Stars</SelectItem>
                  <SelectItem value="2">2 Stars</SelectItem>
                  <SelectItem value="1">1 Star</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="mt-6 space-y-4">
              {reviewsLoading ? (
                <p className="text-muted-foreground text-sm">Loading reviews...</p>
              ) : filteredReviews.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No reviews yet.</p>
              ) : (
                filteredReviews.map((review) => (
                  <div key={review.id} className="rounded-xl border border-border bg-background p-5 transition-all hover:border-primary/20">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-sm font-semibold text-primary-foreground">
                          {(review.customerName || 'A').split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{review.customerName || 'Anonymous'}</p>
                          <p className="text-sm text-muted-foreground">{review.trip || review.packageName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'fill-warning text-warning' : 'text-muted-foreground/30'}`} />
                        ))}
                      </div>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-foreground/80">{review.comment}</p>
                    {review.imageUrls && review.imageUrls.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {review.imageUrls.map((url, idx) => (
                          <img
                            key={idx}
                            src={url}
                            alt={`Attachment ${idx + 1}`}
                            className="h-16 w-16 object-cover rounded-lg border border-border cursor-pointer transition-all hover:scale-105"
                            onClick={() => setSelectedImage(url)}
                          />
                        ))}
                      </div>
                    )}
                    <p className="mt-3 text-xs text-muted-foreground pb-4">
                      {review.date} {review.packageName && `• ${review.packageName}`}
                    </p>
                    {review.reply ? (
                      <div className="mt-2 ml-4 md:ml-8 rounded-lg bg-muted/40 p-4 border-l-2 border-primary">
                        <p className="text-xs font-semibold text-primary mb-1">You replied:</p>
                        <p className="text-sm text-foreground/80">{review.reply}</p>
                      </div>
                    ) : (
                      <div className="mt-2 pt-4 border-t border-border">
                        {activeReplyId === review.id ? (
                          <div className="space-y-3">
                            <Textarea
                              placeholder="Type your reply here..."
                              value={replyInputs[review.id] || ''}
                              onChange={e => setReplyInputs({ ...replyInputs, [review.id]: e.target.value })}
                              className="text-sm min-h-[80px]"
                            />
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="sm" onClick={() => setActiveReplyId(null)}>Cancel</Button>
                              <Button size="sm" onClick={() => handleSendReply(review.id)}>Send Reply</Button>
                            </div>
                          </div>
                        ) : (
                          <Button variant="ghost" size="sm" onClick={() => {
                            setActiveReplyId(review.id);
                            if (replyInputs[review.id] === undefined) {
                              setReplyInputs({ ...replyInputs, [review.id]: '' });
                            }
                          }} className="gap-2 text-muted-foreground hover:text-foreground">
                            <MessageCircle className="h-4 w-4" />Reply
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 transition-all duration-300 backdrop-blur-sm"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative w-[65vw] max-w-5xl">
            <button 
              className="absolute -top-12 right-0 text-white/80 hover:text-white transition-colors p-2"
              onClick={() => setSelectedImage(null)}
            >
              <X className="h-8 w-8" />
            </button>
            <img 
              src={selectedImage} 
              alt="Enlarged view" 
              className="w-full h-auto max-h-[85vh] object-contain rounded-xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Profile;
