const joi = require('joi');

const GAME = joi.object({
    name_game: joi.string().min(3).required(),
    release_year: joi.number().required(),
    sinopse: joi.string().min(10).required()
});

//middleware - validação dos campos enviados via post
function validate_game(req, res, next) {
    const { name_game, release_year, sinopse } = req.body;

    const { error } = GAME.validate({ 
        name_game, 
        release_year,
        sinopse
    })

    if(error) {
        return res.status(400).json({ 
            message: "Formato do dado incorreto. Verifique e tente novamente."
        })
    }


    next()
    
}

module.exports = validate_game;
