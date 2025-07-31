import {create} from "zustand";
import {devtools} from "zustand/middleware";
import {immer} from "zustand/middleware/immer";
import type {MockAppSyncTestTool, MockAppSyncTestToolReducers} from "./types/MockAppSyncTestTool";
import type {Invocation} from "./types/store/Invocation";

const initialState: MockAppSyncTestTool = {
  currentView: "invokeLambda",
  invocations: [],
  socketInfo: {
    connected: false,
  }
};

export const useMockAppSyncTestToolStore = create(
  devtools(immer<MockAppSyncTestTool & MockAppSyncTestToolReducers>(set => ({
    ...initialState,
    setCurrentView: (view: MockAppSyncTestTool["currentView"]) => set({
      currentView: view
    }),
    setInvocations: (payload: MockAppSyncTestTool["invocations"]) => set({
      invocations: payload
    }),
    setSocketInfo: (payload: MockAppSyncTestTool["socketInfo"]) => set({
      socketInfo: payload
    }),
    addInvocation: (invocation: Invocation) => set(state => ({
      invocations: [...state.invocations, invocation]
    })),
  })))
);
