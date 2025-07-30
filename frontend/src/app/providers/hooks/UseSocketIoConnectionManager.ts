import {useListenForSocketConnectionEvents} from "./events/UseSocketConnectionEventListener";

export function useSocketIoConnectionManager() {
  useListenForSocketConnectionEvents();
}
