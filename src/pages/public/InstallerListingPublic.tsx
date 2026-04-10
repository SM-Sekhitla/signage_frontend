import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getInstallersWithSpecialties, getSpecialties } from '@/lib/localStorage';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MapPin } from 'lucide-react';
import Header from '@/components/Header';

const PROVINCES = ['All Provinces', 'Western Cape', 'Eastern Cape', 'Northern Cape', 'Free State', 'KwaZulu-Natal', 'North West', 'Gauteng', 'Limpopo', 'Mpumalanga'];

export default function InstallerListingPublic() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [installers, setInstallers] = useState<any[]>([]);
  const [filteredInstallers, setFilteredInstallers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('All Provinces');
  const [selectedType, setSelectedType] = useState('All Types');
  const [signageTypes, setSignageTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const specs = getSpecialties(true);
    setSignageTypes(['All Types', ...specs.map(s => s.name)]);
    
    const allInstallers = getInstallersWithSpecialties();
    setInstallers(allInstallers);
    setLoading(false);

    const provinceParam = searchParams.get('province');
    const typeParam = searchParams.get('type');
    if (provinceParam) setSelectedProvince(provinceParam);
    if (typeParam) setSelectedType(typeParam);
  }, []);

  useEffect(() => {
    let filtered = installers;
    if (selectedProvince !== 'All Provinces') filtered = filtered.filter(i => i.province === selectedProvince);
    if (selectedType !== 'All Types') filtered = filtered.filter(i => i.specialties.includes(selectedType));
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(i => i.full_name?.toLowerCase().includes(q) || i.company_name?.toLowerCase().includes(q) || i.specialties.some((s: string) => s.toLowerCase().includes(q)));
    }
    setFilteredInstallers(filtered);
  }, [installers, searchQuery, selectedProvince, selectedType]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header hideNavLinks />
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Find an Installer</h1>
            <p className="text-muted-foreground mt-2">Showing {filteredInstallers.length} of {installers.length} installers</p>
          </div>

          <div className="grid lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <Card>
                <CardContent className="p-6 space-y-4">
                  <div><h3 className="font-semibold mb-3">Search</h3><Input placeholder="Search by name or specialty..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div>
                  <div>
                    <h3 className="font-semibold mb-3">Province</h3>
                    <Select value={selectedProvince} onValueChange={setSelectedProvince}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{PROVINCES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-3">Signage Type</h3>
                    <Select value={selectedType} onValueChange={setSelectedType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{signageTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select>
                  </div>
                  <Button variant="outline" className="w-full" onClick={() => { setSearchQuery(''); setSelectedProvince('All Provinces'); setSelectedType('All Types'); }}>Clear Filters</Button>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-3">
              {loading ? (
                <div className="text-center py-12"><p className="text-muted-foreground">Loading installers...</p></div>
              ) : filteredInstallers.length === 0 ? (
                <Card><CardContent className="py-12 text-center"><p className="text-muted-foreground">No installers found matching your criteria</p></CardContent></Card>
              ) : (
                <div className="space-y-4">
                  {filteredInstallers.map((installer) => (
                    <Card key={installer.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <Avatar className="h-16 w-16 border-4 border-primary/20">
                            <AvatarImage src={installer.profile_photo || ''} />
                            <AvatarFallback className="bg-primary text-primary-foreground text-xl">{installer.full_name?.charAt(0) || 'I'}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="text-xl font-semibold">{installer.full_name}</h3>
                                {installer.company_name && <p className="text-muted-foreground">{installer.company_name}</p>}
                              </div>
                              <Button onClick={() => navigate(`/installers/${installer.id}`)}>View Profile & Availability</Button>
                            </div>
                            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground"><MapPin className="h-4 w-4" />{installer.province || 'Province not specified'}</div>
                            {installer.specialties.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-3">{installer.specialties.map((s: string, i: number) => <Badge key={i} variant="secondary">{s}</Badge>)}</div>
                            )}
                            {installer.bio && <p className="text-sm text-muted-foreground mt-3 line-clamp-2">{installer.bio}</p>}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
