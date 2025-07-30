import type {SocketInfo} from "./store/SocketInfo";
import type {Invocation} from "./store/Invocation";
import type {ZustandSetFunction} from "./UseZustandState";

export interface MockAppSyncTestTool {
  invocations: Invocation[];
  socketInfo: SocketInfo;
}

export type CreateReducers<T> = {
  [K in keyof T as `set${Capitalize<string & K>}`]: ZustandSetFunction<T[K]>
};

export type MockAppSyncTestToolReducers = CreateReducers<MockAppSyncTestTool> & {
  addInvocation: (invocation: Invocation) => void;
};

