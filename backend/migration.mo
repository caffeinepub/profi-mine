import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Principal "mo:core/Principal";

module {
  type ExportLimit = {
    MAX_OPERATIONS_PDF_AND_CSV : Nat;
    CSV_AND_PDF_COMBINED_MAX : Nat;
  };

  type SubscriptionTier = {
    #premium : ExportLimit;
    #basic : ExportLimit;
    #free : ExportLimit;
  };

  type OldUserProfile = {
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

  type LogEntry = {
    timestamp : Int;
    message : Text;
  };

  type OldActor = {
    projects : Map.Map<Blob, MiningProject>;
    sensitivityRanges : Map.Map<Text, SensitivityRange>;
    userProfiles : Map.Map<Principal, OldUserProfile>;
    persistentLog : Map.Map<Int, LogEntry>;
    stripeConfig : ?{ secretKey : Text; allowedCountries : [Text] };
  };

  type UserProfile = {
    name : Text;
    email : ?Text;
    organization : ?Text;
    tier : SubscriptionTier;
    modelsCreatedAnnual : Nat;
    exportsRemainingAnnual : Nat;
    lastResetTimestamp : Int;
    romUsageCount : Nat;
  };

  type NewActor = {
    projects : Map.Map<Blob, MiningProject>;
    sensitivityRanges : Map.Map<Text, SensitivityRange>;
    userProfiles : Map.Map<Principal, UserProfile>;
    persistentLog : Map.Map<Int, LogEntry>;
    stripeConfig : ?{ secretKey : Text; allowedCountries : [Text] };
  };

  public func run(old : OldActor) : NewActor {
    let newProfiles = old.userProfiles.map<Principal, OldUserProfile, UserProfile>(
      func(_principal, oldProfile) {
        { oldProfile with romUsageCount = 0 };
      }
    );
    { old with userProfiles = newProfiles };
  };
};
