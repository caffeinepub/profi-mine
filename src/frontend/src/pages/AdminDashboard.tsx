import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { HardHat, Loader2, Lock, RefreshCw, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { UserProfile } from "../backend";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

type UserRecord = {
  principalId: string;
  profile: UserProfile;
};

export default function AdminDashboard() {
  const { identity } = useInternetIdentity();
  const { actor } = useActor();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    if (!actor || !identity) return;
    actor
      .isCallerAdmin()
      .then((result: boolean) => {
        setIsAdmin(result);
        if (result) loadUsers();
        else setLoading(false);
      })
      .catch(() => {
        setIsAdmin(false);
        setLoading(false);
      });
  }, [actor, identity]);

  const loadUsers = async () => {
    if (!actor) return;
    setLoading(true);
    try {
      const result = await actor.getAllUserProfiles();
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
    } catch (_e) {
      toast.error("Failed to load users.");
    } finally {
      setLoading(false);
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
      await loadUsers();
    } catch (_e) {
      toast.error("Failed to update user status.");
    } finally {
      setTogglingId(null);
    }
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

  if (isAdmin === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <Card className="max-w-sm w-full">
          <CardContent className="pt-6 text-center space-y-4">
            <Lock className="w-10 h-10 text-destructive mx-auto" />
            <div>
              <p className="text-foreground font-semibold text-lg">
                Access Denied
              </p>
              <p className="text-muted-foreground text-sm mt-1">
                You do not have administrator privileges.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isAdmin === null || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const activeUsers = users.filter((u) => u.profile.isActive);
  const deactivatedUsers = users.filter((u) => !u.profile.isActive);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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
          <Button
            variant="outline"
            size="sm"
            onClick={loadUsers}
            data-ocid="admin.refresh.button"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl space-y-6">
        {/* Stats */}
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
                    {activeUsers.length}
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
                    {deactivatedUsers.length}
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

        {/* User Table */}
        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
            <CardDescription>
              Manage user access to ProFi Mine. Block a user to immediately deny
              their access; Allow to restore it.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <div
                className="text-center py-12 text-muted-foreground"
                data-ocid="admin.users.empty_state"
              >
                <Users className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p>No users registered yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table data-ocid="admin.users.table">
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
                    {users.map(({ principalId, profile }, index) => (
                      <TableRow
                        key={principalId}
                        data-ocid={`admin.users.row.${index + 1}`}
                        className={!profile.isActive ? "opacity-50" : ""}
                      >
                        <TableCell className="font-medium">
                          {profile.name || "—"}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {profile.email?.[0] || "—"}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {profile.organization?.[0] || "—"}
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
                            size="sm"
                            variant={
                              profile.isActive ? "destructive" : "default"
                            }
                            onClick={() =>
                              handleToggle(principalId, profile.isActive)
                            }
                            disabled={togglingId === principalId}
                            data-ocid={`admin.users.toggle.${index + 1}`}
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
