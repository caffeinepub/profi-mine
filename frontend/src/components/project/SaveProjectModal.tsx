import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useProject } from '../../contexts/ProjectContext';
import { toast } from 'sonner';
import { AlertCircle, Loader2 } from 'lucide-react';
import SubscriptionModal from '../subscription/SubscriptionModal';

interface SaveProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SaveProjectModal({ open, onOpenChange }: SaveProjectModalProps) {
  const { 
    projectName, 
    setProjectName, 
    saveProject, 
    subscriptionTier, 
    usageCount, 
    usageLimit,
    subscriptionLoading 
  } = useProject();
  const [name, setName] = useState(projectName || '');
  const [isSaving, setIsSaving] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Check if user has reached their limit
  const hasReachedLimit = usageCount >= usageLimit;

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Please enter a project name');
      return;
    }

    // Check limit before attempting save
    if (hasReachedLimit) {
      setShowUpgradeModal(true);
      return;
    }

    setIsSaving(true);
    try {
      await saveProject(name.trim());
      setProjectName(name.trim());
      toast.success('Project saved successfully!');
      onOpenChange(false);
    } catch (error: any) {
      // Check if error is due to reaching limit
      if (error?.message?.includes('Monthly model limit reached')) {
        toast.error('You have reached your monthly model limit');
        setShowUpgradeModal(true);
      } else {
        toast.error('Failed to save project');
        console.error(error);
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Save Project</DialogTitle>
            <DialogDescription>
              Enter a name for your mining project to save all inputs and calculations.
            </DialogDescription>
          </DialogHeader>
          
          {subscriptionLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : hasReachedLimit ? (
            <div className="space-y-4 py-4">
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-destructive mb-1">Monthly Limit Reached</h4>
                  <p className="text-sm text-muted-foreground">
                    You've used all {usageLimit} models available in your {subscriptionTier} tier this month.
                    Upgrade to continue creating models.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Button onClick={() => setShowUpgradeModal(true)} className="w-full">
                  View Upgrade Options
                </Button>
                <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full">
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-4 py-4">
                <div className="bg-muted/50 rounded-lg p-3 border border-border">
                  <p className="text-xs text-muted-foreground mb-1">Usage this month</p>
                  <p className="text-sm font-medium">
                    {usageCount} / {usageLimit} models ({subscriptionTier} tier)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="projectName">Project Name</Label>
                  <Input
                    id="projectName"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Gold Mine Project 2026"
                    disabled={isSaving}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Project'
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <SubscriptionModal
        open={showUpgradeModal}
        onOpenChange={setShowUpgradeModal}
        currentTier={subscriptionTier}
        usageCount={usageCount}
        usageLimit={usageLimit}
      />
    </>
  );
}
