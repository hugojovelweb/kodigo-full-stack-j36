<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Tymon\JWTAuth\Contracts\JWTSubject;

/**
 * Modelo User.
 *
 * Implementa JWTSubject para poder ser autenticado mediante
 * JSON Web Tokens a traves del guard "api" (driver jwt).
 */
class User extends Authenticatable implements JWTSubject
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            // El cast "hashed" cifra automaticamente la contrasena
            // con bcrypt cada vez que se asigna, sin necesidad de
            // llamar a Hash::make() manualmente.
            'password' => 'hashed',
        ];
    }

    /**
     * Identificador que se guardara en el "sub" del token JWT.
     */
    public function getJWTIdentifier(): mixed
    {
        return $this->getKey();
    }

    /**
     * Claims personalizados que se anadiran al payload del token.
     */
    public function getJWTCustomClaims(): array
    {
        return [];
    }
}
