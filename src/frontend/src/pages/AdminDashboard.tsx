import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  HardHat,
  KeyRound,
  Loader2,
  Lock,
  RefreshCw,
  Users,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { UserProfile } from "../backend";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

// The admin password used for client-side gate. Same value as stored in the backend.
// This is a defence-in-depth measure — the backend also validates the password.
const ADMIN_PASSWORD = "k0R1@#ch_7251!";
const SESSION_KEY = "profi_admin_verified";

type UserRecord = {
  principalId: string;
  profile: UserProfile;
};

// Admin status: 'pending' = checking, 'verified' = confirmed, 'denied' = not admin yet
type AdminStatus = "pending" | "verified" | "denied";

export default function AdminDashboard() {
  const { identity } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [adminStatus, setAdminStatus] = useState<AdminStatus>("pending");
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [passwordInput, setPasswordInput] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [loadError, setLoadError] = useState(false);

  // Track which identity we last ran the admin check for
  const checkedForRef = useRef<string | null>(null);

  // On mount: check sessionStorage first (instant, no backend call needed)
  // If already verified in session, adminStatus jumps straight to verified.
  // The actor effect below will then loadUsers once the actor is ready.
  useEffect(() => {
    const session = sessionStorage.getItem(SESSION_KEY);
    if (session === "true") {
      setAdminStatus("verified");
    } else {
      // Not verified yet — keep pending until actor check completes
      setAdminStatus("pending");
    }
  }, []);

  // When authenticated actor is ready: check or confirm admin status
  useEffect(() => {
    if (!actor || actorFetching) return;

    // If already verified (from sessionStorage), just load users — no backend check needed
    if (adminStatus === "verified") {
      loadUsers(actor);
      return;
    }

    const principalStr = identity
      ? identity.getPrincipal().toString()
      : "anonymous";
    if (checkedForRef.current === principalStr) return;
    checkedForRef.current = principalStr;

    (async () => {
      try {
        const isAdmin = await actor.isCallerAdmin();
        if (isAdmin) {
          sessionStorage.setItem(SESSION_KEY, "true");
          setAdminStatus("verified");
          loadUsers(actor);
        } else {
          setAdminStatus("denied");
        }
      } catch {
        // Could not reach backend — fall back to password form
        setAdminStatus("denied");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actor, actorFetching, adminStatus, identity]); // loadUsers is defined in component but stable within render

  const grantBackendAdminRole = async (
    actorRef: typeof actor,
    retries = 3,
  ): Promise<boolean> => {
    if (!actorRef) return false;
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const success = await actorRef.claimAdminWithPassword(ADMIN_PASSWORD);
        if (success) return true;
      } catch (e) {
        console.warn(`claimAdminWithPassword attempt ${attempt} failed:`, e);
        if (attempt < retries) {
          // Brief delay before retry
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
        }
      }
    }
    return false;
  };

  const loadUsers = async (actorRef = actor, retries = 3) => {
    if (!actorRef) return;
    setLoading(true);
    setLoadError(false);
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const result = await actorRef.getAllUserProfiles();
        const mapped = result.map(
          ([principal, profile]: [
            { toText: () => string } | string,
            UserProfile,
          ]) => ({
            principalId:
              typeof principal === "string" ? principal : principal.toText(),
            profile,
          }),
        );
        setUsers(mapped);
        setLoading(false);
        return;
      } catch (e) {
        console.warn(`getAllUserProfiles attempt ${attempt} failed:`, e);
        if (attempt < retries) {
          await new Promise((resolve) => setTimeout(resolve, 1200 * attempt));
        } else {
          console.error("Failed to load users after retries:", e);
          setLoadError(true);
          toast.error(
            "Failed to load users. Use the Refresh button to try again.",
          );
        }
      }
    }
    setLoading(false);
  };

  const handleVerifyPassword = async () => {
    if (!passwordInput.trim()) {
      toast.error("Please enter the admin password.");
      return;
    }

    // Step 1: Client-side check — instant gate, no network dependency
    if (passwordInput.trim() !== ADMIN_PASSWORD) {
      toast.error("Incorrect password. Please try again.");
      return;
    }

    // Password is correct — open the dashboard immediately
    setVerifying(true);
    sessionStorage.setItem(SESSION_KEY, "true");
    setAdminStatus("verified");

    // Step 2: Grant the backend role (needed for getAllUserProfiles)
    // Run in background — don't block the UI on this
    if (actor) {
      grantBackendAdminRole(actor).then((granted) => {
        if (granted) {
          loadUsers(actor);
        } else {
          // Backend claim failed after retries — inform and offer retry
          toast.error(
            "Could not connect to the backend to load users. Use the Refresh button to retry.",
          );
          setLoadError(true);
        }
      });
    } else {
      toast.error(
        "App is still initialising. Please wait a moment then use the Refresh button.",
      );
      setLoadError(true);
    }

    setVerifying(false);
  };

  const handleRefresh = async () => {
    if (!actor) {
      toast.error("App is still loading. Please wait.");
      return;
    }
    // Try to grant backend role first (in case it wasn't set yet), then load
    const granted = await grantBackendAdminRole(actor);
    if (granted) {
      await loadUsers(actor);
    } else {
      await loadUsers(actor);
    }
  };

  const handleToggle = async (
    principalId: string,
    currentlyActive: boolean,
  ) => {
    if (!actor) return;
    setTogglingId(principalId);
    try {
      await actor.setUserActiveStatus(principalId, !currentlyActive);
      toast.success(
        currentlyActive
          ? "User blocked successfully."
          : "User allowed successfully.",
      );
      await loadUsers(actor);
    } catch (_e) {
      toast.error("Failed to update user status.");
    } finally {
      setTogglingId(null);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setAdminStatus("denied");
    setUsers([]);
    setPasswordInput("");
    checkedForRef.current = null;
  };

  if (!identity) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-sm w-full">
          <CardContent className="pt-6 text-center">
            <Lock className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-foreground font-medium">
              Please log in to access the admin dashboard.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (adminStatus === "pending") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (adminStatus === "denied") {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-background p-6"
        data-ocid="admin.panel"
      >
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[oklch(0.55_0.15_60)] to-[oklch(0.45_0.12_50)] flex items-center justify-center mx-auto mb-3">
              <KeyRound className="w-7 h-7 text-white" />
            </div>
            <CardTitle className="text-xl">Admin Access</CardTitle>
            <CardDescription>
              Enter the admin password to access the ProFi Mine management
              dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="admin-password-input"
                className="text-sm font-medium text-foreground"
              >
                Admin Password
              </label>
              <Input
                data-ocid="admin.input"
                id="admin-password-input"
                type="password"
                placeholder="Enter admin password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleVerifyPassword()}
              />
            </div>
            <Button
              data-ocid="admin.submit_button"
              className="w-full"
              onClick={handleVerifyPassword}
              disabled={verifying || !passwordInput.trim()}
            >
              {verifying ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Enter Dashboard"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const activeUsers = users.filter((u) => u.profile.isActive);
  const deactivatedUsers = users.filter((u) => !u.profile.isActive);

  return (
    <div className="min-h-screen bg-background" data-ocid="admin.page">
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[oklch(0.55_0.15_60)] to-[oklch(0.45_0.12_50)] flex items-center justify-center">
              <HardHat className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                ProFi Mine — Admin
              </h1>
              <p className="text-xs text-muted-foreground">
                User Management Dashboard
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              data-ocid="admin.secondary_button"
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              {!loading && "Refresh"}
            </Button>
            <Button
              data-ocid="admin.close_button"
              variant="ghost"
              size="sm"
              onClick={handleLogout}
            >
              Lock
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-muted-foreground" />
                <div>
                  <p className="text-2xl font-bold">{users.length}</p>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                  <span className="text-green-600 dark:text-green-400 font-bold text-sm">
                    ✓
                  </span>
                </div>
                <div>
                  <p className="text-2xl font-bold">{activeUsers.length}</p>
                  <p className="text-sm text-muted-foreground">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                  <span className="text-red-600 dark:text-red-400 font-bold text-sm">
                    ✕
                  </span>
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {deactivatedUsers.length}
                  </p>
                  <p className="text-sm text-muted-foreground">Blocked</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
            <CardDescription>
              Manage user access to ProFi Mine. Block a user to immediately deny
              their access; Allow to restore it.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div
                className="flex items-center justify-center py-12"
                data-ocid="admin.loading_state"
              >
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : loadError ? (
              <div className="text-center py-12" data-ocid="admin.error_state">
                <p className="text-destructive font-medium mb-3">
                  Could not load users from the backend.
                </p>
                <p className="text-xs text-muted-foreground mb-4">
                  This can happen when the canister is initialising or
                  temporarily unavailable. Please try again.
                </p>
                <Button
                  data-ocid="admin.primary_button"
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              </div>
            ) : users.length === 0 ? (
              <div
                className="text-center py-12 text-muted-foreground"
                data-ocid="admin.empty_state"
              >
                <Users className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p>No users registered yet.</p>
                <p className="text-xs mt-1">
                  Users appear here after they log in and create their profile.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto" data-ocid="admin.table">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Organization</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>ROM Edits</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map(({ principalId, profile }, idx) => (
                      <TableRow
                        key={principalId}
                        className={!profile.isActive ? "opacity-50" : ""}
                        data-ocid={`admin.item.${idx + 1}`}
                      >
                        <TableCell className="font-medium">
                          {profile.name || "—"}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {profile.email || "—"}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {profile.organization || "—"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            Exploration
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {String(profile.romUsageCount)}
                        </TableCell>
                        <TableCell>
                          {profile.isActive ? (
                            <Badge
                              variant="default"
                              className="bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30 text-xs"
                            >
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="text-xs">
                              Blocked
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            data-ocid={`admin.toggle.${idx + 1}`}
                            size="sm"
                            variant={
                              profile.isActive ? "destructive" : "default"
                            }
                            onClick={() =>
                              handleToggle(principalId, profile.isActive)
                            }
                            disabled={togglingId === principalId}
                          >
                            {togglingId === principalId ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : profile.isActive ? (
                              "Block"
                            ) : (
                              "Allow"
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
