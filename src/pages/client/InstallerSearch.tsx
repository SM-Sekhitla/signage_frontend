import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getInstallersWithSpecialties, createBooking } from '@/lib/localStorage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { MapPin, Briefcase } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

const PROVINCES = ['All Provinces', 'Western Cape', 'Eastern Cape', 'Northern Cape', 'Free State', 'KwaZulu-Natal', 'North West', 'Gauteng', 'Limpopo', 'Mpumalanga'];

export default function InstallerSearch() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [installers, setInstallers] = useState<any[]>([]);
  const [filteredInstallers, setFilteredInstallers] = useState<any[]>([]);
  const [selectedProvince, setSelectedProvince] = useState('All Provinces');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInstaller, setSelectedInstaller] = useState<any>(null);
  const [bookingForm, setBookingForm] = useState({ project_title: '', project_description: '', preferred_date: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) { navigate('/auth/login'); return; }
    setInstallers(getInstallersWithSpecialties());
  }, [user]);

  useEffect(() => {
    let filtered = installers;
    if (selectedProvince !== 'All Provinces') filtered = filtered.filter(i => i.province === selectedProvince);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(i => i.full_name?.toLowerCase().includes(q) || i.company_name?.toLowerCase().includes(q) || i.specialties.some((s: string) => s.toLowerCase().includes(q)));
    }
    setFilteredInstallers(filtered);
  }, [selectedProvince, searchQuery, installers]);

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInstaller || !user) return;
    setLoading(true);
    createBooking({
      client_id: user.id,
      installer_id: selectedInstaller.id,
      project_title: bookingForm.project_title,
      project_description: bookingForm.project_description,
      province: selectedInstaller.province,
      start_date: bookingForm.preferred_date || format(new Date(), 'yyyy-MM-dd'),
      end_date: null,
    });
    toast.success('Quote request sent successfully!');
    setBookingForm({ project_title: '', project_description: '', preferred_date: '' });
    setSelectedInstaller(null);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card"><div className="container mx-auto px-4 py-4"><h1 className="text-2xl font-bold">Find Solar Installers</h1></div></header>
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Search Filters</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Province</Label>
                  <Select value={selectedProvince} onValueChange={setSelectedProvince}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{PROVINCES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Search</Label>
                  <Input placeholder="Search by name, company, or specialty..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInstallers.map(installer => (
              <Card key={installer.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{installer.full_name}</CardTitle>
                      {installer.company_name && <CardDescription>{installer.company_name}</CardDescription>}
                    </div>
                    {installer.profile_photo && <img src={installer.profile_photo} alt={installer.full_name} className="w-12 h-12 rounded-full object-cover" />}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="h-4 w-4" />{installer.province}</div>
                  {installer.bio && <p className="text-sm text-muted-foreground line-clamp-2">{installer.bio}</p>}
                  <div className="flex flex-wrap gap-2">
                    {installer.specialties.slice(0, 3).map((s: string) => <Badge key={s} variant="secondary">{s}</Badge>)}
                    {installer.specialties.length > 3 && <Badge variant="outline">+{installer.specialties.length - 3}</Badge>}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground"><Briefcase className="h-4 w-4" />{installer.portfolio_count} portfolio items</div>
                  <Dialog>
                    <DialogTrigger asChild><Button className="w-full" onClick={() => setSelectedInstaller(installer)}>Request Quote</Button></DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Request Quote from {installer.full_name}</DialogTitle>
                        <DialogDescription>Fill in your project details to request a quote</DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleBookingSubmit} className="space-y-4">
                        <div className="space-y-2"><Label htmlFor="project_title">Project Title *</Label><Input id="project_title" required value={bookingForm.project_title} onChange={(e) => setBookingForm({ ...bookingForm, project_title: e.target.value })} placeholder="e.g., Residential Solar Installation" /></div>
                        <div className="space-y-2"><Label htmlFor="project_description">Project Description</Label><Textarea id="project_description" value={bookingForm.project_description} onChange={(e) => setBookingForm({ ...bookingForm, project_description: e.target.value })} placeholder="Describe your project requirements..." rows={4} /></div>
                        <div className="space-y-2"><Label htmlFor="preferred_date">Preferred Start Date</Label><Input id="preferred_date" type="date" value={bookingForm.preferred_date} onChange={(e) => setBookingForm({ ...bookingForm, preferred_date: e.target.value })} /></div>
                        <Button type="submit" disabled={loading} className="w-full">{loading ? 'Sending...' : 'Send Quote Request'}</Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredInstallers.length === 0 && (
            <Card><CardContent className="py-8 text-center text-muted-foreground">No installers found matching your criteria</CardContent></Card>
          )}
        </div>
      </main>
    </div>
  );
}
