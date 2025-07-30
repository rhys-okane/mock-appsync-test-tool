import {useMockAppSyncTestToolStore} from "../ZustandStore";

export const useAddInvocationState = () => useMockAppSyncTestToolStore(state => state.addInvocation);
