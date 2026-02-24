import Time "mo:core/Time";
import Float "mo:core/Float";
import Blob "mo:core/Blob";
import Nat "mo:core/Nat";
import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Text "mo:core/Text";
import Int "mo:core/Int";
import Stripe "stripe/stripe";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import OutCall "http-outcalls/outcall";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type ExportLimit = {
    MAX_OPERATIONS_PDF_AND_CSV : Nat;
    CSV_AND_PDF_COMBINED_MAX : Nat;
  };

  public type SubscriptionTier = {
    #premium : ExportLimit;
    #basic : ExportLimit;
    #free : ExportLimit;
  };

  public type UserProfile = {
    name : Text;
    email : ?Text;
    organization : ?Text;
    tier : SubscriptionTier;
    modelsCreatedAnnual : Nat;
    exportsRemainingAnnual : Nat;
    lastResetTimestamp : Int;
  };

  type SensitivityRange = {
    min : Float;
    max : Float;
  };

  public type MiningProject = {
    id : Blob;
    name : Text;
    owner : Principal;
    creationDate : Int;
    lastModified : Int;
    oreReserves : Float;
    romTonnage : Float;
    oreGrade : Float;
    recoveryRate : Float;
    commodityPrice : Float;
    miningCost : Float;
    processingCost : Float;
    gAndACost : Float;
    strippingRatio : Float;
    depreciation : Float;
    capex : Float;
    discountRate : Float;
    averageTaxRate : Float;
    lom : ?Float;
    annualProduction : ?Float;
    annualRevenue : ?Float;
    annualOpex : ?Float;
    ebitda : ?Float;
    ocf : ?Float;
    fcf : ?Float;
    npv : ?Float;
    roi : ?Float;
    paybackPeriod : ?Float;
  };

  // Log type for persistent messaging
  type LogEntry = {
    timestamp : Int;
    message : Text;
  };

  module ProjectComparisons {
    public func compareByName(a : MiningProject, b : MiningProject) : Order.Order {
      Text.compare(a.name, b.name);
    };

    public func compareByCreationDate(a : MiningProject, b : MiningProject) : Order.Order {
      Int.compare(a.creationDate, b.creationDate);
    };

    public func compareByLastModified(a : MiningProject, b : MiningProject) : Order.Order {
      Int.compare(a.lastModified, b.lastModified);
    };
  };

  let projects = Map.empty<Blob, MiningProject>();
  let sensitivityRanges = Map.empty<Text, SensitivityRange>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let persistentLog = Map.empty<Int, LogEntry>();

  func log(message : Text) {
    persistentLog.add(Time.now(), { timestamp = Time.now(); message });
  };

  // Helper function to check if a year has passed since last reset
  func shouldResetAnnualCounter(lastResetTimestamp : Int) : Bool {
    let now = Time.now();
    let nanosPerYear = 365 * 24 * 60 * 60 * 1_000_000_000; // Nanoseconds in a year
    (now - lastResetTimestamp) >= nanosPerYear;
  };

  // Helper function to get or reset user profile usage
  func getOrResetUserProfile(caller : Principal) : UserProfile {
    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User profile not found") };
      case (?profile) {
        if (shouldResetAnnualCounter(profile.lastResetTimestamp)) {
          let resetProfile = {
            profile with
            modelsCreatedAnnual = 0;
            exportsRemainingAnnual = switch (profile.tier) {
              case (#free({ CSV_AND_PDF_COMBINED_MAX })) { CSV_AND_PDF_COMBINED_MAX };
              case (#basic({ CSV_AND_PDF_COMBINED_MAX })) { CSV_AND_PDF_COMBINED_MAX };
              case (#premium({ CSV_AND_PDF_COMBINED_MAX })) { CSV_AND_PDF_COMBINED_MAX };
            };
            lastResetTimestamp = Time.now();
          };
          userProfiles.add(caller, resetProfile);
          resetProfile;
        } else {
          profile;
        };
      };
    };
  };

  public query func getSubscriptionTierInfo() : async [SubscriptionTier] {
    [
      #premium({
        MAX_OPERATIONS_PDF_AND_CSV = 300;
        CSV_AND_PDF_COMBINED_MAX = 1000;
      }),
      #basic({
        MAX_OPERATIONS_PDF_AND_CSV = 45;
        CSV_AND_PDF_COMBINED_MAX = 400;
      }),
      #free({
        MAX_OPERATIONS_PDF_AND_CSV = 2;
        CSV_AND_PDF_COMBINED_MAX = 2;
      }),
    ];
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Subscription management and Stripe integration
  var stripeConfig : ?Stripe.StripeConfiguration = null;

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can set Stripe configuration");
    };
    stripeConfig := ?config;
  };

  public query func isStripeConfigured() : async Bool {
    // Public query - no authorization needed
    stripeConfig != null;
  };

  func getStripeConfiguration() : Stripe.StripeConfiguration {
    switch (stripeConfig) {
      case (null) { Runtime.trap("Stripe not configured") };
      case (?config) { config };
    };
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create checkout sessions");
    };

    log("Starting checkout session for caller with " # items.size().toText() # " items");
    let stripeConfig = getStripeConfiguration();
    let itemsText = stringifyShoppingItems(items);
    let requestSummary = "Request to Stripe with config: " # stripeConfig.secretKey # " | Items: " # itemsText # " | Success URL: " # successUrl # " | Cancel URL: " # cancelUrl;
    log(requestSummary);

    try {
      let sessionResponse = await Stripe.createCheckoutSession(stripeConfig, caller, items, successUrl, cancelUrl, transform);
      log("Checkout session created successfully. Response: " # sessionResponse);
      sessionResponse;
    } catch (_) {
      let errorMessage = "Checkout session creation failed.";
      log(errorMessage # " Persistent log added before trap.");
      Runtime.trap(errorMessage);
    };
  };

  // Helper function to stringify shopping items for logging
  func stringifyShoppingItems(items : [Stripe.ShoppingItem]) : Text {
    let itemStrings = items.map(func(item) { item.productName });
    "[" # itemStrings.toText() # "]";
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  public shared ({ caller }) func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check session status");
    };
    await Stripe.getSessionStatus(getStripeConfiguration(), sessionId, transform);
  };

  public shared ({ caller }) func upgradeSubscription(_tier : Text, _planType : ?Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can upgrade subscriptions");
    };

    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User profile not found") };
      case (?profile) {
        let updatedProfile = {
          profile with
          tier = #premium({ MAX_OPERATIONS_PDF_AND_CSV = 300; CSV_AND_PDF_COMBINED_MAX = 1000 });
          modelsCreatedAnnual = 0;
          exportsRemainingAnnual = 1000;
          lastResetTimestamp = Time.now();
        };
        userProfiles.add(caller, updatedProfile);
      };
    };
  };

  func convertIterToArray(iter : Iter.Iter<MiningProject>) : [MiningProject] {
    iter.toArray();
  };

  // Webhook handler for Stripe events
  public shared ({ caller }) func handleStripeWebhook(sessionId : Text, eventType : Text) : async () {
    // Webhook endpoints should validate the caller is from Stripe
    // In production, verify webhook signature from Stripe
    // For now, only admins can manually trigger this (for testing)
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can handle webhooks");
    };

    // Process payment success events
    if (eventType == "checkout.session.completed" or eventType == "payment_intent.succeeded") {};
  };

  public query ({ caller }) func getPersistentLogs() : async [(Int, LogEntry)] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view logs");
    };
    persistentLog.toArray();
  };

  public shared ({ caller }) func clearPersistentLogs() : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can clear logs");
    };
    persistentLog.clear();
  };

  public query ({ caller }) func getProject(id : Blob) : async MiningProject {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access projects");
    };

    switch (projects.get(id)) {
      case (?project) {
        if (project.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own projects");
        };
        project;
      };
      case (null) { Runtime.trap("Project not found") };
    };
  };

  public query ({ caller }) func getProjectsByOwner(owner : Principal) : async [MiningProject] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access projects");
    };

    if (caller != owner and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own projects");
    };

    projects.values().toArray().filter<MiningProject>(func(project) { project.owner == owner });
  };

  public query ({ caller }) func getSortedProjects(sortBy : Text) : async [MiningProject] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access projects");
    };

    let userProjects = if (AccessControl.isAdmin(accessControlState, caller)) {
      projects.values().toArray();
    } else {
      projects.values().toArray().filter(func(project) { project.owner == caller });
    };

    switch (sortBy) {
      case ("name") { userProjects.sort<MiningProject>(ProjectComparisons.compareByName) };
      case ("creationDate") { userProjects.sort<MiningProject>(ProjectComparisons.compareByCreationDate) };
      case ("lastModified") { userProjects.sort<MiningProject>(ProjectComparisons.compareByLastModified) };
      case (_) { userProjects };
    };
  };

  public shared ({ caller }) func deleteProject(id : Blob) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete projects");
    };

    switch (projects.get(id)) {
      case (null) { Runtime.trap("Project not found") };
      case (?project) {
        if (project.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only delete your own projects");
        };
        projects.remove(id);
      };
    };
  };

  public query ({ caller }) func getSensitivityRanges() : async [(Text, SensitivityRange)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view sensitivity ranges");
    };
    sensitivityRanges.entries().toArray();
  };

  public shared ({ caller }) func updateSensitivityRange(setting : Text, update : SensitivityRange) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update sensitivity ranges");
    };
    sensitivityRanges.add(setting, update);
  };

  public shared ({ caller }) func refreshProjects() : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can refresh projects");
    };
    projects.clear();
  };

  public shared ({ caller }) func updateSubscription(principalId : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update subscriptions");
    };

    // Assign premium tier directly
    switch (userProfiles.get(principalId)) {
      case (null) { Runtime.trap("User profile not found") };
      case (?profile) {
        let updatedProfile = {
          profile with
          tier = #premium({ MAX_OPERATIONS_PDF_AND_CSV = 300; CSV_AND_PDF_COMBINED_MAX = 1000 });
          modelsCreatedAnnual = 0;
          exportsRemainingAnnual = 1000;
          lastResetTimestamp = Time.now();
        };
        userProfiles.add(principalId, updatedProfile);
      };
    };
  };

  public shared ({ caller }) func canExport() : async Bool {
    switch (userProfiles.get(caller)) {
      case (null) { false };
      case (?profile) { profile.exportsRemainingAnnual > 0 };
    };
  };

  public shared ({ caller }) func decrementExportCount() : async () {
    let profile = getOrResetUserProfile(caller);

    if (profile.exportsRemainingAnnual <= 0) {
      Runtime.trap("No remaining exports for this year");
    };

    let updatedProfile = {
      profile with
      exportsRemainingAnnual = profile.exportsRemainingAnnual - 1;
    };
    userProfiles.add(caller, updatedProfile);
  };

  public shared ({ caller }) func fullResetExports(principalId : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can reset exports");
    };

    switch (userProfiles.get(principalId)) {
      case (null) { Runtime.trap("User profile not found") };
      case (?profile) {
        let newExports = switch (profile.tier) {
          case (#free({ CSV_AND_PDF_COMBINED_MAX })) { CSV_AND_PDF_COMBINED_MAX };
          case (#basic({ CSV_AND_PDF_COMBINED_MAX })) { CSV_AND_PDF_COMBINED_MAX };
          case (#premium({ CSV_AND_PDF_COMBINED_MAX })) { CSV_AND_PDF_COMBINED_MAX };
        };
        let updatedProfile = {
          profile with
          exportsRemainingAnnual = newExports;
        };
        userProfiles.add(principalId, updatedProfile);
      };
    };
  };

  public type SaveProjectResult = {
    projectId : Blob;
    status : ApiResult;
    timestamp : Int;
  };

  public type ApiResult = {
    #success;
    #error : Text;
  };

  public shared ({ caller }) func saveProject(project : MiningProject) : async SaveProjectResult {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      return {
        projectId = project.id;
        status = #error("Unauthorized: Only users can save projects");
        timestamp = Time.now();
      };
    };

    let existingProject = projects.get(project.id);
    switch (existingProject) {
      case (?existing) {
        if (existing.owner == caller or AccessControl.isAdmin(accessControlState, caller)) {
          projects.add(project.id, project);
          {
            projectId = project.id;
            status = #success;
            timestamp = Time.now();
          };
        } else {
          {
            projectId = project.id;
            status = #error("Unauthorized: Can only update your own projects");
            timestamp = Time.now();
          };
        };
      };
      case (null) {
        projects.add(project.id, project);
        {
          projectId = project.id;
          status = #success;
          timestamp = Time.now();
        };
      };
    };
  };
};
