import { split, HttpLink } from "@apollo/client";
import { getMainDefinition } from "@apollo/client/utilities";
import { WebSocketLink } from "@apollo/client/link/ws";
import { setContext } from "@apollo/client/link/context";

const hasuraSecret = process.env.REACT_APP_HASURA_KEY;

const httpLink = new HttpLink({
  uri: "http://128.199.97.105/v1/graphql",
});

const authLink = setContext((_, { headers }) => {
  return {
    headers: {
      ...headers,
      "X-Hasura-Admin-Secret": hasuraSecret,
    },
  };
});

const wsLink = new WebSocketLink({
  uri: `ws://128.199.97.105/v1/graphql`,
  options: {
    reconnect: true,
    connectionParams: {
      headers: {
        "X-Hasura-Admin-Secret": hasuraSecret,
      },
    },
  },
});

export const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  },
  wsLink,
  authLink.concat(httpLink)
);
