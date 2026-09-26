
"use strict";

/* CONFIGURACIÓN */

const WHATSAPP = "18094092740"; // Cambiar por el número real.

const servicios = [
    {
        id: 1, nombre: "Corte clásico", categoria: "cortes",
        precio: 600, duracion: 35,
        descripcion: "Corte profesional con terminaciones precisas.",
        imagen: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=700&q=85"
    },
    {
        id: 2, nombre: "Fade premium", categoria: "cortes",
        precio: 850, duracion: 45,
        descripcion: "Degradado moderno con acabado impecable.",
        imagen: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=700&q=85"
    },
    {
        id: 3, nombre: "Corte y barba", categoria: "cortes",
        precio: 1100, duracion: 60,
        descripcion: "El combo perfecto para renovar tu imagen.",
        imagen: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=700&q=85"
    },
    {
        id: 4, nombre: "Perfilado de barba", categoria: "barba",
        precio: 450, duracion: 25,
        descripcion: "Diseño y definición de barba.",
        imagen: "https://images.unsplash.com/photo-1622286346003-c5c7e63b1088?auto=format&fit=crop&w=700&q=85"
    },
    {
        id: 5, nombre: "Limpieza facial", categoria: "facial",
        precio: 900, duracion: 45,
        descripcion: "Tratamiento facial para renovar tu piel.",
        imagen: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=700&q=85"
    },
    {
        id: 6, nombre: "Manicura", categoria: "manicura",
        precio: 650, duracion: 35,
        descripcion: "Cuidado y limpieza profesional de uñas.",
        imagen: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=700&q=85"
    },
    {
        id: 7, nombre: "Pedicura", categoria: "pedicura",
        precio: 950, duracion: 50,
        descripcion: "Tratamiento completo para pies y uñas.",
        imagen: "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=700&q=85"
    }
];

// Profesionales ilustrativos. Sustituir por los reales.
// La opción "Cualquiera" no garantiza disponibilidad real.

const barberos = [
    { id: "cualquiera", nombre: "Cualquiera disponible", cargo: "Sin preferencia", imagen: null },
    { id: "carlos", nombre: "Carlos", cargo: "Barbero profesional", imagen: null },
    { id: "miguel", nombre: "Miguel", cargo: "Especialista en fades", imagen: null },
    { id: "andres", nombre: "Andrés", cargo: "Barbero profesional", imagen: null }
];

const categorias = [
    ["todos", "bi-grid", "Todos"],
    ["cortes", "bi-scissors", "Cortes"],
    ["barba", "bi-person", "Barba"],
    ["facial", "bi-stars", "Facial"],
    ["manicura", "bi-hand-index", "Manicura"],
    ["pedicura", "bi-heart", "Pedicura"]
];

const horarios = [
    "09:00", "09:30", "10:00", "10:30",
    "11:00", "11:30", "12:00", "12:30",
    "13:00", "13:30", "14:00", "14:30",
    "15:00", "15:30", "16:00", "16:30",
    "17:00", "17:30", "18:00"
];

const reserva = {
    servicios: new Set(),
    barbero: "cualquiera",
    fecha: null,
    hora: null
};

let paso = 1;
let filtro = "todos";
let ultimoFoco = null;
let toastTimer;

const hoy = new Date();
hoy.setHours(0, 0, 0, 0);

let mesVisible = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

const $ = id => document.getElementById(id);

const dinero = valor => new Intl.NumberFormat("es-DO", {
    style: "currency",
    currency: "DOP",
    maximumFractionDigits: 0
}).format(valor);

const seleccionados = () =>
    servicios.filter(s => reserva.servicios.has(s.id));

const total = () =>
    seleccionados().reduce((suma, s) => suma + s.precio, 0);

const duracion = () =>
    seleccionados().reduce((suma, s) => suma + s.duracion, 0);

function iso(fecha) {
    const y = fecha.getFullYear();
    const m = String(fecha.getMonth() + 1).padStart(2, "0");
    const d = String(fecha.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

function desdeISO(valor) {
    const [y, m, d] = valor.split("-").map(Number);
    return new Date(y, m - 1, d);
}

function fechaTexto(valor) {
    return desdeISO(valor).toLocaleDateString("es-DO", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });
}

function horaTexto(valor) {
    const [h, m] = valor.split(":").map(Number);
    const fecha = new Date();
    fecha.setHours(h, m, 0, 0);

    return fecha.toLocaleTimeString("es-DO", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true
    });
}

function avisar(mensaje) {
    clearTimeout(toastTimer);
    $("toast").textContent = mensaje;
    $("toast").classList.add("show");
    toastTimer = setTimeout(() => $("toast").classList.remove("show"), 3000);
}

