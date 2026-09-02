<?php

use App\Http\Controllers\ContactoController;
use App\Http\Controllers\LugarController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Rutas Web - Catálogo Turístico de El Salvador
|--------------------------------------------------------------------------
|
| Aquí se define el primer punto de contacto del ciclo de vida de una
| petición dentro de Laravel: el Router. Cada ruta enlaza una URI y un
| verbo HTTP con el método de un Controlador, que a su vez consulta al
| Modelo y retorna una Vista.
|
| Flujo:  Cliente -> Router (este archivo) -> Controlador -> Modelo (JSON)
|         -> Controlador -> Vista (Blade) -> Respuesta HTTP -> Cliente
|
*/

Route::get('/', [LugarController::class, 'index'])
    ->name('lugares.index');

Route::get('/lugares/{id}', [LugarController::class, 'show'])
    ->whereNumber('id')
    ->name('lugares.show');

Route::get('/contacto/{id?}', [ContactoController::class, 'create'])
    ->whereNumber('id')
    ->name('contacto.create');

Route::post('/contacto', [ContactoController::class, 'store'])
    ->name('contacto.store');
