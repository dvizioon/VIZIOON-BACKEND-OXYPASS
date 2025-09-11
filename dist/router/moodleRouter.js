const express = require('express');
const moodleController = require('../controller/moodleController');
const { isAuth } = require('../middleware/isAuth');
const { isAdmin } = require('../middleware/isAdmin');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     MoodleFindUserRequest:
 *       type: object
 *       required:
 *         - moodleUrl
 *       properties:
 *         moodleUrl:
 *           type: string
 *           description: URL do Moodle (sem protocolo)
 *           example: ead.ceuma.br
 *         email:
 *           type: string
 *           description: Email do usuário (use OU email OU username)
 *           example: usuario@exemplo.com
 *         username:
 *           type: string
 *           description: Username do usuário (use OU email OU username)
 *           example: usuario123
 *     MoodleResetPasswordRequest:
 *       type: object
 *       required:
 *         - moodleUrl
 *       properties:
 *         moodleUrl:
 *           type: string
 *           description: URL do Moodle (sem protocolo)
 *           example: ead.ceuma.br
 *         email:
 *           type: string
 *           description: Email do usuário (use OU email OU username)
 *           example: usuario@exemplo.com
 *         username:
 *           type: string
 *           description: Username do usuário (use OU email OU username)
 *           example: usuario123
 *     MoodleUserResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: Usuário encontrado
 *         user:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *               example: 123
 *             username:
 *               type: string
 *               example: usuario123
 *             firstname:
 *               type: string
 *               example: João
 *             lastname:
 *               type: string
 *               example: Silva
 *             fullname:
 *               type: string
 *               example: João Silva
 *             email:
 *               type: string
 *               example: joao@exemplo.com
 *             idnumber:
 *               type: string
 *               example: 202100123
 *             suspended:
 *               type: integer
 *               example: 0
 *             confirmed:
 *               type: integer
 *               example: 1
 *         webService:
 *           type: object
 *           properties:
 *             serviceName:
 *               type: string
 *               example: Ceuma EAD WebService
 *             url:
 *               type: string
 *               example: ead.ceuma.br
 *     MoodleResetResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: Se o usuário existir, um email de reset de senha será enviado
 *         timestamp:
 *           type: string
 *           format: date-time
 *           example: 2025-09-05T14:30:00.000Z
 */

/**
 * @swagger
 * /api/moodle/urls:
 *   get:
 *     summary: Listar URLs dos WebServices ativos (ROTA PÚBLICA)
 *     description: Lista todas as URLs dos WebServices ativos. Retorna formato simples (apenas domínio) ou completo (protocolo + domínio).
 *     tags: [Moodle]
 *     parameters:
 *       - in: query
 *         name: base
 *         schema:
 *           type: string
 *           enum: [simples, full]
 *           default: simples
 *         description: Formato de retorno das URLs
 *         examples:
 *           simples:
 *             summary: URLs simples
 *             value: simples
 *           full:
 *             summary: URLs completas
 *             value: full
 *     responses:
 *       200:
 *         description: Lista de URLs dos WebServices
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/MoodleUrlsResponse'
 *                 - $ref: '#/components/schemas/MoodleUrlsFullResponse'
 *             examples:
 *               simples:
 *                 summary: Resposta com URLs simples
 *                 value:
 *                   success: true
 *                   urls:
 *                     - url: ead.ceuma.br
 *                     - url: portal.exemplo.br
 *                   total: 2
 *                   base: simples
 *                   message: URLs dos WebServices (simples)
 *               full:
 *                 summary: Resposta com URLs completas
 *                 value:
 *                   success: true
 *                   urls:
 *                     - url: https://ead.ceuma.br
 *                     - url: https://portal.exemplo.br
 *                   total: 2
 *                   base: full
 *                   message: URLs dos WebServices (full)
 *       400:
 *         description: Parâmetro inválido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Parâmetro "base" deve ser "simples" ou "full"
 */
