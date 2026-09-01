@extends('layouts.app')

@section('titulo', 'Contacto')

@section('contenido')

    <div class="row justify-content-center">
        <div class="col-md-7">
            <h1 class="fw-bold mb-4 text-center">Solicita más información</h1>

            @if ($errors->any())
                <div class="alert alert-danger">
                    <ul class="mb-0">
                        @foreach ($errors->all() as $error)
                            <li>{{ $error }}</li>
                        @endforeach
                    </ul>
                </div>
            @endif

            <form method="POST" action="{{ route('contacto.store') }}" class="card p-4 shadow-sm">
                @csrf

                <div class="mb-3">
                    <label for="nombre" class="form-label">Nombre completo</label>
                    <input type="text" name="nombre" id="nombre" class="form-control"
                           value="{{ old('nombre') }}" required>
                </div>

                <div class="mb-3">
                    <label for="email" class="form-label">Correo electrónico</label>
                    <input type="email" name="email" id="email" class="form-control"
                           value="{{ old('email') }}" required>
                </div>

                <div class="mb-3">
                    <label for="telefono" class="form-label">Teléfono (opcional)</label>
                    <input type="text" name="telefono" id="telefono" class="form-control"
                           value="{{ old('telefono') }}">
                </div>

                <div class="mb-3">
                    <label for="lugar_interes" class="form-label">Lugar de interés</label>
                    <input type="text" name="lugar_interes" id="lugar_interes" class="form-control"
                           value="{{ old('lugar_interes', $lugar['titulo'] ?? '') }}">
                </div>

                <div class="mb-3">
                    <label for="mensaje" class="form-label">Mensaje</label>
                    <textarea name="mensaje" id="mensaje" rows="4" class="form-control" required>{{ old('mensaje') }}</textarea>
                </div>

                <button type="submit" class="btn btn-success w-100">Enviar solicitud</button>
            </form>
        </div>
    </div>

@endsection
