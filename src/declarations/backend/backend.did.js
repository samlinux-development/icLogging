export const idlFactory = ({ IDL }) => {
  const LogEntry = IDL.Record({
    'id' : IDL.Nat,
    'level' : IDL.Text,
    'message' : IDL.Text,
    'timestamp' : IDL.Int,
  });
  return IDL.Service({
    'getLog' : IDL.Func([IDL.Nat], [IDL.Opt(LogEntry)], ['query']),
    'getLogCount' : IDL.Func([], [IDL.Nat], ['query']),
    'getLogs' : IDL.Func([], [IDL.Vec(LogEntry)], ['query']),
    'log' : IDL.Func([IDL.Text, IDL.Text, IDL.Text], [IDL.Nat], []),
    'setAuthKey' : IDL.Func([IDL.Text], [], []),
  });
};
export const init = ({ IDL }) => { return []; };
