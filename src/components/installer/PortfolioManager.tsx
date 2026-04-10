import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getPortfolioItems, createPortfolioItem, updatePortfolioItem, deletePortfolioItem, storeFile } from '@/lib/localStorage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Loader2, Plus, Trash2 } from 'lucide-react';

interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  image_url: string;
}

export default function PortfolioManager() {
  const { user } = useAuth();
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  const [formData, setFormData] = useState({ title: '', description: '', image: null as File | null });

  useEffect(() => {
    if (user) setItems(getPortfolioItems(user.id));
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!editingItem && !formData.image) { toast.error('Please select an image'); return; }

    setUploading(true);
    try {
      let imageUrl = editingItem?.image_url || '';
      if (formData.image) {
        imageUrl = await storeFile(formData.image);
      }

      if (editingItem) {
        updatePortfolioItem(editingItem.id, { title: formData.title, description: formData.description, ...(imageUrl && { image_url: imageUrl }) });
        toast.success('Portfolio item updated');
      } else {
        createPortfolioItem({ installer_id: user.id, title: formData.title, description: formData.description, image_url: imageUrl });
        toast.success('Portfolio item added');
      }

      setFormData({ title: '', description: '', image: null });
      setEditingItem(null);
      setOpen(false);
      setItems(getPortfolioItems(user.id));
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (item: PortfolioItem) => {
    setEditingItem(item);
    setFormData({ title: item.title, description: item.description, image: null });
    setOpen(true);
  };

  const handleDialogClose = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) { setEditingItem(null); setFormData({ title: '', description: '', image: null }); }
  };

  const handleDelete = (id: string) => {
    deletePortfolioItem(id);
    toast.success('Portfolio item deleted');
    if (user) setItems(getPortfolioItems(user.id));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Portfolio</CardTitle>
            <CardDescription>Showcase your completed projects</CardDescription>
          </div>
          <Dialog open={open} onOpenChange={handleDialogClose}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Add Project</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingItem ? 'Edit' : 'Add'} Portfolio Item</DialogTitle>
                <DialogDescription>{editingItem ? 'Update your project details' : 'Upload a completed project to your portfolio'}</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Project Title *</Label>
                  <Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image">Project Image {editingItem ? '(optional)' : '*'}</Label>
                  <Input id="image" type="file" accept="image/*" onChange={(e) => setFormData({ ...formData, image: e.target.files?.[0] || null })} required={!editingItem} />
                </div>
                <Button type="submit" disabled={uploading} className="w-full">
                  {uploading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Uploading...</> : editingItem ? 'Update Portfolio Item' : 'Add to Portfolio'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No portfolio items yet. Add your first project!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map(item => (
              <div key={item.id} className="relative group">
                <img src={item.image_url} alt={item.title} className="w-full h-48 object-cover rounded-lg" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex flex-col justify-between p-4">
                  <div>
                    <h3 className="text-white font-semibold">{item.title}</h3>
                    {item.description && <p className="text-white/80 text-sm mt-1">{item.description}</p>}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm" onClick={() => handleEdit(item)}>Edit</Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(item.id)}>
                      <Trash2 className="h-4 w-4 mr-2" />Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
