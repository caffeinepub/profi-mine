import AccessControl "./access-control";
import Prim "mo:prim";
import Runtime "mo:core/Runtime";

mixin (accessControlState : AccessControl.AccessControlState) {
  // Initialize auth with a secret token (only used from the admin dashboard explicitly).
  public shared ({ caller }) func _initializeAccessControlWithSecret(userSecret : Text) : async () {
    switch (Prim.envVar<system>("CAFFEINE_ADMIN_TOKEN")) {
      case (null) {
        // Env var not set — silently ignore instead of trapping, so regular logins are unaffected.
        return;
      };
      case (?adminToken) {
        AccessControl.initialize(accessControlState, caller, adminToken, userSecret);
      };
    };
  };

  // Safe — returns #guest for unregistered principals instead of trapping.
  public query ({ caller }) func getCallerUserRole() : async AccessControl.UserRole {
    AccessControl.getUserRoleSafe(accessControlState, caller);
  };

  public shared ({ caller }) func assignCallerUserRole(user : Principal, role : AccessControl.UserRole) : async () {
    AccessControl.assignRole(accessControlState, caller, user, role);
  };

  // Safe — returns false for unregistered principals instead of trapping.
  public query ({ caller }) func isCallerAdmin() : async Bool {
    AccessControl.isAdminSafe(accessControlState, caller);
  };
};
