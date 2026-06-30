# 🚀 ElectroSoft Backend

Backend del sistema **ElectroSoft**, desarrollado con **Node.js**, **Express** y **MongoDB Atlas**.

Este proyecto expone una API REST encargada de gestionar toda la lógica de negocio del sistema ElectroSoft, permitiendo administrar usuarios, autenticación, roles, productos, compras, ventas y demás módulos del sistema.

La aplicación implementa autenticación mediante **JSON Web Token (JWT)**, almacenamiento de información en **MongoDB Atlas** y un proceso de inicialización automática que crea los datos esenciales para comenzar a utilizar el sistema desde la primera ejecución.

---

# ✨ Características

* 🔐 Autenticación mediante JWT.
* 👥 Gestión de usuarios.
* 🛡️ Gestión de roles y permisos.
* 🏷️ Gestión de categorías.
* 📦 Gestión de productos.
* 🏢 Gestión de proveedores.
* 🛒 Gestión de compras.
* 👤 Gestión de clientes.
* 📑 Gestión de pedidos.
* 💰 Gestión de ventas.
* 💳 Gestión de pagos y abonos.
* 🔄 Gestión de devoluciones.

---

# 🛠️ Tecnologías utilizadas

| Tecnología    | Descripción                                    |
| ------------- | ---------------------------------------------- |
| Node.js       | Entorno de ejecución del servidor.             |
| Express.js    | Framework para la construcción de la API REST. |
| MongoDB Atlas | Base de datos NoSQL en la nube.                |
| Mongoose      | ODM para la comunicación con MongoDB.          |
| JWT           | Autenticación mediante tokens.                 |
| bcrypt        | Encriptación de contraseñas.                   |
| dotenv        | Gestión de variables de entorno.               |

---

# 📂 Arquitectura del proyecto

El proyecto se encuentra organizado siguiendo una arquitectura modular, separando la lógica de negocio, infraestructura, interfaces y modelos de datos para facilitar el mantenimiento y la escalabilidad del sistema.

Cada módulo contiene sus propias responsabilidades, permitiendo que nuevas funcionalidades puedan añadirse sin afectar el resto de la aplicación.

---

# 📋 Requisitos previos

Antes de ejecutar el proyecto, asegúrese de cumplir con los siguientes requisitos:

* Tener instalado **Node.js** (versión 18 o superior recomendada).
* Tener instalado **npm** (se instala automáticamente junto con Node.js).
* Tener instalado **Git**.
* Disponer de una cuenta en **MongoDB Atlas** para crear la base de datos.

Si aún no tiene instalado Node.js, puede descargarlo desde el sitio oficial:

https://nodejs.org/

Una vez instalado Node.js, abra una terminal (Símbolo del sistema, PowerShell, Windows Terminal o la terminal integrada de Visual Studio Code) y ejecute los siguientes comandos para verificar la instalación:

```bash
node -v
npm -v
```

Si ambos comandos muestran una versión, significa que la instalación fue realizada correctamente y puede continuar con la configuración del proyecto.

---

# 🍃 Configuración de MongoDB Atlas

ElectroSoft utiliza **MongoDB Atlas** como sistema de almacenamiento de datos. Antes de ejecutar el servidor, es necesario crear una base de datos y obtener la cadena de conexión.

## 1. Crear una cuenta

Si aún no dispone de una cuenta, regístrese gratuitamente en:

https://www.mongodb.com/cloud/atlas

## 2. Crear un Cluster

Una vez iniciada la sesión:

1. Cree un nuevo **Cluster**.
2. Puede utilizar el plan gratuito (**M0 Free**) para ejecutar el proyecto sin inconvenientes.

## 3. Crear un usuario para la base de datos

Desde el apartado **Database Access**:

* Cree un nuevo usuario.
* Defina un nombre de usuario y una contraseña.
* Conserve estas credenciales, ya que serán necesarias para la conexión.

## 4. Autorizar la dirección IP

En el apartado **Network Access**:

* Agregue una nueva dirección IP.
* Para fines de desarrollo puede seleccionar:

```
Allow Access From Anywhere
```

## 5. Obtener la cadena de conexión

Seleccione **Connect** → **Drivers** y copie la cadena de conexión proporcionada por MongoDB Atlas.

Tendrá un formato similar al siguiente:

```text
mongodb+srv://usuario:contraseña@cluster.mongodb.net/electrosoft?retryWrites=true&w=majority
```

Reemplace:

* `usuario` por el nombre del usuario creado.
* `contraseña` por la contraseña correspondiente.

Esta cadena será utilizada más adelante para configurar la variable `MONGODB_URI`.

---

# 📥 Clonar el repositorio

Una vez tenga configurado el entorno de desarrollo, clone el repositorio del backend ejecutando el siguiente comando:

```bash
git clone https://github.com/Juan17-santa/ElectroSoft-Backend.git
```

A continuación, ingrese a la carpeta del proyecto:

