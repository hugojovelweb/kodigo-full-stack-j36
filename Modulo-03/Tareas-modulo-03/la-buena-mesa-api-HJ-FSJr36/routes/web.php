<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'project' => 'La Buena Mesa - API RESTful de Menú',
        'status' => 'ok',
        'docs' => 'Ver README.md para la documentación completa de endpoints.',
    ]);
});
