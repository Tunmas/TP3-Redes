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
  'localhost:50051', // Ajusta el puerto si es necesario
  grpc.credentials.createInsecure()
);

const levelToSearch = '1';  // Este es el nivel que deseas buscar
console.log(levelToSearch);

client.GetTasksByLevel({ level: levelToSearch }, (error, response) => {
  if (error) {
    console.error("Error al obtener tareas por nivel:", error);
  } else {
    console.log("Tareas recibidas para el nivel", levelToSearch, ":", response.tasks);
  }
});

