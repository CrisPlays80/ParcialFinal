document.addEventListener("DOMContentLoaded", () => {
  // 1. Obtener los datos de la reserva desde localStorage
  const reservationJSON = localStorage.getItem("currentReservationDetails");

  // 2. Seleccionar los elementos del HTML que vamos a rellenar
  const bookingReferenceEl = document.getElementById("booking-reference");
  const bookingDateEl = document.getElementById("booking-date");
  const bookingTimeEl = document.getElementById("booking-time");
  const bookingVehicleEl = document.getElementById("booking-vehicle");
  const bookingSpacesEl = document.getElementById("booking-spaces");
  const totalAmountEl = document.getElementById("totalAmount");

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
      totalAmountEl.textContent = reservationData.total;
    } catch (error) {
      console.error("Error al parsear los datos de la reserva:", error);
    }
  } else {
    // 6. Si no hay datos, mostrar un mensaje de error o guía
    bookingReferenceEl.textContent = "No se encontró ninguna reserva";
    bookingDateEl.textContent = "No se encontró ninguna reserva";
    bookingTimeEl.textContent = "No se encontró ninguna reserva";
    bookingVehicleEl.textContent = "No se encontró ninguna reserva";
    bookingSpacesEl.textContent = "No se encontró ninguna reserva";
    totalAmountEl.textContent = "No se encontró ninguna reserva";
    // Ocultar los campos de detalles que quedarían vacíos
    document.querySelector(".layout-content-container > .p-4").style.display =
      "none";
    document.querySelectorAll("h3").forEach((h) => (h.style.display = "none"));
  }
});
