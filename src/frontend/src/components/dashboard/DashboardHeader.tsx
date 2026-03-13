import { Badge } from "@/components/ui/badge";
import { HardHat, Pickaxe, User } from "lucide-react";
import { useState } from "react";
import { useProject } from "../../contexts/ProjectContext";
import LoginButton from "../auth/LoginButton";
import ProfilePage from "../auth/ProfilePage";
import SubscriptionModal from "../subscription/SubscriptionModal";

export default function DashboardHeader() {
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showProfilePage, setShowProfilePage] = useState(false);
  const {
    projectName,
    subscriptionLoading,
    romUsageCount,
    usageCount,
    usageLimit,
    exportsRemaining,
  } = useProject();

  return (
    <>
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Logo and Title */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[oklch(0.55_0.15_60)] to-[oklch(0.45_0.12_50)] flex items-center justify-center shadow-md">
                <HardHat className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  ProFi Mine
                </h1>
                {projectName && (
                  <p className="text-xs text-muted-foreground">
                    Project: {projectName}
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Plan badge */}
              {!subscriptionLoading && (
                <button
                  type="button"
                  onClick={() => setShowSubscriptionModal(true)}
                  className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer"
                  data-ocid="header.plan.button"
                >
                  <Pickaxe className="w-4 h-4 text-muted-foreground" />
                  <div className="text-left">
                    <p className="text-xs text-muted-foreground">Plan</p>
                    <p className="text-sm font-medium text-foreground">
                      Exploration Tier
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Active
                  </Badge>
                </button>
              )}

              {/* My Profile Button */}
              <button
                type="button"
                data-ocid="header.profile_button"
                onClick={() => setShowProfilePage(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer text-sm font-medium text-foreground"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">My Profile</span>
              </button>

              <LoginButton />
            </div>
          </div>
        </div>
      </header>

      <SubscriptionModal
        open={showSubscriptionModal}
        onOpenChange={setShowSubscriptionModal}
        currentTier="Exploration"
        usageCount={usageCount}
        usageLimit={usageLimit}
        exportsRemaining={exportsRemaining}
        romUsageCount={romUsageCount}
      />

      <ProfilePage open={showProfilePage} onOpenChange={setShowProfilePage} />
    </>
  );
}
