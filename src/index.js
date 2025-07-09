const express = require("express");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const OpenApiValidator = require("express-openapi-validator");
const app = express();
const port = 3000;

const swaggerDocument = YAML.load("./openapi.yaml");

// In-memory storage for users
const users = new Map();

// In-memory storage for products
const products = new Map();

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(express.json());

app.use(
  OpenApiValidator.middleware({
    apiSpec: swaggerDocument,
    validateRequests: true,
    validateResponses: true,
    ignorePaths: /.*\/docs.*/,  // ignore the docs path
  })
);

app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    message: err.message,
    errors: err.errors,
  });
});

app.get("/hello", (req, res) => {
  res.json({ message: "Hello World" });
});

app.post("/user", (req, res) => {
    const { name, age, email } = req.body;
    const newUser = {
        id: Date.now().toString(),
        name,
        age,
        email,
    };
    users.set(newUser.id, newUser);
    res.status(201).json(newUser);
});

// GET /user/{id} - Get a user by ID
app.get("/user/:id", (req, res) => {
    const { id } = req.params;
    const user = users.get(id);
    
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    
    res.status(200).json({
        id: parseInt(id),
        name: user.name
    });
});

// POST /user/{id} - Update a user by ID
app.post("/user/:id", (req, res) => {
    const { id } = req.params;
    const { name, age, email } = req.body;
    
    const user = users.get(id);
    
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    
    // Update user data
    const updatedUser = {
        id: parseInt(id),
        name,
        age,
        email
    };
    
    users.set(id, updatedUser);
    
    res.status(200).json(updatedUser);
});

// Product endpoints

// GET /products - Get all products
app.get("/products", (req, res) => {
    const productsList = Array.from(products.values());
    res.status(200).json(productsList);
});

// POST /products - Create a new product
app.post("/products", (req, res) => {
    const productData = req.body;
    const newProduct = {
        id: Date.now().toString(),
        ...productData
    };
    
    products.set(newProduct.id, newProduct);
    res.status(201).json(newProduct);
});

// GET /products/{id} - Get a product by ID
app.get("/products/:id", (req, res) => {
    const { id } = req.params;
    const product = products.get(id);
    
    if (!product) {
        return res.status(404).json({ message: "Product not found" });
    }
    
    res.status(200).json(product);
});

// PUT /products/{id} - Update a product by ID
app.put("/products/:id", (req, res) => {
    const { id } = req.params;
    const productData = req.body;
    
    const existingProduct = products.get(id);
    
    if (!existingProduct) {
        return res.status(404).json({ message: "Product not found" });
    }
    
    const updatedProduct = {
        ...existingProduct,
        ...productData,
        id // Ensure ID doesn't get overwritten
    };
    
    products.set(id, updatedProduct);
    res.status(200).json(updatedProduct);
});

// DELETE /products/{id} - Delete a product by ID
app.delete("/products/:id", (req, res) => {
    const { id } = req.params;
    
    const product = products.get(id);
    
    if (!product) {
        return res.status(404).json({ message: "Product not found" });
    }
    
    products.delete(id);
    res.status(204).send();
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});