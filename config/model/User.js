const { Model, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

class User extends Model {
  static init(sequelize) {
    super.init({
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'Nome é obrigatório'
          },
          len: {
            args: [2, 100],
            msg: 'Nome deve ter entre 2 e 100 caracteres'
          }
        }
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: {
          msg: 'Este email já está em uso'
        },
        validate: {
          isEmail: {
            msg: 'Email deve ter um formato válido'
          },
          notEmpty: {
            msg: 'Email é obrigatório'
          }
        }
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'Senha é obrigatória'
          },
          len: {
            args: [6, 255],
            msg: 'Senha deve ter pelo menos 6 caracteres'
          }
        }
      },
      role: {
        type: DataTypes.ENUM('user', 'admin'),
        allowNull: false,
        defaultValue: 'user',
        validate: {
          isIn: {
            args: [['user', 'admin']],
            msg: 'Role deve ser user ou admin'
          }
        }
      }
    }, {
      sequelize,
      modelName: 'User',
      tableName: 'users',
      timestamps: true,
      hooks: {
        beforeCreate: async (user) => {
          if (user.password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
          }
          if (user.email) {
            user.email = user.email.toLowerCase();
          }
        },
        beforeUpdate: async (user) => {
          if (user.changed('password')) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
          }
          if (user.email) {
            user.email = user.email.toLowerCase();
          }
        }
      }
    });

    return this;
  }

  static associate(models) {
    // Definir associações aqui quando necessário
  }

  checkPassword(password) {
    return bcrypt.compare(password, this.password);
  }

  toJSON() {
    const values = { ...this.get() };
    delete values.password;
    return values;
  }
}

module.exports = User;