function actualizarTotal() {
    const cantidad = reserva.servicios.size;
    $("miniCount").textContent =
        `${cantidad} ${cantidad === 1 ? "servicio seleccionado" : "servicios seleccionados"}`;
    $("miniTotal").textContent = dinero(total());
}

/* CATÁLOGO PRINCIPAL */

function renderCatalogo(categoria = "todos") {
    $("serviceGrid").innerHTML = servicios
        .filter(s => categoria === "todos" || s.categoria === categoria)
        .map(s => `
            <article class="service-card">
                <img class="service-photo" src="${s.imagen}"
                     alt="${s.nombre}" loading="lazy">
                <div class="service-info">
                    <h3>${s.nombre}</h3>
                    <p>${s.descripcion}</p>
                    <div class="service-bottom">
                        <strong>${dinero(s.precio)}</strong>
                        <span><i class="bi bi-clock"></i> ${s.duracion} min</span>
                    </div>
                    <button class="btn btn-dark"
                            data-reserve-service="${s.id}">
                        <i class="bi bi-calendar-plus"></i>
                        Reservar este servicio
                    </button>
                </div>
            </article>
        `).join("");
}

function renderFiltros() {
    const html = categorias.map(([id, icono, nombre]) => `
        <button class="filter ${filtro === id ? "active" : ""}"
                data-filter="${id}">
            <i class="bi ${icono}"></i>${nombre}
        </button>
    `).join("");

    $("filters").innerHTML = html;
    $("modalFilters").innerHTML = html;
}

document.addEventListener("click", e => {
    const boton = e.target.closest("[data-filter]");
    if (!boton) return;

    filtro = boton.dataset.filter;
    renderFiltros();
    renderCatalogo(filtro);
    renderServiciosModal();
});

$("serviceGrid").addEventListener("click", e => {
    const boton = e.target.closest("[data-reserve-service]");
    if (!boton) return;

    reserva.servicios.add(Number(boton.dataset.reserveService));
    reserva.hora = null;
    abrirModal();
});

/* MODAL */

function abrirModal() {
    ultimoFoco = document.activeElement;
    paso = 1;

    $("bookingModal").classList.add("open");
    $("bookingModal").setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");

    renderFiltros();
    renderServiciosModal();
    renderBarberos();
    renderCalendario();
    renderHorarios();
    mostrarPaso();

    $("closeModal").focus();
}

function cerrarModal() {
    $("bookingModal").classList.remove("open");
    $("bookingModal").setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    ultimoFoco?.focus();
}

document.querySelectorAll("[data-open-booking]")
    .forEach(boton => boton.addEventListener("click", abrirModal));

$("closeModal").addEventListener("click", cerrarModal);

$("bookingModal").addEventListener("click", e => {
    if (e.target === $("bookingModal")) cerrarModal();
});

document.addEventListener("keydown", e => {
    if (!$("bookingModal").classList.contains("open")) return;

    if (e.key === "Escape") {
        cerrarModal();
        return;
    }

    // Mantener el foco dentro del modal.
    if (e.key === "Tab") {
        const elementos = [...$("bookingModal").querySelectorAll(
            'button:not([disabled]):not([hidden]), input, textarea'
        )].filter(el => el.getClientRects().length);

        const primero = elementos[0];
        const ultimo = elementos[elementos.length - 1];

        if (e.shiftKey && document.activeElement === primero) {
            e.preventDefault();
            ultimo.focus();
        } else if (!e.shiftKey && document.activeElement === ultimo) {
            e.preventDefault();
            primero.focus();
        }
    }
});

function mostrarPaso() {
    document.querySelectorAll(".step").forEach(seccion => {
        seccion.classList.toggle("active", Number(seccion.dataset.step) === paso);
    });

    const nombres = ["Servicios", "Profesional", "Fecha y hora", "Confirmación"];

    $("stepLabel").textContent = `PASO ${paso} DE 4`;
    $("stepName").textContent = nombres[paso - 1];
    $("progressFill").style.width = `${paso * 25}%`;

    $("backBtn").hidden = paso === 1;
    $("nextBtn").hidden = paso === 4;
    $("sendBtn").hidden = paso !== 4;

    $("nextBtn").disabled = !pasoValido();

    $("nextBtn").innerHTML = paso === 3
        ? 'Revisar mi cita <i class="bi bi-arrow-right"></i>'
        : 'Continuar <i class="bi bi-arrow-right"></i>';

    actualizarTotal();
    $("modalScroll").scrollTop = 0;

    if (paso === 4) renderResumenFinal();
}

