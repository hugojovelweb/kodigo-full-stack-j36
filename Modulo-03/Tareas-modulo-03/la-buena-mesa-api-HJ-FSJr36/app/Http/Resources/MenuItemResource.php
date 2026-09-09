<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Transforma el modelo Eloquent MenuItem en la representación JSON
 * pública de la API.
 *
 * Usar un API Resource (en lugar de devolver el modelo directamente)
 * desacopla la estructura de la base de datos de la estructura del
 * contrato HTTP: podemos cambiar la tabla sin romper a los clientes
 * (app de meseros, sistema de cocina, plataforma web) que menciona
 * el caso de estudio.
 *
 * @mixin \App\Models\MenuItem
 */
class MenuItemResource extends JsonResource
{
    /**
     * Transforma el recurso en un arreglo.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'price' => (float) $this->price,
            'category' => $this->category,
            'is_available' => (bool) $this->is_available,
            'image_url' => $this->image_url,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
