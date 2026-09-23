<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\BookController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Rutas de la API - Biblioteca Comunitaria
|--------------------------------------------------------------------------
| Todas las rutas de este archivo se registran automaticamente bajo
| el prefijo /api (ver bootstrap/app.php -> withRouting(api: ...)).
*/

// -----------------------------------------------------------------
// Endpoints publicos de autenticacion
// -----------------------------------------------------------------
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    // -------------------------------------------------------------
    // Endpoints de autenticacion protegidos por JWT
    // -------------------------------------------------------------
    Route::middleware('auth:api')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::post('/refresh', [AuthController::class, 'refresh']);
        Route::get('/me', [AuthController::class, 'me']);
    });
});

// -----------------------------------------------------------------
// Endpoints protegidos del catalogo de libros (requieren token JWT)
// -----------------------------------------------------------------
Route::middleware('auth:api')->group(function () {
    Route::apiResource('books', BookController::class);
});
