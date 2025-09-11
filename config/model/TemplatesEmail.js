const { Model, DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

class TemplatesEmail extends Model {
  static init(sequelize) {
    super.init({
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: () => uuidv4(),
        allowNull: false
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'Nome do template é obrigatório'
          },
          len: {
            args: [2, 100],
            msg: 'Nome deve ter entre 2 e 100 caracteres'
          }
        }
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
          len: {
            args: [0, 500],
            msg: 'Descrição deve ter no máximo 500 caracteres'
          }
        }
      },
      subject: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'Assunto é obrigatório'
          },
          len: {
            args: [2, 200],
            msg: 'Assunto deve ter entre 2 e 200 caracteres'
          }
        }
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'Conteúdo é obrigatório'
          }
        }
      },
      type: {
        type: DataTypes.ENUM('html', 'text'),
        allowNull: false,
        defaultValue: 'html',
        validate: {
          isIn: {
            args: [['html', 'text']],
            msg: 'Tipo deve ser html ou text'
          }
        }
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'is_active'
      },
      isDefault: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'is_default',
        comment: 'Indica se é o template padrão para a categoria'
      }
    }, {
      sequelize,
      modelName: 'TemplatesEmail',
      tableName: 'templates_email',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      hooks: {
        beforeCreate: async (template) => {
          if (template.name) {
            template.name = template.name.trim();
          }
          if (template.subject) {
            template.subject = template.subject.trim();
          }
          
          // Se está sendo definido como padrão, remover padrão dos outros
          if (template.isDefault) {
            await TemplatesEmail.update(
              { isDefault: false },
              { where: { isDefault: true } }
            );
          }
        },
        beforeUpdate: async (template) => {
          if (template.name) {
            template.name = template.name.trim();
          }
          if (template.subject) {
            template.subject = template.subject.trim();
          }
          
          // Se está sendo definido como padrão, remover padrão dos outros
          if (template.isDefault && template.changed('isDefault')) {
            await TemplatesEmail.update(
              { isDefault: false },
              { where: { isDefault: true } }
            );
          }
        }
      }
    });

    return this;
  }

  static associate(models) {
    // Associações futuras se necessário
  }

  /**
   * Substitui variáveis no template
   * @param {Object} variables - Objeto com as variáveis para substituir
   * @returns {Object} Template com variáveis substituídas
   */
  renderTemplate(variables = {}) {
    let renderedSubject = this.subject;
    let renderedContent = this.content;

    // Substituir variáveis no formato {{variavel}}
    Object.keys(variables).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      renderedSubject = renderedSubject.replace(regex, variables[key] || '');
      renderedContent = renderedContent.replace(regex, variables[key] || '');
    });

    return {
      subject: renderedSubject,
      content: renderedContent,
      type: this.type
    };
  }

  toJSON() {
    const values = { ...this.get() };
    return values;
  }
}

module.exports = TemplatesEmail;