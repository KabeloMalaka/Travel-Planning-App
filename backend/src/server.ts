import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { typeDefs } from "./schema.ts";
import { resolvers } from "./resolvers.ts";

import dotenv from 'dotenv';
dotenv.config();

const PORT = Number(process.env.PORT);

async function startServer() {
  const server = new ApolloServer({ typeDefs, resolvers });

  const { url } = await startStandaloneServer(server, {
    listen: { port: PORT },
  });
  
  console.log(`Apollo Server ready at ${url}`);
}

startServer();