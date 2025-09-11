const { Model, DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

class WebService extends Model {
  static init(sequelize) {
    super.init({
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: () => uuidv4(),
        allowNull: false
      },
      protocol: {
        type: DataTypes.ENUM('http', 'https'),
        allowNull: false,
        defaultValue: 'https',
        validate: {
          isIn: {
            args: [['http', 'https']],
            msg: 'Protocolo deve ser http ou https'
          }
        }
      },
      url: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'URL é obrigatória'
          },
          len: {
            args: [3, 255],
            msg: 'URL deve ter entre 3 e 255 caracteres'
          }
        }
      },
      token: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
          len: {
            args: [0, 500],
            msg: 'Token deve ter no máximo 500 caracteres'
          }
        }
      },
      // moodleUser: {
      //   type: DataTypes.STRING,
      //   allowNull: false,
      //   field: 'moodle_user',
      //   validate: {
      //     notEmpty: {
      //       msg: 'Usuário Moodle é obrigatório'
      //     },
      //     len: {
      //       args: [2, 100],
      //       msg: 'Usuário Moodle deve ter entre 2 e 100 caracteres'
      //     }
      //   }
      // },
      // moodlePassword: {
      //   type: DataTypes.STRING,
      //   allowNull: false,
      //   field: 'moodle_password',
      //   validate: {
      //     notEmpty: {
      //       msg: 'Senha Moodle é obrigatória'
      //     },
      //     len: {
      //       args: [6, 255],
      //       msg: 'Senha Moodle deve ter pelo menos 6 caracteres'
      //     }
      //   }
      // },
        moodleUser: {
        type: DataTypes.STRING,
        allowNull: true, // Agora opcional
        field: 'moodle_user',
        validate: {
          len: {
            args: [0, 100], // Permite vazio
            msg: 'Usuário Moodle deve ter no máximo 100 caracteres'
          }
        }
      },
      moodlePassword: {
        type: DataTypes.STRING,
        allowNull: true, // Agora opcional
        field: 'moodle_password',
        validate: {
          len: {
            args: [0, 255], // Permite vazio
            msg: 'Senha Moodle deve ter no máximo 255 caracteres'
          }
        }
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'is_active'
      },
      serviceName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'service_name',
        validate: {
          notEmpty: {
            msg: 'Nome do serviço é obrigatório'
          },
          len: {
            args: [2, 100],
            msg: 'Nome do serviço deve ter entre 2 e 100 caracteres'
          }
        }
      },
      route: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: '/webservice/rest/server.php',
        validate: {
          notEmpty: {
            msg: 'Rota é obrigatória'
          },
          len: {
            args: [1, 255],
            msg: 'Rota deve ter entre 1 e 255 caracteres'
          }
        }
      }
    }, {
      sequelize,
      modelName: 'WebService',
      tableName: 'webservices',
      timestamps: true,
      hooks: {
        beforeCreate: (webservice) => {
          if (webservice.url) {
            webservice.url = webservice.url.replace(/^https?:\/\//, '');
          }
          
          if (webservice.route && !webservice.route.startsWith('/')) {
            webservice.route = '/' + webservice.route;
          }
        },
        beforeUpdate: (webservice) => {
          if (webservice.url) {
            webservice.url = webservice.url.replace(/^https?:\/\//, '');
          }
          
          if (webservice.route && !webservice.route.startsWith('/')) {
            webservice.route = '/' + webservice.route;
          }
        }
      }
    });

    return this;
  }

  static associate(models) {
    // Associações futuras aqui
  }

  toJSON() {
    const values = { ...this.get() };
    delete values.moodlePassword;
    return values;
  }
}

module.exports = WebService;