import type {MockAppSyncTestTool} from "../../../store/types/MockAppSyncTestTool";
import type {UseZustandState} from "../../../store/types/UseZustandState";
import {useMockAppSyncTestToolStore} from "../../../store/ZustandStore";

export const useSocketInfoState = (): UseZustandState<MockAppSyncTestTool["socketInfo"]> => [
  useMockAppSyncTestToolStore((state) => state.socketInfo),
  useMockAppSyncTestToolStore((state) => state.setSocketInfo)
];
