<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;
use Illuminate\Http\Request;

/**
 * Sobrescribe el middleware de autenticacion por defecto de Laravel.
 *
 * Como esta aplicacion es una API pura (sin vistas ni sesiones web),
 * nunca debe intentar redirigir a una ruta "login": en su lugar,
 * al no devolver ninguna ruta, Laravel lanza AuthenticationException,
 * la cual es convertida a JSON 401 en bootstrap/app.php.
 */
class Authenticate extends Middleware
{
    protected function redirectTo(Request $request): ?string
    {
        return null;
    }
}
