// Importar fs para manejo de archivos y readline para la interacción con el usuario
import fs from 'fs';
import readline from 'readline';

// Configurar readline
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Archivos para almacenar datos
const archivoSiniestros = 'siniestros.json';
const archivoClientes = 'clientes.json';

// Función para leer datos de un archivo
function leerArchivo(archivo) {
  try {
    const data = fs.readFileSync(archivo);
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// Función para guardar datos en un archivo
function guardarArchivo(archivo, datos) {
  fs.writeFileSync(archivo, JSON.stringify(datos));
}

// Función para validar cliente y póliza
function validarClienteYPoliza(dni) {
  const clientes = leerArchivo(archivoClientes);
  const cliente = clientes.find(c => c.dni === dni && c.status === 'activo');
  if (!cliente) {
    console.log('Cliente no encontrado o inactivo.');
    return null;
  }
  const polizaActiva = cliente.polizas.find(p => p.status === 'activo');
  if (!polizaActiva) {
    console.log('Su póliza se encuentra inactiva, por favor contacte a su ejecutivo.');
    return null;
  }
  return { cliente, polizaActiva };
}
// Función para mostrar el menú principal
function mostrarMenu() {
    console.log('\n--- Menú Principal ---');
    console.log('1. Crear nuevo siniestro');
    console.log('2. Leer siniestros');
    console.log('3. Actualizar siniestro');
    console.log('4. Eliminar siniestro');
    console.log('0. Salir');
    rl.question('Seleccione una opción: ', (opcion) => {
      switch (opcion) {
        case '1':
          crearSiniestro();
          break;
        case '2':
          leerSiniestros();
          break;
        case '3':
          actualizarSiniestro();
          break;
        case '4':
          eliminarSiniestro();
          break;
        case '0':
          console.log('Gracias por usar el Sistema de Gestión de Siniestros. ¡Hasta luego!');
          rl.close();
          break;
        default:
          console.log('Opción no válida. Por favor, intente de nuevo.');
          mostrarMenu();
      }
    });
  }
  
// Función para crear un nuevo siniestro
function crearSiniestro() {
  rl.question('DNI del cliente: ', (dni) => {
    const validacion = validarClienteYPoliza(dni);
    if (!validacion) {
      mostrarMenu();
      return;
    }

    const { cliente, polizaActiva } = validacion;
    const nuevoSiniestro = { id: Date.now(), clienteDni: dni, polizaNumero: polizaActiva.numeroPoliza };

    console.log(`Creando siniestro para cliente: ${cliente.nombre} ${cliente.apellido}`);
    console.log(`Póliza: ${polizaActiva.numeroPoliza} - Tipo: ${polizaActiva.tipoSeguro}`);

    rl.question('Fecha del incidente (YYYY-MM-DD): ', (fecha) => {
      rl.question('Hora del incidente (HH:mm): ', (hora) => {
        rl.question('Ubicación (dirección, ciudad, código postal): ', (ubicacion) => {
          rl.question('Breve descripción de lo ocurrido: ', (descripcion) => {
            rl.question('¿Hubo lesiones personales? (si/no): ', (lesiones) => {
              rl.question('Descripción de daños a la propiedad: ', (danios) => {
                rl.question('¿Se llamó a la policía o bomberos? (si/no): ', (autoridades) => {
                  rl.question('Número de informe policial (si aplica): ', (informePolicial) => {
                    rl.question('¿La información proporcionada es correcta? (si/no): ', (confirmacion) => {
                      if (confirmacion.toLowerCase() !== 'si') {
                        console.log('Registro cancelado por confirmación negativa.');
                        mostrarMenu();
                        return;
                      }

                      nuevoSiniestro.fecha = fecha;
                      nuevoSiniestro.hora = hora;
                      nuevoSiniestro.ubicacion = ubicacion;
                      nuevoSiniestro.descripcion = descripcion;
                      nuevoSiniestro.lesiones = lesiones.toLowerCase() === 'si';
                      nuevoSiniestro.danios = danios;
                      nuevoSiniestro.autoridades = autoridades.toLowerCase() === 'si';
                      nuevoSiniestro.informePolicial = informePolicial;

                      if (polizaActiva.tipoSeguro === 'auto') {
                        rl.question('Marca del vehículo: ', (marca) => {
                          rl.question('Modelo del vehículo: ', (modelo) => {
                            rl.question('Año del vehículo: ', (anio) => {
                              rl.question('Número de placa: ', (placa) => {
                                rl.question('¿El vehículo es conducible? (si/no): ', (conducible) => {
                                  nuevoSiniestro.vehiculo = { marca, modelo, anio, placa };
                                  nuevoSiniestro.vehiculoConducible = conducible.toLowerCase() === 'si';
                                  
                                  const siniestros = leerArchivo(archivoSiniestros);
                                  siniestros.push(nuevoSiniestro);
                                  guardarArchivo(archivoSiniestros, siniestros);
                                  console.log('Siniestro registrado con éxito.');
                                  mostrarMenu();
                                });
                              });
                            });
                          });
                        });
                      } else {
                        const siniestros = leerArchivo(archivoSiniestros);
                        siniestros.push(nuevoSiniestro);
                        guardarArchivo(archivoSiniestros, siniestros);
                        console.log('Siniestro registrado con éxito.');
                        mostrarMenu();
                      }
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  });
}

// Función para leer y mostrar todos los siniestros
function leerSiniestros() {
  const siniestros = leerArchivo(archivoSiniestros);
  console.log('\n--- Lista de Siniestros ---');
  siniestros.forEach(siniestro => {
    console.log(`ID: ${siniestro.id}, Cliente: ${siniestro.clienteDni}, Póliza: ${siniestro.polizaNumero}`);
    console.log(`Fecha: ${siniestro.fecha} ${siniestro.hora}, Ubicación: ${siniestro.ubicacion}`);
    console.log(`Descripción: ${siniestro.descripcion}`);
    console.log('-------------------------');
  });
  mostrarMenu();
}

// Función para actualizar un siniestro existente
function actualizarSiniestro() {
  const siniestros = leerArchivo(archivoSiniestros);
  rl.question('ID del siniestro a actualizar: ', (id) => {
    const siniestro = siniestros.find(s => s.id.toString() === id);
    if (siniestro) {
      rl.question(`Nueva descripción (anterior: ${siniestro.descripcion}): `, (descripcion) => {
        siniestro.descripcion = descripcion || siniestro.descripcion;
        guardarArchivo(archivoSiniestros, siniestros);
        console.log('Siniestro actualizado con éxito.');
        mostrarMenu();
      });
    } else {
      console.log('Siniestro no encontrado.');
      mostrarMenu();
    }
  });
}

// Función para eliminar un siniestro existente
function eliminarSiniestro() {
  const siniestros = leerArchivo(archivoSiniestros);
  rl.question('ID del siniestro a eliminar: ', (id) => {
    const index = siniestros.findIndex(s => s.id.toString() === id);
    if (index !== -1) {
      rl.question('¿Está seguro de que desea eliminar este siniestro? (si/no): ', (confirmacion) => {
        if (confirmacion.toLowerCase() === 'si') {
          siniestros.splice(index, 1);
          guardarArchivo(archivoSiniestros, siniestros);
          console.log('Siniestro eliminado con éxito.');
        } else {
          console.log('Eliminación cancelada.');
        }
        mostrarMenu();
      });
    } else {
      console.log('Siniestro no encontrado.');
      mostrarMenu();
    }
  });
}

// Función para mostrar mensaje de bienvenida
function mostrarMensajeBienvenida() {
  console.log('---------------------------------------------');
  console.log('  Bienvenido al Sistema de Gestión de Siniestros');
  console.log('---------------------------------------------');
}

// Iniciar el programa mostrando el mensaje de bienvenida y el menú principal
mostrarMensajeBienvenida();
mostrarMenu();