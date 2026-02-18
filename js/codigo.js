const ruteo = document.querySelector("#ruteo");
const menu = document.querySelector("#menu");
let urlBase = "https://movielist.develotion.com";
let latitud;
let longitud;
let map;

navigator.geolocation.getCurrentPosition(guardarUbicacion, mostrarError);

inicio();

function inicio() {
  usuarioLogueado();
  agregarEventos();
}

function usuarioLogueado() {
  let token = localStorage.getItem("token");
  if (token) {
    setTimeout(() => {
      ruteo.push("/");
    }, 50);
  } else {
    setTimeout(() => {
      ruteo.push("/login");
    }, 50);
  }
}

function agregarEventos() {
  ruteo.addEventListener("ionRouteWillChange", navegar);
  document.querySelector("#btnRegistro").addEventListener("click", registro);
  document.querySelector("#btnLogin").addEventListener("click", login);
  document
    .querySelector("#btnAgregarPelicula")
    .addEventListener("click", agregarPelicula);

  document
    .querySelector("#slcFiltro")
    .addEventListener("ionChange", aplicarFiltro);
}

function guardarUbicacion(position){
  latitud=position.coords.latitude;
  longitud=position.coords.longitude;
}

function mostrarError(error){
  mostrarMensaje(error.message);
}

function cerrarMenu() {
  menu.close();
}

function menuUsuInvitado() {
  document.querySelector("#menuInicio").style.display = "none";
  document.querySelector("#menuAgregarPelicula").style.display = "none";
  document.querySelector("#menuListado").style.display = "none";
  document.querySelector("#menuLogout").style.display = "none";
  document.querySelector("#menuLogin").style.display = "block";
  document.querySelector("#menuRegistro").style.display = "block";
  document.querySelector("#menuEstadisticas").style.display = "none";
  document.querySelector("#menuMapa").style.display = "none";
}

function menuUsuLogueado() {
  document.querySelector("#menuInicio").style.display = "block";
  document.querySelector("#menuAgregarPelicula").style.display = "block";
  document.querySelector("#menuLogout").style.display = "block";
  document.querySelector("#menuListado").style.display = "block";
  document.querySelector("#menuLogin").style.display = "none";
  document.querySelector("#menuRegistro").style.display = "none";
  document.querySelector("#menuEstadisticas").style.display = "block";
  document.querySelector("#menuMapa").style.display = "block";
}

function navegar(evt) {
  let paginaDestino = evt.detail.to;
  ocultarPaginas();
  switch (paginaDestino) {
    case "/":
      menuUsuLogueado();
      document.querySelector("#bienvenido").innerHTML =
        `<h1>Bienvenido "${localStorage.getItem("usuLogueado")}"</h1>`;
      document.querySelector("#page-home").style.display = "block";
      break;
    case "/registro":
      menuUsuInvitado();
      mostrarPaises();
      document.querySelector("#page-registro").style.display = "block";
      break;
    case "/agregarPelicula":
      menuUsuLogueado();
      mostrarCategorias();
      document.querySelector("#page-agregarPelicula").style.display = "block";
      break;

    case "/listado":
      menuUsuLogueado();
      mostrarListado();
      document.querySelector("#page-listado").style.display = "block";
      break;

    case "/estadisticas":
      menuUsuLogueado();
      mostrarEstadisticas();
      document.querySelector("#page-estadisticas").style.display = "block";
      break;

    case "/mapa":
      menuUsuLogueado();
      setTimeout(() => {
      mostrarMapa();
      }, 50);
      document.querySelector("#page-mapa").style.display = "block";
      break;

    case "/logout":
      logout();
      break;
    default:
      menuUsuInvitado();
      document.querySelector("#page-login").style.display = "block";
      break;
  }
}
//asaddd
function ocultarPaginas() {
  let paginas = document.querySelectorAll(".ion-page");
  for (let i = 1; i < paginas.length; i++) {
    paginas[i].style.display = "none";
  }
}

