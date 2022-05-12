import fs from "fs";
import { ApolloGateway } from "@apollo/gateway";
import { ApolloServer } from "apollo-server";

import  dotenv  from "dotenv";
dotenv.config();

const PORT = process.env.PORT || 4000;

const schema = fs.readFileSync('supergraph.graphql', 'utf8').toString();

const gateway = new ApolloGateway({supergraphSdl: schema});

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