router.get('/urls', moodleController.getUrls);

/**
 * @swagger
 * /api/moodle/find-user:
 *   post:
 *     summary: Buscar usuário no Moodle
 *     description: Busca usuário no Moodle usando URL e email OU username (apenas um dos dois)
 *     tags: [Moodle]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MoodleFindUserRequest'
 *           examples:
 *             porEmail:
 *               summary: Busca por email
 *               value:
 *                 moodleUrl: ead.ceuma.br
 *                 email: usuario@exemplo.com
 *             porUsername:
 *               summary: Busca por username
 *               value:
 *                 moodleUrl: ead.ceuma.br
 *                 username: usuario123
 *     responses:
 *       200:
 *         description: Usuário encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MoodleUserResponse'
 *       404:
 *         description: Usuário não encontrado
 *       400:
 *         description: Dados inválidos ou ambos email e username informados
 *       401:
 *         description: Não autorizado
 */
router.post('/find-user', [isAuth,isAdmin], moodleController.findUser);

/**
 * @swagger
 * /api/moodle/reset-password:
 *   post:
 *     summary: Solicitar reset de senha (ROTA PÚBLICA)
 *     description: Solicita reset de senha para usuário no Moodle. Esta rota é pública e não requer autenticação.
 *     tags: [Moodle]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MoodleResetPasswordRequest'
 *           examples:
 *             porEmail:
 *               summary: Reset por email
 *               value:
 *                 moodleUrl: ead.ceuma.br
 *                 email: usuario@exemplo.com
 *             porUsername:
 *               summary: Reset por username
 *               value:
 *                 moodleUrl: ead.ceuma.br
 *                 username: usuario123
 *     responses:
 *       200:
 *         description: Solicitação processada (sempre retorna sucesso por segurança)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MoodleResetResponse'
 *       400:
 *         description: Dados inválidos ou ambos email e username informados
 */
router.post('/reset-password', moodleController.resetPassword);

/**
 * @swagger
 * /api/moodle/validate-reset-token:
 *   post:
 *     summary: Validar token de reset de senha
 *     description: Valida se o token de reset está válido e não expirou (5 minutos)
 *     tags: [Moodle]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 description: Token JWT de reset recebido por email
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *           example:
 *             token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     responses:
 *       200:
 *         description: Token válido
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
 *                   example: Token válido
 *                 data:
 *                   type: object
 *                   properties:
 *                     username:
 *                       type: string
 *                       example: usuario123
 *                     email:
 *                       type: string
 *                       example: usuario@exemplo.com
 *                     moodleUrl:
 *                       type: string
 *                       example: ead.ceuma.br
 *                     tokenValid:
 *                       type: boolean
 *                       example: true
 *       400:
 *         description: Token inválido ou expirado
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/validate-reset-token', moodleController.validateResetToken);

/**
 * @swagger
 * /api/moodle/change-password:
 *   post:
 *     summary: Redefinir senha com token (ROTA PÚBLICA)
 *     description: Redefine a senha do usuário usando token JWT válido
 *     tags: [Moodle]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - newPassword
 *             properties:
 *               token:
 *                 type: string
 *                 description: Token JWT de reset recebido por email
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *               newPassword:
 *                 type: string
 *                 description: Nova senha (mínimo 6 caracteres)
 *                 example: novaSenha123
 *           example:
 *             token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *             newPassword: novaSenha123
 *     responses:
 *       200:
 *         description: Senha redefinida com sucesso
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
 *                   example: Senha redefinida com sucesso
 *                 user:
 *                   type: object
 *                   properties:
 *                     email:
 *                       type: string
 *                       example: user@domain.com
 *                     url:
 *                       type: string
 *                       example: ead.ceuma.br
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: 2025-09-05T15:30:00.000Z
 *       400:
 *         description: Token inválido, expirado ou senha inválida
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/change-password', moodleController.changePassword);

module.exports = router;