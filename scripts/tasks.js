/* ---- SEGURIDAD: Si no se encuentra en localStorage info del usuario 👇 --- */
// funcion autoejecutable, antes de la carga del DOM

(function comprobacion() {
  // no lo deja acceder a la página, redirigiendo al login inmediatamente
  const jwt = localStorage.getItem("jwt");

  if (!jwt) {
    location.replace("./");
  }

  console.log("Paso correctamente la comprobacion");
})();

/* ----- comienzan las funcionalidades una vez que carga el documento 👇 ---- */
window.addEventListener("load", function () {
  /* ---------------- variables globales ---------------- */
  const btnCerrarSesion = document.querySelector("#closeApp");
  const nombreUsuario = document.querySelector(".user-info p");
  const contenedorTareasPendientes =
    document.querySelector(".tareas-pendientes");
  const contenedorTareasTerminadas =
    document.querySelector(".tareas-terminadas");
  const formCrearTarea = document.querySelector("form.nueva-tarea");
  const inputNuevaTarea = this.document.querySelector("#nuevaTarea");

  const urlBase = "http://todo-api.ctd.academy:3000/v1";
  const jwt = localStorage.getItem("jwt");

  /* -------------------------------------------------------------------------- */
  /*                          FUNCIÓN 1 - Cerrar sesión                         */
  /* -------------------------------------------------------------------------- */

  btnCerrarSesion.addEventListener("click", function () {
    console.log("Cerrar sesion");
    const confirmacion = confirm("¿Seguro desea cerrar sesión?");

    // si lo confirmo, cerramos la sesion
    if (confirmacion) {
      //  limpiamos el storage
      localStorage.clear();
      // lo llevamos a la pantalla de login
      location.replace("./");
    }
  });

  /* -------------------------------------------------------------------------- */
  /*                 FUNCIÓN 2 - Obtener nombre de usuario [GET]                */
  /* -------------------------------------------------------------------------- */

  function obtenerNombreUsuario() {
    const url = `${urlBase}/users/getMe`;

    const configuraciones = {
      method: "GET",
      headers: {
        authorization: jwt,
      },
    };

    // lanzamos la consulta para saber los datos del usuario
    fetch(url, configuraciones)
      .then((respuesta) => respuesta.json())
      .then((data) => {
        console.log(data);
        // reemplazamos el texto del nodo parrafo correspondiente
        nombreUsuario.innerText = data.firstName;
      })
      .catch((error) => console.log(error));
  }
  obtenerNombreUsuario();

  /* -------------------------------------------------------------------------- */
  /*                 FUNCIÓN 3 - Obtener listado de tareas [GET]                */
  /* -------------------------------------------------------------------------- */

  function consultarTareas() {
    const url = `${urlBase}/tasks`;

    const configuraciones = {
      method: "GET",
      headers: {
        authorization: jwt,
      },
    };

    // lanzamos la consulta para saber las tareas del usuario
    fetch(url, configuraciones)
      .then((respuesta) => respuesta.json())
      .then((data) => {
        console.log(data);
        // llamo a la funcion que renderiza las tareas en pantalla
        renderizarTareas(data);
      })
      .catch((error) => console.log(error));
  }
  consultarTareas();

  /* -------------------------------------------------------------------------- */
  /*                    FUNCIÓN 4 - Crear nueva tarea [POST]                    */
  /* -------------------------------------------------------------------------- */

  formCrearTarea.addEventListener("submit", function (evento) {
    evento.preventDefault();

    // preparamos el objeto a enviar al servidor
    const nueva = {
      description: inputNuevaTarea.value,
      completed: false,
    };

    // armamos la carta(peticion) como la pide el servidor (ver documentacion)
    const configuraciones = {
      method: "POST",
      headers: {
        authorization: jwt,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(nueva),
    };

    fetch(`${urlBase}/tasks`, configuraciones)
      .then((respuesta) => respuesta.json())
      .then((info) => {
        console.log("Tarea recien posteada 👇" + info);
        // necesitamos recargar nuestra interfaz
        consultarTareas();
      })
      .catch((error) => console.log(error));
  });

  /* -------------------------------------------------------------------------- */
  /*                  FUNCIÓN 5 - Renderizar tareas en pantalla                 */
  /* -------------------------------------------------------------------------- */

  function renderizarTareas(listado) {
    // limpiamos los contendores
    contenedorTareasPendientes.innerHTML = "";
    contenedorTareasTerminadas.innerHTML = "";

    console.log("pintando");
    // filtramos las terminadas
    const listadoTareasTerminadas = listado.filter((item) => item.completed);
    const listadoTareasPendientes = listado.filter((item) => !item.completed);

    console.log("Pendientes");
    console.log(listadoTareasPendientes);
    console.log("Terminadas");
    console.log(listadoTareasTerminadas);

    listadoTareasPendientes.forEach((tarea) => {
      // por cada tarea inyectamos un nodo li
      contenedorTareasPendientes.innerHTML += `
      <li class="tarea" data-aos="fade-down">
        <button class="change" id="${tarea.id}"><i class="fa-regular fa-circle"></i></button>
        <div class="descripcion">
          <p class="nombre">${tarea.description}</p>
          <p class="timestamp">${tarea.createdAt}</p>
        </div>
      </li>
      `;
    });
    listadoTareasTerminadas.forEach((tarea) => {
      // por cada tarea inyectamos un nodo li
      contenedorTareasTerminadas.innerHTML += `
      <li class="tarea" data-aos="fade-up">
        <div class="hecha">
          <i class="fa-regular fa-circle-check"></i>
        </div>
        <div class="descripcion">
          <p class="nombre">${tarea.description}</p>
          <div class="cambios-estados">
            <button class="change completa" id="${tarea.id}" ><i class="fa-solid fa-rotate-left"></i></button>
            <button class="borrar" id="${tarea.id}"><i class="fa-regular fa-trash-can"></i></button>
          </div>
        </div>
      </li>
      `;
    });

    const botonesChange = document.querySelectorAll(".change");
    const botonesDelete = document.querySelectorAll(".borrar");

    botonesChange.forEach((boton) => {
      boton.addEventListener("click", function (evento) {
        botonesCambioEstado(evento.target);
      });
    });

    botonesDelete.forEach((boton) =>{
      boton.addEventListener("click", function (evento) {
        botonBorrarTarea(evento.target);
      });
    });
  }

  /* -------------------------------------------------------------------------- */
  /*                  FUNCIÓN 6 - Cambiar estado de tarea [PUT]                 */
  /* -------------------------------------------------------------------------- */
  function botonesCambioEstado(nodo) {
    console.log(nodo);

    const terminada = nodo.classList.contains("completa");

    const cambio = {
      completed: !terminada,
    };

    const configuraciones = {
      method: "PUT",
      headers: {
        authorization: jwt,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(cambio),
    };

    fetch(`${urlBase}/tasks/${nodo.id}`, configuraciones)
      .then((respuesta) => respuesta.json())
      .then((data) => {
        consultarTareas();
      })
      .catch((error) => console.log(error));
  }

  /* -------------------------------------------------------------------------- */
  /*                     FUNCIÓN 7 - Eliminar tarea [DELETE]                    */
  /* -------------------------------------------------------------------------- */
  function botonBorrarTarea(nodo) {

    const configuraciones = {
      method: "DELETE",
      headers: {
        authorization: jwt,
        "Content-Type": "application/json",
      },
    };
console.log(nodo.id);
    fetch(`${urlBase}/tasks/${nodo.id}`, configuraciones)
      .then((respuesta) => respuesta.json())
      .then((data) => {
        consultarTareas();
      })
      .catch((error) => console.log(error));

  }
});
