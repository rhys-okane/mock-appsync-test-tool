import { useInvocationsState } from "../../../../../store/hooks/UseInvocationsState";
import type { Invocation } from "../../../../../store/types/store/Invocation";
import { socket } from "../../Socket";

export const useSocketInvocationCompletedEventListener = () => {
  const [invocations, setInvocations] = useInvocationsState();

  socket.on("invocationCompleted", (updatedInvocation: Invocation) => {
    console.log(`Invocation completed`, updatedInvocation);
    setInvocations(
      invocations.map((invocation) =>
        invocation.lambdaEventId === updatedInvocation.lambdaEventId
          ? updatedInvocation
          : invocation,
      ),
    );
  });
};
