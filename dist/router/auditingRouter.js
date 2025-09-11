const express = require('express');
const auditingController = require('../controller/auditingController');
const { isAuth } = require('../middleware/isAuth');
const { isAdmin } = require('../middleware/isAdmin');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Auditing:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         userId:
 *           type: integer
 *         username:
 *           type: string
 *         email:
 *           type: string
 *         webServiceId:
 *           type: string
 *           format: uuid
 *         tokenUser:
 *           type: string
 *         useToken:
 *           type: boolean
 *         emailSent:
 *           type: boolean
 *         tokenExpiresAt:
 *           type: string
 *           format: date-time
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *     AuditingRequest:
 *       type: object
 *       properties:
 *         userId:
 *           type: integer
 *         username:
 *           type: string
 *         email:
 *           type: string
 *         webServiceId:
 *           type: string
 *           format: uuid
 *         tokenUser:
 *           type: string
 *         useToken:
 *           type: boolean
 *           default: false
 *         emailSent:
 *           type: boolean
 *           default: false
 *         tokenExpiresAt:
 *           type: string
 *           format: date-time
 *         description:
 *           type: string
 *         status:
 *           type: string
 *           enum: [error, success, pending]
 */

/**
 * @swagger
 * /api/auditing:
 *   post:
 *     summary: Criar registro de auditoria
 *     tags: [Auditoria]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AuditingRequest'
 *           example:
 *             userId: 123
 *             username: usuario123
 *             email: usuario@exemplo.com
 *             webServiceId: 456e7890-e89b-12d3-a456-426614174001
 *             tokenUser: abc123token
 *             useToken: false
 *             emailSent: true
 *             tokenExpiresAt: 2025-09-05T15:30:00.000Z
 *             description: Acesso ao web service realizado com sucesso
 *             status: success || error || pending
 *     responses:
 *       201:
 *         description: Registro criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 auditing:
 *                   $ref: '#/components/schemas/Auditing'
 *                 message:
 *                   type: string
 *                   example: Registro de auditoria criado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado
 */
router.post('/', [isAuth, isAdmin], auditingController.create);

/**
 * @swagger
 * /api/auditing:
 *   get:
 *     summary: Listar auditorias
 *     tags: [Auditoria]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número da página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Registros por página
 *     responses:
 *       200:
 *         description: Lista de auditorias
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 auditing:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Auditing'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 150
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 50
 *                     pages:
 *                       type: integer
 *                       example: 3
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado
 */
router.get('/', [isAuth, isAdmin], auditingController.getAll);

/**
 * @swagger
 * /api/auditing/{id}:
 *   get:
 *     summary: Buscar auditoria por ID
 *     tags: [Auditoria]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único da auditoria
 *         example: 123e4567-e89b-12d3-a456-426614174000
 *     responses:
 *       200:
 *         description: Auditoria encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 auditing:
 *                   $ref: '#/components/schemas/Auditing'
 *       404:
 *         description: Auditoria não encontrada
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado
 */
router.get('/:id', [isAuth, isAdmin], auditingController.getById);

/**
 * @swagger
 * /api/auditing/{id}:
 *   put:
 *     summary: Atualizar auditoria
 *     tags: [Auditoria]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único da auditoria
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AuditingRequest'
 *           example:
 *             useToken: true
 *             emailSent: true
 *             tokenExpiresAt: 2025-09-05T16:00:00.000Z
 *     responses:
 *       200:
 *         description: Auditoria atualizada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 auditing:
 *                   $ref: '#/components/schemas/Auditing'
 *                 message:
 *                   type: string
 *                   example: Registro de auditoria atualizado com sucesso
 *       404:
 *         description: Auditoria não encontrada
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado
 */
router.put('/:id', [isAuth, isAdmin], auditingController.update);

/**
 * @swagger
 * /api/auditing/{id}:
 *   delete:
 *     summary: Deletar auditoria
 *     tags: [Auditoria]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único da auditoria
 *     responses:
 *       200:
 *         description: Auditoria deletada
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
 *                   example: Registro de auditoria deletado com sucesso
 *       404:
 *         description: Auditoria não encontrada
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado
 */
router.delete('/:id', [isAuth, isAdmin], auditingController.delete);

module.exports = router;