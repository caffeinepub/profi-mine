import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent } from '@/components/ui/card';
import { useSaveCallerUserProfile } from '../../hooks/useQueries';
import { toast } from 'sonner';
import type { UserProfile, SubscriptionTier } from '../../backend';
import { Check } from 'lucide-react';

export default function ProfileSetupModal() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [organization, setOrganization] = useState('');
  const [selectedTier, setSelectedTier] = useState<'free' | 'premium'>('free');
  const saveProfile = useSaveCallerUserProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Please enter your name');
      return;
    }

    try {
      const tier: SubscriptionTier = selectedTier === 'free' 
        ? { __kind__: 'free', free: { MAX_OPERATIONS_PDF_AND_CSV: BigInt(2), CSV_AND_PDF_COMBINED_MAX: BigInt(2) } }
        : { __kind__: 'premium', premium: { MAX_OPERATIONS_PDF_AND_CSV: BigInt(300), CSV_AND_PDF_COMBINED_MAX: BigInt(1000) } };

      const newProfile: UserProfile = {
        name: name.trim(),
        email: email.trim() || undefined,
        organization: organization.trim() || undefined,
        tier,
        modelsCreatedAnnual: BigInt(0),
        exportsRemainingAnnual: selectedTier === 'free' ? BigInt(2) : BigInt(1000),
        lastResetTimestamp: BigInt(Date.now() * 1000000),
        romUsageCount: BigInt(0),
      };

      await saveProfile.mutateAsync(newProfile);
      toast.success('Profile created successfully!');
    } catch (error) {
      toast.error('Failed to create profile');
      console.error(error);
    }
  };

  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Welcome to ProFi Mine!</DialogTitle>
          <DialogDescription>
            Please set up your profile and choose your subscription tier to get started.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email (optional)</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="organization">Organization (optional)</Label>
              <Input
                id="organization"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="Your company or organization"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label>Choose Your Subscription Tier *</Label>
            <RadioGroup value={selectedTier} onValueChange={(value) => setSelectedTier(value as 'free' | 'premium')}>
              <Card className={`cursor-pointer transition-all ${selectedTier === 'free' ? 'border-primary ring-2 ring-primary' : 'border-border'}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <RadioGroupItem value="free" id="free" className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor="free" className="cursor-pointer">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-lg font-semibold">Free Tier</span>
                          <span className="text-2xl font-bold">$0<span className="text-sm text-muted-foreground">/year</span></span>
                        </div>
                        <ul className="space-y-1.5 text-sm text-muted-foreground">
                          <li className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                            <span>3 models per year</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                            <span>2 total CSV exports</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                            <span>All calculation features</span>
                          </li>
                        </ul>
                      </Label>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className={`cursor-pointer transition-all ${selectedTier === 'premium' ? 'border-primary ring-2 ring-primary' : 'border-border'}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <RadioGroupItem value="premium" id="premium" className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor="premium" className="cursor-pointer">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-lg font-semibold">Premium Tier</span>
                          <span className="text-2xl font-bold">$235<span className="text-sm text-muted-foreground">/year</span></span>
                        </div>
                        <ul className="space-y-1.5 text-sm text-muted-foreground">
                          <li className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                            <span>300 models per year</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                            <span>Unlimited CSV exports</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                            <span>All calculation features</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                            <span>Priority email support</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                            <span>Advanced sensitivity analysis</span>
                          </li>
                        </ul>
                      </Label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </RadioGroup>
          </div>

          <Button type="submit" className="w-full" disabled={saveProfile.isPending}>
            {saveProfile.isPending ? 'Creating Profile...' : 'Create Profile'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
