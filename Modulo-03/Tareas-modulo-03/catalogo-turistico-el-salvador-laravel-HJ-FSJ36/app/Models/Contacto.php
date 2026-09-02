<?php

namespace App\Models;

use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

/**
 * Hugo Ernesto Jovel Hernandez - FSJ36
 * 
 * Modelo Contacto
 *
 * Encapsula el registro de las solicitudes de contacto enviadas desde el
 * formulario. Cada solicitud se persiste como un archivo JSON individual
 * dentro de storage/app/contactos/, simulando el flujo de escritura de datos
 * (Create) sin depender de una base de datos.
 */
class Contacto
{
    protected static function directorio(): string
    {
        return storage_path('app/contactos');
    }

    /**
     * Guarda una nueva solicitud de contacto.
     *
     * @param  array  $datos  Datos validados provenientes del formulario.
     * @return string  Nombre del archivo generado.
     */
    public static function guardar(array $datos): string
    {
        $directorio = self::directorio();

        if (! File::exists($directorio)) {
            File::makeDirectory($directorio, 0755, true);
        }

        $datos['id'] = (string) Str::uuid();
        $datos['fecha_envio'] = now()->toDateTimeString();

        $nombreArchivo = 'contacto_' . now()->format('Ymd_His') . '_' . Str::random(6) . '.json';

        File::put(
            $directorio . DIRECTORY_SEPARATOR . $nombreArchivo,
            json_encode($datos, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)
        );

        return $nombreArchivo;
    }
}
