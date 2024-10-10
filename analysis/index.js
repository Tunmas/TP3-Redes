const grpc = require('@grpc/grpc-js');
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

const PROTO_PATH = __dirname + '/../proto/task.proto'; // Ajusta esta línea


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
  
      // Formatea la respuesta
      const stats = {
        total_tasks: totalCount,
        levels: {}
      };
  
      levelCounts.forEach(level => {
        console.log(`Nivel: ${level._id}, Conteo: ${level.count}`); // Para depuración
        stats.levels[level._id] = level.count;
      });
  
      console.log("Estadísticas enviadas:", stats);
  
      
      callback(null, stats);
    } catch (err) {
      console.error("Error al obtener estadísticas:", err);
      callback(err);
    }
  }
  
  

const server = new grpc.Server();
server.addService(tasksProto.TaskAnalysisService.service, { GetTaskStats: getTaskStats });

console.log("URI de mongoose: " + process.env.URI);

const PORT = process.env.GRPC_PORT || 50051;
server.bindAsync(`localhost:${PORT}`, grpc.ServerCredentials.createInsecure(), () => {
  console.log(`Servidor gRPC corriendo en el puerto ${PORT}`);
  server.start();
});
