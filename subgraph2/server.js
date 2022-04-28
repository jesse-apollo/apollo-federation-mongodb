const fs = require('fs');
const dotenv = require('dotenv');

const { ApolloServer, gql } = require('apollo-server');
const { buildSubgraphSchema } = require('@apollo/federation');
const { MongoClient } = require("mongodb");

const resolvers = require('./resolvers');
const OnTimeAPI = require('./datasource');

dotenv.config();

// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
const schema = gql(fs.readFileSync('schema.graphql', 'utf8'))


const client = new MongoClient(process.env.MONGODB_CONN);
client.connect();
const database = client.db("ontime");

const dataSources = () => ({
  ontimeAPI: new OnTimeAPI(database),
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
