import type {MockAppSyncTestTool} from "../types/MockAppSyncTestTool";
import type {UseZustandState} from "../types/UseZustandState";
import {useMockAppSyncTestToolStore} from "../ZustandStore";

export const useInvocationsState = (): UseZustandState<MockAppSyncTestTool["invocations"]> => [
  useMockAppSyncTestToolStore(state => state.invocations),
  useMockAppSyncTestToolStore(state => state.setInvocations),
];
