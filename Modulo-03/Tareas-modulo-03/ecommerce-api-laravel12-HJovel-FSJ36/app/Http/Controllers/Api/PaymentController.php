<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Stripe\Exception\ApiErrorException;
use Stripe\Stripe;
use Stripe\PaymentIntent;
use Stripe\Webhook;
use Stripe\Exception\SignatureVerificationException;

class PaymentController extends Controller
{
    public function __construct()
    {
        Stripe::setApiKey(config('services.stripe.secret'));
    }

    /**
     * @OA\Post(
     *     path="/payments/checkout",
     *     tags={"Pagos"},
     *     summary="Crear un PaymentIntent de Stripe para pagar una orden",
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"order_id"},
     *             @OA\Property(property="order_id", type="integer", example=1)
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="PaymentIntent creado. Use client_secret en el frontend con Stripe.js/Elements",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="client_secret", type="string", example="pi_3P9x2eK..._secret_..."),
     *                 @OA\Property(property="payment", ref="#/components/schemas/Payment")
     *             )
     *         )
     *     ),
     *     @OA\Response(response=403, description="No autorizado", @OA\JsonContent(ref="#/components/schemas/ErrorResponse")),
     *     @OA\Response(response=422, description="La orden ya fue pagada o no es válida", @OA\JsonContent(ref="#/components/schemas/ErrorResponse")),
     *     @OA\Response(response=500, description="Error al comunicarse con Stripe", @OA\JsonContent(ref="#/components/schemas/ErrorResponse"))
     * )
     */
    public function checkout(Request $request)
    {
        $request->validate([
            'order_id' => ['required', 'integer', 'exists:orders,id'],
        ]);

        $order = Order::findOrFail($request->order_id);

        if ($order->user_id !== auth('api')->id()) {
            return response()->json([
                'success' => false,
                'message' => 'No tiene permiso para pagar esta orden.',
            ], 403);
        }

        if ($order->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Esta orden no está pendiente de pago.',
            ], 422);
        }

        try {
            $intent = PaymentIntent::create([
                'amount' => (int) round($order->total * 100), // Stripe trabaja en centavos
                'currency' => config('services.stripe.currency', 'usd'),
                'metadata' => [
                    'order_id' => $order->id,
                    'order_number' => $order->order_number,
                    'user_id' => $order->user_id,
                ],
                'automatic_payment_methods' => ['enabled' => true],
            ]);

            $payment = Payment::updateOrCreate(
                ['order_id' => $order->id],
                [
                    'stripe_payment_intent_id' => $intent->id,
                    'amount' => $order->total,
                    'currency' => $intent->currency,
                    'status' => $intent->status,
                ]
            );

            return response()->json([
                'success' => true,
                'data' => [
                    'client_secret' => $intent->client_secret,
                    'payment' => $payment,
                ],
            ]);
        } catch (ApiErrorException $e) {
            Log::error('Stripe checkout error: '.$e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Error al procesar el pago con Stripe.',
                'errors' => ['stripe' => $e->getMessage()],
            ], 500);
        }
    }

    /**
     * @OA\Post(
     *     path="/payments/webhook",
     *     tags={"Pagos"},
     *     summary="Webhook de Stripe (confirmación asíncrona de pagos)",
     *     description="Endpoint público invocado por Stripe. Verifica la firma con STRIPE_WEBHOOK_SECRET. No requiere token JWT.",
     *     @OA\Response(response=200, description="Evento procesado"),
     *     @OA\Response(response=400, description="Firma inválida")
     * )
     */
    public function webhook(Request $request)
    {
        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');
        $webhookSecret = config('services.stripe.webhook_secret');

        try {
            $event = Webhook::constructEvent($payload, $sigHeader, $webhookSecret);
        } catch (\UnexpectedValueException $e) {
            return response()->json(['success' => false, 'message' => 'Payload inválido.'], 400);
        } catch (SignatureVerificationException $e) {
            return response()->json(['success' => false, 'message' => 'Firma inválida.'], 400);
        }

        switch ($event->type) {
            case 'payment_intent.succeeded':
                $this->handlePaymentSucceeded($event->data->object);
                break;

            case 'payment_intent.payment_failed':
                $this->handlePaymentFailed($event->data->object);
                break;

            default:
                Log::info('Evento de Stripe no manejado: '.$event->type);
        }

        return response()->json(['success' => true, 'message' => 'Evento recibido.']);
    }

    private function handlePaymentSucceeded($intent): void
    {
        $payment = Payment::where('stripe_payment_intent_id', $intent->id)->first();

        if (! $payment) {
            return;
        }

        $payment->update([
            'status' => 'succeeded',
            'stripe_charge_id' => $intent->latest_charge ?? null,
            'raw_response' => $intent->toArray(),
        ]);

        $payment->order->update(['status' => 'paid']);
    }

    private function handlePaymentFailed($intent): void
    {
        $payment = Payment::where('stripe_payment_intent_id', $intent->id)->first();

        if (! $payment) {
            return;
        }

        $payment->update([
            'status' => 'failed',
            'raw_response' => $intent->toArray(),
        ]);

        $payment->order->update(['status' => 'failed']);
    }
}
