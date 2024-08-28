const express = require('express');
const connection = require('./connection');
const validate_game = require('./validate_game');
const swagger_ui = require('swagger-ui-express');
const swagger_js_doc = require('swagger-jsdoc');
const teste = require('./teste');

const options = { 
    swaggerDefinition: {
        info: {
            title: 'API de jogos',
            version: '1.0.0'
        }
    },
    apis: ['index.js']
}

const openapiSpecification = swagger_js_doc(options);
console.log(openapiSpecification);

const app = express();

app.use(express.json());

// teste - middleware global
app.use(teste);

app.use('/api-docs', swagger_ui.serve, swagger_ui.setup(
    openapiSpecification
))

/**
 * @swagger
 * /games:
 *  get:
 *      summary: Lista todos os jogos cadastrados
 *      description: List all games in database
 *      responses:
 *          200:
 *              description: Jogos listados com sucesso
 *          400:
 *              description: Requisição inválida
 */
app.get("/games", async (req, res) => {
    const [result] = await connection.execute("SELECT * FROM games");
    console.log(result);
    res.status(200).json(result);
})


/**
 * @swagger
 * /games/{id}:
 *  get:
 *      summary: Obtém um jogo pelo ID
 *      produces:
 *          - application/json
 *      parameters:
 *          - name: id
 *            in: path
 *            required: true
 *            type: integer
 *            description: ID do jogo a ser obtido
 *      responses:
 *          200:
 *              description: Jogo encontrado com sucesso
 *              schema:
 *                  type: object
 *                  properties:
 *                      id:
 *                          type: integer
 *                      name_game:
 *                          type: string
 *                      release_year:
 *                          type: number
 *                      sinopse:
 *                          type: string
 *          404:
 *              description: Jogo não encontrado
 */
app.get('/games/:id', async (req, res) => {
    const { id } = req.params;
    
    const [result] = await connection.execute(`
        SELECT * FROM GAMES
        WHERE id = ?
    `, [id]);

    res.status(200).json(result);
})

/**
 * @swagger
 * /games:
 *  post:
 *      summary: Cadastra um jogo no sistema
 *      produces:
 *          -   apllication/json
 *      parameters: 
 *          -   name: game
 *              in: body
 *              required: true
 *              schema: 
 *                  type: object
 *                  properties:
 *                      name_game:
 *                          type: string
 *                      release_year:
 *                          type: number
 *                      sinopse:
 *                          type: string
 *      responses:
 *          201:
 *              description: Jogo criado com sucesso
 *          400:
 *              description: Requisição inválida. Verifique e tente novamente.
 */
app.post('/games', validate_game, async (req, res) => {
    const { name_game, release_year, sinopse } = req.body;
    
    const [result] = await connection.execute(`
        INSERT INTO games (
            name_game, release_year, sinopse
        )
        VALUES
        (?, ?, ?)
    `, [name_game, release_year, sinopse]);

    const new_game = {
        id: result.insertId,
        name_game,
        release_year,
        sinopse
    }
    res.status(201).json(new_game);
})

/**
 * @swagger
 * /games/{id}:
 *  put:
 *      summary: Atualiza um jogo existente
 *      produces:
 *          - application/json
 *      parameters:
 *          - name: id
 *            in: path
 *            required: true
 *            type: integer
 *            description: ID do jogo a ser atualizado
 *          - name: game
 *            in: body
 *            required: true
 *            schema:
 *              type: object
 *              properties:
 *                  name_game:
 *                      type: string
 *                  release_year:
 *                      type: number
 *                  sinopse:
 *                      type: string
 *      responses:
 *          200:
 *              description: Jogo atualizado com sucesso
 *          404:
 *              description: Jogo não encontrado
 *          400:
 *              description: Requisição inválida
 */
app.put('/games/:id', async (req, res) => {
    const { id } = req.params;
    const { name_game, release_year, sinopse } = req.body;

    // Executa a atualização no banco de dados
    const [result] = await connection.execute(`
        UPDATE games
        SET 
            name_game = ?, 
            release_year = ?, 
            sinopse = ?
        WHERE id = ?
    `, [name_game, release_year, sinopse, id]);

    // Verifica se alguma linha foi afetada, ou seja, se a atualização foi bem-sucedida
    if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Jogo não encontrado' });
    }

    const updated_game = {
        id,
        name_game,
        release_year,
        sinopse
    };

    res.status(200).json(updated_game);
})

/**
 * @swagger
 * /games/{id}:
 *  delete:
 *      summary: Exclui um jogo existente
 *      produces:
 *          - application/json
 *      parameters:
 *          - name: id
 *            in: path
 *            required: true
 *            type: integer
 *            description: ID do jogo a ser excluído
 *      responses:
 *          200:
 *              description: Jogo excluído com sucesso
 *          404:
 *              description: Jogo não encontrado
 */
app.delete('/games/:id', async (req, res) => {
    const { id } = req.params;
    
    const [result] = await connection.execute(`
        DELETE FROM GAMES
        WHERE id = ?
    `, [id]);

    // Verifica se alguma linha foi afetada, ou seja, se a atualização foi bem-sucedida
    if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Jogo não encontrado' });
    }

    res.status(200).json(result);
})

app.listen(3001, () => {
    console.log("Executando na porta 3001");
});