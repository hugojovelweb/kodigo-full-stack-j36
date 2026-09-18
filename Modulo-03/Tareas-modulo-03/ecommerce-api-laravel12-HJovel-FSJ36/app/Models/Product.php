<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

/**
 * @OA\Schema(
 *     schema="Product",
 *     type="object",
 *     title="Producto",
 *     @OA\Property(property="id", type="integer", example=1),
 *     @OA\Property(property="name", type="string", example="Mouse inalámbrico"),
 *     @OA\Property(property="slug", type="string", example="mouse-inalambrico"),
 *     @OA\Property(property="description", type="string", example="Mouse ergonómico con receptor USB"),
 *     @OA\Property(property="price", type="number", format="float", example=19.99),
 *     @OA\Property(property="stock", type="integer", example=50),
 *     @OA\Property(property="sku", type="string", example="SKU-0001"),
 *     @OA\Property(property="image", type="string", nullable=true, example="https://example.com/img/mouse.jpg"),
 *     @OA\Property(property="is_active", type="boolean", example=true),
 *     @OA\Property(property="created_at", type="string", format="date-time"),
 *     @OA\Property(property="updated_at", type="string", format="date-time")
 * )
 */
class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'price',
        'stock',
        'image',
        'sku',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'is_active' => 'boolean',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Product $product) {
            if (empty($product->slug)) {
                $product->slug = Str::slug($product->name).'-'.Str::random(5);
            }
        });
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
