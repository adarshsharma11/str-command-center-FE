import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { CrewMember } from '@/types';

interface EditMemberDialogProps {
  member: CrewMember | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (member: CrewMember) => void;
  mode?: 'create' | 'edit';
}

export function EditMemberDialog({ member, open, onOpenChange, onSave, mode = 'edit' }: EditMemberDialogProps) {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Reset form when member changes or dialog opens
  useEffect(() => {
    if (open) {
      if (mode === 'edit' && member) {
        setName(member.name);
        setRole(member.role);
        setEmail(member.contactInfo.email);
        setPhone(member.contactInfo.phone);
      } else {
        setName('');
        setRole('');
        setEmail('');
        setPhone('');
      }
    }
  }, [member, open, mode]);

  const handleSave = () => {
    const memberId = member?.id || `new-${Date.now()}`;
    const memberOrder = member?.order || 0;
    
    onSave({
      id: memberId,
      name,
      role,
      order: memberOrder,
      contactInfo: { email, phone },
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Add New Contact' : 'Edit Contact'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contact name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Input
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g., Lead Cleaning"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contact@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1-555-0000"
            />
          </div>
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSave} className="flex-1">
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
