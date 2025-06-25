import { auth } from "express-oauth2-jwt-bearer";
import dotenv from "dotenv";
import express from "express";

const app = express();

dotenv.config();

const jwtCheck = auth({
  audience: process.env.AUTH0_API_IDENTIFIER,
  issuerBaseURL: process.env.AUTH0_DOMAIN,
  tokenSigningAlg: "RS256",
});

export default jwtCheck;
