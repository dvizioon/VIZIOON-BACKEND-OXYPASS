const { Model, DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

class Auditing extends Model {
  static init(sequelize) {
    super.init({
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: () => uuidv4(),
        allowNull: false
      },
      userId: {
        type: DataTypes.INTEGER, // id do usuário no Moodle não relacionado com a tabela user
        allowNull: true,
        field: 'user_id'
      },
      username: {
        type: DataTypes.STRING,
        allowNull: true
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true
      },
      webServiceId: {
        type: DataTypes.UUID,
        allowNull: true,
        field: 'webservice_id'
      },
      tokenUser: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'token_user'
      },
      useToken: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'use_token'
      },
      emailSent: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'email_sent'
      },
      tokenExpiresAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'token_expires_at'
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true
      },
      status: {
        type: DataTypes.ENUM('error', 'success', 'pending'),
        allowNull: true
      }
    }, {
      sequelize,
      modelName: 'Auditing',
      tableName: 'auditing',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    });

    return this;
  }

  static associate(models) {
    if (models.WebService) {
      this.belongsTo(models.WebService, {
        foreignKey: 'webServiceId',
        as: 'webService'
      });
    }
       // Outras associações podem ser definidas aqui
  }
}

module.exports = Auditing;