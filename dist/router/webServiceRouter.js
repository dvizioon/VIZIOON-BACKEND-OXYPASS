const express = require('express');
const webServiceController = require('../controller/webServiceController');
const { isAuth } = require('../middleware/isAuth');
const { isAdmin } = require('../middleware/isAdmin');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     WebService:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           example: 123e4567-e89b-12d3-a456-426614174000
 *         protocol:
 *           type: string
 *           enum: [http, https]
 *           example: https
 *         url:
 *           type: string
 *           example: ead.ceuma.br
 *         token:
 *           type: string
 *           example: abc123token
 *         moodleUser:
 *           type: string
 *           example: master_user
 *         serviceName:
 *           type: string
 *           example: Ceuma WebService
 *         route:
 *           type: string
 *           example: /webservice/rest/server.php
 *         isActive:
 *           type: boolean
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     WebServiceRequest:
 *       type: object
 *       required:
 *         - url
 *         - token
 *         - serviceName
 *         - protocol
 *       properties:
 *         protocol:
 *           type: string
 *           enum: [http, https]
 *           default: https
 *           example: https
 *           description: Protocolo de comunicação (obrigatório)
 *         url:
 *           type: string
 *           example: ead.ceuma.br
 *           description: URL do Moodle sem protocolo (obrigatório)
 *         token:
 *           type: string
 *           example: abc123token456
 *           description: Token de acesso ao WebService (obrigatório)
 *         serviceName:
 *           type: string
 *           example: Ceuma EAD
 *           description: Nome identificador do serviço (obrigatório)
 *         route:
 *           type: string
 *           default: /webservice/rest/server.php
 *           example: /webservice/rest/server.php
 *           description: Rota do WebService (opcional - padrão automático)
 *         moodleUser:
 *           type: string
 *           example: master_admin
 *           description: Usuário admin do Moodle (opcional)
 *         moodlePassword:
 *           type: string
 *           example: senha_segura123
 *           description: Senha do usuário admin (opcional)
 *     WebServiceResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         webService:
 *           $ref: '#/components/schemas/WebService'
 *         message:
 *           type: string
 *           example: WebService criado com sucesso
 *     WebServiceListResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         webServices:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/WebService'
 *         total:
 *           type: number
 *           example: 5
 *     WebServiceUrlResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         fullUrl:
 *           type: string
 *           example: https://ead.ceuma.br/webservice/rest/server.php
 *         webService:
 *           $ref: '#/components/schemas/WebService'
 */

/**
 * @swagger
 * /api/webservice:
 *   post:
 *     summary: Criar novo WebService
 *     description: Cria um novo WebService. Apenas URL, token, serviceName e protocol são obrigatórios. Route, moodleUser e moodlePassword são opcionais.
 *     tags: [WebService]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/WebServiceRequest'
 *           examples:
 *             minimo:
 *               summary: Exemplo mínimo (apenas campos obrigatórios)
 *               value:
 *                 protocol: https
 *                 url: ead.ceuma.br
 *                 token: abc123token456
 *                 serviceName: Ceuma EAD
 *             completo:
 *               summary: Exemplo completo (com campos opcionais)
 *               value:
 *                 protocol: https
 *                 url: ead.ceuma.br
 *                 token: abc123token456
 *                 serviceName: Ceuma EAD
 *                 route: /webservice/rest/server.php
 *                 moodleUser: master_admin
 *                 moodlePassword: senha_segura123
 *     responses:
 *       201:
 *         description: WebService criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WebServiceResponse'
 *       400:
 *         description: Dados inválidos ou obrigatórios faltando
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Token de autenticação inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', [isAuth,isAdmin], webServiceController.create);

/**
 * @swagger
 * /api/webservice:
 *   get:
 *     summary: Listar todos os WebServices
 *     tags: [WebService]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de todos os WebServices
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WebServiceListResponse'
 *       401:
 *         description: Token de autenticação inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', [isAuth, isAdmin], webServiceController.getAll);

/**
 * @swagger
 * /api/webservice/{id}:
 *   get:
 *     summary: Buscar WebService por ID
 *     tags: [WebService]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único do WebService (UUID)
 *         example: 123e4567-e89b-12d3-a456-426614174000
 *     responses:
 *       200:
 *         description: WebService encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WebServiceResponse'
 *       404:
 *         description: WebService não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Token de autenticação inválido
 */
router.get('/:id', [isAuth, isAdmin], webServiceController.getById);

/**
 * @swagger
 * /api/webservice/{id}:
 *   put:
 *     summary: Atualizar WebService existente
 *     tags: [WebService]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único do WebService (UUID)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/WebServiceRequest'
 *           example:
 *             protocol: https
 *             url: ead.ceuma.br
 *             token: novo_token_123
 *             serviceName: Ceuma EAD Atualizado
 *             route: /webservice/rest/server.php
 *             moodleUser: master_admin
 *             moodlePassword: nova_senha_segura
 *     responses:
 *       200:
 *         description: WebService atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WebServiceResponse'
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: WebService não encontrado
 *       401:
 *         description: Token de autenticação inválido
 */
router.put('/:id', [isAuth, isAdmin], webServiceController.update);

/**
 * @swagger
 * /api/webservice/{id}:
 *   delete:
 *     summary: Deletar WebService
 *     tags: [WebService]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único do WebService (UUID)
 *     responses:
 *       200:
 *         description: WebService deletado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: WebService deletado com sucesso
 *       404:
 *         description: WebService não encontrado
 *       401:
 *         description: Token de autenticação inválido
 */
router.delete('/:id', [isAuth, isAdmin], webServiceController.delete);

/**
 * @swagger
 * /api/webservice/{id}/toggle:
 *   patch:
 *     summary: Ativar ou desativar WebService
 *     description: Alterna o status ativo/inativo do WebService. Se estiver ativo, desativa. Se estiver inativo, ativa.
 *     tags: [WebService]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único do WebService (UUID)
 *     responses:
 *       200:
 *         description: Status do WebService alterado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WebServiceResponse'
 *       404:
 *         description: WebService não encontrado
 *       401:
 *         description: Token de autenticação inválido
 */
router.patch('/:id/toggle', [isAuth, isAdmin], webServiceController.toggleActive);


module.exports = router;