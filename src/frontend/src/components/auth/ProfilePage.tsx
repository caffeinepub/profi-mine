import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Pencil, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { UserProfile } from "../../backend";
import {
  useGetCallerUserProfile,
  useSaveCallerUserProfile,
} from "../../hooks/useQueries";

interface ProfilePageProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ProfilePage({ open, onOpenChange }: ProfilePageProps) {
  const { data: profile, isLoading } = useGetCallerUserProfile();
  const saveMutation = useSaveCallerUserProfile();

  const [isEditMode, setIsEditMode] = useState(false);
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formOrg, setFormOrg] = useState("");

  useEffect(() => {
    if (profile) {
      setFormName(profile.name ?? "");
      setFormEmail(profile.email ?? "");
      setFormOrg(profile.organization ?? "");
    }
  }, [profile]);

  const modelsCreated = profile ? Number(profile.modelsCreatedAnnual) : 0;

  function handleEdit() {
    if (profile) {
      setFormName(profile.name ?? "");
      setFormEmail(profile.email ?? "");
      setFormOrg(profile.organization ?? "");
    }
    setIsEditMode(true);
  }

  function handleCancel() {
    setIsEditMode(false);
  }

  async function handleSave() {
    if (!profile) return;
    if (!formName.trim()) {
      toast.error("Name is required.");
      return;
    }

    const updated: UserProfile = {
      ...profile,
      name: formName.trim(),
      email: formEmail.trim() || undefined,
      organization: formOrg.trim() || undefined,
    };

    try {
      await saveMutation.mutateAsync(updated);
      toast.success("Profile updated successfully!");
      setIsEditMode(false);
    } catch {
      toast.error("Failed to save profile. Please try again.");
    }
  }

  const avatarInitial = (profile?.name ?? "U")[0].toUpperCase();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <User className="w-5 h-5 text-muted-foreground" />
            My Profile
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div
            className="flex items-center justify-center py-12"
            data-ocid="profile.loading_state"
          >
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : !profile ? (
          <div
            className="text-center py-8 text-muted-foreground"
            data-ocid="profile.error_state"
          >
            No profile found. Please log in.
          </div>
        ) : !isEditMode ? (
          /* ── View Mode ── */
          <div data-ocid="profile.view.panel" className="space-y-5">
            {/* Avatar + Name */}
            <div className="flex flex-col items-center gap-3 pt-2">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[oklch(0.55_0.15_60)] to-[oklch(0.45_0.12_50)] flex items-center justify-center shadow-lg">
                <span className="text-3xl font-bold text-white">
                  {avatarInitial}
                </span>
              </div>
              <div className="text-center">
                <h2 className="text-xl font-bold text-foreground">
                  {profile.name}
                </h2>
                <Badge
                  className="mt-1 text-xs font-semibold bg-primary/10 text-primary border-primary/30"
                  variant="outline"
                >
                  Exploration Tier
                </Badge>
              </div>
            </div>

            {/* Profile Details */}
            <Card className="border-border bg-muted/20">
              <CardContent className="pt-4 space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground font-medium">
                    Email
                  </span>
                  <span className="text-foreground">
                    {profile.email ?? "Not provided"}
                  </span>
                </div>
                <div className="border-t border-border" />
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground font-medium">
                    Organization
                  </span>
                  <span className="text-foreground">
                    {profile.organization ?? "Not provided"}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Usage Stats */}
            <Card className="border-border bg-muted/20">
              <CardContent className="pt-4 space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Usage Statistics
                </p>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">ROM Edits</span>
                  <span className="text-foreground font-medium">Unlimited</span>
                </div>
                <div className="border-t border-border" />
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">
                    CSV Exports Remaining
                  </span>
                  <span className="text-foreground font-medium">Unlimited</span>
                </div>
                <div className="border-t border-border" />
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">
                    Models Created (this year)
                  </span>
                  <span className="text-foreground font-medium">
                    {modelsCreated}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Button
              data-ocid="profile.edit_button"
              onClick={handleEdit}
              className="w-full flex items-center gap-2"
              variant="outline"
            >
              <Pencil className="w-4 h-4" />
              Edit Profile
            </Button>
          </div>
        ) : (
          /* ── Edit Mode ── */
          <div data-ocid="profile.edit.panel" className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="profile-name"
                className="text-foreground font-medium"
              >
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="profile-name"
                data-ocid="profile.name.input"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Your full name"
                className="bg-muted/30 border-border"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="profile-email"
                className="text-foreground font-medium"
              >
                Email
              </Label>
              <Input
                id="profile-email"
                data-ocid="profile.email.input"
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                placeholder="your@email.com"
                className="bg-muted/30 border-border"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="profile-org"
                className="text-foreground font-medium"
              >
                Organization
              </Label>
              <Input
                id="profile-org"
                data-ocid="profile.organization.input"
                value={formOrg}
                onChange={(e) => setFormOrg(e.target.value)}
                placeholder="Your company or organization"
                className="bg-muted/30 border-border"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                data-ocid="profile.save_button"
                onClick={handleSave}
                disabled={saveMutation.isPending}
                className="flex-1"
              >
                {saveMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
              <Button
                data-ocid="profile.cancel_button"
                variant="outline"
                onClick={handleCancel}
                disabled={saveMutation.isPending}
                className="flex-1 flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                Cancel
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
