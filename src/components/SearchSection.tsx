import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getSpecialties } from "@/lib/localStorage";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

const provinces = [
  "Gauteng", "Western Cape", "KwaZulu-Natal", "Eastern Cape",
  "Free State", "Limpopo", "Mpumalanga", "Northern Cape", "North West",
];

const SearchSection = () => {
  const navigate = useNavigate();
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedSignageType, setSelectedSignageType] = useState("");
  const [signageTypes, setSignageTypes] = useState<string[]>([]);

  useEffect(() => {
    setSignageTypes(getSpecialties(true).map(s => s.name));
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (selectedProvince) params.append('province', selectedProvince);
    if (selectedSignageType) params.append('type', selectedSignageType);
    navigate(`/installers?${params.toString()}`);
  };

  return (
    <section className="py-16 bg-gradient-silver">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Find Your Perfect Installer</h2>
            <p className="text-muted-foreground text-lg">Search by location and signage specialty to connect with verified professionals</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Province</label>
                <Select value={selectedProvince} onValueChange={setSelectedProvince}>
                  <SelectTrigger className="w-full h-12 border-2 border-input focus:border-accent"><SelectValue placeholder="Select province" /></SelectTrigger>
                  <SelectContent>{provinces.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Signage Type</label>
                <Select value={selectedSignageType} onValueChange={setSelectedSignageType}>
                  <SelectTrigger className="w-full h-12 border-2 border-input focus:border-accent"><SelectValue placeholder="Select signage type" /></SelectTrigger>
                  <SelectContent>{signageTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <Button variant="secondary" size="lg" className="w-full" onClick={handleSearch}><Search className="mr-2" />Search Installers</Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SearchSection;
