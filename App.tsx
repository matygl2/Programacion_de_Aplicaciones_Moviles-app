import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// -----------------------------------------------------------------------------
// Tipos y configuracion
// -----------------------------------------------------------------------------

// Este tipo representa exactamente el objeto que devuelve la API.
interface Person {
  id: number;
  firstName: string;
  lastName: string;
  edad: number;
  arrivalDate: string | null;
  isWorking: boolean;
}

// En Web usamos localhost. En un celular fisico se debe reemplazar por la IP
// local de la PC, por ejemplo: http://192.168.1.25:3000.
const API_URL = 'http://localhost:3000';

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function App() {
  // people es la lista que FlatList va a dibujar en pantalla.
  const [people, setPeople] = useState<Person[]>([]);

  // Estos estados representan los valores de los inputs del formulario.
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [arrivalDate, setArrivalDate] = useState(today());
  const [isWorking, setIsWorking] = useState(false);
  const [age, setAge]= useState('');
  // Guarda la persona pendiente de confirmar, o null si el modal está cerrado.
  const [personaAEliminar, setPersonaAEliminar] = useState<Person | null>(null);
  
  // ---------------------------------------------------------------------------
  // Comunicacion con la API
  // ---------------------------------------------------------------------------

  // GET: pide la lista al backend y la guarda en el estado people.
  async function loadPeople() {
    const response = await fetch(`${API_URL}/api/personas`);

    if (!response.ok) {
      throw new Error('No se pudo cargar la lista');
    }

    setPeople(await response.json());
  }

  // Al abrir la pantalla hacemos el primer GET.
  useEffect(() => {
    loadPeople().catch(() => Alert.alert('Error', 'No se pudo conectar con el backend'));
  }, []);

  // POST: envia el formulario, limpia los inputs y vuelve a pedir la lista.
  async function addPerson() {
    if (!firstName.trim() || !lastName.trim() || !arrivalDate.trim() || !age.trim()) {
      Alert.alert('Faltan datos', 'Completa nombre, apellido, edad y fecha');
      return;
    }

    const response = await fetch(`${API_URL}/api/personas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        edad: age.trim(),
        arrivalDate,
        isWorking,
      }),
    });

    if (!response.ok) {
      Alert.alert('Error', 'No se pudo guardar la persona');
      return;
    }

    // Dejamos el formulario listo para cargar otro registro.
    setFirstName('');
    setLastName('');
    setArrivalDate(today());
    setIsWorking(false);
    setAge('');
    // Refrescamos FlatList para mostrar el nuevo registro.
    await loadPeople();
  }

  // PATCH: cambia solamente isWorking, sin reemplazar toda la persona.
  async function toggleWorking(person: Person) {
    const response = await fetch(`${API_URL}/api/personas/${person.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isWorking: !person.isWorking }),
    });

    if (!response.ok) {
      Alert.alert('Error', 'No se pudo actualizar el estado de trabajo');
      return;
    }

    // El backend responde con el registro actualizado; volvemos a cargar todo
    // para mantener la pantalla sincronizada con la base de datos.
    await loadPeople();
  }

  // Solo deja pasar dígitos, descarta cualquier letra o símbolo.
  function manejarCambioEdad(texto: string) {
    const soloNumeros = texto.replace(/[^0-9]/g, '');
    setAge(soloNumeros);
  }

  // Abre el modal guardando qué persona se quiere borrar.
  function pedirConfirmacionEliminar(person: Person) {
    setPersonaAEliminar(person);
  }

  // Cierra el modal sin borrar nada.
  function cancelarEliminar() {
    setPersonaAEliminar(null);
  }

  // DELETE real: se ejecuta solo cuando el usuario confirma en el modal.
  async function confirmarEliminar() {
    if (!personaAEliminar) return;

    const response = await fetch(`${API_URL}/api/personas/${personaAEliminar.id}`, {
      method: 'DELETE',
    });

    setPersonaAEliminar(null); // cerramos el modal en cualquier caso

    if (!response.ok) {
      Alert.alert('Error', 'No se pudo eliminar el registro');
      return;
    }

    await loadPeople();
  }
  // -----------------------------------------------------------------------------
  // Interfaz: formulario + listado
  // -----------------------------------------------------------------------------

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <Text style={styles.logo}>
        {'+--------------------------+\n'}
        {'|      DWARF FORTRESS     |\n'}
        {'|       ASCII LEDGER       |\n'}
        {'+--------------------------+'}
      </Text>

      <Text style={styles.heading}>[ REGISTRO DE LA FORTALEZA ]</Text>
      <Text style={styles.subtitle}>Llegadas, labores y destinos de los enanos</Text>

      {/* Formulario: cada input modifica un estado local. */}
      <TextInput
        style={styles.input}
        placeholder="Nombre del enano"
        placeholderTextColor="#8b806d"
        value={firstName}
        onChangeText={setFirstName}
      />
      <TextInput
        style={styles.input}
        placeholder="Apellido del enano"
        placeholderTextColor="#8b806d"
        value={lastName}
        onChangeText={setLastName}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Edad del enano"
        placeholderTextColor="#8b806d"
        value={age}
        onChangeText={manejarCambioEdad}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Fecha de llegada [AAAA-MM-DD]"
        placeholderTextColor="#8b806d"
        value={arrivalDate}
        onChangeText={setArrivalDate}
      />

      <View style={styles.switchRow}>
        <Text style={styles.label}>[ESTA EN LABORES?]</Text>
        <Switch value={isWorking} onValueChange={setIsWorking} />
      </View>

      <TouchableOpacity style={styles.actionButton} onPress={addPerson}>
        <Text style={styles.actionText}>[ TALLAR NUEVO REGISTRO ]</Text>
      </TouchableOpacity>

      {/* FlatList recorre people y crea una tarjeta por cada persona. */}
      <FlatList
        style={styles.list}
        data={people}
        keyExtractor={(person) => String(person.id)}
        ListEmptyComponent={<Text style={styles.empty}>La fortaleza no tiene registros.</Text>}
        renderItem={({ item }) => (
          <View style={styles.personCard}>
            <Text style={styles.personName}>+ {item.firstName} {item.lastName}</Text>
            <Text style={styles.personInfo}>
              | Llegada: {item.arrivalDate?.slice(0, 10) ?? 'sin fecha'}
            </Text>
            <Text style={styles.personInfo}>
              | Edad: {item.edad ?? 'sin dato'}
            </Text>
            <Text style={styles.personInfo}>
              | Oficio: {item.isWorking ? 'EN LABORES' : 'SIN LABOR'}
            </Text>

            {/* Este boton dispara el PATCH de la persona seleccionada. */}
            <TouchableOpacity style={styles.smallButton} onPress={() => toggleWorking(item)}>
              <Text style={styles.smallButtonText}>
                {item.isWorking ? '[ RETIRAR DE LABORES ]' : '[ ASIGNAR A LABORES ]'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.smallButton, styles.deleteButton]}
              onPress={() => pedirConfirmacionEliminar(item)}
            >
              <Text style={styles.smallButtonText}>[ ELIMINAR ENANO ]</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <Modal
        visible={personaAEliminar !== null}
        animationType="fade"
        transparent
        onRequestClose={cancelarEliminar}
      >
        <View style={styles.fondoModal}>
          <View style={styles.contenidoModal}>
            <Text style={styles.tituloModal}>[ CONFIRMAR ELIMINACION ]</Text>

            <Text style={styles.textoModal}>
              ¿Seguro que querés eliminar a{' '}
              {personaAEliminar?.firstName} {personaAEliminar?.lastName}?
              Esta acción no se puede deshacer.
            </Text>

            <View style={styles.filaBotonesModal}>
              <TouchableOpacity
                style={[styles.smallButton, styles.botonCancelarModal]}
                onPress={cancelarEliminar}
              >
                <Text style={styles.smallButtonText}>[ CANCELAR ]</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.smallButton, styles.deleteButton]}
                onPress={confirmarEliminar}
              >
                <Text style={styles.smallButtonText}>[ SI, ELIMINAR ]</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// -----------------------------------------------------------------------------
