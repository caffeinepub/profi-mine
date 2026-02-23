import Map "mo:core/Map";
import Int "mo:core/Int";
import Blob "mo:core/Blob";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Float "mo:core/Float";
import Text "mo:core/Text";

module {
  type OldSubscriptionTier = {
    #premium;
  };

  type OldUserProfile = {
    name : Text;
    email : ?Text;
    organization : ?Text;
    tier : OldSubscriptionTier;
    modelsCreatedThisMonth : Nat;
    lastResetTimestamp : Int;
  };

  type OldMiningProject = {
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

  type OldActor = {
    projects : Map.Map<Blob, OldMiningProject>;
    userProfiles : Map.Map<Principal, OldUserProfile>;
    persistentLog : Map.Map<Int, { timestamp : Int; message : Text }>;
    sensitivityRanges : Map.Map<Text, { min : Float; max : Float }>;
  };

  type NewExportLimit = {
    MAX_OPERATIONS_PDF_AND_CSV : Nat;
    CSV_AND_PDF_COMBINED_MAX : Nat;
  };

  type NewSubscriptionTier = {
    #premium : NewExportLimit;
    #basic : NewExportLimit;
    #free : NewExportLimit;
  };

  type NewUserProfile = {
    name : Text;
    email : ?Text;
    organization : ?Text;
    tier : NewSubscriptionTier;
    modelsCreatedAnnual : Nat;
    exportsRemainingAnnual : Nat;
    lastResetTimestamp : Int;
  };

  type NewMiningProject = {
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

  type NewActor = {
    projects : Map.Map<Blob, NewMiningProject>;
    userProfiles : Map.Map<Principal, NewUserProfile>;
    persistentLog : Map.Map<Int, { timestamp : Int; message : Text }>;
    sensitivityRanges : Map.Map<Text, { min : Float; max : Float }>;
  };

  // Map old user profiles to new format
  public func run(old : OldActor) : NewActor {
    let newUserProfiles = old.userProfiles.map<Principal, OldUserProfile, NewUserProfile>(
      func(_p, oldProfile) {
        let newTier : NewSubscriptionTier = #premium({ MAX_OPERATIONS_PDF_AND_CSV = 300; CSV_AND_PDF_COMBINED_MAX = 1000 });
        {
          oldProfile with
          tier = newTier;
          modelsCreatedAnnual = oldProfile.modelsCreatedThisMonth;
          exportsRemainingAnnual = 1000;
        };
      }
    );
    let newProjects = old.projects.map<Blob, OldMiningProject, NewMiningProject>(
      func(_id, oldProject) {
        oldProject;
      }
    );
    {
      old with
      userProfiles = newUserProfiles;
      projects = newProjects;
    };
  };
};
