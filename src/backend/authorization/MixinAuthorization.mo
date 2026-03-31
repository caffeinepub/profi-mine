import AccessControl "./access-control";
import Prim "mo:prim";
import Runtime "mo:core/Runtime";

mixin (accessControlState : AccessControl.AccessControlState) {
  // Initialize auth (first caller becomes admin, others become users)
  public shared ({ caller }) func _initializeAccessControlWithSecret(userSecret : Text) : async () {
    switch (Prim.envVar<system>("CAFFEINE_ADMIN_TOKEN")) {
      case (null) {
        // Env var not set — silently ignore instead of trapping
        return;
      };
      case (?adminToken) {
        AccessControl.initialize(accessControlState, caller, adminToken, userSecret);
      };
    };
  };

  public query ({ caller }) func getCallerUserRole() : async AccessControl.UserRole {
    // Use safe check — return #guest for unregistered principals instead of trapping
    if (caller.isAnonymous()) { return #guest };
    switch (accessControlState.userRoles.get(caller)) {
      case (?role) { role };
      case (null) { #guest };
    };
  };

  public shared ({ caller }) func assignCallerUserRole(user : Principal, role : AccessControl.UserRole) : async () {
    // Admin-only check happens inside
    AccessControl.assignRole(accessControlState, caller, user, role);
  };

  // Safe version: never traps, returns false for unregistered principals
  public query ({ caller }) func isCallerAdmin() : async Bool {
    AccessControl.isAdminSafe(accessControlState, caller);
  };
};
