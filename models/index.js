const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(module.filename);
const env = process.env.NODE_ENV || 'development';
const config = require(`${__dirname}/../config/config.json`)[env];
const db = {};
const match = "postgres://hpgosguazhffka:c0e74d569ce7460a8d4f885e8a26fb5e1a7193ae6184b4dc4adf1361f0080971@ec2-54-197-239-115.compute-1.amazonaws.com:5432/d85nvtpdtuk40f".match(/postgres:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/)

console.log(match);

let sequelize;
// if (config.use_env_variable) {
//     sequelize = new Sequelize(process.env[config.use_env_variable]);
// } 
if (env == 'production') {
    sequelize = new Sequelize(match[5], match[1], match[2], {
        dialect:  'postgres',
        protocol: 'postgres',
        port:     match[4],
        host:     match[3],
        logging:  false
      });
} 
else {
    sequelize = new Sequelize(
        config.database, config.username, config.password, config
    );
}

fs
    .readdirSync(__dirname)
    .filter(file =>
        (file.indexOf('.') !== 0) &&
        (file !== basename) &&
        (file.slice(-3) === '.js'))
    .forEach(file => {
        const model = sequelize.import(path.join(__dirname, file));
        db[model.name] = model;
    });

Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;