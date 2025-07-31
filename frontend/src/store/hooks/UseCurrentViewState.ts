import type {MockAppSyncTestTool} from "../types/MockAppSyncTestTool";
import type {UseZustandState} from "../types/UseZustandState";
import {useMockAppSyncTestToolStore} from "../ZustandStore";

export const useCurrentViewState = (): UseZustandState<MockAppSyncTestTool["currentView"]> => ([
  useMockAppSyncTestToolStore(state => state.currentView),
  useMockAppSyncTestToolStore(state => state.setCurrentView),
])
