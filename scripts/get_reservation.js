document.addEventListener("DOMContentLoaded", () => {
  // 1. Obtener los datos de la reserva desde localStorage
  const reservationJSON = localStorage.getItem("currentReservationDetails");

  // 2. Seleccionar los elementos del HTML que vamos a rellenar
  const mainTitle = document.getElementById("main-title");
  const mainSubtitle = document.getElementById("main-subtitle");
  const bookingReferenceEl = document.getElementById("booking-reference");
  const bookingDateEl = document.getElementById("booking-date");
  const bookingTimeEl = document.getElementById("booking-time");
  const bookingVehicleEl = document.getElementById("booking-vehicle");
  const bookingSpacesEl = document.getElementById("booking-spaces");

  // 3. Verificar si existen datos de reserva
  if (reservationJSON) {
    // 4. Si hay datos, procesarlos y mostrarlos
    try {
      // Convertir la cadena JSON a un objeto JavaScript
      const reservationData = JSON.parse(reservationJSON);
      console.log("Datos de la reserva:", reservationData);

      // Generar un número de referencia simple para el ejemplo
      const referenceNumber =
        "PS-" + Date.now().toString().slice(-6).toUpperCase();

      // 5. Actualizar el contenido del HTML con los datos de la reserva
      bookingReferenceEl.textContent = referenceNumber;
      bookingDateEl.textContent = reservationData.fecha;
      bookingTimeEl.textContent = reservationData.hora;
      bookingVehicleEl.textContent = reservationData.vehiculo;
      bookingSpacesEl.textContent =
        reservationData.selectedParkingSpaces.join(", ");
    } catch (error) {
      console.error("Error al parsear los datos de la reserva:", error);
      mainTitle.textContent = "Error en la Reserva";
      mainSubtitle.textContent =
        "No se pudieron cargar los detalles de la reserva. Por favor, inténtalo de nuevo.";
    }
  } else {
    // 6. Si no hay datos, mostrar un mensaje de error o guía
    mainTitle.textContent = "No se encontró ninguna reserva";
    mainSubtitle.textContent =
      "Parece que has llegado aquí sin hacer una reserva. Por favor, vuelve al mapa y selecciona tus espacios.";
    // Ocultar los campos de detalles que quedarían vacíos
    document.querySelector(".layout-content-container > .p-4").style.display =
      "none";
    document.querySelectorAll("h3").forEach((h) => (h.style.display = "none"));
  }
});
