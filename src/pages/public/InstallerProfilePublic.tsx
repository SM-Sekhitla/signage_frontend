import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProfile, getInstallerSpecialties, getPortfolioItems, getInstallerAvailability, createBooking, storeFile } from '@/lib/localStorage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { BookingCalendar } from '@/components/ui/booking-calendar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AddressAutocomplete } from '@/components/ui/address-autocomplete';
import { MapPin, Phone, Building, ArrowLeft, Calendar as CalendarIcon, Upload, FileText, Download } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function InstallerProfilePublic() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, userRole } = useAuth();
  const [installer, setInstaller] = useState<any>(null);
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [unavailableDates, setUnavailableDates] = useState<Date[]>([]);
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined } | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [quoteForm, setQuoteForm] = useState({ project_title: '', project_description: '', address: '' });
  const [documents, setDocuments] = useState({ work_order: null as File | null, drawings: null as File | null, purchase_order: null as File | null });

  useEffect(() => {
    if (id) {
      const profile = getProfile(id);
      setInstaller(profile);
      setSpecialties(getInstallerSpecialties(id).map(s => s.specialty));
      setPortfolio(getPortfolioItems(id));
      const avail = getInstallerAvailability(id);
      setUnavailableDates(avail.filter(a => !a.is_available).map(a => new Date(a.date)));
      setLoading(false);
    }
  }, [id]);

  const handleQuoteSubmit = async () => {
    if (!user) { toast.error('Please sign in to request a quote'); navigate('/auth/login'); return; }
    if (userRole !== 'client') { toast.error('Only clients can request quotes'); return; }
    if (!quoteForm.project_title || !quoteForm.address) { toast.error('Please fill in project title and address'); return; }
    if (!documents.work_order || !documents.drawings || !documents.purchase_order) { toast.error('Please upload all required documents'); return; }

    setUploading(true);
    try {
      const workOrderUrl = await storeFile(documents.work_order);
      const drawingsUrl = await storeFile(documents.drawings);
      const purchaseOrderUrl = await storeFile(documents.purchase_order);

      createBooking({
        client_id: user.id,
        installer_id: id,
        project_title: quoteForm.project_title,
        project_description: quoteForm.project_description,
        address: quoteForm.address,
        province: '',
        start_date: dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
        end_date: dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : null,
        work_order_url: workOrderUrl,
        drawings_url: drawingsUrl,
        purchase_order_url: purchaseOrderUrl,
      });

      toast.success('Quote request sent successfully!');
      setDialogOpen(false);
      setQuoteForm({ project_title: '', project_description: '', address: '' });
      setDocuments({ work_order: null, drawings: null, purchase_order: null });
      setDateRange(undefined);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (<div className="min-h-screen flex flex-col"><Header /><div className="flex-1 flex items-center justify-center"><p className="text-muted-foreground">Loading...</p></div><Footer /></div>);
  }

  if (!installer) {
    return (<div className="min-h-screen flex flex-col"><Header /><div className="flex-1 flex items-center justify-center"><p className="text-muted-foreground">Installer not found</p></div><Footer /></div>);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <Button variant="ghost" onClick={() => navigate('/installers')} className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />Back to Installers
          </Button>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <Avatar className="h-32 w-32 border-4 border-primary/20 mb-4">
                      <AvatarImage src={installer.profile_photo || ''} />
                      <AvatarFallback className="text-4xl bg-primary text-primary-foreground">{installer.full_name?.charAt(0) || 'I'}</AvatarFallback>
                    </Avatar>
                    <h2 className="text-2xl font-bold">{installer.full_name}</h2>
                    {installer.company_name && <p className="text-muted-foreground">{installer.company_name}</p>}
                  </div>

                  <div className="space-y-3 mt-6">
                    {installer.province && <div className="flex items-center gap-2 text-sm"><MapPin className="h-4 w-4 text-muted-foreground" /><span>{installer.province}</span></div>}
                    {installer.contact_number && <div className="flex items-center gap-2 text-sm"><Phone className="h-4 w-4 text-muted-foreground" /><span>{installer.contact_number}</span></div>}
                    {installer.company_name && <div className="flex items-center gap-2 text-sm"><Building className="h-4 w-4 text-muted-foreground" /><span>{installer.company_name}</span></div>}
                  </div>

                  {installer.bio && <div className="mt-6"><h3 className="font-semibold mb-2">About</h3><p className="text-sm text-muted-foreground">{installer.bio}</p></div>}

                  {specialties.length > 0 && (
                    <div className="mt-6">
                      <h3 className="font-semibold mb-2">Specialties</h3>
                      <div className="flex flex-wrap gap-2">{specialties.map((s, i) => <Badge key={i} variant="secondary">{s}</Badge>)}</div>
                    </div>
                  )}

                  {installer.company_portfolio_url && (
                    <div className="mt-6">
                      <h3 className="font-semibold mb-2">Company Portfolio</h3>
                      <a href={installer.company_portfolio_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
                        <FileText className="h-4 w-4" />View Portfolio Document
                      </a>
                      <Button variant="outline" size="sm" className="ml-2" asChild>
                        <a href={installer.company_portfolio_url} download target="_blank" rel="noopener noreferrer"><Download className="h-4 w-4 mr-1" />Download</a>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><CalendarIcon className="h-5 w-5" />Select Booking Dates</CardTitle>
                  <p className="text-sm text-muted-foreground mt-2">Select a start date, or click another date to set an end date</p>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col space-y-6">
                    <div className="w-full border rounded-lg overflow-hidden">
                      <BookingCalendar
                        mode="range"
                        selected={dateRange}
                        onSelect={(range) => setDateRange(range as any)}
                        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                        unavailableDates={unavailableDates}
                        className="w-full"
                      />
                    </div>
                    <Dialog open={dialogOpen} onOpenChange={(open) => {
                      if (open && !user) { toast.info('Please sign in to request a quote'); navigate('/auth/login'); return; }
                      setDialogOpen(open);
                    }}>
                      <DialogTrigger asChild>
                        <Button size="sm" className="w-auto px-6">{user ? 'Get Quote' : 'Sign in to Get Quote'}</Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Request a Quote</DialogTitle>
                          <DialogDescription>Fill in your project details to request a quote from {installer.full_name}</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div><Label htmlFor="title">Project Title *</Label><Input id="title" value={quoteForm.project_title} onChange={(e) => setQuoteForm({ ...quoteForm, project_title: e.target.value })} placeholder="e.g., Storefront Signage Installation" /></div>
                          <div><Label htmlFor="description">Project Description</Label><Textarea id="description" value={quoteForm.project_description} onChange={(e) => setQuoteForm({ ...quoteForm, project_description: e.target.value })} placeholder="Describe your project..." rows={3} /></div>
                          <div><Label htmlFor="address">Installation Address *</Label><AddressAutocomplete id="address" value={quoteForm.address} onChange={(address) => setQuoteForm({ ...quoteForm, address })} placeholder="Start typing to search for an address..." /></div>
                          <div className="space-y-3">
                            <Label>Required Documents</Label>
                            <div className="space-y-2">
                              <Label htmlFor="work_order" className="text-sm font-normal">Work Order *</Label>
                              <Input id="work_order" type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" onChange={(e) => setDocuments({ ...documents, work_order: e.target.files?.[0] || null })} />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="drawings" className="text-sm font-normal">Drawings *</Label>
                              <Input id="drawings" type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.dwg" onChange={(e) => setDocuments({ ...documents, drawings: e.target.files?.[0] || null })} />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="purchase_order" className="text-sm font-normal">Purchase Order *</Label>
                              <Input id="purchase_order" type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" onChange={(e) => setDocuments({ ...documents, purchase_order: e.target.files?.[0] || null })} />
                            </div>
                          </div>
                          <Button onClick={handleQuoteSubmit} disabled={uploading} className="w-full">{uploading ? 'Sending...' : 'Send Quote Request'}</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>

              {portfolio.length > 0 && (
                <Card>
                  <CardHeader><CardTitle>Portfolio</CardTitle></CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {portfolio.map((item) => (
                        <div key={item.id} className="rounded-lg overflow-hidden border">
                          <img src={item.image_url} alt={item.title} className="w-full h-48 object-cover" />
                          <div className="p-3">
                            <h4 className="font-semibold">{item.title}</h4>
                            {item.description && <p className="text-sm text-muted-foreground mt-1">{item.description}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
