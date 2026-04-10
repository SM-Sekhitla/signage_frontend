import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getInstallerSpecialties, addInstallerSpecialty, removeInstallerSpecialty, getSpecialties } from '@/lib/localStorage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { X } from 'lucide-react';

export default function SpecialtyManager() {
  const { user } = useAuth();
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [availableSpecialties, setAvailableSpecialties] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setSpecialties(getInstallerSpecialties(user.id).map(s => s.specialty));
      setAvailableSpecialties(getSpecialties(true).map(s => s.name));
    }
  }, [user]);

  const handleAdd = (specialty: string) => {
    if (!user) return;
    if (specialties.includes(specialty)) { toast.error('Specialty already added'); return; }
    const { error } = addInstallerSpecialty(user.id, specialty);
    if (error) { toast.error(error); return; }
    setSpecialties([...specialties, specialty]);
    toast.success('Specialty added');
  };

  const handleRemove = (specialty: string) => {
    if (!user) return;
    removeInstallerSpecialty(user.id, specialty);
    setSpecialties(specialties.filter(s => s !== specialty));
    toast.success('Specialty removed');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Specialties</CardTitle>
        <CardDescription>Select your areas of expertise</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {specialties.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {specialties.map(specialty => (
              <Badge key={specialty} variant="secondary" className="text-sm">
                {specialty}
                <button onClick={() => handleRemove(specialty)} className="ml-2 hover:text-destructive">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
        <div className="space-y-2">
          <p className="text-sm font-medium">Available Specialties:</p>
          <div className="flex flex-wrap gap-2">
            {availableSpecialties.filter(s => !specialties.includes(s)).map(specialty => (
              <Button key={specialty} variant="outline" size="sm" onClick={() => handleAdd(specialty)}>
                + {specialty}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
