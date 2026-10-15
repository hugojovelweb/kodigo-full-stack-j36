import "server-only";
import { createHash, randomBytes } from "node:crypto";

/** Token aleatorio criptográficamente seguro (256 bits) apto para URL y cookies. */
export const generateToken = () => randomBytes(32).toString("base64url");

/** Lo que se guarda en la base de datos: nunca el token en claro. */
export const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");
