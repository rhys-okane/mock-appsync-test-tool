import { Application } from "express";
import { readFileSync } from "fs";
import {
  buildSchema,
  graphql,
  GraphQLSchema,
} from "graphql";
import {lambdaResponseEventEmitter} from "../lambda-api/LambdaApiRoutes";
import {Invocation} from "../../types/Invocation";
import {invokeLambdaFromQueue} from "../../shared/InvokeLambdaFromQueue";
import {invocations, lambdasAwaitingPayloads} from "../../state/State";
import {v4 as uuid} from "uuid";

export function handleGraphQL(app: Application) {
  app.post("/graphql", async (req, res) => {
    const { query, variables, operationName } = req.body;

    const schema = buildSchema(readFileSync("merged-schema.graphql", "utf8"));

    const resolvers = createResolvers(schema);

    const result = await graphql({
      schema,
      source: query,
      rootValue: resolvers,
      variableValues: variables,
      operationName,
      contextValue: {
        headers: req.headers,
      },
    });

    res.json(result);
  });
}

function createResolvers(schema: GraphQLSchema) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  const resolvers: Record<string, Function> = {};
  
  // Get all types from schema
  const typeMap = schema.getTypeMap();
  
  Object.keys(typeMap).forEach(typeName => {
    const type = typeMap[typeName];
    
    // Skip built-in types
    if (typeName.startsWith('__')) return;
    
    // Skip Query and Mutation - we only want their sub-types
    if (typeName === 'Query' || typeName === 'Mutation') {
      // For Query/Mutation, we need to provide simple resolvers that return objects
      // so that the nested resolvers can be called
      if ('getFields' in type && typeof type.getFields === 'function') {
        const fields = type.getFields();
        
        Object.keys(fields).forEach(fieldName => {
          // Return empty object so nested resolvers can be called
          resolvers[fieldName] = () => ({});
        });
      }
      return;
    }
    
    // Create resolvers for all other types (like xoAdminPortal)
    if ('getFields' in type && typeof type.getFields === 'function') {
      const fields = type.getFields();
      
      Object.keys(fields).forEach(fieldName => {
        const resolverName = `${typeName}.${fieldName}`;
        resolvers[resolverName] = createNestedResolver(typeName, fieldName);
      });
    }
  });
  
  return resolvers;
}

function createNestedResolver(typeName: string, fieldName: string) {
  const fieldPath = `${typeName}.${fieldName}`;

  return async (graphqlArguments: Record<string, unknown>) => {
    return await new Promise((resolve) => {
      try {
      // Build context for Velocity templates
      const appsyncRequest = {
        arguments: graphqlArguments,
        identity: {
          // TODO: Replace with actual identity data
          sub: "test-user-id",
          issuer:
            "https://cognito-idp.us-west-2.amazonaws.com/us-west-2_123456789",
          claims: {
            sub: "test-user-id",
            aud: "123456789",
            azp: "123456789",
            gty: "password",
            iss: "https://cognito-idp.us-west-2.amazonaws.com/us-west-2_123456789",
            iat: 1617640000,
            exp: 1617643600,
            permissions: [
              "update:attestation-reminder",
              "mutation:xo-admin-portal",
            ],
            org_id: "01J3JGGQ4G3JNCX75086M4MBG9",
          },
        },
        source: {},
        info: {
          parentTypeName: typeName,
          fieldName: fieldName,
        },
      };

      // Render request template
      console.log(`Request for ${fieldPath}:`, appsyncRequest);

      // Execute data source

      const invocation: Invocation = {
        lambdaEventId: uuid(),
        payload: JSON.stringify(appsyncRequest, null, 2),
        status: "pending",
      }

      if (lambdasAwaitingPayloads.length === 0) {
        console.log(`No lambdas waiting for payloads, dropping GraphQL request for ${fieldPath}`);
        return resolve({
          data: null,
          errors: [
            {
              message: `No lambdas waiting for payloads, dropping GraphQL request for ${fieldPath}`,
            },
          ],
        })
      }

      invocations.push(invocation);

      invokeLambdaFromQueue(invocation);

      const eventCallback = (invocation: Invocation) => {
        if (invocation.lambdaEventId !== invocation.lambdaEventId) {
          return;
        }
        if (invocation.status !== "success") {
          return resolve({
            data: null,
            errors: [
              {
                message: `Invocation failed for ${fieldPath}`,
              },
            ],
          });
        }

        console.log(invocation.responsePayload)

        resolve(invocation.responsePayload ? JSON.parse(invocation.responsePayload) : null);

        console.log(`Invocation completed for ${fieldPath}:`, invocation);

        lambdaResponseEventEmitter.off("invocationCompleted", eventCallback);
      };
      lambdaResponseEventEmitter.on("invocationCompleted", eventCallback);
    } catch (error) {
      console.error(`Resolver error for ${fieldPath}:`, error);

      // Handle error through response template if available
      const errorContext = {
        arguments: graphqlArguments,
        result: null,
        error: {
          // @ts-expect-error
          message: error.message,
          // @ts-expect-error
          type: error.constructor.name,
        },
      };

      try {
        return resolve(errorContext);
      } catch {
        throw error; // Throw original error if response template fails
      }
    }
  });
  };
}
