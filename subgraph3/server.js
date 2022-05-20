const fs = require('fs');
const dotenv = require('dotenv');

const { ApolloServer, gql } = require('apollo-server');
const { buildSubgraphSchema } = require('@apollo/federation');
const { MongoClient } = require("mongodb");

const resolvers = require('./resolvers');
const AircraftAPI = require('./datasources/aircraft');
const RegistrationAPI = require('./datasources/registration');
const EngineAPI = require('./datasources/engines');

dotenv.config();

// Load schema
const schema = gql(fs.readFileSync('schema.graphql', 'utf8'))

// Connect to MongoDB
const client = new MongoClient(process.env.MONGODB_CONN);
client.connect();
const database = client.db("aircraft");

const dataSources = () => ({
  aircraftAPI: new AircraftAPI(database),
  regAPI: new RegistrationAPI(database),
  engineAPI: new EngineAPI(database),
});

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer({ 
  schema: buildSubgraphSchema([{ typeDefs: schema, resolvers }]),
  dataSources: dataSources
});

const PORT = process.env.PORT || 8080;

// The `listen` method launches a web server.
server.listen({port:PORT}).then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
