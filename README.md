# Dwarf Fortress — App

App móvil hecha con Expo y React Native. Consulta y gestiona el registro de personas de la fortaleza (nombre, apellido, edad, fecha de llegada y estado laboral), conectada a la API del [repositorio de backend](https://github.com/matygl2/Programacion_de_Aplicaciones_Moviles-backend).

## Versiones verificadas

| Herramienta      | Versión  |
|-------------------|----------|
| Node.js           | 20.20.2  |
| npm                | 10.9.2   |
| Expo               | 57.0.23  |
| React Native       | 0.86.3   |

## Instalación

```bash
npm install
```

Si es la primera vez que se corre este proyecto en un entorno nuevo, además puede ser necesario:

```bash
npx expo install react-dom react-native-web @expo/metro-runtime
npx expo-doctor
```

`expo-doctor` revisa que las dependencias y la configuración sean compatibles con el SDK de Expo instalado.

## Configuración de la URL del backend

La URL del backend está definida directamente en el código, al principio de `App.tsx`:

```ts
const API_URL = 'http://localhost:3000';
```

- **Web**: `localhost` funciona sin cambios, siempre que el backend esté corriendo en la misma máquina.
- **Celular físico (Expo Go)**: editar esa línea y reemplazar `localhost` por la IP local de la computadora en la red Wi-Fi, por ejemplo `http://192.168.1.25:3000`. Esto es necesario porque, desde el punto de vista del celular, `localhost` apunta al propio celular, no a la PC. La PC y el celular deben estar en la misma red, y el firewall debe permitir conexiones al puerto usado por el backend (por defecto 3000).

**El backend tiene que estar corriendo antes de abrir la app** (ver instrucciones en su propio repositorio).

## Correr la app

```bash
npx expo start
```

Desde la terminal de Expo, presionar `w` para abrir la versión web, o escanear el código QR con la app Expo Go para abrirla en el celular. También se puede abrir directo en Web con:

```bash
npx expo start --web
```

## Resultado esperado

- La pantalla muestra las personas ya cargadas en la base (o los datos de ejemplo, si es la primera vez).
- El formulario permite cargar nombre, apellido, edad y fecha de llegada.
- Cada tarjeta tiene un botón para cambiar el estado laboral y otro para eliminar el registro (con confirmación mediante un modal antes de borrar).

## Errores habituales

- **La Web no aparece en Expo**: instalar `react-dom`, `react-native-web` y `@expo/metro-runtime`, correr `npx expo-doctor` y abrir con `npx expo start --web`.
- **Network request failed**: comprobar que el backend esté corriendo. En celular, confirmar que `EXPO_PUBLIC_API_URL` use la IP local de la PC (no `localhost`) y que backend y celular estén en la misma red Wi-Fi.
- **Cannot find module o errores de tipos**: correr `npm install` dentro de esta carpeta (la app tiene su propio `package.json`, separado del backend).