//Funciones de Registro

async function mostrarPaises() {
  let options = "";
  let paises = await obtenerPaises();
  for (let i = 0; i < paises.length; i++) {
    options += `<ion-select-option value="${paises[i].id}">${paises[i].nombre}</ion-select-option>`;
  }
  document.querySelector("#slcPaises").innerHTML = options;
}
async function obtenerPaises() {
  try {
    let paises = "";
    let response = await fetch(`${urlBase}/paises`);
    if (response.ok) {
      let data = await response.json();
      paises = data.paises;
    } else {
      mostrarMensaje("No se pudo cargar paises");
    }
    return paises;
  } catch (error) {
    mostrarMensaje(error);
  }
}

function registro() {
  let mensaje = "";
  try {
    let usuario = document.querySelector("#txtRegNombreUsuario").value;
    let password = document.querySelector("#txtRegPassword").value;
    let idPais = document.querySelector("#slcPaises").value;

    if (usuario && password && idPais) {
      limpiarCampos("txtRegNombreUsuario", "txtRegPassword", "slcPaises");
      fetch(`${urlBase}/usuarios`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          usuario: usuario,
          password: password,
          idPais: idPais,
        }),
      })
        .then(function (response) {
          return response.json();
        })
        .then(function (data) {
          if (data.mensaje) {
            mensaje = data.mensaje;
            mostrarMensaje(mensaje);
          } else {
            localStorage.setItem("token", data.token);
            localStorage.setItem("usuLogueado", usuario);
            mensaje = "Registrado exitosamente";
            mostrarMensaje(mensaje);
            ruteo.push("/");
          }
        });
    } else {
      mensaje = "Debe completar todos los campos";
      mostrarMensaje(mensaje);
    }
  } catch (error) {
    mensaje = error;
    mostrarMensaje(mensaje);
  }
}

//Funcion Logout
function logout() {
  localStorage.clear();
  ruteo.push("/login");
}

