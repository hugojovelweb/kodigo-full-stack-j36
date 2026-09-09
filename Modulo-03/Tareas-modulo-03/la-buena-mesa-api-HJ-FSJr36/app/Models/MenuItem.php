<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Modelo Eloquent que representa un elemento del menú del restaurante
 * "La Buena Mesa".
 *
 * @property int $id
 * @property string $name
 * @property string|null $description
 * @property float $price
 * @property string $category
 * @property bool $is_available
 * @property string|null $image_url
 * @property \Illuminate\Support\Carbon $created_at
 * @property \Illuminate\Support\Carbon $updated_at
 */
class MenuItem extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * Atributos asignables en masa.
     *
     * Se usa mass assignment protegido (whitelist) como buena práctica
     * de seguridad, en lugar de $guarded = [].
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'description',
        'price',
        'category',
        'is_available',
        'image_url',
    ];

    /**
     * Conversión de tipos de atributos (casts).
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'is_available' => 'boolean',
        ];
    }

    /**
     * Scope de consulta: filtra únicamente los elementos disponibles.
     */
    public function scopeAvailable(Builder $query): Builder
    {
        return $query->where('is_available', true);
    }

    /**
     * Scope de consulta: filtra por categoría (case-insensitive).
     */
    public function scopeByCategory(Builder $query, string $category): Builder
    {
        return $query->whereRaw('LOWER(category) = ?', [strtolower($category)]);
    }
}
