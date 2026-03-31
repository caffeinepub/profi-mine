import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";

module {
  public type UserRole = {
    #admin;
    #user;
    #guest;
  };

  public type AccessControlState = {
    var adminAssigned : Bool;
    userRoles : Map.Map<Principal, UserRole>;
  };

  public func initState() : AccessControlState {
    {
      var adminAssigned = false;
      userRoles = Map.empty<Principal, UserRole>();
    };
  };

  // First principal that calls this function with the correct token becomes admin.
  public func initialize(state : AccessControlState, caller : Principal, adminToken : Text, userProvidedToken : Text) {
    if (caller.isAnonymous()) { return };
    switch (state.userRoles.get(caller)) {
      case (?_) {}; // already registered, preserve existing role
      case (null) {
        if (not state.adminAssigned and userProvidedToken == adminToken) {
          state.userRoles.add(caller, #admin);
          state.adminAssigned := true;
        } else {
          state.userRoles.add(caller, #user);
        };
      };
    };
  };

  // Returns the role of the caller. Traps if user is not registered.
  public func getUserRole(state : AccessControlState, caller : Principal) : UserRole {
    if (caller.isAnonymous()) { return #guest };
    switch (state.userRoles.get(caller)) {
      case (?role) { role };
      case (null) {
        Runtime.trap("User is not registered");
      };
    };
  };

  // Safe version of isAdmin — never traps, returns false for unregistered principals.
  public func isAdminSafe(state : AccessControlState, caller : Principal) : Bool {
    if (caller.isAnonymous()) { return false };
    switch (state.userRoles.get(caller)) {
      case (?(#admin)) { true };
      case (_) { false };
    };
  };

  public func assignRole(state : AccessControlState, caller : Principal, user : Principal, role : UserRole) {
    if (not (isAdmin(state, caller))) {
      Runtime.trap("Unauthorized: Only admins can assign user roles");
    };
    state.userRoles.add(user, role);
  };

  public func hasPermission(state : AccessControlState, caller : Principal, requiredRole : UserRole) : Bool {
    if (caller.isAnonymous()) { return requiredRole == #guest };
    switch (state.userRoles.get(caller)) {
      case (?(#admin)) { true };
      case (?(#user)) { requiredRole == #user or requiredRole == #guest };
      case (?(#guest)) { requiredRole == #guest };
      case (null) { requiredRole == #guest };
    };
  };

  public func isAdmin(state : AccessControlState, caller : Principal) : Bool {
    isAdminSafe(state, caller);
  };
};
