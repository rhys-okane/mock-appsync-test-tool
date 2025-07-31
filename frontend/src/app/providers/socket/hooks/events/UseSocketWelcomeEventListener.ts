import {useInvocationsState} from "../../../../../store/hooks/UseInvocationsState";
import type {Invocation} from "../../../../../store/types/store/Invocation";
import {socket} from "../../Socket";

export const useSocketWelcomeEventListener = () => {
  const [, setInvocations] = useInvocationsState();

  socket.on("welcome", (data: Invocation[]) => {
    setInvocations(data);
  });
};
