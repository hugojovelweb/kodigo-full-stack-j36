<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Modelo Book.
 *
 * Representa un libro del catalogo de la biblioteca.
 */
class Book extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'author',
        'isbn',
        'genre',
        'published_year',
        'copies_available',
        'description',
    ];

    protected function casts(): array
    {
        return [
            'published_year' => 'integer',
            'copies_available' => 'integer',
        ];
    }
}
