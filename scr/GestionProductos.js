const fs = require('fs');

class GestionProductos {
    constructor(path, path1) {
        this.path = path;
        this.path1 = path1;
        this.productos = this.obtenerProductosDesdeArchivo();
        this.carrito = this.obtenerCarritoDesdeArchivo();
        this.ultimoId = this.productos.length > 0 ? Math.max(...this.productos.map(p => p.id)) : 0;
        console.log(this.ultimoId)
    }

    // Método para obtener los productos del archivo productos.json
    obtenerProductosDesdeArchivo() {
        try {
            const data = fs.readFileSync(this.path, 'utf8');
            const productos = JSON.parse(data).productos;
            return productos;
        } catch (error) {
            console.error(`Error al leer el archivo productos.json: ${error.message}`);
            return [];
        }
    }

    // Método para obtener los datos del carrito del archivo carrito.json
    obtenerCarritoDesdeArchivo() {
        try {
            const data = fs.readFileSync(this.path1, 'utf8');
            const carrito = JSON.parse(data).carrito;
            return carrito;
        } catch (error) {
            console.error(`Error al leer el archivo carrito.json: ${error.message}`);
            return [];
        }
    }

    // Guardo los datos de productos en el acchivo productos.json
    guardarProductosEnArchivo() {
        const data = JSON.stringify({ productos: this.productos }, null, 2);
        try {
            fs.writeFileSync(this.path, data);
            console.log('Datos guardados en productos.json correctamente.');
        } catch (error) {
            console.error(`Error al guardar datos en productos.json: ${error.message}`);
        }
    }

    // Guardo los datos de carrito en el acchivo carrito.json
    guardarCarritoEnArchivo() {
        const data = JSON.stringify({ carrito: this.carrito }, null, 2);
        try {
            fs.writeFileSync(this.path1, data);
            console.log('Datos guardados en carrito.json correctamente.');
        } catch (error) {
            console.error(`Error al guardar datos en carrito.json: ${error.message}`);
        }
    }

    // Método para crear un nuevo carrito
    crearNuevoCarrito(products) {
        // Obtener un id único para el nuevo carrito
        const nuevoCarritoId = this.obtenerNuevoCarritoId();

        // Crear un nuevo objeto carrito
        const nuevoCarrito = {
            id: nuevoCarritoId,
            products: products || [] // Puedes pasar un array de productos o un array vacío
        };

        // Agregar el nuevo carrito al array de carritos
        this.carrito.push(nuevoCarrito);

        // Guardar la actualización en el archivo
        this.guardarCarritoEnArchivo();

        console.log(`Nuevo carrito creado con ID: ${nuevoCarritoId}`);
        return nuevoCarrito;
    }

    // Método para obtener un id único para el nuevo carrito
    obtenerNuevoCarritoId() {
        const ultimoCarrito = this.carrito.length > 0 ? Math.max(...this.carrito.map(c => c.id)) : 0;
        return ultimoCarrito + 1;
    }

    // Método para mostrar los porductos de un carrito
    mostrarProductosDeCarrito(carritoId) {
        const carritoEncontrado = this.carrito.find(carrito => carrito.id === carritoId);

        if (carritoEncontrado) {
            console.log(`Productos en el carrito con ID ${carritoId}:`);
            console.log(carritoEncontrado.products);
            return carritoEncontrado.products;
        } else {
            console.error(`Carrito con ID ${carritoId} no encontrado.`);
            return [];
        }
    }

    // Método para agregar un porducto a un carrito
    agregarProductoAlCarrito(carritoId, productoId) {
        // Buscar el carrito por su ID
        const carrito = this.carrito.find(c => c.id === carritoId);

        // Verificar si el carrito existe
        if (carrito) {
            // Buscar el producto por su ID en la lista de productos
            const producto = this.productos.find(p => p.id === productoId);

            // Verificar si el producto existe
            if (producto) {
                // Verificar si la cantidad del producto es mayor a 0
                if (producto.cantidad > 0) {
                    // Verificar si el producto ya está en el carrito
                    const productoEnCarrito = carrito.products.find(p => p.id === productoId);

                    if (productoEnCarrito) {
                        // Si el producto ya está en el carrito, incrementar la cantidad en uno
                        productoEnCarrito.quantity += 1;

                        // Disminuir la cantidad en el producto original
                        producto.cantidad -= 1;
                    } else {
                        // Si el producto no está en el carrito, agregarlo con cantidad 1
                        carrito.products.push({
                            id: productoId,
                            quantity: 1
                        });

                        // Disminuir la cantidad en el producto original
                        producto.cantidad -= 1;
                    }

                    // Guardar el carrito y los productos actualizados en los archivos
                    this.guardarCarritoEnArchivo();
                    this.guardarProductosEnArchivo();
                    console.log(`Producto con ID ${productoId} agregado al carrito ${carritoId} correctamente.`);
                } else {
                    console.error(`Error: La cantidad del producto con ID ${productoId} es 0. No se puede agregar al carrito.`);
                }
            } else {
                console.error(`Error: No se encontró el producto con ID ${productoId}.`);
            }
        } else {
            console.error(`Error: No se encontró el carrito con ID ${carritoId}.`);
        }
    }

