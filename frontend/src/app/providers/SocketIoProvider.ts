import type {ReactElement, FC} from "react";
import {useSocketIoConnectionManager} from "./hooks/UseSocketIoConnectionManager";

interface Props {
  children: ReactElement;
}

export const SocketIoProvider: FC<Props> = ({children}) => {
  useSocketIoConnectionManager();

  return children;
};
