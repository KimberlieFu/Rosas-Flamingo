const homeService = require("../service/homeService");

class HomeController {
    
    /**
     * Endpoint of __.
     */
    async func(req, res) {
        const variable = req.body.variable;
    }
}

module.exports = new HomeController();