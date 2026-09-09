<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreMenuItemRequest;
use App\Http\Requests\UpdateMenuItemRequest;
use App\Http\Resources\MenuItemResource;
use App\Models\MenuItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

/**
 * Controlador RESTful para la gestión del menú del restaurante
 * "La Buena Mesa".
 *
 * Responsabilidad única: orquestar la petición HTTP entrante hacia
 * el modelo Eloquent y devolver una respuesta JSON estandarizada.
 * La validación vive en los Form Requests y la forma de la
 * respuesta vive en el API Resource, siguiendo el principio de
 * separación de responsabilidades (arquitectura limpia).
 */
class MenuItemController extends Controller
{
    /**
     * GET /api/menu-items
     *
     * Lista todos los elementos del menú. Soporta filtros opcionales
     * por query string:
     *   ?available=true    -> solo platillos disponibles
     *   ?category=Postres  -> filtra por categoría
     *   ?per_page=15       -> tamaño de página (paginación)
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = MenuItem::query();

        if ($request->boolean('available')) {
            $query->available();
        }

        if ($request->filled('category')) {
            $query->byCategory((string) $request->query('category'));
        }

        $perPage = (int) $request->integer('per_page', 15);
        $perPage = $perPage > 0 && $perPage <= 100 ? $perPage : 15;

        $menuItems = $query->latest()->paginate($perPage);

        return MenuItemResource::collection($menuItems);
    }

    /**
     * POST /api/menu-items
     *
     * Crea un nuevo elemento del menú. Los datos ya llegan validados
     * gracias a StoreMenuItemRequest.
     */
    public function store(StoreMenuItemRequest $request): JsonResponse
    {
        $menuItem = MenuItem::create($request->validated());

        return (new MenuItemResource($menuItem))
            ->response()
            ->setStatusCode(JsonResponse::HTTP_CREATED);
    }

    /**
     * GET /api/menu-items/{menuItem}
     *
     * Muestra un elemento específico. Gracias al Route Model Binding
     * de Laravel, si el id no existe se devuelve automáticamente
     * un 404 estandarizado (ver bootstrap/app.php).
     */
    public function show(MenuItem $menuItem): MenuItemResource
    {
        return new MenuItemResource($menuItem);
    }

    /**
     * PUT/PATCH /api/menu-items/{menuItem}
     *
     * Actualiza un elemento existente.
     */
    public function update(UpdateMenuItemRequest $request, MenuItem $menuItem): MenuItemResource
    {
        $menuItem->update($request->validated());

        return new MenuItemResource($menuItem);
    }

    /**
     * DELETE /api/menu-items/{menuItem}
     *
     * Elimina (soft delete) un elemento del menú.
     */
    public function destroy(MenuItem $menuItem): JsonResponse
    {
        $menuItem->delete();

        return response()->json([
            'message' => 'Elemento del menú eliminado correctamente.',
        ], JsonResponse::HTTP_OK);
    }

    /**
     * GET /api/menu-items/category/{category}
     *
     * Endpoint adicional (opcional en la consigna) para filtrar
     * el menú directamente por categoría vía segmento de ruta,
     * útil para vistas de la carta como "Entradas", "Postres", etc.
     */
    public function byCategory(string $category): AnonymousResourceCollection
    {
        $menuItems = MenuItem::query()
            ->byCategory($category)
            ->latest()
            ->paginate(15);

        return MenuItemResource::collection($menuItems);
    }
}