```bash
cd ElectroSoft-Backend
```

Con esto tendrá una copia local del proyecto y podrá continuar con la instalación.

---

# ⚙️ Configuración de variables de entorno

Antes de ejecutar el servidor, es necesario crear un archivo llamado **`.env`** en la raíz del proyecto.

La estructura del archivo debe ser la siguiente:

```env
PORT=4000

MONGODB_URI=mongodb+srv://usuario:contraseña@cluster.mongodb.net/electrosoft

JWT_SECRET=123456789abcdeft

JWT_EXPIRES_IN=2h
```

## Descripción de cada variable

| Variable         | Descripción                                          |
| ---------------- | ---------------------------------------------------- |
| `PORT`           | Puerto donde se ejecutará el servidor.               |
| `MONGODB_URI`    | Cadena de conexión de MongoDB Atlas.                 |
| `JWT_SECRET`     | Clave utilizada para firmar los tokens JWT.          |
| `JWT_EXPIRES_IN` | Tiempo de expiración de los tokens de autenticación. |

> **Importante:** Reemplace el valor de `MONGODB_URI` por la cadena de conexión obtenida previamente desde MongoDB Atlas.

---

# 📦 Instalación de dependencias

Una vez clonado el repositorio y configuradas las variables de entorno, instale todas las dependencias del proyecto ejecutando:

```bash
npm install
```

Este comando descargará automáticamente todas las librerías necesarias definidas en el archivo `package.json`.

Espere a que finalice la instalación antes de continuar con el siguiente paso.

---

# 🚀 Ejecutar el servidor

Con las dependencias instaladas y el archivo `.env` correctamente configurado, inicie el servidor utilizando uno de los siguientes comandos.

### Modo desarrollo

```bash
npm run dev
```

Este modo reinicia automáticamente el servidor cuando detecta cambios en el código fuente.

### Modo producción

```bash
npm start
```

Si todo fue configurado correctamente, el servidor iniciará sin errores y quedará disponible en:

```text
http://localhost:4000
```

En la consola también podrá visualizar los mensajes de conexión a MongoDB y el estado del servidor.

---

# 🌱 Inicialización automática

Durante la primera ejecución del servidor, ElectroSoft verifica automáticamente si existen los datos mínimos necesarios para el funcionamiento del sistema.

Si la base de datos está vacía, el proyecto crea automáticamente:

* 📄 Tipos de documento.
* 🛡️ Roles del sistema.
* 👤 Usuario administrador.

Este proceso se ejecuta únicamente cuando la información no existe previamente, evitando la duplicación de datos en futuras ejecuciones del servidor.

Gracias a esta inicialización automática, no es necesario ejecutar scripts adicionales para comenzar a utilizar la aplicación.

---

# 👤 Usuario administrador

Una vez finalizada la inicialización automática, el sistema crea un usuario administrador con las siguientes credenciales:

| Campo                  | Valor                                                     |
| ---------------------- | --------------------------------------------------------- |
| **Nombre**             | Administrador del Sistema                                 |
| **Correo electrónico** | [administrador@gmail.com](mailto:administrador@gmail.com) |
| **Contraseña**         | 123456                                                    |

> **Importante:** Este usuario solo se crea si no existe previamente en la base de datos.

Se recomienda cambiar la contraseña después del primer inicio de sesión si el proyecto va a utilizarse en un entorno diferente al de desarrollo.

---

# 📜 Scripts disponibles

El proyecto dispone de los siguientes scripts para facilitar su ejecución:

| Comando       | Descripción                                      |
| ------------- | ------------------------------------------------ |
| `npm install` | Instala todas las dependencias del proyecto.     |
| `npm run dev` | Inicia el servidor en modo desarrollo.           |
| `npm start`   | Inicia el servidor en modo producción.           |
| `npm test`    | Ejecuta las pruebas configuradas en el proyecto. |

---

# ❓ Solución de problemas

Si presenta inconvenientes al ejecutar el proyecto, verifique los siguientes aspectos:

* Que **Node.js** y **npm** estén correctamente instalados.
* Que la cadena de conexión `MONGODB_URI` sea válida.
* Que el archivo `.env` se encuentre en la raíz del proyecto.
* Que todas las dependencias hayan sido instaladas mediante `npm install`.
* Que el puerto configurado en `PORT` no esté siendo utilizado por otra aplicación.
* Que MongoDB Atlas permita conexiones desde su dirección IP.

Si el problema persiste, revise los mensajes mostrados en la consola, ya que normalmente indican la causa del error.

---

# 🖥️ Repositorio del Frontend

Este proyecto corresponde únicamente al **Backend** de ElectroSoft.

Para utilizar la interfaz gráfica del sistema, también deberá descargar el repositorio del Frontend:

```text
https://github.com/Juan17-santa/ElectroSoft
```

Una vez el backend esté en funcionamiento, siga las instrucciones del README del frontend para completar la instalación.
