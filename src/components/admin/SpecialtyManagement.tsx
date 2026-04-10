import { useState, useEffect } from 'react';
import { getSpecialties, createSpecialty, deleteSpecialty as deleteSpec, updateSpecialty } from '@/lib/localStorage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface Specialty {
  id: string;
  name: string;
  is_active: boolean;
}

export default function SpecialtyManagement() {
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [newSpecialty, setNewSpecialty] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadSpecialties(); }, []);

  const loadSpecialties = () => { setSpecialties(getSpecialties()); };

  const addSpecialty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSpecialty.trim()) { toast.error('Please enter a specialty name'); return; }
    createSpecialty(newSpecialty.trim());
    toast.success('Specialty added successfully');
    setNewSpecialty('');
    loadSpecialties();
  };

  const handleDelete = (id: string) => {
    deleteSpec(id);
    toast.success('Specialty deleted successfully');
    loadSpecialties();
  };

  const toggleActive = (id: string, currentStatus: boolean) => {
    updateSpecialty(id, { is_active: !currentStatus });
    toast.success(`Specialty ${!currentStatus ? 'activated' : 'deactivated'}`);
    loadSpecialties();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Specialties</CardTitle>
        <CardDescription>Add, remove, or deactivate installer specialties</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={addSpecialty} className="flex gap-2">
          <Input value={newSpecialty} onChange={(e) => setNewSpecialty(e.target.value)} placeholder="Enter new specialty" />
          <Button type="submit"><Plus className="h-4 w-4 mr-2" />Add</Button>
        </form>
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Current Specialties</h3>
          <div className="flex flex-wrap gap-2">
            {specialties.map((specialty) => (
              <div key={specialty.id} className="flex items-center gap-2">
                <Badge variant={specialty.is_active ? 'default' : 'secondary'} className="cursor-pointer" onClick={() => toggleActive(specialty.id, specialty.is_active)}>
                  {specialty.name}{!specialty.is_active && ' (Inactive)'}
                </Badge>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6"><Trash2 className="h-3 w-3 text-destructive" /></Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Specialty</AlertDialogTitle>
                      <AlertDialogDescription>Are you sure you want to delete "{specialty.name}"? This action cannot be undone.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(specialty.id)}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
