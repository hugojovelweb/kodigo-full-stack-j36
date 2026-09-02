<?php

namespace App\Http\Controllers;

use App\Models\Lugar;
use Illuminate\Http\Request;

/**
 * Hugo Ernesto Jovel Hernandez - FSJ36
 * 
 * LugarController
 *
 * Responsable de recibir la petición HTTP (ya enrutada por routes/web.php),
 * solicitar los datos necesarios al Modelo (App\Models\Lugar) y devolver
 * una Vista (Blade) con esos datos. El controlador NO accede directamente
 * al archivo JSON: esa responsabilidad pertenece exclusivamente al Modelo.
 */
class LugarController extends Controller
{
    /**
     * GET /
     * Lista todos los lugares turísticos, con filtros opcionales por
     * departamento y/o categoría (query string).
     */
    public function index(Request $request)
    {
        $departamento = $request->query('departamento');
        $categoria    = $request->query('categoria');

        if ($departamento) {
            $lugares = Lugar::porDepartamento($departamento);
        } elseif ($categoria) {
            $lugares = Lugar::porCategoria($categoria);
        } else {
            $lugares = Lugar::all();
        }

        // Datos auxiliares para los filtros del formulario en la vista.
        $departamentos = Lugar::all()->pluck('departamento')->unique()->sort()->values();
        $categorias    = Lugar::all()->pluck('categoria')->unique()->sort()->values();

        return view('lugares.index', [
            'lugares'        => $lugares,
            'departamentos'  => $departamentos,
            'categorias'     => $categorias,
            'filtroDepto'    => $departamento,
            'filtroCategoria'=> $categoria,
        ]);
    }

    /**
     * GET /lugares/{id}
     * Muestra el detalle de un lugar turístico específico.
     */
    public function show(int $id)
    {
        $lugar = Lugar::find($id);

        abort_if(is_null($lugar), 404, 'El lugar turístico solicitado no existe.');

        return view('lugares.show', [
            'lugar' => $lugar,
        ]);
    }
}
