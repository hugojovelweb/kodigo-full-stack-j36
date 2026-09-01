<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('titulo', 'Catálogo Turístico') | El Salvador</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Poppins', sans-serif; background-color: #f7f7f5; }
        .navbar-brand { font-weight: 700; }
        .card-lugar img { height: 200px; object-fit: cover; }
        .badge-precio { font-size: .95rem; }
        footer { background-color: #14213d; color: #fff; }
    </style>
</head>
<body>

    <nav class="navbar navbar-expand-lg navbar-dark" style="background-color:#0b6e4f;">
        <div class="container">
            <a class="navbar-brand" href="{{ route('lugares.index') }}">🇸🇻 Catálogo Turístico ES</a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navMenu">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navMenu">
                <ul class="navbar-nav ms-auto">
                    <li class="nav-item">
                        <a class="nav-link" href="{{ route('lugares.index') }}">Inicio</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="{{ route('contacto.create') }}">Contacto</a>
                    </li>
                </ul>
            </div>
        </div>
    </nav>

    <main class="container my-5">
        @if (session('exito'))
            <div class="alert alert-success alert-dismissible fade show" role="alert">
                {{ session('exito') }}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        @endif

        @yield('contenido')
    </main>

    <footer class="text-center py-4 mt-5">
        <div class="container">
            <p class="mb-1">Catálogo Turístico de El Salvador &copy; {{ date('Y') }}</p>
            <small>By Hugo Jovel Web &mdash; Patrón MVC en Laravel</small>
        </div>
    </footer>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