function pasoValido() {
    if (paso === 1) return reserva.servicios.size > 0;
    if (paso === 2) return Boolean(reserva.barbero);
    if (paso === 3) {
        return Boolean(
            reserva.fecha && reserva.hora && horaDisponible(reserva.hora)
        );
    }
    return true;
}

$("nextBtn").addEventListener("click", () => {
    if (!pasoValido() || paso >= 4) return;
    paso++;
    mostrarPaso();
});

$("backBtn").addEventListener("click", () => {
    if (paso <= 1) return;
    paso--;
    mostrarPaso();
});

/* PASO 1 */

function renderServiciosModal() {
    $("modalServices").innerHTML = servicios
        .filter(s => filtro === "todos" || s.categoria === filtro)
        .map(s => {
            const activo = reserva.servicios.has(s.id);

            return `
                <button class="modal-service ${activo ? "selected" : ""}"
                        data-select-service="${s.id}"
                        aria-pressed="${activo}">
                    <img src="${s.imagen}" alt="" loading="lazy">
                    <span class="modal-service-info">
                        <strong>${s.nombre}</strong>
                        <small><i class="bi bi-clock"></i> ${s.duracion} minutos</small>
                        <b>${dinero(s.precio)}</b>
                    </span>
                    <span class="select-circle">
                        <i class="bi bi-check-lg"></i>
                    </span>
                </button>
            `;
        }).join("");
}

$("modalServices").addEventListener("click", e => {
    const boton = e.target.closest("[data-select-service]");
    if (!boton) return;

    const id = Number(boton.dataset.selectService);

    if (reserva.servicios.has(id)) {
        reserva.servicios.delete(id);
    } else {
        reserva.servicios.add(id);
    }

    reserva.hora = null;
    renderServiciosModal();
    renderHorarios();
    actualizarTotal();
    $("nextBtn").disabled = !pasoValido();
});

/* PASO 2 */

function renderBarberos() {
    $("barbersGrid").innerHTML = barberos.map(b => {
        const activo = reserva.barbero === b.id;

        return `
            <button class="barber-card ${activo ? "selected" : ""}"
                    data-barber="${b.id}"
                    aria-pressed="${activo}">
                <span class="barber-avatar">
                    ${b.imagen
                        ? `<img src="${b.imagen}" alt="">`
                        : `<i class="bi ${b.id === "cualquiera" ? "bi-people" : "bi-person"}"></i>`
                    }
                </span>
                <strong>${b.nombre}</strong>
                <small>${b.cargo}</small>
                <span class="barber-check">
                    <i class="bi ${activo ? "bi-check-circle-fill" : "bi-circle"}"></i>
                </span>
            </button>
        `;
    }).join("");
}

$("barbersGrid").addEventListener("click", e => {
    const boton = e.target.closest("[data-barber]");
    if (!boton) return;

    reserva.barbero = boton.dataset.barber;
    reserva.hora = null;

    renderBarberos();
    renderHorarios();
    $("nextBtn").disabled = !pasoValido();
});

/* PASO 3 */

function renderCalendario() {
    const y = mesVisible.getFullYear();
    const m = mesVisible.getMonth();

    $("calendarTitle").textContent =
        mesVisible.toLocaleDateString("es-DO", {
            month: "long", year: "numeric"
        });

    const desplazamiento = (new Date(y, m, 1).getDay() + 6) % 7;
    const dias = new Date(y, m + 1, 0).getDate();

    const maximo = new Date(hoy);
    maximo.setDate(maximo.getDate() + 60);

    let html = '<span class="calendar-empty"></span>'.repeat(desplazamiento);

    for (let dia = 1; dia <= dias; dia++) {
        const fecha = new Date(y, m, dia);
        const valor = iso(fecha);

        const deshabilitado =
            fecha < hoy || fecha > maximo || fecha.getDay() === 0;

        html += `
            <button data-date="${valor}"
                    class="${reserva.fecha === valor ? "selected" : ""} ${valor === iso(hoy) ? "today" : ""}"
                    ${deshabilitado ? "disabled" : ""}
                    aria-label="${fechaTexto(valor)}"
                    aria-pressed="${reserva.fecha === valor}">
                ${dia}
            </button>
        `;
    }

    $("calendarDays").innerHTML = html;

    $("prevMonth").disabled =
        y === hoy.getFullYear() && m === hoy.getMonth();

    $("nextMonth").disabled =
        mesVisible >= new Date(hoy.getFullYear(), hoy.getMonth() + 2, 1);
}

$("calendarDays").addEventListener("click", e => {
    const boton = e.target.closest("[data-date]");
    if (!boton || boton.disabled) return;

    reserva.fecha = boton.dataset.date;
    reserva.hora = null;

    renderCalendario();
    renderHorarios();
    $("nextBtn").disabled = !pasoValido();
});

