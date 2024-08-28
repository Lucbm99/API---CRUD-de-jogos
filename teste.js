function teste(req, res, next) {
    console.log("Passei por aqui!!");
    next();
}

module.exports = teste;