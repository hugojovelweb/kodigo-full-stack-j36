<?php

return [

    /*
    |--------------------------------------------------------------------------
    | JWT Authentication Secret
    |--------------------------------------------------------------------------
    | Se genera automaticamente con: php artisan jwt:secret
    | y se guarda en la variable JWT_SECRET del archivo .env.
    | NUNCA debe compartirse ni subirse a un repositorio publico.
    */
    'secret' => env('JWT_SECRET'),

    /*
    |--------------------------------------------------------------------------
    | JWT_ALGO
    |--------------------------------------------------------------------------
    | Algoritmo de firma utilizado para codificar el token.
    */
    'algo' => env('JWT_ALGO', 'HS256'),

    /*
    |--------------------------------------------------------------------------
    | JWT Authentication Keys (solo necesario para algoritmos RS256/ES256)
    |--------------------------------------------------------------------------
    */
    'keys' => [
        'public' => env('JWT_PUBLIC_KEY'),
        'private' => env('JWT_PRIVATE_KEY'),
        'passphrase' => env('JWT_PASSPHRASE'),
    ],

    /*
    |--------------------------------------------------------------------------
    | JWT time to live
    |--------------------------------------------------------------------------
    | Tiempo de vida del token en minutos. Pasado este tiempo, el token
    | expira y el cliente debe usar /api/auth/refresh o volver a
    | autenticarse en /api/auth/login.
    */
    'ttl' => env('JWT_TTL', 60),

    /*
    |--------------------------------------------------------------------------
    | Refresh time to live
    |--------------------------------------------------------------------------
    | Ventana de tiempo (en minutos) durante la cual un token ya
    | expirado todavia puede refrescarse.
    */
    'refresh_ttl' => env('JWT_REFRESH_TTL', 20160),

    /*
    |--------------------------------------------------------------------------
    | JWT hashing algorithm alias
    |--------------------------------------------------------------------------
    */
    'required_claims' => [
        'iss',
        'iat',
        'exp',
        'nbf',
        'sub',
        'jti',
    ],

    /*
    |--------------------------------------------------------------------------
    | Blacklist habilitada
    |--------------------------------------------------------------------------
    | Cuando esta activa, al hacer logout el token se invalida
    | realmente (se guarda en cache) y no puede reutilizarse.
    */
    'blacklist_enabled' => env('JWT_BLACKLIST_ENABLED', true),

    'blacklist_grace_period' => env('JWT_BLACKLIST_GRACE_PERIOD', 0),

    'show_black_list_exception' => false,

    /*
    |--------------------------------------------------------------------------
    | Persistent Claims
    |--------------------------------------------------------------------------
    */
    'persistent_claims' => [],

    'lock_subject' => true,

    'leeway' => env('JWT_LEEWAY', 0),

    'exceptions' => [
        'token_expired' => Tymon\JWTAuth\Exceptions\TokenExpiredException::class,
        'token_invalid' => Tymon\JWTAuth\Exceptions\TokenInvalidException::class,
    ],

    'decrypt_cookies' => false,

    'providers' => [
        'jwt' => Tymon\JWTAuth\Providers\JWT\Lcobucci::class,

        'auth' => Tymon\JWTAuth\Providers\Auth\Illuminate::class,

        'storage' => Tymon\JWTAuth\Providers\Storage\Illuminate::class,
    ],

];
