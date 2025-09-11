const bcrypt = require('bcryptjs');
const { connectDatabase, User, TemplatesEmail, WebService, closeDatabase, sequelize } = require('./database');
const logger = require('../utils/logger');

// Configurações do usuário admin
const ADMIN_CONFIG = {
  name: 'Administrador',
  email: 'admin@oxypass.com',
  password: 'admin123',
  role: 'admin'
};


// Configuração do template padrão
const TEMPLATE_CONFIG = {
  name: 'Template Reset de Senha - Padrão',
  description: 'Template padrão para envio de emails de reset de senha',
  subject: 'Redefinir Senha - {{system.name}}',
  content: `<div style="max-width: 600px; margin: 0 auto; background-color: white; font-family: Arial, sans-serif;">
    <!-- Header com gradient roxo -->
    <div style="background: linear-gradient(135deg, #6a4c93, #4a148c); padding: 40px 20px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold; letter-spacing: 1px;">OXYGENI</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Tecnologia & Inovação</p>
    </div>
    <!-- Conteúdo principal -->
    <div style="padding: 40px 30px;">
        <h2 style="color: #333; margin: 0 0 20px 0; font-size: 24px;">Olá {{user.firstname}} {{user.lastname}},</h2>
        <p style="color: #666; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">
            Recebemos uma solicitação para redefinir a senha da sua conta <strong>{{user.email}}</strong>.
        </p>
        <p style="color: #666; line-height: 1.6; margin: 0 0 30px 0; font-size: 16px;">
            Para sua segurança, clique no botão abaixo para criar uma nova senha:
        </p>
        <!-- Botão de ação -->
        <div style="text-align: center; margin: 40px 0;">
            <a href="{{reset.link}}" style="background: linear-gradient(135deg, #6a4c93, #4a148c); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 12px rgba(106, 76, 147, 0.3); transition: all 0.3s ease;">
                Redefinir Minha Senha
            </a>
        </div>
        <!-- Link alternativo em caixa destacada -->
        <div style="background-color: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; padding: 20px; margin: 30px 0;">
            <p style="color: #666; margin: 0 0 10px 0; font-size: 14px; font-weight: bold;">
                Problemas com o botão? Use este link:
            </p>
            <p style="margin: 0; word-break: break-all; font-size: 12px; color: #007bff; background-color: white; padding: 10px; border-radius: 4px; border: 1px solid #dee2e6;">
                <a href="{{reset.link}}" style="color: #007bff; text-decoration: none;">{{reset.token(50)}}</a>
            </p>
        </div>
        <!-- Informações de segurança -->
        <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 30px 0; border-radius: 0 4px 4px 0;">
            <p style="margin: 0; color: #856404; font-size: 14px;">
                <strong>Importante:</strong> Este link expira em {{reset.expirationTime}}. Se você não solicitou esta alteração, ignore este email e sua conta permanecerá segura.
            </p>
        </div>
        <p style="color: #999; font-size: 14px; line-height: 1.5; margin: 30px 0 0 0;">
            Se você tem dúvidas sobre este email, entre em contato com nosso suporte.
        </p>
    </div>
    <!-- Footer -->
    <div style="background-color: #2c3e50; padding: 30px; text-align: center;">
        <p style="color: #bdc3c7; margin: 0 0 10px 0; font-size: 14px;">
            Este é um email automático do sistema {{system.name}}
        </p>
        <div style="margin-top: 20px;">
            <div style="display: inline-block; background: linear-gradient(135deg, #6a4c93, #4a148c); padding: 8px 16px; border-radius: 20px;">
                <span style="color: white; font-weight: bold; font-size: 12px; letter-spacing: 1px;">OXYGENI</span>
            </div>
        </div>
    </div>
</div>`,
  type: 'html',
  isActive: true,
  isDefault: true
};

// Configuração do WebService padrão
const WEBSERVICE_CONFIG = {
  protocol: 'https',
  url: 'ead.ceuma.br',
  token: 'a1edbccc0854456cd3761469908a0ad5',
  // moodleUser: '',
  // moodlePassword: '',
  serviceName: 'Ceuma EAD',
  route: '/webservice/rest/server.php',
  isActive: true
};

async function createAdminUser() {
  const existingAdmin = await User.findOne({
    where: { email: ADMIN_CONFIG.email }
  });

  if (existingAdmin) {
    logger.warning(`Usuário admin já existe: ${ADMIN_CONFIG.email}`);
    return;
  }

  const admin = await User.create({
    name: ADMIN_CONFIG.name,
    email: ADMIN_CONFIG.email,
    password: ADMIN_CONFIG.password,
    role: ADMIN_CONFIG.role
  });

  logger.success('Usuário admin criado com sucesso!');
}

async function createTemplatesEmail() {
  const existingTemplate = await TemplatesEmail.findOne({
    where: { isDefault: true }
  });

  if (existingTemplate) {
    logger.warning(`Template padrão já existe: ${existingTemplate.name}`);
    return;
  }

  const template = await TemplatesEmail.create(TEMPLATE_CONFIG);
  logger.success('Template padrão criado com sucesso!');
}

async function createWebService() {
  // Verificar se já existe um WebService com a mesma URL
  const existingWebService = await WebService.findOne({
    where: { url: WEBSERVICE_CONFIG.url }
  });

  if (existingWebService) {
    logger.warning(`WebService já existe para URL: ${WEBSERVICE_CONFIG.url}`);
    return;
  }

  const webService = await WebService.create(WEBSERVICE_CONFIG);
  logger.success('WebService padrão criado com sucesso!');
  // logger.info(`Nome: ${webService.serviceName}`);
  // logger.info(`URL: ${webService.protocol}://${webService.url}`);
}

// Função principal que coordena tudo
async function runSeed() {
  try {
    const connected = await connectDatabase();
    if (!connected) {
      logger.error('Falha ao conectar com o banco de dados');
      process.exit(1);
    }

    // Executar todas as funções na mesma conexão
    await createAdminUser();
    await createTemplatesEmail();
    await createWebService();

  } catch (error) {
    logger.error(`Erro no seed: ${error.message}`);
  } finally {
    await closeDatabase();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  runSeed();
}

module.exports = { createAdminUser, createTemplatesEmail, createWebService, runSeed };