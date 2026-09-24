<?php

use App\Http\Middleware\Authenticate;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Tymon\JWTAuth\Exceptions\JWTException;
use Tymon\JWTAuth\Exceptions\TokenExpiredException;
use Tymon\JWTAuth\Exceptions\TokenInvalidException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // Alias "auth" apuntando a nuestra version que nunca
        // redirige (una API no tiene pantalla de login).
        $middleware->alias([
            'auth' => Authenticate::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // Todas las excepciones relacionadas con JWT y autenticacion
        // se transforman en respuestas JSON limpias con codigo 401,
        // en lugar de la pagina de error HTML por defecto de Laravel.
        $exceptions->render(function (TokenExpiredException $e, $request) {
            return response()->json(['message' => 'El token ha expirado'], 401);
        });

        $exceptions->render(function (TokenInvalidException $e, $request) {
            return response()->json(['message' => 'El token es invalido'], 401);
        });

        $exceptions->render(function (JWTException $e, $request) {
            return response()->json(['message' => 'Token no proporcionado'], 401);
        });

        $exceptions->render(function (AuthenticationException $e, $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                return response()->json(['message' => 'No autenticado'], 401);
            }
        });
    })->create();
