<?php
/**
 * Hugo Ernesto Jovel Hernandez - FSJ36
 *
 * bootstrap/app.php
 *
 * Este archivo ya viene incluido por defecto en cualquier instalación
 * nueva de Laravel (laravel/laravel). Se incluye aquí únicamente por
 * completitud, ya que no se han agregado servicios adicionales.
 */

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        //
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
