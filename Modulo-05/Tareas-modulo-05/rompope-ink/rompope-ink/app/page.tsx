import { Gallery } from "../components/gallery";
import { Booking } from "../components/booking";

const STUDIO = process.env.NEXT_PUBLIC_STUDIO_NAME ?? "Rompope Ink";

export default function Home() {
  return (
    <main>
      <header className="nav">
        <div className="wrap">
          <a className="logo" href="#top">Rompope<span> Ink</span></a>
          <nav aria-label="Principal">
            <ul>
              <li><a href="#sobre">Sobre mí</a></li>
              <li><a href="#galeria">Galería</a></li>
              <li><a href="#proceso">Proceso</a></li>
              <li><a href="#cita">Cita</a></li>
            </ul>
          </nav>
        </div>
      </header>

      <section className="hero" id="top">
        <div className="wrap">
          <p className="eyebrow">Estudio de tatuajes · San Salvador</p>
          <h1>Tinta con <em>carácter</em></h1>
          <p>Flash tradicional, blackwork y fine line con alma vintage y trazo limpio. Cada pieza, hecha a la medida.</p>
          <a className="btn" href="#cita">Agenda tu cita</a>
          <div><span className="stamp">Est. 2026 · {STUDIO}</span></div>
        </div>
      </section>

      <section className="block" id="sobre">
        <div className="wrap about">
          <div className="portrait" aria-hidden="true">
            <svg viewBox="0 0 200 200" width="70%"><g fill="none" stroke="#15110e" strokeWidth="3" strokeLinecap="round"><circle cx="100" cy="78" r="38" /><path d="M42 188 Q100 112 158 188" /><path d="M70 66 Q100 40 130 66" /></g></svg>
          </div>
          <div>
            <h2 className="title">El que sostiene la aguja</h2>
            <p className="sub">Retrato ficticio · reemplazar por foto real</p>
            <p>Rompope creció dibujando en cuadernos y hoy convierte esas líneas en tatuajes para toda la vida. Su sello: composiciones simples, contraste fuerte y un rojo que firma cada diseño.</p>
            <div className="facts">
              <span><b>8</b>años de oficio</span>
              <span><b>+900</b>piezas</span>
              <span><b>3</b>estilos</span>
            </div>
          </div>
        </div>
      </section>

      <section className="block" id="galeria">
        <div className="wrap">
          <h2 className="title">Flash &amp; proyectos</h2>
          <p className="sub">Ilustraciones de muestra · filtra por estilo</p>
          <Gallery />
        </div>
      </section>

      <section className="block" id="proceso">
        <div className="wrap">
          <h2 className="title">Cómo trabajamos</h2>
          <p className="sub">Tres pasos, cero sorpresas</p>
          <div className="steps">
            <div className="step"><h3>Idea</h3><p>Cuéntanos qué quieres, dónde y de qué tamaño. Llevamos tus referencias al papel.</p></div>
            <div className="step"><h3>Diseño</h3><p>Boceto a medida, ajustes contigo y aprobación antes de la sesión.</p></div>
            <div className="step"><h3>Sesión</h3><p>Material descartable, higiene estricta y cuidados posteriores explicados al detalle.</p></div>
          </div>
        </div>
      </section>

      <section className="block booking" id="cita">
        <div className="wrap">
          <h2 className="title">Agenda tu cita</h2>
          <p className="sub">Elige un estilo y escríbenos: el mensaje sale listo por WhatsApp</p>
          <Booking />
        </div>
      </section>
    </main>
  );
}
