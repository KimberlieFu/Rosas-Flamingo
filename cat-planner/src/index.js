const Resolver = require('@forge/resolver').default;

const express = require("express");
const cors = require("cors");

const homeRouter = require("./router/homeRouter");

// connect to forge
const resolver = new Resolver();

resolver.define('getText', (req) => {
    console.log(req);

    return 'Hello, world!';
});

// connect to port 4000
const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

// connect to routers
app.use("/api/", homeRouter);

app.listen(PORT, function () {
    console.log("Server listening on port", PORT);
});

// export forge
module.exports = {
    handler: resolver.getDefinitions(),
};