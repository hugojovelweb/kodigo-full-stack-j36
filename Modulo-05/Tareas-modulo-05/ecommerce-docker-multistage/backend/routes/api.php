<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\ProductController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Rutas de la API - Ecommerce
|--------------------------------------------------------------------------
| Todas las rutas aquí ya tienen el prefijo /api gracias a la configuración
| en bootstrap/app.php -> withRouting(api: __DIR__.'/../routes/api.php')
*/

// ---------- Autenticación ----------
Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);

    Route::middleware('auth:api')->group(function () {
        Route::get('me', [AuthController::class, 'me']);
        Route::post('logout', [AuthController::class, 'logout']);
        Route::post('refresh', [AuthController::class, 'refresh']);
    });
});

// ---------- Productos ----------
Route::get('products', [ProductController::class, 'index']);          // Público
Route::get('products/{product}', [ProductController::class, 'show']); // Público

Route::middleware('auth:api')->group(function () {
    Route::post('products', [ProductController::class, 'store']);
    Route::put('products/{product}', [ProductController::class, 'update']);
    Route::delete('products/{product}', [ProductController::class, 'destroy']);
});

// ---------- Órdenes ----------
Route::middleware('auth:api')->group(function () {
    Route::get('orders', [OrderController::class, 'index']);
    Route::get('orders/{order}', [OrderController::class, 'show']);
    Route::post('orders', [OrderController::class, 'store']);
});

// ---------- Pagos ----------
Route::middleware('auth:api')->post('payments/checkout', [PaymentController::class, 'checkout']);

// Webhook público (Stripe firma la petición; no usa JWT)
Route::post('payments/webhook', [PaymentController::class, 'webhook']);
