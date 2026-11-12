import { connection } from "next/server";

// El año se calcula en cada petición (nunca escrito a mano).
// Con Cache Components, new Date() debe ejecutarse después de connection().
export async function CurrentYear() {
  await connection();
  return <>{new Date().getFullYear()}</>;
}
