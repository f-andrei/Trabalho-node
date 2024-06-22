const mysql = require('mysql');

const connecta = mysql.createConnection({
   host: "localhost",
   user: "root",
   password: "admin",
   database: "banco"
});

connecta.connect((err) =>{
    if(err){
        console.log("Erro ao conectar no banco de dados " + err);
        return;
    }
    console.log("Conexão realizada com o MYSQL!! com o id: " + connecta.threadId);
});

module.exports = connecta;