//Funciones de login
async function login() {
  
  try {
    let usuario = document.querySelector("#txtNombreUsuario").value;
    let password = document.querySelector("#txtPassword").value;
    if (usuario && password) {
      limpiarCampos ("txtNombreUsuario", "txtPassword")
      let response = await fetch(`${urlBase}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ usuario: usuario, password: password }),
      });
      let respuestaJson = await response.json();
      if (response.ok) {
        //token = respuestaJson.data.token;
        localStorage.setItem("token", respuestaJson.token);
        localStorage.setItem("usuLogueado", usuario);
        ruteo.push("/");
      } else {
        mostrarMensaje(respuestaJson.mensaje);
      }
    } else {
      mostrarMensaje("Datos incorrectos");
    }
  } catch (error) {
    mostrarMensaje(error);
  }
}

//Agregar pelicula
async function agregarPelicula() {
  try {
    let token = localStorage.getItem("token");
    if (token) {
      
      let idCategoria = document.querySelector("#slcCategorias").value;
      let nombre = document.querySelector("#txtRegNombrePelicula").value;
      const hoy = new Date().toISOString();
      let fecha = document.querySelector("#dtFechaPelicula").value;
      let comentario = document.querySelector("#txtComentarioPelicula").value;
      let sentiment = await llamarSentiment(comentario);

      if (idCategoria && nombre && fecha <= hoy && comentario) {
        limpiarCampos("slcCategorias","txtRegNombrePelicula", "dtFechaPelicula", "txtComentarioPelicula")
        if (sentiment) {
          if (idCategoria && nombre && fecha) {
            let response = await fetch(`${urlBase}/peliculas`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                idCategoria: idCategoria,
                nombre: nombre,
                fecha: fecha,
              }),
            });
            let respuestaJson = await response.json();
            if (response.ok) {
              mostrarMensaje(respuestaJson.mensaje);
            } else if (response.status == 401) {
              mostrarMensaje("Debes iniciar sesiòn nuevamente");
            } else {
              mostrarMensaje("test de error");
            }
          } else {
            mostrarMensaje("datos invalidos");
          }
        } else {
          mostrarMensaje(
            "tuvo comentario negativo, no se pudo registrar, vuelva a intentarlo",
          );
        }
      } else {
        mostrarMensaje("Campos vacios o incorrectos");
      }
    } else {
      mostrarMensaje("No esta logueado, debe loguearse");
    }
  } catch (error) {
    mostrarMensaje(error);
  }
}

async function llamarSentiment(comentario) {
  try {
    let prompt = comentario;
    let valor = "";
    if (comentario) {
      let response = await fetch(`${urlBase}/genai`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt,
        }),
      });
      let respuestaJson = await response.json();
      if (response.ok) {
        if (respuestaJson.sentiment == "Negativo") {
          valor = false;
        } else {
          valor = true;
        }
      } else {
        mostrarMensaje("Error");
      }
    } else {
      mostrarMensaje("Comentario vacio");
    }
    return valor;
  } catch (error) {
    mostrarMensaje(error);
  }
}

async function mostrarCategorias() {
  let options = "";
  let categorias = await obtenerCategorias();
  for (let i = 0; i < categorias.length; i++) {
    options += `<ion-select-option value="${categorias[i].id}">${categorias[i].nombre}</ion-select-option>`;
  }
  document.querySelector("#slcCategorias").innerHTML = options;
}
async function obtenerCategorias() {
  try {
    let categorias = "";
    let token = localStorage.getItem("token");
    if (token) {
      let response = await fetch(`${urlBase}/categorias`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        let data = await response.json();
        categorias = data.categorias;
      } else if (response.status == 401) {
        mostrarMensaje("Debes iniciar sesiòn nuevamente");
      } else {
        mostrarMensaje("No se pudo cargar categorias");
      }
      return categorias;
    } else {
      mostrarMensaje("No esta logueado, debe loguearse");
    }
  } catch (error) {
    mostrarMensaje(error);
  }
}

//Funciones de Listado

async function obtenerPeliculas() {
  try {
    let peliculas = "";
    let token = localStorage.getItem("token");
    if (token) {
      let response = await fetch(`${urlBase}/peliculas`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        let data = await response.json();
        peliculas = data.peliculas;
        console.log(data.peliculas);
      } else if (response.status == 401) {
        mostrarMensaje("Debes iniciar sesiòn nuevamente");
      } else {
        mostrarMensaje("No se pudo cargar peliculas");
      }
      return peliculas;
    } else {
      mostrarMensaje("No esta logueado, debe loguearse");
    }
  } catch (error) {
    mostrarMensaje(error);
  }
}

async function mostrarListado() {
  try {
    let peliculas = await obtenerPeliculas();
    let categorias = await obtenerCategorias();
    document.querySelector("#listado").innerHTML = "";
    let listado = "";
    if (peliculas.length > 0 && categorias.length > 0) {
      for (let i = 0; i < peliculas.length; i++) {
        let unaPeli = peliculas[i];
        let categoriaBuscada = categorias.find(
          (cat) => cat.id == unaPeli.idCategoria,
        );
        if (categoriaBuscada) {
          //listado += `${unaPeli.nombre} + ${categoriaBuscada.nombre}`
          listado += `
                      
                      <ion-card>
                        <ion-card-header>
                          <ion-card-title>${unaPeli.nombre}</ion-card-title>
                          <ion-card-subtitle>${categoriaBuscada.nombre} ${categoriaBuscada.emoji}</ion-card-subtitle>
                        </ion-card-header>

                        <ion-card-content>
                          <ion-button onclick=eliminarPelicula(${unaPeli.id})>Eliminar</ion-button>
                          Here's a small text description for the card content. Nothing more, nothing less.
                        </ion-card-content>
                      </ion-card>`;
        }
        document.querySelector("#listado").innerHTML = listado;
      }
    } else {
      mostrarMensaje("No hay peliculas para mostrar");
    }
  } catch (error) {
    mostrarMensaje(error);
  }
}

// Eliminar Pelicula
async function eliminarPelicula(idPelicula) {
  try {
    let token = localStorage.getItem("token");
    if (token) {
      let response = await fetch(`${urlBase}/peliculas/${idPelicula}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        let data = await response.json();
        mostrarListado();

        mostrarMensaje(data.mensaje);
      } else if (response.status == 401) {
        mostrarMensaje("Debes iniciar sesiòn nuevamente");
      } else {
        mostrarMensaje(data.mensaje);
      }
    } else {
      mostrarMensaje("No esta logueado, debe loguearse");
    }
  } catch (error) {
    mostrarMensaje(error);
  }
}


