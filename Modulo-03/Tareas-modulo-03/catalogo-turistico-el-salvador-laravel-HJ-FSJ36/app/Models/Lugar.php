<?php

namespace App\Models;

use Illuminate\Support\Facades\File;

/**
 * Hugo Ernesto Jovel Hernandez - FSJ36
 * 
 * Modelo Lugar
 *
 * En esta práctica NO se utiliza una base de datos relacional ni Eloquent ORM.
 * En su lugar, este modelo cumple el mismo rol que cumpliría un modelo Eloquent
 * (encapsular el acceso y las reglas de los datos), pero la fuente de datos es
 * un archivo JSON ubicado en storage/app/data/lugares.json.
 *
 * Esto permite comprender que el patrón MVC no depende de una tecnología de
 * persistencia específica: el Modelo es responsable de la LÓGICA DE DATOS,
 * sin importar si estos provienen de MySQL, JSON, una API externa, etc.
 */
class Lugar
{
    /**
     * Ruta absoluta del archivo JSON que actúa como fuente de datos.
     */
    protected static function rutaArchivo(): string
    {
        return storage_path('app/data/lugares.json');
    }

    /**
     * Obtiene la colección completa de lugares turísticos.
     *
     * @return \Illuminate\Support\Collection
     */
    public static function all()
    {
        $ruta = self::rutaArchivo();

        if (! File::exists($ruta)) {
            return collect();
        }

        $contenido = File::get($ruta);
        $datos = json_decode($contenido, true) ?? [];

        return collect($datos);
    }

    /**
     * Busca un lugar turístico por su id.
     *
     * @param  int  $id
     * @return array|null
     */
    public static function find(int $id): ?array
    {
        return self::all()->firstWhere('id', $id);
    }

    /**
     * Filtra lugares por departamento (usado como ejemplo de lógica de negocio
     * que puede vivir en el Modelo en lugar del Controlador).
     */
    public static function porDepartamento(string $departamento)
    {
        return self::all()->filter(function ($lugar) use ($departamento) {
            return str_contains(
                strtolower($lugar['departamento']),
                strtolower($departamento)
            );
        })->values();
    }

    /**
     * Filtra lugares por categoría.
     */
    public static function porCategoria(string $categoria)
    {
        return self::all()->filter(function ($lugar) use ($categoria) {
            return str_contains(
                strtolower($lugar['categoria']),
                strtolower($categoria)
            );
        })->values();
    }
}
