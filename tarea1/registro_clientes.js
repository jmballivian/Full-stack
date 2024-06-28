// Importar fs para manejo de archivos, readline para la interacción con el usuario y chalk para colores
import fs from 'fs';
import readline from 'readline';
import chalk from 'chalk';

// Configurar readline
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Archivo para almacenar clientes
const archivoClientes = 'clientes.json';

// Función para leer clientes del archivo
function leerClientes() {
  try {
    const data = fs.readFileSync(archivoClientes);
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// Función para guardar clientes en el archivo
function guardarClientes(clientes) {
  fs.writeFileSync(archivoClientes, JSON.stringify(clientes));
}

// Función para mostrar un menú y pedir una opción al usuario
function mostrarMenu() {
  console.log('\n--- Menú ---');
  console.log('1. Registrar cliente');
  console.log('2. Registrar póliza');
  console.log('3. Buscar cliente');
  console.log('4. Actualizar cliente');
  console.log('5. Eliminar cliente');
  console.log('6. Actualizar estado de póliza');
  console.log('7. Salir');
  rl.question('Seleccione una opción: ', (opcion) => {
    switch (opcion) {
      case '1': registrarCliente(); break;
      case '2': registrarPoliza(); break;
      case '3': buscarCliente(); break;
      case '4': actualizarCliente(); break;
      case '5': eliminarCliente(); break;
      case '6': actualizarEstadoPoliza(); break;
      case '7': rl.close(); break;
      default: console.log('Opción no válida.'); mostrarMenu();
    }
  });
}

// Función para registrar un nuevo cliente
function registrarCliente() {
  rl.question('DNI: ', (dni) => {
    rl.question('Nombre: ', (nombre) => {
      rl.question('Apellido: ', (apellido) => {
        rl.question('Teléfono: ', (telefono) => {
          rl.question('Email: ', (email) => {
            rl.question('Status (activo/inactivo): ', (status) => {
              if (['activo', 'inactivo'].includes(status.toLowerCase())) {
                const cliente = { dni, nombre, apellido, telefono, email, status: status.toLowerCase(), polizas: [] };
                const clientes = leerClientes();
                clientes.push(cliente);
                guardarClientes(clientes);
                console.log(chalk.green('Cliente registrado con éxito.'));
                mostrarMenu();
              } else {
                console.log(chalk.red('Estado no válido. Por favor ingrese "activo" o "inactivo".'));
                registrarCliente();
              }
            });
          });
        });
      });
    });
  });
}

// Función para generar un número de póliza único
function generarNumeroPoliza() {
  return 'POL-' + Date.now();
}

// Función para registrar una póliza para un cliente
function registrarPoliza() {
  rl.question('DNI del cliente: ', (dni) => {
    const clientes = leerClientes();
    const cliente = clientes.find(c => c.dni === dni && c.status === 'activo');
    if (cliente) {
      rl.question('Tipo de seguro (auto, incendio, robo): ', (tipoSeguro) => {
        if (['auto', 'incendio', 'robo'].includes(tipoSeguro.toLowerCase())) {
          rl.question('Status de la póliza (activo/inactivo): ', (status) => {
            if (['activo', 'inactivo'].includes(status.toLowerCase())) {
              const numeroPoliza = generarNumeroPoliza();
              const poliza = { numeroPoliza, tipoSeguro, status: status.toLowerCase() };
              cliente.polizas.push(poliza);
              guardarClientes(clientes);
              console.log(chalk.green('Póliza registrada con éxito:'));
              console.log(poliza);
              mostrarMenu();
            } else {
              console.log(chalk.red('Estado no válido. Por favor ingrese "activo" o "inactivo".'));
              registrarPoliza();
            }
          });
        } else {
          console.log(chalk.red('Tipo de seguro no válido.'));
          mostrarMenu();
        }
      });
    } else {
      console.log(chalk.red('Cliente no encontrado o no está activo.'));
      mostrarMenu();
    }
  });
}

// Función para buscar un cliente por DNI
function buscarCliente() {
  rl.question('DNI del cliente: ', (dni) => {
    const clientes = leerClientes();
    const cliente = clientes.find(c => c.dni === dni);
    if (cliente) {
      console.log(chalk.green('Cliente encontrado:'));
      console.log(cliente);
    } else {
      console.log(chalk.red('Cliente no encontrado.'));
    }
    mostrarMenu();
  });
}

// Función para actualizar un cliente
function actualizarCliente() {
    const clientes = leerClientes();
    rl.question('DNI del cliente a actualizar: ', (dni) => {
      const cliente = clientes.find(c => c.dni === dni);
      if (cliente) {
        rl.question(`Nombre (anterior: ${cliente.nombre}): `, (nombre) => {
          rl.question(`Apellido (anterior: ${cliente.apellido}): `, (apellido) => {
            rl.question(`Teléfono (anterior: ${cliente.telefono}): `, (telefono) => {
              rl.question(`Email (anterior: ${cliente.email}): `, (email) => {
                rl.question(`Status (anterior: ${cliente.status}, activo/inactivo): `, (status) => {
                  const nuevoNombre = nombre || cliente.nombre;
                  const nuevoApellido = apellido || cliente.apellido;
                  const nuevoTelefono = telefono || cliente.telefono;
                  const nuevoEmail = email || cliente.email;
                  let nuevoStatus = cliente.status;
  
                  if (status.toLowerCase() === 'activo' || status.toLowerCase() === 'inactivo') {
                    nuevoStatus = status.toLowerCase();
                  } else if (status.trim() !== '') {
                    console.log(chalk.red('Estado no válido. Se mantendrá el estado actual.'));
                  }
  
                  const cambios = [
                    nuevoNombre !== cliente.nombre ? `Nombre: ${cliente.nombre} -> ${nuevoNombre}` : null,
                    nuevoApellido !== cliente.apellido ? `Apellido: ${cliente.apellido} -> ${nuevoApellido}` : null,
                    nuevoTelefono !== cliente.telefono ? `Teléfono: ${cliente.telefono} -> ${nuevoTelefono}` : null,
                    nuevoEmail !== cliente.email ? `Email: ${cliente.email} -> ${nuevoEmail}` : null,
                    nuevoStatus !== cliente.status ? `Status: ${cliente.status} -> ${nuevoStatus}` : null
                  ].filter(Boolean);
  
                  if (cambios.length > 0) {
                    console.log(chalk.yellow('Cambios a realizar:'));
                    cambios.forEach(cambio => console.log(`- ${cambio}`));
  
                    rl.question('¿Está seguro de que desea actualizar este cliente? (si/no): ', (confirmacion) => {
                      if (confirmacion.toLowerCase() === 'si') {
                        cliente.nombre = nuevoNombre;
                        cliente.apellido = nuevoApellido;
                        cliente.telefono = nuevoTelefono;
                        cliente.email = nuevoEmail;
                        cliente.status = nuevoStatus;
                        guardarClientes(clientes);
                        console.log(chalk.green('Cliente actualizado con éxito.'));
                      } else {
                        console.log(chalk.yellow('Actualización cancelada.'));
                      }
                      mostrarMenu();
                    });
                  } else {
                    console.log(chalk.yellow('No se realizaron cambios.'));
                    mostrarMenu();
                  }
                });
              });
            });
          });
        });
      } else {
        console.log(chalk.red('Cliente no encontrado.'));
        mostrarMenu();
      }
    });
  }

// Función para eliminar un cliente
function eliminarCliente() {
  const clientes = leerClientes();
  rl.question('DNI del cliente a eliminar: ', (dni) => {
    const cliente = clientes.find(c => c.dni === dni);
    if (cliente) {
      rl.question('¿Está seguro de que desea eliminar este cliente? (si/no): ', (confirmacion) => {
        if (confirmacion.toLowerCase() === 'si') {
          const nuevosClientes = clientes.filter(c => c.dni !== dni);
          guardarClientes(nuevosClientes);
          console.log(chalk.green('Cliente eliminado con éxito.'));
        } else {
          console.log(chalk.yellow('Eliminación cancelada.'));
        }
        mostrarMenu();
      });
    } else {
      console.log(chalk.red('Cliente no encontrado.'));
      mostrarMenu();
    }
  });
}

// Función para actualizar el estado de una póliza
function actualizarEstadoPoliza() {
  const clientes = leerClientes();
  rl.question('DNI del cliente: ', (dni) => {
    const cliente = clientes.find(c => c.dni === dni && c.status === 'activo');
    if (cliente && cliente.polizas.length > 0) {
      console.log(chalk.blue('Pólizas del cliente:'));
      cliente.polizas.forEach((p, index) => {
        console.log(`${index + 1}. Número de Póliza: ${p.numeroPoliza}, Tipo de Seguro: ${p.tipoSeguro}, Estado: ${p.status}`);
      });

      rl.question('Número de índice de la póliza a actualizar: ', (indice) => {
        const i = parseInt(indice) - 1;
        if (i >= 0 && i < cliente.polizas.length) {
          const poliza = cliente.polizas[i];
          const nuevoEstado = poliza.status === 'activo' ? 'inactivo' : 'activo';
          
          rl.question(`¿Está seguro de que desea cambiar el estado de la póliza a ${nuevoEstado}? (si/no): `, (confirmacion) => {
            if (confirmacion.toLowerCase() === 'si') {
              poliza.status = nuevoEstado;
              guardarClientes(clientes);
              console.log(chalk.green(`Estado de la póliza actualizado a ${nuevoEstado} con éxito.`));
            } else {
              console.log(chalk.yellow('Actualización cancelada.'));
            }
            mostrarMenu();
          });
        } else {
          console.log(chalk.red('Índice de póliza no válido.'));
          mostrarMenu();
        }
      });
    } else {
      console.log(chalk.red('Cliente no encontrado, no está activo o no tiene pólizas.'));
      mostrarMenu();
    }
  });
}

// Función para mostrar mensaje de bienvenida
function mostrarMensajeBienvenida() {
  console.log(chalk.blue('---------------------------------------------'));
  console.log(chalk.blue('  Bienvenido al Sistema de Registro de Clientes'));
  console.log(chalk.blue('---------------------------------------------'));
}

// Iniciar el programa mostrando el mensaje de bienvenida y el menú principal
mostrarMensajeBienvenida();
mostrarMenu();