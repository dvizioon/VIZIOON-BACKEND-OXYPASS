const express = require('express');
const userController = require('../controller/userController');
const { isAuth } = require('../middleware/isAuth');
const { isAdmin } = require('../middleware/isAdmin');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: number
 *           example: 1
 *         name:
 *           type: string
 *           example: username
 *         email:
 *           type: string
 *           example: user@domain.com
 *         role:
 *           type: string
 *           enum: [user, admin]
 *           example: admin
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: 2025-01-01T00:00:00.000Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: 2025-01-01T00:00:00.000Z
 *     UserResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         user:
 *           $ref: '#/components/schemas/User'
 *     UsersListResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         users:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/User'
 *         total:
 *           type: number
 *           example: 5
 *         message:
 *           type: string
 *           example: Lista de usuários
 *     UsersInfoResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: Informações do usuário
 *         data:
 *           type: object
 *           properties:
 *             totalUsers:
 *               type: number
 *               example: 1
 *             lastUpdate:
 *               type: string
 *               format: date-time
 *               example: 2025-01-01T00:00:00.000Z
 *             serverStatus:
 *               type: string
 *               example: online
 */

/**
 * @swagger
 * /api/user/profile:
 *   get:
 *     summary: Obter perfil do usuário autenticado
 *     tags: [Usuário]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil do usuário
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       401:
 *         description: Token não fornecido ou inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Usuário não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/profile', isAuth, userController.getProfile);


/**
 * @swagger
 * /api/user/all:
 *   get:
 *     summary: Listar todos os usuários (ADMIN)
 *     description: Lista todos os usuários do sistema com paginação. Requer privilégios de administrador.
 *     tags: [Usuário]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número da página
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Usuários por página
 *         example: 10
 *     responses:
 *       200:
 *         description: Lista paginada de usuários
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 25
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     pages:
 *                       type: integer
 *                       example: 3
 *             example:
 *               success: true
 *               users:
 *                 - id: 1
 *                   name: Administrador
 *                   email: admin@domain.com
 *                   role: admin
 *                   createdAt: 2025-01-01T00:00:00.000Z
 *                   updatedAt: 2025-01-01T00:00:00.000Z
 *                 - id: 2
 *                   name: João Silva
 *                   email: user@domain.com
 *                   role: user
 *                   createdAt: 2025-01-15T10:30:00.000Z
 *                   updatedAt: 2025-01-15T10:30:00.000Z
 *               pagination:
 *                 total: 25
 *                 page: 1
 *                 limit: 10
 *                 pages: 3
 *       401:
 *         description: Token não fornecido ou inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Acesso negado - Privilégios de administrador necessários
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/all', [isAuth, isAdmin], userController.getAllUsers);

module.exports = router;