//Filtrado
async function aplicarFiltro() {
  try {
    let peliculas = await obtenerPeliculas();
    let categorias = await obtenerCategorias();
    document.querySelector("#listado").innerHTML = "";
    let listado = "";
    const filtro = document.querySelector("#slcFiltro").value;

    let ahora = new Date();
    let fecha = new Date();
    if (filtro === "semana") {
      fecha.setDate(ahora.getDate() - 7);
      ahora = ahora.toISOString().split("T")[0];
      fecha = fecha.toISOString().split("T")[0];
      if (peliculas.length > 0 && categorias.length > 0) {
        for (let i = 0; i < peliculas.length; i++) {
          let unaPeli = peliculas[i];
          if (unaPeli.fechaEstreno <= ahora && unaPeli.fechaEstreno >= fecha) {
            let categoriaBuscada = categorias.find(
              (cat) => cat.id == unaPeli.idCategoria,
            );
            if (categoriaBuscada) {
              //listado += `${unaPeli.nombre} + ${categoriaBuscada.nombre}`
              listado += `
                      
                      <ion-card>
                        <ion-card-header>
                          <ion-card-title>${unaPeli.nombre}</ion-card-title>
                          <ion-card-subtitle>${categoriaBuscada.nombre} ${categoriaBuscada.emoji}</ion-card-subtitle>
                        </ion-card-header>

                        <ion-card-content>
                          <ion-button onclick=eliminarPelicula(${unaPeli.id})>Eliminar</ion-button>
                          Here's a small text description for the card content. Nothing more, nothing less.
                        </ion-card-content>
                      </ion-card>`;
            }
            document.querySelector("#listado").innerHTML = listado;
          }
        }
      } else {
        mostrarMensaje("No hay peliculas para mostrar");
      }
    }
     else if (filtro === "mes") {
      fecha.setMonth(ahora.getMonth() - 1);
      ahora = ahora.toISOString().split("T")[0];
      fecha = fecha.toISOString().split("T")[0];
      if (peliculas.length > 0 && categorias.length > 0) {
        for (let i = 0; i < peliculas.length; i++) {
          let unaPeli = peliculas[i];
          if (unaPeli.fechaEstreno <= ahora && unaPeli.fechaEstreno >= fecha) {
            let categoriaBuscada = categorias.find(
              (cat) => cat.id == unaPeli.idCategoria,
            );
            if (categoriaBuscada) {
              //listado += `${unaPeli.nombre} + ${categoriaBuscada.nombre}`
              listado += `
                      
                      <ion-card>
                        <ion-card-header>
                          <ion-card-title>${unaPeli.nombre}</ion-card-title>
                          <ion-card-subtitle>${categoriaBuscada.nombre} ${categoriaBuscada.emoji}</ion-card-subtitle>
                        </ion-card-header>

                        <ion-card-content>
                          <ion-button onclick=eliminarPelicula(${unaPeli.id})>Eliminar</ion-button>
                          Here's a small text description for the card content. Nothing more, nothing less.
                        </ion-card-content>
                      </ion-card>`;
            }
            document.querySelector("#listado").innerHTML = listado;
          }
        
        }
      } else {
        mostrarMensaje("No hay peliculas para mostrar");
      }
    }
    else{
      mostrarListado()
    }
  } catch (error) {
    mostrarMensaje(error);
  }
}

