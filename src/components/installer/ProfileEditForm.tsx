import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getProfile, updateProfile, storeFile } from '@/lib/localStorage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const PROVINCES = [
  'Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal',
  'Limpopo', 'Mpumalanga', 'Northern Cape', 'North West', 'Western Cape'
];

export default function ProfileEditForm() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    contact_number: '',
    province: '',
    company_name: '',
    bio: '',
    profile_photo: '',
    company_logo: ''
  });

  useEffect(() => {
    if (user) {
      const profile = getProfile(user.id);
      if (profile) {
        setFormData({
          full_name: profile.full_name || '',
          contact_number: profile.contact_number || '',
          province: profile.province || '',
          company_name: profile.company_name || '',
          bio: profile.bio || '',
          profile_photo: profile.profile_photo || '',
          company_logo: profile.company_logo || ''
        });
      }
    }
  }, [user]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'logo') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await storeFile(file);
      setFormData(prev => ({
        ...prev,
        [type === 'profile' ? 'profile_photo' : 'company_logo']: url
      }));
      toast.success(`${type === 'profile' ? 'Profile photo' : 'Company logo'} uploaded`);
    } catch (error: any) {
      toast.error(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = updateProfile(user.id, formData);
      if (error) throw new Error(error);
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>Update your profile details and company information</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="profile_photo">Profile Photo</Label>
              {formData.profile_photo && (
                <img src={formData.profile_photo} alt="Profile" className="w-32 h-32 rounded-full object-cover mb-2" />
              )}
              <Input id="profile_photo" type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'profile')} disabled={uploading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company_logo">Company Logo</Label>
              {formData.company_logo && (
                <img src={formData.company_logo} alt="Company" className="w-32 h-32 object-contain mb-2" />
              )}
              <Input id="company_logo" type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'logo')} disabled={uploading} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name *</Label>
              <Input id="full_name" value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_number">Contact Number</Label>
              <Input id="contact_number" type="tel" value={formData.contact_number} onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="company_name">Company Name</Label>
              <Input id="company_name" value={formData.company_name} onChange={(e) => setFormData({ ...formData, company_name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="province">Province</Label>
              <Select value={formData.province} onValueChange={(value) => setFormData({ ...formData, province: value })}>
                <SelectTrigger><SelectValue placeholder="Select province" /></SelectTrigger>
                <SelectContent>
                  {PROVINCES.map(province => (<SelectItem key={province} value={province}>{province}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} placeholder="Tell clients about your experience and services..." rows={4} />
          </div>

          <Button type="submit" disabled={loading || uploading} className="w-full">
            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : 'Save Profile'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
