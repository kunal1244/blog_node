const sauto = require('sequelize-auto');
var auto = new sauto('dev', 'manjeet.kumar', 'manjeet13',{
  host: 'dev-mumbai.cyvlbltrfdzs.ap-south-1.rds.amazonaws.com',
  port:'3306',
  camelCase: false,
  tables:[
    'fe_sys_resource_m' 
    ]
});

auto.run(function (err) {
  if (err) throw err;

  console.log(auto.tables); // table list
  console.log(auto.foreignKeys); // foreign key list
});