import AccessControl "./access-control";
import Runtime "mo:core/Runtime";

mixin (accessControlState : AccessControl.AccessControlState) {
  // Returns the caller's role. Returns #guest for unregistered principals (never traps).
  public query ({ caller }) func getCallerUserRole() : async AccessControl.UserRole {
    if (caller.isAnonymous()) { return #guest };
    switch (accessControlState.userRoles.get(caller)) {
      case (?role) { role };
      case (null) { #guest };
    };
  };

  public shared ({ caller }) func assignCallerUserRole(user : Principal, role : AccessControl.UserRole) : async () {
    AccessControl.assignRole(accessControlState, caller, user, role);
  };

  // Returns true if the caller has admin role. Never traps — returns false for guests/unregistered.
  public shared ({ caller }) func isCallerAdmin() : async Bool {
    AccessControl.isAdminSafe(accessControlState, caller);
  };
};
