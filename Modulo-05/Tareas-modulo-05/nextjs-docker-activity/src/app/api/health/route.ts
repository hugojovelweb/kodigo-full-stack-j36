// Endpoint de salud usado por el HEALTHCHECK del Dockerfile.
export function GET() {
  return Response.json({ status: "ok" });
}
