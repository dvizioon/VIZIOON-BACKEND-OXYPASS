const express = require('express');
const templatesEmailController = require('../controller/templatesEmailController');
const { isAuth } = require('../middleware/isAuth');
const { isAdmin } = require('../middleware/isAdmin');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     TemplatesEmail:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           example: 123e4567-e89b-12d3-a456-426614174000
 *         name:
 *           type: string
 *           example: Template Reset de Senha
 *         description:
 *           type: string
 *           example: Template para envio de reset de senha
 *         subject:
 *           type: string
 *           example: Reset de Senha - OxyPass
 *         content:
 *           type: string
 *           example: <h1>Reset de Senha</h1><p>Clique no link para redefinir...</p>
 *         type:
 *           type: string
 *           enum: [html, text]
 *           example: html
 *         isActive:
 *           type: boolean
 *           example: true
 *         isDefault:
 *           type: boolean
 *           example: false
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *     TemplatesEmailRequest:
 *       type: object
 *       required:
 *         - name
 *         - subject
 *         - content
 *       properties:
 *         name:
 *           type: string
 *           example: Template Reset de Senha
 *         description:
 *           type: string
 *           example: Template para envio de reset de senha
 *         subject:
 *           type: string
 *           example: Reset de Senha - OxyPass
 *         content:
 *           type: string
 *           example: <h1>Reset de Senha</h1><p>Clique no link para redefinir...</p>
 *         type:
 *           type: string
 *           enum: [html, text]
 *           default: html
 *           example: html
 *         isActive:
 *           type: boolean
 *           default: true
 *           example: true
 *         isDefault:
 *           type: boolean
 *           default: false
 *           example: false
 */

/**
 * @swagger
 * /api/templates-email:
 *   post:
 *     summary: Criar novo template de email
 *     tags: [Templates Email]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TemplatesEmailRequest'
 *           example:
 *             name: Template Reset de Senha
 *             description: Template para envio de reset de senha
 *             subject: Reset de Senha - OxyPass
 *             content: "<h1>Reset de Senha</h1><p>Clique no link para redefinir sua senha.</p>"
 *             type: html
 *             isActive: true
 *             isDefault: false
 *     responses:
 *       201:
 *         description: Template criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 template:
 *                   $ref: '#/components/schemas/TemplatesEmail'
 *                 message:
 *                   type: string
 *                   example: Template de email criado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado
 */
router.post('/', [isAuth, isAdmin], templatesEmailController.create);

/**
 * @swagger
 * /api/templates-email:
 *   get:
 *     summary: Listar todos os templates
 *     tags: [Templates Email]
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
 *         description: Templates por página
 *     responses:
 *       200:
 *         description: Lista de templates
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 templates:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/TemplatesEmail'
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
 *                       example: 50
 *                     pages:
 *                       type: integer
 *                       example: 1
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado
 */
router.get('/', [isAuth, isAdmin], templatesEmailController.getAll);

/**
 * @swagger
 * /api/templates-email/variables:
 *   get:
 *     summary: Listar variáveis disponíveis para templates
 *     description: Retorna todas as variáveis que podem ser usadas nos templates de email
 *     tags: [Templates Email]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de variáveis disponíveis
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 variables:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       category:
 *                         type: string
 *                         example: user
 *                       key:
 *                         type: string
 *                         example: user.fullname
 *                       description:
 *                         type: string
 *                         example: Nome completo do usuário
 *                       example:
 *                         type: string
 *                         example: João Silva
 *                       usage:
 *                         type: string
 *                         example: "{{user.fullname}}"
 *                 total:
 *                   type: integer
 *                   example: 15
 *                 message:
 *                   type: string
 *                   example: Variáveis disponíveis para templates
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado
 */
router.get('/variables', [isAuth, isAdmin], templatesEmailController.getVariables);

/**
 * @swagger
 * /api/templates-email/{id}:
 *   get:
 *     summary: Buscar template por ID
 *     tags: [Templates Email]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único do template
 *         example: 123e4567-e89b-12d3-a456-426614174000
 *     responses:
 *       200:
 *         description: Template encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 template:
 *                   $ref: '#/components/schemas/TemplatesEmail'
 *       404:
 *         description: Template não encontrado
 *       401:
 *         description: Não autorizado
 */
router.get('/:id', [isAuth, isAdmin], templatesEmailController.getById);

/**
 * @swagger
 * /api/templates-email/{id}:
 *   put:
 *     summary: Atualizar template
 *     tags: [Templates Email]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único do template
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TemplatesEmailRequest'
 *           example:
 *             name: Template Reset de Senha Atualizado
 *             description: Template atualizado para envio de reset de senha
 *             subject: Redefinir Senha - OxyPass
 *             content: "<h1>Redefinir Senha</h1><p>Clique aqui para redefinir sua senha.</p>"
 *             type: html
 *             isActive: true
 *     responses:
 *       200:
 *         description: Template atualizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 template:
 *                   $ref: '#/components/schemas/TemplatesEmail'
 *                 message:
 *                   type: string
 *                   example: Template atualizado com sucesso
 *       404:
 *         description: Template não encontrado
 *       401:
 *         description: Não autorizado
 */
router.put('/:id', [isAuth, isAdmin], templatesEmailController.update);

/**
 * @swagger
 * /api/templates-email/{id}:
 *   delete:
 *     summary: Deletar template
 *     tags: [Templates Email]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único do template
 *     responses:
 *       200:
 *         description: Template deletado
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
 *                   example: Template deletado com sucesso
 *       404:
 *         description: Template não encontrado
 *       401:
 *         description: Não autorizado
 */
router.delete('/:id', [isAuth, isAdmin], templatesEmailController.delete);

/**
 * @swagger
 * /api/templates-email/{id}/toggle:
 *   patch:
 *     summary: Ativar ou desativar template
 *     description: Alterna o status ativo/inativo do template
 *     tags: [Templates Email]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único do template
 *     responses:
 *       200:
 *         description: Status do template alterado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 template:
 *                   $ref: '#/components/schemas/TemplatesEmail'
 *                 message:
 *                   type: string
 *                   example: Template ativado com sucesso
 *       404:
 *         description: Template não encontrado
 *       401:
 *         description: Não autorizado
 */
router.patch('/:id/toggle', [isAuth, isAdmin], templatesEmailController.toggleActive);

/**
 * @swagger
 * /api/templates-email/{id}/set-default:
 *   patch:
 *     summary: Definir template como padrão
 *     description: Define este template como padrão (remove padrão dos outros)
 *     tags: [Templates Email]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único do template
 *     responses:
 *       200:
 *         description: Template definido como padrão
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 template:
 *                   $ref: '#/components/schemas/TemplatesEmail'
 *                 message:
 *                   type: string
 *                   example: Template definido como padrão
 *       404:
 *         description: Template não encontrado
 *       401:
 *         description: Não autorizado
 */
router.patch('/:id/set-default', [isAuth, isAdmin], templatesEmailController.setAsDefault);


module.exports = router;