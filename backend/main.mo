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

// Persistent data types for exports and database projects

actor {
  // For front-end queries
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

  // Export (non-db) projects to persistent storage
  public type UserProfile = {
    name : Text;
    email : ?Text;
    organization : ?Text;
    tier : SubscriptionTier;
    modelsCreatedAnnual : Nat;
    exportsRemainingAnnual : Nat;
    lastResetTimestamp : Int;
    romUsageCount : Nat;
  };

  // Export (non-db) projects to persistent storage
  type SensitivityRange = {
    min : Float;
    max : Float;
  };

  // Export (non-db) projects to persistent storage
  type MiningProject = {
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

  // ACTOR STATE
  let projects = Map.empty<Blob, MiningProject>();
  let sensitivityRanges = Map.empty<Text, SensitivityRange>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let persistentLog = Map.empty<Int, LogEntry>();
  var stripeConfig : ?Stripe.StripeConfiguration = null;

  // ACTOR STATE END

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

  // Helper function for persistent messaging
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

  // New function to create checkout session for premium subscription
  public shared ({ caller }) func createPremiumCheckoutSession() : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create checkout sessions");
    };

    let items : [Stripe.ShoppingItem] = [{
      currency = "usd";
      productName = "Premium Subscription";
      productDescription = "Access to premium features";
      priceInCents = 23_500; // Corrected price to $235
      quantity = 1;
    }];

    let successUrl = "https://app.runtime-mining.com/payment-success";
    let cancelUrl = "https://app.runtime-mining.com/payment-failure";

    log("Starting premium checkout session for caller with 1 item");
    let stripeConfig : Stripe.StripeConfiguration = {
      secretKey = "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";
      allowedCountries = [
        "AU",
        "US",
        "GB",
        "CA",
        "NZ",
        "ZA",
        "SG",
        "IN",
        "DE",
        "FR",
        "ES",
        "DK",
        "EE",
        "FI",
        "IE",
        "LU",
        "NL",
        "NO",
        "SE",
      ];
    };
    let itemsText = stringifyShoppingItems(items);
    let requestSummary = "Request to Stripe with default config | Items: " # itemsText # " | Success URL: " # successUrl # " | Cancel URL: " # cancelUrl;
    log(requestSummary);

    try {
      let sessionResponse = await Stripe.createCheckoutSession(stripeConfig, caller, items, successUrl, cancelUrl, transform);
      log("Premium checkout session created successfully. Response: " # sessionResponse);
      sessionResponse;
    } catch (_) {
      let errorMessage = "Premium checkout session creation failed.";
      log(errorMessage # " Persistent log added before trap.");
      Runtime.trap(errorMessage);
    };
  };

  // Helper function to stringify shopping items for logging
  func stringifyShoppingItems(items : [Stripe.ShoppingItem]) : Text {
    let itemStrings = items.map(func(item) { item.productName });
    "[" # itemStrings.toText() # "]";
  };

  // Marks the calling user as premium. Only authenticated (non-anonymous) users
  // can call this for themselves. The caller principal is taken from the shared
  // context — no principal parameter is accepted to prevent privilege escalation.
  public shared ({ caller }) func markUserAsPremium() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can be marked as premium");
    };

    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User profile not found") };
      case (?profile) {
        let updatedProfile = {
          profile with
          tier = #premium({
            MAX_OPERATIONS_PDF_AND_CSV = 300;
            CSV_AND_PDF_COMBINED_MAX = 1000;
          });
          modelsCreatedAnnual = 0;
          exportsRemainingAnnual = 1000;
          lastResetTimestamp = Time.now();
        };
        userProfiles.add(caller, updatedProfile);
      };
    };
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
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check export availability");
    };
    switch (userProfiles.get(caller)) {
      case (null) { false };
      case (?profile) { profile.exportsRemainingAnnual > 0 };
    };
  };

  public shared ({ caller }) func decrementExportCount() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can decrement export count");
    };
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

  public shared ({ caller }) func saveProject(project : MiningProject) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save projects");
    };

    if (project.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only save your own projects");
    };

    switch (projects.get(project.id)) {
      case (null) { projects.add(project.id, project) };
      case (?existingProject) {
        if (existingProject.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only update your own projects");
        };
        projects.add(project.id, project);
      };
    };
  };

  // ROM (Annual Tonnage Schedule) Usage Tracking

  // Returns the ROM usage count for the calling user.
  // Requires #user permission: guests/anonymous principals are not allowed
  // to access profile data.
  public query ({ caller }) func getRomUsageCount() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view ROM usage count");
    };
    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User profile not found") };
      case (?profile) { profile.romUsageCount };
    };
  };

  // Increments the ROM usage count for the calling user.
  // Requires #user permission.
  // Free Tier users are capped at 3 ROM uses; basic and premium tiers use
  // their respective MAX_OPERATIONS_PDF_AND_CSV limit.
  public shared ({ caller }) func incrementRomUsage() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can increment ROM usage");
    };

    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User profile not found") };
      case (?profile) {
        // Free Tier is capped at 3 ROM uses as per the application intent.
        // Basic and premium tiers use their MAX_OPERATIONS_PDF_AND_CSV limit.
        let maxRomUsage : Nat = switch (profile.tier) {
          case (#free(_)) { 3 };
          case (#basic({ MAX_OPERATIONS_PDF_AND_CSV })) { MAX_OPERATIONS_PDF_AND_CSV };
          case (#premium({ MAX_OPERATIONS_PDF_AND_CSV })) { MAX_OPERATIONS_PDF_AND_CSV };
        };

        if (profile.romUsageCount >= maxRomUsage) {
          Runtime.trap("ROM usage limit exceeded");
        };

        let updatedProfile = {
          profile with
          romUsageCount = profile.romUsageCount + 1;
        };
        userProfiles.add(caller, updatedProfile);
      };
    };
  };

  // Resets the ROM usage count for any user. Admin-only.
  public shared ({ caller }) func resetRomUsage(principalId : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can reset ROM usage");
    };

    switch (userProfiles.get(principalId)) {
      case (null) { Runtime.trap("User profile not found") };
      case (?profile) {
        let updatedProfile = {
          profile with
          romUsageCount = 0;
        };
        userProfiles.add(principalId, updatedProfile);
      };
    };
  };
};

