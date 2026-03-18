// Added by Agent 2
import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  useServiceCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} from '@/lib/api/dispatch';
import type { ServiceCategory } from '@/types/dispatch';

type FormData = {
  category_name: string;
  time: string;
  status: boolean;
  price: string;
  email: string;
  phone: string;
};

const emptyForm: FormData = {
  category_name: '',
  time: '',
  status: true,
  price: '',
  email: '',
  phone: '',
};

export function ServiceCategoryManager() {
  const { toast } = useToast();
  const { data, isLoading } = useServiceCategoriesQuery();
  const createMutation = useCreateCategoryMutation();
  const updateMutation = useUpdateCategoryMutation();
  const deleteMutation = useDeleteCategoryMutation();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);

  const categories: ServiceCategory[] = data?.data || [];

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (cat: ServiceCategory) => {
    setEditingId(cat.id);
    setForm({
      category_name: cat.category_name,
      time: cat.time,
      status: cat.status,
      price: cat.price,
      email: cat.email,
      phone: String(cat.phone),
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const payload = {
      ...form,
      phone: Number(form.phone) || 0,
    };

    try {
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, data: payload });
        toast({ title: 'Category updated' });
      } else {
        await createMutation.mutateAsync(payload as Omit<ServiceCategory, 'id'>);
        toast({ title: 'Category created' });
      }
      setDialogOpen(false);
    } catch (err) {
      toast({
        title: 'Error',
        description: (err as Error).message,
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast({ title: 'Category deleted' });
    } catch (err) {
      toast({
        title: 'Error',
        description: (err as Error).message,
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-12 rounded bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          {categories.length} service categories configured
        </p>
        <Button size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4 mr-1" />
          Add Category
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((cat) => (
              <TableRow key={cat.id}>
                <TableCell className="font-medium">
                  {cat.category_name}
                </TableCell>
                <TableCell>{cat.time || '—'}</TableCell>
                <TableCell>{cat.price ? `$${cat.price}` : '—'}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {cat.email || '—'}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      cat.status
                        ? 'bg-green-100 text-green-800 border-green-200'
                        : 'bg-gray-100 text-gray-600 border-gray-200'
                    }
                  >
                    {cat.status ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => openEdit(cat)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => handleDelete(cat.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {categories.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-muted-foreground"
                >
                  No service categories configured
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Edit Category' : 'New Service Category'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Service Name</Label>
              <Input
                value={form.category_name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, category_name: e.target.value }))
                }
                placeholder="e.g. Private Chef"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Time</Label>
                <Input
                  value={form.time}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, time: e.target.value }))
                  }
                  placeholder="e.g. 2 hours"
                />
              </div>
              <div className="space-y-2">
                <Label>Price</Label>
                <Input
                  value={form.price}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, price: e.target.value }))
                  }
                  placeholder="e.g. 250"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
                placeholder="provider@email.com"
              />
            </div>

            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                type="tel"
                value={form.phone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, phone: e.target.value }))
                }
                placeholder="Phone number"
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={form.status}
                onCheckedChange={(val) =>
                  setForm((f) => ({ ...f, status: val }))
                }
              />
              <Label>Active</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={
                !form.category_name ||
                createMutation.isPending ||
                updateMutation.isPending
              }
            >
              {editingId ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
