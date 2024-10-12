const grpc = require('@grpc/grpc-js');  // Solo necesita estar una vez
const protoLoader = require('@grpc/proto-loader');
require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const fs = require('fs');

// Verifica si el archivo .env existe y puede ser leído
if (fs.existsSync('.env')) {
    console.log('.env file exists and is readable.');
} else {
    console.log('.env file does not exist or is not readable.');
}

// Ruta del archivo proto
const PROTO_PATH = __dirname + '/../proto/task.proto';

// Carga del archivo proto
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});
const tasksProto = grpc.loadPackageDefinition(packageDefinition).tasks;

// Conexión a MongoDB
mongoose.connect(process.env.URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const Task = require('../api/models/Task');

// Función para obtener estadísticas de tareas
async function getTaskStats(call, callback) {
  try {
    const totalCount = await Task.countDocuments({});
    const levelCounts = await Task.aggregate([
      {
        $group: {
          _id: "$description",
          count: { $sum: 1 }
        }
      }
    ]);

    // Formatear la respuesta
    const stats = {
      total_tasks: totalCount,
      levels: levelCounts.map(level => ({
        level: level._id,
        count: level.count
      }))
    };

    callback(null, stats);
  } catch (err) {
    console.error("Error al obtener estadísticas:", err);
    callback(err);
  }
}

async function getTasksByLevel(call, callback) {
  try {
    const level = call.request.level;  // Extrae el nivel de la solicitud

    // Imprime el valor recibido para depuración
    console.log("Nivel recibido en la solicitud:", level);

    if (!level) {
      throw new Error("El nivel está vacío o no se proporcionó.");
    }

    // Encuentra todas las tareas que coincidan con el nivel proporcionado
    const tasks = await Task.find({ description: level });

    // Mapea las tareas para devolverlas en el formato correcto
    const tasksList = tasks.map(task => ({
      id: task._id.toString(),
      description: task.description,
      status: task.status  // Agrega otros campos si es necesario
    }));

    console.log(`Tareas del nivel ${level} enviadas:`, tasksList);

    // Envía la respuesta con las tareas encontradas
    callback(null, { tasks: tasksList });
  } catch (err) {
    console.error("Error al obtener tareas por nivel:", err);
    callback(err);
  }
}


// Crear servidor gRPC y añadir servicios
const server = new grpc.Server();
server.addService(tasksProto.TaskAnalysisService.service, {
  GetTaskStats: getTaskStats,
  GetTasksByLevel: getTasksByLevel  // Añadir la nueva función aquí
});

console.log("URI de mongoose: " + process.env.URI);

const PORT = process.env.GRPC_PORT || 50051;
server.bindAsync(`localhost:${PORT}`, grpc.ServerCredentials.createInsecure(), () => {
  console.log(`Servidor gRPC corriendo en el puerto ${PORT}`);
  server.start();
});
