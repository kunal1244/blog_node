const encryption = require("../routes/encryption");
module.exports = function (sequelize, DataTypes) {

    const User = sequelize.define('User', {
            email: {type: DataTypes.STRING, required: true, unique: true, allowNull: false},
            passwordHash: {type: DataTypes.STRING, required: true},
            fullName: {type: DataTypes.STRING, required: true},
            salt: {type: DataTypes.STRING, required: true},
            resetPasswordToken: {type: DataTypes.TEXT,allowNull: true},
            resetPasswordExpires: {type: DataTypes.DATE,allowNull: true}

        }, {timestamps: false}
    );

    User.prototype.authenticate = function (password) {
        return encryption.hashPassword(password, this.salt) === this.passwordHash;
    };


    User.associate =  (models) => {
        User.hasMany(models.Article,{
            foreignKey:'authorId',
            as: 'articles',
        });
    };

    return User;
};



