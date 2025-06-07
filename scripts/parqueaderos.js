// script.js

document.addEventListener("DOMContentLoaded", () => {
  const dslUrl = "../DSL.json"; // Asegura que esta ruta sea correcta

  let selectedSpots = []; // Un array global para mantener el registro de los espacios seleccionados

  // --- Función para actualizar los contadores de disponibilidad/ocupación ---
  const updateSpotCounts = () => {
    let availableCount = 0;
    let occupiedCount = 0;
    let totalCount = 0;

    // Recorre todas las zonas y sus espacios
    const allSpaces = document.querySelectorAll(".espacio");
    totalCount = allSpaces.length; // El total es la suma de todos los espacios renderizados

    allSpaces.forEach((espacio) => {
      if (espacio.classList.contains("available")) {
        availableCount++;
      } else if (espacio.classList.contains("occupied")) {
        occupiedCount++;
      }
    });

    document.getElementById("availableSpots").textContent = availableCount;
    document.getElementById("occupiedSpots").textContent = occupiedCount;
    document.getElementById("totalSpots").textContent = totalCount;
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
      const parqueaderoMapa = document.getElementById("parqueadero-mapa");

      // Función para simular el estado de un espacio (puedes mantenerla para pruebas)
      const getRandomStatus = () => {
        const statuses = ["available", "occupied"];
        return statuses[Math.floor(Math.random() * statuses.length)];
      };

      for (const zonaId in zonasParqueo) {
        if (zonasParqueo.hasOwnProperty(zonaId)) {
          const zonaData = zonasParqueo[zonaId];
          const zonaElement = document.getElementById(zonaId);

          if (zonaElement) {
            const zonaTitle = document.createElement("div");
            zonaTitle.classList.add("zona-titulo");
            zonaTitle.textContent = `Zona ${zonaData.nombre}`; // Muestra el nombre de la zona del DSL
            zonaElement.appendChild(zonaTitle);

            if (zonaData.capacidad > 0) {
              for (let i = 1; i <= zonaData.capacidad; i++) {
                const espacioDiv = document.createElement("div");
                espacioDiv.classList.add("espacio");
                espacioDiv.textContent = `${zonaData.nombre}-${i}`; // Numero de espacio
                espacioDiv.setAttribute("data-zona", zonaData.nombre);
                espacioDiv.setAttribute(
                  "data-espacio-id",
                  `${zonaData.nombre}-${i}`
                );

                // Lógica para añadir clases específicas según el DSL (ej. moto, bajo techo)
                // Usando los datos del DSL para 'tipoVehiculoPermitido' y 'techo'
                if (
                  zonaData.tipoVehiculoPermitido.includes("Moto") &&
                  zonaData.puestosMoto.includes(i)
                ) {
                  espacioDiv.classList.add("motorcycle-only");
                }
                if (zonaData.techo === true) {
                  espacioDiv.classList.add("under-roof");
                }

                // Asignar un estado inicial (random para ejemplo, pero idealmente vendría del DSL o un backend)
                const estadoInicial = getRandomStatus();
                espacioDiv.classList.add(estadoInicial);

                // --- Evento Click para Selección de Espacios ---
                espacioDiv.addEventListener("click", function () {
                  // 1. No permitir selección si está ocupado
                  if (this.classList.contains("occupied")) {
                    alert(
                      "Este espacio está ocupado y no se puede seleccionar."
                    );
                    return;
                  }

                  // 2. Manejo de la clase 'selected' y el array 'selectedSpots'
                  const espacioId = this.getAttribute("data-espacio-id");

                  if (this.classList.contains("selected")) {
                    // Si ya está seleccionado, lo deseleccionamos
                    this.classList.remove("selected");
                    // Eliminar del array
                    selectedSpots = selectedSpots.filter(
                      (id) => id !== espacioId
                    );
                  } else {
                    // Si no está seleccionado, intentamos seleccionarlo
                    // 3. Limitar a un máximo de 3 espacios
                    if (selectedSpots.length < 3) {
                      this.classList.add("selected");
                      selectedSpots.push(espacioId); // Añadir al array
                    } else {
                      alert("Solo puedes seleccionar un máximo de 3 espacios.");
                      // No se añade la clase 'selected' ni se agrega al array
                    }
                  }
                  console.log("Espacios seleccionados:", selectedSpots);
                });

                zonaElement.appendChild(espacioDiv);
              }
            }
          } else {
            console.warn(
              `Elemento HTML para la zona "${zonaId}" no encontrado. Asegurate de que el ID en HTML (${zonaId}) coincida con el DSL y exista en tu index.html.`
            );
          }
        }
      }
      updateSpotCounts(); // Llama a la función para actualizar los contadores al inicio
    })
    .catch((error) => {
      console.error("Error al cargar el DSL:", error);
      const parqueaderoMapa = document.getElementById("parqueadero-mapa");
      if (parqueaderoMapa) {
        parqueaderoMapa.innerHTML =
          "<p style='color: red;'>Error al cargar el mapa del parqueadero. Por favor, recargue la página.</p>";
      }
    });

  // --- Manejo del Formulario y Pasar Datos ---
  // CORRECCIÓN: El ID del formulario en HTML es "reservationForm", no "reservacionForm"
  const reservationForm = document.getElementById("reservationForm");

  if (reservationForm) {
    reservationForm.addEventListener("submit", function (event) {
      console.log("1. Evento de submit disparado.");
      event.preventDefault(); // Detiene el envío por defecto del formulario
      console.log("2. Comportamiento por defecto prevenido.");

      // Recopilar datos del formulario (antes de las validaciones de campos vacíos)
      const formData = new FormData(this);
      const reservationData = {};
      let allFormFieldsFilled = {}; // Bandera para validar campos

      // Itera sobre los campos del formulario para validar si están vacíos
      // y para recopilar los datos.
      for (let [key, value] of formData.entries()) {
        reservationData[key] = value;
        console.log(`Form data: ${key} = ${value}`);

        // Validación de campos vacíos
        if (value.trim() === "" && key !== "tipo") {
          // .trim() para quitar espacios en blanco
          allFormFieldsFilled[key] = false;
          // Opcional: podrías identificar qué campo está vacío para un mensaje más específico
          console.log(`Campo vacío detectado: ${key}`);
        } else {
          allFormFieldsFilled[key] = true;
        }
      }
      console.log("3. Datos del formulario recopilados:", reservationData);

      // --- VALIDACIONES CONSOLIDADAS ---

      // Validación 1: Todos los campos del formulario están llenos
      if (!Object.values(allFormFieldsFilled).every((filled) => filled)) {
        alert(
          `Por favor, completa los siguientes campos: ${Object.entries(
            allFormFieldsFilled
          )
            .filter(([key, value]) => !value)
            .map(([key]) => key)
            .join(", ")}.`
        );
        console.log("4. Validación: Campos del formulario incompletos.");
        return; // Detiene la ejecución si falta algún campo
      }

      // Validación 2: Al menos un espacio de parqueo seleccionado
      if (selectedSpots.length === 0) {
        alert("Por favor, selecciona al menos un espacio de parqueo.");
        console.log("4. Validación: No hay espacios seleccionados.");
        return; // Sale de la función, NO redirige
      }

      // La validación de selectedSpots.length > 3 ya se maneja en el click del espacio.
      // Si todas las validaciones pasan:
      reservationData.selectedParkingSpaces = selectedSpots;
      console.log("5. Datos de reserva final a guardar:", reservationData);

      // Guardar datos en localStorage
      localStorage.setItem(
        "currentReservationDetails",
        JSON.stringify(reservationData)
      );
      console.log("6. Datos de reserva guardados en localStorage.");

      // Redirigir a la siguiente página
      console.log("7. Redirigiendo a confirmacion.html");
      window.location.href = "confirmacion.html";
    });
  }
});
