import Map "mo:core/pure/Map";
import Nat "mo:core/Nat";
import Debug "mo:base/Debug";
import Time "mo:base/Time";
import Iter "mo:core/Iter";
import Principal "mo:base/Principal";

persistent actor Backend {
  public type LogEntry = {
    id: Nat;
    timestamp: Int;
    level: Text;
    message: Text;
  };

  // Authentication key for adding log entries
  // Set via setAuthKey function (only callable by installer)
  private var authKey: Text = "";

  // Set the authentication key (only callable by installer/controller)
  public shared(msg) func setAuthKey(key: Text) : async () {
    // Assert that the caller is a controller of this canister
    assert(Principal.isController(msg.caller));
    assert(key != "");
    authKey := key;
  };

  // Ordered map storing log entries by ID (automatically ordered by key)
  private var logMap: Map.Map<Nat, LogEntry> = Map.empty<Nat, LogEntry>();
  private var nextId: Nat = 1;

  public func log(key: Text, level: Text, message: Text) : async Nat {
    // Assert that the provided key matches the authentication key
    assert(key == authKey);
    let entry: LogEntry = {
      id = nextId;
      timestamp = Time.now();
      level = level;
      message = message;
    };
    
    // Add entry to ordered map (maintains order by ID)
    // Pure Map returns a new map, so we assign it back
    logMap := Map.add(logMap, Nat.compare, entry.id, entry);
    nextId += 1;
    Debug.print("Log [" # level # "]: " # message);
    return entry.id;
  };

  public query func getLogs() : async [LogEntry] {
    // Map.values() returns values in ascending order of keys (by ID)
    // The map is automatically ordered, so values come out in ID order
    return Iter.toArray(Map.values(logMap));
  };

  public query func getLog(id: Nat) : async ?LogEntry {
    return Map.get(logMap, Nat.compare, id);
  };

  public query func getLogCount() : async Nat {
    return Map.size(logMap);
  };
};