$("prevMonth").addEventListener("click", () => {
    mesVisible = new Date(
        mesVisible.getFullYear(), mesVisible.getMonth() - 1, 1
    );
    renderCalendario();
});

$("nextMonth").addEventListener("click", () => {
    mesVisible = new Date(
        mesVisible.getFullYear(), mesVisible.getMonth() + 1, 1
    );
    renderCalendario();
});

function horaDisponible(hora) {
    if (!reserva.fecha || !duracion()) return false;

    const [h, m] = hora.split(":").map(Number);

    // La sesión completa debe terminar antes de las 7 PM.
    if (h * 60 + m + duracion() > 19 * 60) return false;

    const fecha = desdeISO(reserva.fecha);
    fecha.setHours(h, m, 0, 0);

    return fecha.getTime() >= Date.now() + 30 * 60 * 1000;
}

function renderHorarios() {
    if (!reserva.fecha) {
        $("timeHint").textContent = "Selecciona primero una fecha.";
        $("timeGrid").innerHTML = "";
        return;
    }

    $("timeHint").textContent = "Elige la hora que prefieras.";

    $("timeGrid").innerHTML = horarios.map(h => {
        const disponible = horaDisponible(h);
        const activo = reserva.hora === h;

        return `
            <button class="time-btn ${activo ? "selected" : ""}"
                    data-time="${h}"
                    ${disponible ? "" : "disabled"}
                    aria-pressed="${activo}">
                ${horaTexto(h)}
            </button>
        `;
    }).join("");
}

$("timeGrid").addEventListener("click", e => {
    const boton = e.target.closest("[data-time]");
    if (!boton || boton.disabled) return;

    reserva.hora = boton.dataset.time;
    renderHorarios();
    $("nextBtn").disabled = !pasoValido();
});

/* PASO 4 */

function renderResumenFinal() {
    $("finalServices").innerHTML = seleccionados().map(s => `
        <div class="final-service">
            <span><i class="bi bi-check2"></i> ${s.nombre}</span>
            <strong>${dinero(s.precio)}</strong>
        </div>
    `).join("");

    $("finalTotal").textContent = dinero(total());

    $("finalBarber").textContent =
        barberos.find(b => b.id === reserva.barbero)?.nombre || "Cualquiera";

    $("finalDate").textContent = fechaTexto(reserva.fecha);
    $("finalTime").textContent = horaTexto(reserva.hora);
    $("finalDuration").textContent = `${duracion()} minutos`;
}

/* WHATSAPP */

$("sendBtn").addEventListener("click", () => {
    if (!/^\d{10,15}$/.test(WHATSAPP)) {
        avisar("Configura el número de WhatsApp de la barbería.");
        return;
    }

    if (
        !reserva.servicios.size ||
        !reserva.barbero ||
        !reserva.fecha ||
        !reserva.hora ||
        !horaDisponible(reserva.hora)
    ) {
        avisar("Revisa los servicios, la fecha y la hora.");
        return;
    }

    const nombre = $("clientName").value.trim() || "No indicado";
    const notas = $("clientNotes").value.trim();
    const profesional = barberos.find(b => b.id === reserva.barbero);

    const detalle = seleccionados().map((s, i) =>
        `${i + 1}. ${s.nombre} — ${dinero(s.precio)}`
    ).join("\n");

    const mensaje = [
        "✂️ *THE GENTLEMEN BARBER STUDIO*",
        "*SOLICITUD DE CITA*",
        "",
        `👤 *Nombre:* ${nombre}`,
        `💈 *Profesional:* ${profesional.nombre}`,
        "",
        "*SERVICIOS*",
        detalle,
        "",
        `💰 *TOTAL: ${dinero(total())}*`,
        `⏳ *Duración:* ${duracion()} minutos`,
        "",
        `📅 *Fecha:* ${fechaTexto(reserva.fecha)}`,
        `🕒 *Hora:* ${horaTexto(reserva.hora)}`,
        "",
        ...(notas ? [`📝 *Indicaciones:* ${notas}`, ""] : []),
        "Hola, deseo solicitar esta cita.",
        "Quedo pendiente de su confirmación."
    ].join("\n");

    const url = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(mensaje)}`;

    // El usuario envía el mensaje desde su propio WhatsApp.
    // Esta versión no registra ni confirma citas automáticamente.
    const ventana = window.open(url, "_blank", "noopener,noreferrer");

    if (!ventana) {
        window.location.href = url;
    }
});

/* INICIO */

$("year").textContent = new Date().getFullYear();

window.addEventListener("scroll", () => {
    $("header").classList.toggle("scrolled", window.scrollY > 25);
}, { passive: true });

renderFiltros();
renderCatalogo();
