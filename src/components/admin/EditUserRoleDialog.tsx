import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useUpdateUserRole } from '@/hooks/useUserRoles';
import { UserActivity } from '@/types/database';
import { RoleType } from '@/types/database';

interface EditUserRoleDialogProps {
  user: UserActivity;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditUserRoleDialog({ user, open, onOpenChange }: EditUserRoleDialogProps) {
  const [selectedRole, setSelectedRole] = useState<RoleType>(user.role || 'client');
  const updateRole = useUpdateUserRole();

  useEffect(() => {
    setSelectedRole(user.role || 'client');
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateRole.mutateAsync({
        userId: user.user_id,
        role: selectedRole,
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit User Role</DialogTitle>
          <DialogDescription>
            Change the role for {user.email}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-3">
              <Label>Role</Label>
              <RadioGroup
                value={selectedRole}
                onValueChange={(value) => setSelectedRole(value as RoleType)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="client" id="client" />
                  <Label htmlFor="client" className="font-normal cursor-pointer">
                    Client - Limited access to assigned galleries
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="admin" id="admin" />
                  <Label htmlFor="admin" className="font-normal cursor-pointer">
                    Admin - Full access to all galleries and settings
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateRole.isPending}>
              Update Role
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
