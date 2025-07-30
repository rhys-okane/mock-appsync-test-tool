import { useCallback, useState, type FC } from "react";
import { invokeLambdaAPI } from "../../../api/InvokeLambdaAPI";
import { useAddInvocationState } from "../../../store/hooks/UseAddInvocationState";

export const InvokeLambda: FC = () => {
  const [payload, setPayload] = useState("");
  const [apiRequestSending, setApiRequestSending] = useState(false);
  const addInvocation = useAddInvocationState();

  const invokeLambda = useCallback(() => {
    (async () => {
      setApiRequestSending(true);

      const invocation = await invokeLambdaAPI(payload);
      addInvocation(invocation);

      setApiRequestSending(false);
    })();
  }, [payload]);

  return (
    <div className="w-full h-full flex items-center justify-center gap-12">
      <div className="grid grid-cols-2 pl-24 w-full h-full">
        <div className="flex flex-col gap-2 h-full justify-center">
          <div className="flex flex-col gap-2 h-[40%]">
            <label htmlFor="lambdaPayload">Payload:</label>
            <textarea
              id="lambdaPayload"
              placeholder="Lambda Payload"
              className="border border-neutral-300 rounded px-4 py-2 w-full h-full"
              value={payload}
              onChange={(e) => setPayload(e.target.value)}
            />
          </div>

          <button
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={() => invokeLambda()}
            disabled={apiRequestSending}
          >
            Queue Event
          </button>
        </div>
        <div className="flex items-center justify-center h-full">
          <div className="flex flex-col gap-2 h-[40%]">
            <label htmlFor="lambdaResponse">Response:</label>
            <textarea
              id="lambdaResponse"
              placeholder="Lambda Response"
              className="border border-neutral-300 rounded px-4 py-2 w-full h-full"
              readOnly={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
