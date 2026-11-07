<?php

namespace App\Http\Controllers;

/**
 * @OA\Info(
 *     title="API de E-commerce Segura",
 *     version="1.0.0",
 *     description="API RESTful para gestión de un e-commerce: usuarios, productos, órdenes y pagos con Stripe. Documentada con Swagger/OpenAPI.",
 *     @OA\Contact(email="soporte@example.com"),
 *     @OA\License(name="MIT")
 * )
 *
 * @OA\Server(
 *     url=L5_SWAGGER_CONST_HOST,
 *     description="Servidor API"
 * )
 *
 * @OA\SecurityScheme(
 *     securityScheme="bearerAuth",
 *     type="http",
 *     scheme="bearer",
 *     bearerFormat="JWT",
 *     description="Ingrese el token JWT obtenido en /api/auth/login, con el formato: Bearer {token}"
 * )
 *
 * @OA\Tag(name="Autenticación", description="Registro, login y gestión de sesión JWT")
 * @OA\Tag(name="Productos", description="Catálogo de productos (CRUD)")
 * @OA\Tag(name="Órdenes", description="Creación y consulta de órdenes de compra")
 * @OA\Tag(name="Pagos", description="Procesamiento de pagos mediante Stripe")
 *
 * @OA\Schema(
 *     schema="ErrorResponse",
 *     type="object",
 *     @OA\Property(property="success", type="boolean", example=false),
 *     @OA\Property(property="message", type="string", example="Ha ocurrido un error."),
 *     @OA\Property(property="errors", type="object", nullable=true)
 * )
 */
abstract class Controller
{
    //
}
