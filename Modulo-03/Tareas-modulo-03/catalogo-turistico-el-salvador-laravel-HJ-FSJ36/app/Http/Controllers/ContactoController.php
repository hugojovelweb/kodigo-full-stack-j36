<?php

namespace App\Http\Controllers;

use App\Models\Contacto;
use App\Models\Lugar;
use Illuminate\Http\Request;

/**
 * ContactoController
 * Hugo Ernesto Jovel Hernandez - FSJ36
 *
 * Gestiona el formulario de contacto que un usuario utiliza para solicitar
 * más información sobre un lugar turístico. Ejemplifica el ciclo completo
 * de una petición con método POST: validación -> lógica de negocio (Modelo)
 * -> redirección con mensaje flash (Vista).
 */
class ContactoController extends Controller
{
    /**
     * GET /contacto/{id?}
     * Muestra el formulario de contacto. Si se recibe un id de lugar,
     * se precarga el campo "lugar_interes".
     */
    public function create(?int $id = null)
    {
        $lugar = $id ? Lugar::find($id) : null;

        return view('contacto.create', [
            'lugar' => $lugar,
        ]);
    }

    /**
     * POST /contacto
     * Valida los datos del formulario, delega el guardado al Modelo
     * y redirige al usuario con un mensaje de confirmación.
     */
    public function store(Request $request)
    {
        $datosValidados = $request->validate([
            'nombre'        => ['required', 'string', 'max:100'],
            'email'         => ['required', 'email', 'max:150'],
            'telefono'      => ['nullable', 'string', 'max:20'],
            'lugar_interes' => ['nullable', 'string', 'max:150'],
            'mensaje'       => ['required', 'string', 'max:1000'],
        ], [
            'nombre.required'  => 'El nombre es obligatorio.',
            'email.required'   => 'El correo electrónico es obligatorio.',
            'email.email'      => 'Ingresa un correo electrónico válido.',
            'mensaje.required' => 'El mensaje es obligatorio.',
        ]);

        Contacto::guardar($datosValidados);

        return redirect()
            ->route('lugares.index')
            ->with('exito', '¡Gracias, ' . $datosValidados['nombre'] . '! Tu solicitud fue enviada correctamente.');
    }
}
