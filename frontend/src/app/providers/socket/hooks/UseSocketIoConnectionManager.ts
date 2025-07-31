import {useSocketConnectionEventListener} from "./events/UseSocketConnectionEventListener";
import {useSocketInvocationCompletedEventListener} from "./events/UseSocketinvocationCompletedEventListener";
import {useSocketWelcomeEventListener} from "./events/UseSocketWelcomeEventListener";

export function useSocketIoConnectionManager() {
  useSocketConnectionEventListener();
  useSocketWelcomeEventListener();
  useSocketInvocationCompletedEventListener();
}
