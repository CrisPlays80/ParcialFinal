// script.js

// Elimina las lineas de Node.js, no son necesarias en el navegador
// const { readFileSync } = require("fs");
// const PARKING_DSL = JSON.parse(readFileSync("./DSL.json", "utf-8"));

document.addEventListener("DOMContentLoaded", () => {
  // Definimos la URL de tu archivo DSL.json
  const dslUrl = "../DSL.json"; // Asegurate que esta ruta sea correcta

  // Usamos fetch para cargar el archivo DSL de forma asincrona
  fetch(dslUrl)
    .then((response) => {
      // Verifica si la solicitud fue exitosa (codigo de estado 200-299)
      if (!response.ok) {
        throw new Error(
          `Error HTTP: ${response.status} - No se pudo cargar el DSL.`
        );
      }
      console.log(response);
      return response.json();
    })
    .then((PARKING_DSL_COMPLETO) => {
      // El objeto PARKING_DSL_COMPLETO ahora contiene todo tu DSL.json
      // Asegurate de acceder a la parte correcta del DSL que necesitas para las zonas de parqueo
      const zonasParqueo =
        PARKING_DSL_COMPLETO.configuracionSistema.zonasParqueo;
      const parqueaderoMapa = document.getElementById("parqueadero-mapa");

      // Funcion para simular el estado de un espacio
      const getRandomStatus = () => {
        const statuses = ["available", "occupied"];
        return statuses[Math.floor(Math.random() * statuses.length)];
      };

      // Itera sobre las zonas de parqueo definidas en el DSL
      for (const zonaId in zonasParqueo) {
        // Asegurate de que la propiedad pertenezca directamente al objeto y no sea de su prototipo
        if (zonasParqueo.hasOwnProperty(zonaId)) {
          const zonaData = zonasParqueo[zonaId]; // Obtiene los datos de la zona (capacidad, descripcion)
          const zonaElement = document.getElementById(zonaId); // Busca el div HTML con el ID de la zona

          if (zonaElement && zonaData.capacidad > 0) {
            // Añadir nombre de la zona y capacidad
            const zonaTitle = document.createElement("div");
            zonaTitle.classList.add("zona-titulo");
            zonaTitle.textContent = `${zonaData.descripcion} (${zonaData.capacidad})`;
            zonaTitle.style.padding = "10px";
            zonaElement.appendChild(zonaTitle);

            // Crear los espacios individuales dentro de cada zona
            for (let i = 1; i <= zonaData.capacidad; i++) {
              const espacioDiv = document.createElement("div");
              espacioDiv.classList.add("espacio");
              espacioDiv.textContent = i; // Numero de espacio
              espacioDiv.setAttribute("data-zona", zonaId);
              espacioDiv.setAttribute("data-espacio-id", `${zonaId}-${i}`);

              // Simular un estado aleatorio para el ejemplo
              const estado = getRandomStatus();
              espacioDiv.classList.add(estado);

              // Añadir un evento click para futuras interacciones (ej. reservar)
              espacioDiv.addEventListener("click", () => {
                espacioDiv.classList.toggle("selected");
                // Aqui podrias abrir un modal de reserva, etc.
              });

              zonaElement.appendChild(espacioDiv);
            }
          } else {
            console.warn(
              `Elemento HTML para la zona "${zonaId}" no encontrado. Asegurate de que el ID en HTML (${zonaId}) coincida con el DSL y exista en tu index.html.`
            );
          }
        }
      }
    })
    .catch((error) => {
      // Maneja cualquier error que ocurra durante la carga o el parseo
      console.error("Error al cargar el DSL:", error);
      // Podrias mostrar un mensaje de error en la UI si el DSL no carga
      const parqueaderoMapa = document.getElementById("parqueadero-mapa");
      if (parqueaderoMapa) {
        parqueaderoMapa.innerHTML =
          "<p style='color: red;'>Error al cargar el mapa del parqueadero. Por favor, recargue la página.</p>";
      }
    });
});
