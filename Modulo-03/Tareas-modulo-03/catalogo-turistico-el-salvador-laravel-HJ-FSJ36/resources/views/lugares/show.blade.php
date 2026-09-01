@extends('layouts.app')

@section('titulo', $lugar['titulo'])

@section('contenido')

    <nav aria-label="breadcrumb">
        <ol class="breadcrumb">
            <li class="breadcrumb-item"><a href="{{ route('lugares.index') }}">Inicio</a></li>
            <li class="breadcrumb-item active">{{ $lugar['titulo'] }}</li>
        </ol>
    </nav>

    <div class="row g-5">
        <div class="col-md-6">
            <img src="https://picsum.photos/seed/lugar-{{ $lugar['id'] }}/800/600"
                 class="img-fluid rounded shadow-sm" alt="{{ $lugar['titulo'] }}" loading="lazy">
        </div>
        <div class="col-md-6">
            <span class="badge bg-success-subtle text-success mb-2">{{ $lugar['categoria'] }}</span>
            <h1 class="fw-bold">{{ $lugar['titulo'] }}</h1>
            <p class="text-muted">📍 {{ $lugar['departamento'] }}</p>

            <p>{{ $lugar['descripcion'] }}</p>

            <ul class="list-group list-group-flush mb-4">
                <li class="list-group-item">
                    <strong>Precio de entrada:</strong>
                    {{ $lugar['precio_entrada'] > 0 ? '$'.number_format($lugar['precio_entrada'], 2).' '.$lugar['moneda'] : 'Gratuito' }}
                </li>
                <li class="list-group-item">
                    <strong>Horario:</strong> {{ $lugar['horario'] }}
                </li>
                <li class="list-group-item">
                    <strong>Servicios disponibles:</strong>
                    {{ implode(', ', $lugar['servicios'] ?? []) }}
                </li>
                <li class="list-group-item">
                    <strong>Recomendado para:</strong>
                    {{ implode(', ', $lugar['recomendado_para'] ?? []) }}
                </li>
                <li class="list-group-item">
                    <strong>Coordenadas:</strong>
                    {{ $lugar['coordenadas']['lat'] ?? '-' }}, {{ $lugar['coordenadas']['lng'] ?? '-' }}
                </li>
            </ul>

            <a href="{{ route('contacto.create', $lugar['id']) }}" class="btn btn-success btn-lg">
                Solicitar más información
            </a>
            <a href="{{ route('lugares.index') }}" class="btn btn-outline-secondary btn-lg">
                Volver al listado
            </a>
        </div>
    </div>

@endsection
