# Trabajo Practico N°3
## Documentacion: [Notion](https://www.notion.so/Trabajo-Practico-N-3-11a8fc3958a7804a8c0cdb54dbb2150f)

### Instrucciones:

Crear archivo .env:
```
URL=mongodb+srv://Tunma:mora1234@prog3back.m6fw8nx.mongodb.net/
PORT=3000
```
Instalar dependencias:

`npm install`

### Ejecutar: 
`npm run server`

`npm run analisis`

### Endpoints:

POST: /tasks
```
{
  "title": "Tarea de Baja Prioridad 3",
  "description": "No muy importante",
  "level": "3"
}
```

GET: /tasks
`Consigue las tareas`

GET: /tasks/stats
`Consigue la cantidad total de tareas y por nivel`

GET: /tasks/level/:level
`Reemplazar :level por el deseado, consigue todas las tareas de ese nivel `

### gRPC:
El servicio reflection le permite obtener automaticamente el archivo proto

#### GetTasksStats
Response:
```
{
    "levels": [
        {
            "level": "",
            "count": 
        }
    ],
    "total_tasks":
}
```

#### GetTasksByLevel
Request:
```
{
    "level": ""
}
```
Response:
```
{
    "tasks": [
        {
            "id": "",
            "title": "",
            "description": "",
            "level": ""
        }
    ]
}
```
