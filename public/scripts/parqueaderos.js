// script.js

document.addEventListener("DOMContentLoaded", () => {
  const dslUrl = "../DSL.json";
  let selectedSpots = [];

  // --- OBTENER ELEMENTOS DEL DOM ---
  const reservationForm = document.getElementById("reservationForm");
  const totalAmountEl = document.getElementById("totalAmount");
  const availableSpotsEl = document.getElementById("availableSpots");
  const occupiedSpotsEl = document.getElementById("occupiedSpots");
  const totalSpotsEl = document.getElementById("totalSpots");

  // --- FUNCIÓN RESTAURADA para actualizar los contadores de disponibilidad/ocupación ---
  const updateSpotCounts = () => {
    let availableCount = 0;
    let occupiedCount = 0;

    const allSpaces = document.querySelectorAll(".espacio");
    const totalCount = allSpaces.length;

    allSpaces.forEach((espacio) => {
      if (espacio.classList.contains("available")) {
        availableCount++;
      } else if (espacio.classList.contains("occupied")) {
        occupiedCount++;
      }
    });

    // Actualizar los elementos en el HTML
    if (availableSpotsEl) availableSpotsEl.textContent = availableCount;
    if (occupiedSpotsEl) occupiedSpotsEl.textContent = occupiedCount;
    if (totalSpotsEl) totalSpotsEl.textContent = totalCount;
  };

  // --- FUNCIÓN CENTRAL PARA ACTUALIZAR EL TOTAL ---
  const updateTotalAmount = () => {
    if (!reservationForm || !totalAmountEl) {
      return;
    }

    const formData = new FormData(reservationForm);
    const vehiculo = formData.get("vehiculo");
    const servicios = formData.get("tipo");
    const hora = formData.get("hora");

    if (vehiculo && selectedSpots.length > 0) {
      const total = calculateTotal(selectedSpots, hora, vehiculo, servicios);
      totalAmountEl.textContent = `$${total.toLocaleString("es-CO")}`;
    } else {
      totalAmountEl.textContent = "$0";
    }
  };

  // --- Carga del DSL y Renderizado del Mapa ---
  fetch(dslUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error(
          `Error HTTP: ${response.status} - No se pudo cargar el DSL.`
        );
      }
      return response.json();
    })
    .then((PARKING_DSL_COMPLETO) => {
      const zonasParqueo =
        PARKING_DSL_COMPLETO.configuracionSistema.zonasParqueo;
      for (const zonaId in zonasParqueo) {
        if (zonasParqueo.hasOwnProperty(zonaId)) {
          const zonaData = zonasParqueo[zonaId];
          const zonaElement = document.getElementById(zonaId);
          if (zonaElement) {
            const zonaTitle = document.createElement("div");
            zonaTitle.classList.add("zona-titulo");
            zonaTitle.textContent = `Zona ${zonaData.nombre}`;
            zonaElement.appendChild(zonaTitle);

            if (zonaData.capacidad > 0) {
              for (let i = 1; i <= zonaData.capacidad; i++) {
                const espacioDiv = document.createElement("div");
                espacioDiv.classList.add("espacio");
                espacioDiv.textContent = `${zonaData.nombre}-${i}`;
                espacioDiv.setAttribute("data-zona", zonaData.nombre);
                espacioDiv.setAttribute(
                  "data-espacio-id",
                  `${zonaData.nombre}-${i}`
                );
                if (
                  zonaData.tipoVehiculoPermitido.includes("Moto") &&
                  zonaData.puestosMoto.includes(i)
                ) {
                  espacioDiv.classList.add("motorcycle-only");
                }
                if (zonaData.techo === true) {
                  espacioDiv.classList.add("under-roof");
                }
                const estadoInicial = ["available", "occupied"][
                  Math.floor(Math.random() * 2)
                ];
                espacioDiv.classList.add(estadoInicial);
                espacioDiv.addEventListener("click", function () {
                  if (this.classList.contains("occupied")) {
                    alert(
                      "Este espacio está ocupado y no se puede seleccionar."
                    );
                    return;
                  }
                  const espacioId = this.getAttribute("data-espacio-id");
                  if (this.classList.contains("selected")) {
                    this.classList.remove("selected");
                    selectedSpots = selectedSpots.filter(
                      (id) => id !== espacioId
                    );
                  } else {
                    if (selectedSpots.length < 3) {
                      this.classList.add("selected");
                      selectedSpots.push(espacioId);
                    } else {
                      alert("Solo puedes seleccionar un máximo de 3 espacios.");
                    }
                  }
                  console.log("Espacios seleccionados:", selectedSpots);
                  updateTotalAmount(); // Actualiza el total
                });
                zonaElement.appendChild(espacioDiv);
              }
            }
          }
        }
      }
      // **LLAMADA RESTAURADA: Se ejecuta después de crear todos los espacios**
      updateSpotCounts();
    })
    .catch((error) => console.error("Error al cargar el DSL:", error));

  // --- MANEJO DE CAMBIOS EN EL FORMULARIO ---
  if (reservationForm) {
    reservationForm.addEventListener("change", updateTotalAmount);
    reservationForm.addEventListener("submit", function (event) {
      event.preventDefault();
      const formData = new FormData(this);
      const reservationData = {};
      let allFieldsValid = true;

      for (let [key, value] of formData.entries()) {
        reservationData[key] = value;
        if (value.trim() === "" && key !== "tipo") {
          allFieldsValid = false;
        }
      }

      if (!allFieldsValid) {
        alert("Por favor, completa todos los campos del formulario.");
        return;
      }

      if (selectedSpots.length === 0) {
        alert("Por favor, selecciona al menos un espacio de parqueo.");
        return;
      }

      reservationData.selectedParkingSpaces = selectedSpots;
      reservationData.total = calculateTotal(
        selectedSpots,
        reservationData.hora,
        reservationData.vehiculo,
        reservationData.tipo
      );

      localStorage.setItem(
        "currentReservationDetails",
        JSON.stringify(reservationData)
      );
      console.log("Datos guardados. Redirigiendo...");
      window.location.href = "detalles.html";
    });
  }
});

// --- FUNCIONES DE CÁLCULO (sin cambios) ---

function valorVehiculo(vehiculo) {
  const preciosVehiculos = {
    carro: 2000,
    camioneta: 2500,
    moto: 1000,
    bicicleta: 500,
  };
  return preciosVehiculos[vehiculo] || 0;
}

function valorServicio(servicio) {
  const preciosServicios = {
    ambas: 10500,
    techo: 500,
    lavadero: 10000,
    ninguno: 0,
  };
  return preciosServicios[servicio] || 0;
}

function calculateTotal(selectedSpots, hora, vehiculo, servicios) {
  const precioVehiculo = valorVehiculo(vehiculo) * hora * selectedSpots.length;
  const precioServicios = valorServicio(servicios);
  return precioVehiculo + precioServicios;
}
