<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreOrderRequest;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    /**
     * @OA\Get(
     *     path="/orders",
     *     tags={"Órdenes"},
     *     summary="Historial de compras del usuario autenticado",
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Listado de órdenes del usuario",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="data", type="array", @OA\Items(ref="#/components/schemas/Order"))
     *         )
     *     )
     * )
     */
    public function index()
    {
        $orders = auth('api')->user()
            ->orders()
            ->with(['items.product', 'payment'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json([
            'success' => true,
            'data' => $orders,
        ]);
    }

    /**
     * @OA\Get(
     *     path="/orders/{id}",
     *     tags={"Órdenes"},
     *     summary="Ver el detalle de una orden propia",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Detalle de la orden"),
     *     @OA\Response(response=403, description="No autorizado", @OA\JsonContent(ref="#/components/schemas/ErrorResponse")),
     *     @OA\Response(response=404, description="Orden no encontrada", @OA\JsonContent(ref="#/components/schemas/ErrorResponse"))
     * )
     */
    public function show(Order $order)
    {
        if ($order->user_id !== auth('api')->id()) {
            return response()->json([
                'success' => false,
                'message' => 'No tiene permiso para ver esta orden.',
            ], 403);
        }

        $order->load(['items.product', 'payment']);

        return response()->json([
            'success' => true,
            'data' => $order,
        ]);
    }

    /**
     * @OA\Post(
     *     path="/orders",
     *     tags={"Órdenes"},
     *     summary="Crear una nueva orden de compra",
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"items","shipping_address"},
     *             @OA\Property(
     *                 property="items",
     *                 type="array",
     *                 @OA\Items(
     *                     @OA\Property(property="product_id", type="integer", example=1),
     *                     @OA\Property(property="quantity", type="integer", example=2)
     *                 )
     *             ),
     *             @OA\Property(property="shipping_address", type="string", example="Col. Escalón, San Salvador")
     *         )
     *     ),
     *     @OA\Response(response=201, description="Orden creada, pendiente de pago", @OA\JsonContent(ref="#/components/schemas/Order")),
     *     @OA\Response(response=422, description="Error de validación / stock insuficiente", @OA\JsonContent(ref="#/components/schemas/ErrorResponse"))
     * )
     */
    public function store(StoreOrderRequest $request)
    {
        try {
            $order = DB::transaction(function () use ($request) {
                $user = auth('api')->user();
                $total = 0;
                $itemsData = [];

                // Bloquear filas de productos para evitar condiciones de carrera sobre el stock
                foreach ($request->items as $item) {
                    $product = Product::where('id', $item['product_id'])->lockForUpdate()->first();

                    if (! $product || ! $product->is_active) {
                        throw new \RuntimeException("El producto ID {$item['product_id']} no está disponible.");
                    }

                    if ($product->stock < $item['quantity']) {
                        throw new \RuntimeException("Stock insuficiente para el producto '{$product->name}'.");
                    }

                    $subtotal = $product->price * $item['quantity'];
                    $total += $subtotal;

                    $itemsData[] = [
                        'product' => $product,
                        'quantity' => $item['quantity'],
                        'unit_price' => $product->price,
                        'subtotal' => $subtotal,
                    ];
                }

                $order = Order::create([
                    'user_id' => $user->id,
                    'total' => $total,
                    'status' => 'pending',
                    'shipping_address' => $request->shipping_address,
                ]);

                foreach ($itemsData as $data) {
                    $order->items()->create([
                        'product_id' => $data['product']->id,
                        'quantity' => $data['quantity'],
                        'unit_price' => $data['unit_price'],
                        'subtotal' => $data['subtotal'],
                    ]);

                    // Reservar stock inmediatamente al crear la orden
                    $data['product']->decrement('stock', $data['quantity']);
                }

                return $order->load('items.product');
            });

            return response()->json([
                'success' => true,
                'message' => 'Orden creada con éxito. Proceda al pago.',
                'data' => $order,
            ], 201);
        } catch (\RuntimeException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }
}
