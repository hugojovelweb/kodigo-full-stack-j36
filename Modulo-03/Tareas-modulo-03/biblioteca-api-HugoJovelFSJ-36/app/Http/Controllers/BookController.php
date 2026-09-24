<?php

namespace App\Http\Controllers;

use App\Models\Book;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

/**
 * Controlador CRUD del catalogo de libros.
 *
 * Todos los endpoints estan protegidos por el guard "api" (JWT):
 * solo un usuario con un token valido puede acceder.
 */
class BookController extends Controller
{
    /** GET /api/books */
    public function index(): JsonResponse
    {
        return response()->json(
            Book::orderBy('created_at', 'desc')->paginate(15)
        );
    }

    /** POST /api/books */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'title' => ['required', 'string', 'max:255'],
            'author' => ['required', 'string', 'max:255'],
            'isbn' => ['required', 'string', 'max:20', 'unique:books,isbn'],
            'genre' => ['nullable', 'string', 'max:100'],
            'published_year' => ['nullable', 'integer', 'min:1000', 'max:' . date('Y')],
            'copies_available' => ['nullable', 'integer', 'min:0'],
            'description' => ['nullable', 'string'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Error de validacion',
                'errors' => $validator->errors(),
            ], 422);
        }

        $book = Book::create($validator->validated());

        return response()->json([
            'message' => 'Libro creado correctamente',
            'book' => $book,
        ], 201);
    }

    /** GET /api/books/{book} */
    public function show(Book $book): JsonResponse
    {
        return response()->json($book);
    }

    /** PUT/PATCH /api/books/{book} */
    public function update(Request $request, Book $book): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'author' => ['sometimes', 'required', 'string', 'max:255'],
            'isbn' => ['sometimes', 'required', 'string', 'max:20', 'unique:books,isbn,' . $book->id],
            'genre' => ['nullable', 'string', 'max:100'],
            'published_year' => ['nullable', 'integer', 'min:1000', 'max:' . date('Y')],
            'copies_available' => ['nullable', 'integer', 'min:0'],
            'description' => ['nullable', 'string'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Error de validacion',
                'errors' => $validator->errors(),
            ], 422);
        }

        $book->update($validator->validated());

        return response()->json([
            'message' => 'Libro actualizado correctamente',
            'book' => $book,
        ]);
    }

    /** DELETE /api/books/{book} */
    public function destroy(Book $book): JsonResponse
    {
        $book->delete();

        return response()->json([
            'message' => 'Libro eliminado correctamente',
        ]);
    }
}
