// API simulada (SOLO para desarrollo/pruebas sin Laravel).
// Uso:  node scripts/mock-api.mjs   →  http://localhost:8000/api
import http from "node:http";

const PORT = process.env.PORT ?? 8000;
const users = new Map(); // email → { id, name, email, password }
const orders = []; // { id, user_id, status, total, items, created_at }
const products = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  name: `Producto ${i + 1}`,
  description: `Descripción del producto ${i + 1}. Material de calidad y envío rápido.`,
  price: (9.99 + i * 5).toFixed(2),
  stock: 20 - i,
  image_url: null,
}));

const send = (res, code, body) => {
  res.writeHead(code, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
};
const readBody = (req) =>
  new Promise((r) => {
    let d = "";
    req.on("data", (c) => (d += c));
    req.on("end", () => r(d ? JSON.parse(d) : {}));
  });
const userFrom = (req) => {
  const t = (req.headers.authorization ?? "").replace("Bearer ", "");
  return [...users.values()].find((u) => `tok-${u.id}` === t);
};

http
  .createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const p = url.pathname.replace(/^\/api/, "");
    const body = ["POST", "PUT"].includes(req.method) ? await readBody(req) : {};

    if (p === "/auth/register" && req.method === "POST") {
      if (users.has(body.email))
        return send(res, 422, { message: "El correo ya existe.", errors: { email: ["El correo ya está registrado."] } });
      const u = { id: users.size + 1, name: body.name, email: body.email, password: body.password };
      users.set(u.email, u);
      return send(res, 201, { user: { id: u.id, name: u.name }, access_token: `tok-${u.id}` });
    }
    if (p === "/auth/login" && req.method === "POST") {
      const u = users.get(body.email);
      if (!u || u.password !== body.password) return send(res, 401, { message: "Credenciales inválidas." });
      return send(res, 200, { access_token: `tok-${u.id}`, token_type: "bearer" });
    }
    if (p === "/auth/logout") return send(res, 200, { message: "ok" });

    if (p === "/products" && req.method === "GET") {
      const page = Number(url.searchParams.get("page") ?? 1);
      const per = 8;
      return send(res, 200, {
        data: products.slice((page - 1) * per, page * per),
        meta: { current_page: page, last_page: Math.ceil(products.length / per) },
      });
    }
    const pm = p.match(/^\/products\/(\d+)$/);
    if (pm) {
      const prod = products.find((x) => x.id === Number(pm[1]));
      return prod ? send(res, 200, { data: prod }) : send(res, 404, { message: "No encontrado" });
    }

    const user = userFrom(req);
    if (p.startsWith("/orders") && !user) return send(res, 401, { message: "Unauthenticated." });

    if (p === "/orders" && req.method === "POST") {
      const items = (body.items ?? []).map((i) => {
        const prod = products.find((x) => x.id === i.product_id);
        return { product_id: i.product_id, name: prod?.name, quantity: i.quantity, unit_price: prod?.price };
      });
      const total = items.reduce((n, i) => n + i.quantity * Number(i.unit_price), 0);
      const o = { id: orders.length + 1, user_id: user.id, status: "pending", total, items, created_at: new Date().toISOString() };
      orders.push(o);
      return send(res, 201, { data: o });
    }
    if (p === "/orders" && req.method === "GET")
      return send(res, 200, { data: orders.filter((o) => o.user_id === user.id).reverse() });

    const om = p.match(/^\/orders\/(\d+)(\/pay)?$/);
    if (om) {
      const o = orders.find((x) => x.id === Number(om[1]) && x.user_id === user.id);
      if (!o) return send(res, 404, { message: "Orden no encontrada" });
      if (om[2] && req.method === "POST") {
        if (body.payment_method === "pm_card_chargeDeclined") return send(res, 402, { message: "Tarjeta rechazada." });
        o.status = "paid";
        return send(res, 200, { message: "Pago exitoso", data: o });
      }
      return send(res, 200, { data: o });
    }
    send(res, 404, { message: "Ruta no encontrada" });
  })
  .listen(PORT, () => console.log(`Mock API en http://localhost:${PORT}/api`));
