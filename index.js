import express from 'express';
import http from 'http';
import cors from 'cors';

import { ApolloServer } from "@apollo/server"
import { startStandaloneServer } from "@apollo/server/standalone"
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { buildSchema } from "graphql"
import resolvers from "./resolvers/index.js"
import typeDefs from "./typeDefs/index.js"
import dotenv from 'dotenv';
import { connectDb } from './db/connectDb.js';
import { buildContext } from "graphql-passport";
import User from "./models/user.model.js";
import jwt from "jsonwebtoken";

import passport from 'passport';
import session from 'express-session';
import ConnectMongoDBSession from 'connect-mongodb-session';
import { ConfigurePassport } from './passport/passport.config.js';

const app = express()

ConfigurePassport();

dotenv.config();

const httpServer = http.createServer(app);
const server = new ApolloServer({
  typeDefs: typeDefs,
  resolvers: resolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })]
})

await server.start();



app.use(
  "/graphql",
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
  express.json(),
  expressMiddleware(server, {
    context: async ({ req }) => {
      const token = req.headers.authorization?.split(" ")[1]; // Extract token
      let user = null;

      if (token) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          user = await User.findById(decoded.id);

          if (!user) {
            throw new Error("User not found.");
          }
        } catch (error) {
          console.error("Token verification failed:", error);
        }
      }

      return { user }; // Attach user to context (null if not authenticated)
    },
  })
);

await new Promise(resolve => httpServer.listen({ port: 4000 }, resolve));
await connectDb();
console.log(`🚀 Server ready at http://localhost:4000/graphql`);