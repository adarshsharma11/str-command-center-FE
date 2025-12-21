import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { CrewMember } from '@/types';

const memberSchema = yup.object({
  name: yup.string().required('Name is required').min(2, 'Name must be at least 2 characters'),
  role: yup.string().required('Role is required').min(2, 'Role must be at least 2 characters'),
  email: yup.string().email('Please enter a valid email address').required('Email is required'),
  phone: yup.string().required('Phone number is required').min(10, 'Phone number must be at least 10 characters'),
});

type MemberFormData = yup.InferType<typeof memberSchema>;

interface EditMemberDialogProps {
  member: CrewMember | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (member: CrewMember) => void;
  mode?: 'create' | 'edit';
}

export function EditMemberDialog({ member, open, onOpenChange, onSave, mode = 'edit' }: EditMemberDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MemberFormData>({
    resolver: yupResolver(memberSchema),
    defaultValues: {
      name: '',
      role: '',
      email: '',
      phone: '',
    },
  });

  // Reset form when member changes or dialog opens
  useEffect(() => {
    if (open) {
      if (mode === 'edit' && member) {
        reset({
          name: member.name,
          role: member.role,
          email: member.contactInfo.email,
          phone: member.contactInfo.phone,
        });
      } else {
        reset({
          name: '',
          role: '',
          email: '',
          phone: '',
        });
      }
    }
  }, [member, open, mode, reset]);

  const handleSave = (data: MemberFormData) => {
    const memberId = member?.id || `new-${Date.now()}`;
    const memberOrder = member?.order || 0;
    
    onSave({
      id: memberId,
      name: data.name,
      role: data.role,
      order: memberOrder,
      contactInfo: { email: data.email, phone: data.phone },
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Add New Contact' : 'Edit Contact'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleSave)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Contact name"
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Input
              id="role"
              {...register('role')}
              placeholder="e.g., Lead Cleaning"
              className={errors.role ? 'border-destructive' : ''}
            />
            {errors.role && (
              <p className="text-sm text-destructive">{errors.role.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="contact@example.com"
              className={errors.email ? 'border-destructive' : ''}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              {...register('phone')}
              placeholder="+1-555-0000"
              className={errors.phone ? 'border-destructive' : ''}
            />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone.message}</p>
            )}
          </div>
          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
