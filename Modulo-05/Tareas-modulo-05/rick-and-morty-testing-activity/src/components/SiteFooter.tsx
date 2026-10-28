// SELLO: reemplazar al cierre del pago (solo maquetas de cliente)
export default function SiteFooter({ stack }: { stack: string }) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-950 border-t border-gray-800 py-8 mt-12">
      <div className="container mx-auto px-4 text-center text-gray-500">
        <p className="mb-2">{stack}</p>
        <p className="text-sm">
          Datos de{' '}
          <a
            href="https://rickandmortyapi.com"
            className="text-orange-500 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            The Rick and Morty API
          </a>
          <br />© {currentYear}{' '}
          <a
            href="https://hugojovelweb.tech/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <strong>Hugo Jovel Web</strong>
          </a>
          . Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
