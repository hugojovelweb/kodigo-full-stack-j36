<?php
/**
 * Hugo Ernesto Jovel Hernandez - FSJ36
 *
 * public/index.php
 *
 * Este archivo ya viene incluido por defecto en cualquier instalación
 * nueva de Laravel (laravel/laravel). Se incluye aquí únicamente por
 * completitud, ya que no se han agregado servicios adicionales.
 */

use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// Determine if the application is in maintenance mode...
if (file_exists($maintenance = __DIR__.'/../storage/framework/maintenance.php')) {
    require $maintenance;
}

// Register the Composer autoloader...
require __DIR__.'/../vendor/autoload.php';

// Bootstrap Laravel and handle the request...
(require_once __DIR__.'/../bootstrap/app.php')
    ->handleRequest(Request::capture());
