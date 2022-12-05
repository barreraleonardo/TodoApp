/* --------------- COMPROBACION, antes de la carga del DOM 👇 --------------- */

// evaluar si hay un token para mandarlo directo a sus tareas
const jwt = localStorage.getItem("jwt");

if (jwt) {
  location.replace("/mis-tareas.html");
}

window.addEventListener("load", function () {
  /* ---------------------- obtenemos variables globales ---------------------- */
  const form = document.querySelector("form");
  const nombre = document.querySelector("#inputNombre");
  const apellido = document.querySelector("#inputApellido");
  const email = document.querySelector("#inputEmail");
  const password = document.querySelector("#inputPassword");
  const url = "http://todo-api.ctd.academy:3000/v1";

  /* -------------------------------------------------------------------------- */
  /*            FUNCIÓN 1: Escuchamos el submit y preparamos el envío           */
  /* -------------------------------------------------------------------------- */
  form.addEventListener("submit", function (event) {
    event.preventDefault();

    //creamos el cuerpo de la request
    const payload = {
      firstName: nombre.value,
      lastName: apellido.value,
      email: email.value,
      password: password.value,
    };

    //lanzamos la consulta de register a la API
    realizarRegister(payload);

    //limpio los campos del formulario
    form.reset();
  });

  /* -------------------------------------------------------------------------- */
  /*                    FUNCIÓN 2: Realizar el signup [POST]                    */
  /* -------------------------------------------------------------------------- */
  function realizarRegister(usuario) {
    //configuramos la peticion del Fetch
    const configuraciones = {
      method: "POST",
      body: JSON.stringify(usuario),
      headers: {
        "Content-Type": "application/json",
      },
    };

    console.log("Lanzando la consulta a la API");
    fetch(`${url}/users`, configuraciones)
      .then((response) => {
        console.log(response);

        if (response.ok != true) {
          alert("Alguno de los datos es incorrecto.");
        }

        return response.json();
      })
      .then((data) => {
        console.log(data);

        if (data.jwt) {
          //guardo en LocalStorage el objeto con el token
          localStorage.setItem("jwt", data.jwt);

          //redireccionamos a la página
          location.replace("./mis-tareas.html");
        }
      })
      .catch((error) => console.log(error));
  }
});
