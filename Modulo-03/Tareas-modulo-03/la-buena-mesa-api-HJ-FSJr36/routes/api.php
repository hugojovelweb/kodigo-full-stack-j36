<?php

use App\Http\Controllers\Api\MenuItemController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes - La Buena Mesa
|--------------------------------------------------------------------------
|
| Todas las rutas aquí definidas se registran automáticamente bajo el
| prefijo "/api" (ver bootstrap/app.php) y reciben el middleware group
| "api" (throttle + resolución de bindings).
|
*/

Route::prefix('menu-items')->group(function () {
    // Ruta específica ANTES del recurso para que "category" no sea
    // interpretado como un {menuItem} por el route model binding.
    Route::get('category/{category}', [MenuItemController::class, 'byCategory'])
        ->name('menu-items.by-category');
});

Route::apiResource('menu-items', MenuItemController::class);
