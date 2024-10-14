const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

// Ruta del archivo proto
const PROTO_PATH = __dirname + '/proto/task.proto';

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});

// Cargar paquete de tareas desde el archivo proto
const tasksProto = grpc.loadPackageDefinition(packageDefinition).tasks;

// Crear el cliente gRPC para conectarse al servidor
const client = new tasksProto.TaskAnalysisService(
  'localhost:50051',
  grpc.credentials.createInsecure()
);

// Obtener estadísticas de tareas
client.GetTaskStats({}, (error, response) => {
  if (error) {
    console.error("Error al obtener estadísticas de tareas:", error);
  } else {
    console.log("Total de tareas:", response.total_tasks);
    console.log("Niveles y conteo de tareas:", response.levels);
  }
});

// Buscar tareas por nivel
const levelToSearch = '1';  // Nivel a buscar
client.GetTasksByLevel({ level: levelToSearch }, (error, response) => {
  if (error) {
    console.error("Error al obtener tareas por nivel:", error);
  } else {
    console.log("Tareas recibidas para el nivel", levelToSearch, ":", response.tasks);
  }
});