    // Método para añadir un producto
    añadirProducto(datosProducto) {
        // Verificar si el código ya está en uso
        const codeExistente = this.productos.some(producto => producto.code === datosProducto.code);
        if (codeExistente) {
            console.error(`Error: Ya existe un producto con el código ${datosProducto.code}. No se pudo agregar.`);
            return; // Salir del método si el código está duplicado
        }

        // Validar que todos los campos necesarios estén presentes y sean válidos
        const camposNecesarios = ['titulo', 'descripcion', 'code', 'precio', 'estado', 'cantidad', 'categoria',];
        const camposInvalidos = camposNecesarios.filter(campo => !datosProducto.hasOwnProperty(campo) || datosProducto[campo] === null || datosProducto[campo] === undefined);

        if (camposInvalidos.length > 0 || typeof datosProducto.precio !== 'number' || typeof datosProducto.estado !== 'boolean' || typeof datosProducto.cantidad !== 'number' || (datosProducto.imagen && !Array.isArray(datosProducto.imagen))) {
            console.error(`Error: El producto no contiene todos los campos necesarios o los tipos de datos no son válidos.`);
            return; // Salir del método si hay campos faltantes o tipos de datos no válidos
        }

        this.ultimoId++;
        let producto = {
            id: this.ultimoId,
            titulo: datosProducto.titulo,
            descripcion: datosProducto.descripcion,
            code: datosProducto.code,
            precio: datosProducto.precio,
            estado: datosProducto.estado,
            cantidad: datosProducto.cantidad,
            categoria: datosProducto.categoria,
            imagen: datosProducto.imagen
        };
        this.productos.push(producto);
        this.guardarProductosEnArchivo();
    }

    // Método para mostrar los productos esto seria getProducts
    mostrarProductos() {
        console.log(this.productos);
        return this.productos;
    }

    // Método para mostrar un solo producto por ID esto es getProductById
    mostrarProducto(id) {
        const productoEncontrado = this.productos.find(producto => producto.id === id);
        if (productoEncontrado) {
            console.log(productoEncontrado);
            return productoEncontrado;
        } else {
            console.error("Producto no encontrado");
        }
    }

    //Método para actualizar un campo del producto buscado con el id
    actualizarProducto({ productoId, campo, nuevoValor }) {
        const productoIndex = this.productos.findIndex(producto => producto.id === productoId);

        if (productoIndex !== -1) {
            // Si se encuentra el producto por ID, actualizar el campo especificado
            if (this.productos[productoIndex].hasOwnProperty(campo)) {//hasOwnProperty me permite saber is un objeto (this.productos[productoIndex]) tiene una propiedad (campo) y devuelve un valor booleano
                this.productos[productoIndex][campo] = nuevoValor;
                console.log(`Campo ${campo} del producto con ID ${productoId} actualizado: ${nuevoValor}`);
            } else {
                console.log(`Error: El campo ${campo} no existe en el producto.`);
            }
        } else {
            console.log(`Producto con ID ${productoId} no encontrado. No se pudo actualizar.`);
        }
        this.guardarProductosEnArchivo();
    }

    //Método para borrar un producto por id
    borrarProducto(productoId) {
        const productoIndex = this.productos.findIndex(producto => producto.id === productoId);

        if (productoIndex !== -1) {
            // Si se encuentra el producto por ID, borrarlo
            this.productos.splice(productoIndex, 1);
            console.log(`Producto con ID ${productoId} eliminado.`);
        } else {
            console.log(`Producto con ID ${productoId} no encontrado. No se pudo eliminar.`);
        }
        this.guardarProductosEnArchivo();
    }

}

module.exports = GestionProductos;