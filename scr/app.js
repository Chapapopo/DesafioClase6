const express = require("express");
const http = require('http');
const { Server } = require('socket.io');
const handlebars = require('express-handlebars');
const path = require('path');
const bodyParser = require('body-parser');
const GestionProductos = require("./GestionProductos.js");
const { Socket } = require("socket.io-client");

const port = 8080;
const app = express();

const httpServer = app.listen(port, () => { console.log(`Servidor Express iniciado en http://localhost:${port}`); });

const io = new Server(httpServer);

app.use(express.json())
const gestion = new GestionProductos('./scr/productos.json', './scr/carrito.json');

//configuraciones handlebars

app.engine("handlebars", handlebars.engine())
app.set('views', path.join(`${__dirname}/views`));
app.set("view engine", "handlebars");

//uso de handlebars

app.get('/home', (req, res) => {
    const ArrayProductos = gestion.mostrarProductos();
    res.render('home', { productos: ArrayProductos });
});

//configuraciones socket

app.get("/realtimeproducts", (req, res) => {
const ArrayProductos = gestion.mostrarProductos();
    res.render('index', { productos: ArrayProductos })
})

io.on("connection", (socket) => {
    console.log("Nuevo cliente conectado", socket.id);

    // Ruta para agregar un nuevo producto (POST)
    app.post("/productos", (req, res) => {
        const datosProducto = req.body; // Obtener datos del cuerpo de la solicitud

        // Llamar al método de la clase GestionProductos para agregar el producto
        gestion.añadirProducto(datosProducto);
        
        const ArrayProductos = gestion.mostrarProductos();
        socket.emit("listaActualizada", { productos: ArrayProductos })

        res.json({ message: "Producto agregado con éxito", producto: datosProducto });
    });
    

    // Ruta para borrar un producto por ID
    app.delete("/productos/:id", (req, res) => {
        const productoId = parseInt(req.params.id);
    
        gestion.borrarProducto(productoId);

        const ArrayProductos = gestion.mostrarProductos();
        socket.emit("listaActualizada", { productos: ArrayProductos })
    
        res.json({ message: "Producto eliminado exitosamente" });
    });
})