// Estilos visuales de la fortaleza
// -----------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 45, backgroundColor: '#151515' },
  logo: { marginBottom: 18, color: '#d1b274', fontFamily: 'monospace', fontSize: 15, lineHeight: 18, textAlign: 'center' },
  heading: { fontFamily: 'monospace', fontSize: 18, fontWeight: 'bold', color: '#e0c58b' },
  subtitle: { marginBottom: 20, color: '#a99b82', fontFamily: 'monospace' },
  input: { marginBottom: 10, padding: 12, borderWidth: 1, borderColor: '#62563f', borderRadius: 0, backgroundColor: '#242424', color: '#eee1c2', fontFamily: 'monospace' },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, paddingVertical: 4 },
  label: { color: '#c9b27c', fontFamily: 'monospace' },
  actionButton: { padding: 13, borderWidth: 1, borderColor: '#d1b274', backgroundColor: '#4c3b22' },
  actionText: { color: '#f6e8bf', textAlign: 'center', fontFamily: 'monospace', fontWeight: 'bold' },
  list: { marginTop: 20 },
  empty: { color: '#a99b82', fontFamily: 'monospace' },
  personCard: { marginBottom: 12, padding: 15, borderWidth: 1, borderColor: '#62563f', backgroundColor: '#202020' },
  personName: { fontSize: 19, fontWeight: 'bold', color: '#e0c58b', fontFamily: 'monospace' },
  personInfo: { marginTop: 5, color: '#bdb19a', fontFamily: 'monospace' },
  smallButton: { marginTop: 10, padding: 9, borderWidth: 1, borderColor: '#725b35', backgroundColor: '#302719' },
  deleteButton: { borderColor: '#8b2e2e', backgroundColor: '#3a1a1a', flex: 1 },
  fondoModal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  contenidoModal: {
    width: '100%',
    padding: 20,
    borderWidth: 1,
    borderColor: '#62563f',
    backgroundColor: '#202020',
  },
  tituloModal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e0c58b',
    fontFamily: 'monospace',
    marginBottom: 12,
  },
  textoModal: {
    color: '#bdb19a',
    fontFamily: 'monospace',
    marginBottom: 18,
    lineHeight: 20,
  },
  filaBotonesModal: {
    flexDirection: 'row',
    gap: 10,
  },
  botonCancelarModal: {
    flex: 1,
    borderColor: '#62563f',
    backgroundColor: '#302719',
  },
  smallButtonText: { color: '#d1b274', textAlign: 'center', fontFamily: 'monospace', fontSize: 12 },
});
