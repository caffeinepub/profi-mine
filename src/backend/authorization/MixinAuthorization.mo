import AccessControl "./access-control";
import Prim "mo:prim";
import Runtime "mo:core/Runtime";

mixin (accessControlState : AccessControl.AccessControlState) {
  // No-token initialization: first caller becomes admin, subsequent callers become users.
  // This is the primary registration entry point used on every login.
  public shared ({ caller }) func _initializeAccessControl() : async () {
    AccessControl.initializeFirstLogin(accessControlState, caller);
  };

  // Token-based initialization (legacy / fallback).
  public shared ({ caller }) func _initializeAccessControlWithSecret(userSecret : Text) : async () {
    switch (Prim.envVar<system>("CAFFEINE_ADMIN_TOKEN")) {
      case (null) {
        // If no env token is set, fall back to first-login logic
        AccessControl.initializeFirstLogin(accessControlState, caller);
      };
      case (?adminToken) {
        AccessControl.initialize(accessControlState, caller, adminToken, userSecret);
      };
    };
  };

  public query ({ caller }) func getCallerUserRole() : async AccessControl.UserRole {
    AccessControl.getUserRole(accessControlState, caller);
  };

  public shared ({ caller }) func assignCallerUserRole(user : Principal, role : AccessControl.UserRole) : async () {
    // Admin-only check happens inside
    AccessControl.assignRole(accessControlState, caller, user, role);
  };

  public query ({ caller }) func isCallerAdmin() : async Bool {
    AccessControl.isAdmin(accessControlState, caller);
  };
};
