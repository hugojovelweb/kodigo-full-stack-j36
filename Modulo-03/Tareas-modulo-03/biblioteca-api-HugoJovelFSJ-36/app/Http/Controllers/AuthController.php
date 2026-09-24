<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Tymon\JWTAuth\JWTGuard;

/**
 * Controlador de autenticacion basado en JWT (guard "api").
 *
 * Endpoints publicos: register, login.
 * Endpoints protegidos: logout, refresh, me.
 */
class AuthController extends Controller
{
    /**
     * Devuelve el guard "api" ya tipado como JWTGuard.
     *
     * Auth::guard('api') solo declara el contrato generico
     * Illuminate\Contracts\Auth\Guard, por lo que herramientas de
     * analisis estatico (Intelephense, PHPStan) no reconocen metodos
     * propios de JWT como login(), refresh() o factory(). Al declarar
     * el tipo de retorno real aqui, en un unico lugar, evitamos
     * repetir anotaciones @var en cada metodo del controlador.
     */
    protected function guard(): JWTGuard
    {
        /** @var JWTGuard $guard */
        $guard = Auth::guard('api');

        return $guard;
    }

    /**
     * POST /api/auth/register
     * Registra un nuevo usuario y devuelve un token JWT.
     */
    public function register(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Error de validacion',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = User::create([
            'name' => $request->string('name'),
            'email' => $request->string('email'),
            // Gracias al cast 'password' => 'hashed' del modelo,
            // Laravel cifra la contrasena automaticamente con bcrypt.
            'password' => $request->string('password'),
        ]);

        $token = $this->guard()->login($user);

        return response()->json([
            'message' => 'Usuario registrado correctamente',
            'user' => $user,
            'authorization' => $this->respondWithToken($token),
        ], 201);
    }

    /**
     * POST /api/auth/login
     * Valida las credenciales y devuelve un token JWT firmado.
     */
    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        if (! $token = $this->guard()->attempt($credentials)) {
            return response()->json([
                'message' => 'Credenciales invalidas',
            ], 401);
        }

        return response()->json([
            'message' => 'Inicio de sesion exitoso',
            'user' => $this->guard()->user(),
            'authorization' => $this->respondWithToken($token),
        ]);
    }

    /**
     * POST /api/auth/logout
     * Invalida el token actual (lo agrega a la blacklist de jwt-auth).
     */
    public function logout(): JsonResponse
    {
        $this->guard()->logout();

        return response()->json([
            'message' => 'Sesion cerrada correctamente. Token invalidado.',
        ]);
    }

    /**
     * GET /api/auth/me
     * Devuelve los datos del usuario autenticado segun el token enviado.
     */
    public function me(): JsonResponse
    {
        return response()->json($this->guard()->user());
    }

    /**
     * POST /api/auth/refresh
     * Emite un nuevo token a partir de uno valido (rotacion de tokens).
     */
    public function refresh(): JsonResponse
    {
        return response()->json(
            $this->respondWithToken($this->guard()->refresh())
        );
    }

    /**
     * Da forma estandar a la respuesta que contiene el token.
     */
    protected function respondWithToken(string $token): array
    {
        return [
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => $this->guard()->factory()->getTTL() * 60,
        ];
    }
}