//Funciones Generales
function mostrarMensaje(mensaje) {
  let toast = document.createElement("ion-toast");
  toast.duration = 1500;
  toast.message = mensaje;
  toast.position = "bottom";
  document.body.append(toast);
  toast.present();
}

function limpiarCampos(){
    for(let i=0;i<arguments.length;i++){
        console.log(arguments[i]);
        //if(arguments[i]==="slcRoles"){
          //  document.querySelector("#"+arguments[i]).value="-1";
        //}
        //else{
        document.querySelector("#"+arguments[i]).value="";
        //}
    }
}

async function mostrarEstadisticas(){

  try{

    let peliculas = await obtenerPeliculas();
    let categorias = await obtenerCategorias();

    if(!peliculas || peliculas.length === 0){

      document.querySelector("#estadisticas").innerHTML =
      "No hay datos";

      return;
    }

    let html = "<h2>Películas por categoría</h2>";

    // contar por categoria
    categorias.forEach(cat => {

      let cantidad = peliculas.filter(p =>
        p.idCategoria == cat.id
      ).length;

      html += `
        ${cat.nombre} ${cat.emoji}: ${cantidad}
        <br>
      `;
    });
    // porcentaje mayores de 12
    let mayores12 = 0;
    let menores12 = 0;

    peliculas.forEach(p => {

      let categoria = categorias.find(c =>
        c.id == p.idCategoria
      );
      if(categoria){

        if(categoria.edadMinima >= 12){
          mayores12++;
        }
        else{
          menores12++;
        }
      }
    });
    let total = peliculas.length;

    let porcentajeMayores =
      ((mayores12 * 100) / total).toFixed(1);

    let porcentajeMenores =
      ((menores12 * 100) / total).toFixed(1);

    html += `
      <h2>Porcentajes</h2>
      Mayores de 12: ${porcentajeMayores}%<br>
      Menores de 12: ${porcentajeMenores}%
    `;
    document.querySelector("#estadisticas").innerHTML = html;
  }
  catch(error){
    mostrarMensaje(error);
  }
}

async function mostrarMapa(){

  try{

    let token = localStorage.getItem("token");

    let responseUsuarios = await fetch(`${urlBase}/usuariosPorPais`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      }
    });

    let responsePaises = await fetch(`${urlBase}/paises`);

    if(responseUsuarios.ok && responsePaises.ok){

      let dataUsuarios = await responseUsuarios.json();
      let dataPaises = await responsePaises.json();

      let usuariosPorPais = dataUsuarios.paises;
      let paises = dataPaises.paises;

      if(map){
        map.remove();
      }

      map = L.map('mapa').setView([20, 0], 2);

      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
      }).addTo(map);

      let contador = 0;

      for(let i = 0; i < usuariosPorPais.length; i++){

        let up = usuariosPorPais[i];

        let paisEncontrado = paises.find(p =>
          p.id == up.id
        );

        if(paisEncontrado &&
           paisEncontrado.latitud &&
           paisEncontrado.longitud){

          L.marker([
            parseFloat(paisEncontrado.latitud),
            parseFloat(paisEncontrado.longitud)
          ])
          .addTo(map)
          .bindPopup(`
            <b>${paisEncontrado.nombre}</b><br>
            Usuarios: ${up.cantidadDeUsuarios}
          `);
          contador++;
          if(contador == 10){
            break;
          }
        }
      }
      setTimeout(() => {
        map.invalidateSize();
      }, 200);
    }
  }
  catch(error){
    console.log(error);
  }
}

/*function mostrarMapa(){
  if(latitud && longitud){
    if(map){
      map.remove();
    }
  map = L.map('mapa').setView([latitud, longitud], 13);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);
L.marker([latitud, longitud]).addTo(map);
}else {
  mostrarMensaje("Coordenadas Incorrectas");
}
}*/