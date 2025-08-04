import { useState, type FC } from "react";
import schemaSDL from "./merged-schema.graphql?raw";
import { GraphiQLProvider, QueryEditor } from "@graphiql/react";
import { buildClientSchema, buildSchema } from "graphql";
import { createGraphiQLFetcher } from "@graphiql/toolkit";

export const AppSync: FC = () => {
  const [gql, setGql] = useState("");

  const schema = buildSchema(schemaSDL);
  const fetcher = createGraphiQLFetcher({ url: "" });
  return (
    <div className="w-full h-full flex items-center justify-center gap-12">
      <div className="grid grid-cols-2 pl-24 w-full h-full">
        <div className="flex flex-col gap-2 h-full justify-center">
          <GraphiQLProvider schema={schema} fetcher={fetcher}>
            <QueryEditor className="h-[90%]" />
          </GraphiQLProvider>

          <button
            className="bg-blue-500 text-white px-4 py-2 rounded"
            // onClick={() => invokeLambda()}
            // disabled={apiRequestSending}
          >
            Execute
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
              // value={response}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
