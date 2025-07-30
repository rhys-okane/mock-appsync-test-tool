import {useEffect} from "react";;
import {socket} from "../../Socket";
import {useSocketInfoState} from "../UseSocketInfoState";

export function useListenForSocketConnectionEvents() {
  const [, setSocketInfo] = useSocketInfoState();

  useEffect(() => {
    const onConnect = () => {
      setSocketInfo({
        connected: true
      });
      console.log("Connected to Socket.IO Server");
    };
    const onDisconnect = () => {
      setSocketInfo({
        connected: false
      });
      console.warn("Lost connection to Socket.IO Server");
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
    
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
