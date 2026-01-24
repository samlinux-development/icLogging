import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface LogEntry {
  'id' : bigint,
  'level' : string,
  'message' : string,
  'timestamp' : bigint,
}
export interface _SERVICE {
  'getLog' : ActorMethod<[bigint], [] | [LogEntry]>,
  'getLogCount' : ActorMethod<[], bigint>,
  'getLogs' : ActorMethod<[], Array<LogEntry>>,
  'log' : ActorMethod<[string, string, string], bigint>,
  'setAuthKey' : ActorMethod<[string], undefined>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
