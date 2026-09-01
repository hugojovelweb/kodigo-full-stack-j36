@extends('layouts.app')

@section('titulo', 'Inicio')

@section('contenido')

    <div class="text-center mb-5">
        <h1 class="fw-bold">Descubre El Salvador</h1>
        <p class="text-muted">Explora los destinos turísticos más populares del país.</p>
    </div>

    <form method="GET" action="{{ route('lugares.index') }}" class="row g-2 justify-content-center mb-5">
        <div class="col-md-3">
            <select name="departamento" class="form-select" onchange="this.form.submit()">
                <option value="">Todos los departamentos</option>
                @foreach ($departamentos as $depto)
                    <option value="{{ $depto }}" @selected($filtroDepto === $depto)>{{ $depto }}</option>
                @endforeach
            </select>
        </div>
        <div class="col-md-3">
            <select name="categoria" class="form-select" onchange="this.form.submit()">
                <option value="">Todas las categorías</option>
                @foreach ($categorias as $cat)
                    <option value="{{ $cat }}" @selected($filtroCategoria === $cat)>{{ $cat }}</option>
                @endforeach
            </select>
        </div>
        @if ($filtroDepto || $filtroCategoria)
            <div class="col-md-2">
                <a href="{{ route('lugares.index') }}" class="btn btn-outline-secondary w-100">Limpiar</a>
            </div>
        @endif
    </form>

    @if ($lugares->isEmpty())
        <div class="alert alert-warning text-center">
            No se encontraron lugares turísticos con los filtros seleccionados.
        </div>
    @else
        <div class="row g-4">
            @foreach ($lugares as $lugar)
                <div class="col-md-4">
                    <div class="card h-100 shadow-sm card-lugar">
                        <img src="https://picsum.photos/seed/lugar-{{ $lugar['id'] }}/600/400"
                             class="card-img-top" alt="{{ $lugar['titulo'] }}" loading="lazy">
                        <div class="card-body d-flex flex-column">
                            <span class="badge bg-success-subtle text-success mb-2 align-self-start">
                                {{ $lugar['categoria'] }}
                            </span>
                            <h5 class="card-title">{{ $lugar['titulo'] }}</h5>
                            <p class="card-text text-muted mb-1">📍 {{ $lugar['departamento'] }}</p>
                            <p class="card-text badge-precio">
                                @if ($lugar['precio_entrada'] > 0)
                                    💲 Desde ${{ number_format($lugar['precio_entrada'], 2) }}
                                @else
                                    ✅ Entrada gratuita
                                @endif
                            </p>
                            <a href="{{ route('lugares.show', $lugar['id']) }}" class="btn btn-success mt-auto">
                                Ver detalle
                            </a>
                        </div>
                    </div>
                </div>
            @endforeach
        </div>
    @endif

@endsection
