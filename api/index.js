const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/../.env' });
const Task = require('./models/Task');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

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

const client = new tasksProto.TaskAnalysisService('localhost:50051', grpc.credentials.createInsecure());

const app = express();
app.use(express.json());

// Endpoint para crear una tarea
app.post('/tasks', async (req, res) => {
  try {
    const task = new Task(req.body);
    await task.save();
    res.status(201).send(task);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Endpoint para listar todas las tareas
app.get('/tasks', async (req, res) => {
  try {
    const tasks = await Task.find({});
    res.status(200).send(tasks);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Endpoint REST para obtener estadísticas
app.get('/tasks/stats', (req, res) => {
  client.GetTaskStats({}, (error, response) => {
    if (error) {
      console.error("Error en la llamada gRPC:", error);
      return res.status(500).send(error);
    }
    
    
    console.log("Respuesta de gRPC:", response);
    res.status(200).send(response);
  });
});



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor REST corriendo en el puerto ${PORT}`);
});

// Conexión a MongoDB
mongoose.connect(process.env.URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log("Conectado a MongoDB Atlas");
}).catch((error) => {
  console.error("Error al conectar a MongoDB Atlas:", error);
});
