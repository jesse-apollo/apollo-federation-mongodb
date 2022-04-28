import { ApolloGateway } from "@apollo/gateway";
import { ApolloServer } from "apollo-server";

import  dotenv  from "dotenv";
dotenv.config();

const PORT = process.env.PORT || 4000;

const gateway = new ApolloGateway({});

const server = new ApolloServer({
  gateway,
  debug: false,
  introspection: false, 
  playground: false, 
  subscriptions: false,
});

server.listen({ port: PORT }).then(({ url }) => {
  console.log(`Gateway ready at ${url}`);
}); 