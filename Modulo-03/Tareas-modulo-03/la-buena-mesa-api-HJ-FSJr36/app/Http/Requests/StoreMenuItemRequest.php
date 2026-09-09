<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator as ValidatorContract;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

/**
 * Valida los datos de entrada para la creación (POST) de un
 * elemento del menú.
 *
 * Mantener la validación en una Form Request (en lugar del controlador)
 * es parte de la separación de responsabilidades exigida por la
 * arquitectura limpia: el controlador no debe saber "cómo" se valida,
 * solo que los datos ya son válidos cuando los recibe.
 */
class StoreMenuItemRequest extends FormRequest
{
    /**
     * Determina si el usuario está autorizado a realizar esta petición.
     *
     * No hay control de roles en el alcance de esta actividad,
     * por lo que se autoriza siempre.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Reglas de validación aplicadas al payload.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:150'],
            'description' => ['nullable', 'string', 'max:2000'],
            'price' => ['required', 'numeric', 'min:0', 'max:99999.99'],
            'category' => ['required', 'string', 'max:100'],
            'is_available' => ['sometimes', 'boolean'],
            'image_url' => ['nullable', 'url', 'max:2048'],
        ];
    }

    /**
     * Mensajes de validación personalizados en español.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'El nombre del platillo es obligatorio.',
            'name.max' => 'El nombre no puede superar los 150 caracteres.',
            'price.required' => 'El precio es obligatorio.',
            'price.numeric' => 'El precio debe ser un valor numérico.',
            'price.min' => 'El precio no puede ser negativo.',
            'category.required' => 'La categoría es obligatoria.',
            'image_url.url' => 'La URL de la imagen no tiene un formato válido.',
        ];
    }

    /**
     * Sobrescribe la respuesta cuando la validación falla para
     * devolver siempre JSON (contrato de API REST), sin importar
     * las cabeceras Accept enviadas por el cliente.
     */
    protected function failedValidation(ValidatorContract $validator): void
    {
        throw new HttpResponseException(response()->json([
            'message' => 'Los datos proporcionados no son válidos.',
            'errors' => $validator->errors(),
        ], 422));
    }
}
