const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const connecta = require('./config/conectaBanco');

const app = express();
app.set("view engine","ejs")
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

app.get("/", (req,res) => {
    res.status(200).render("home");
});

app.get("/cliente", (req,res) => {
    connecta.query("SELECT * FROM clientes;", (err, results, fields) => {
        if(err){
            console.error("Erro na cosulta" + err);
            res.status(500).render("erro");
            return;
        }
        res.status(200).render("cliente", {clientes: results});
    });
});

app.get("/cadastraCliente", (req,res) => {
    res.status(200).render("cadastraCliente");
});

app.get("/corretor", (req,res) => {
    res.status(200).render("corretor");
    
});

app.get("/anunciar-imovel", (req,res) => {
    res.status(200).render("propriedade");
});

app.post('/cadastroCli', (req,res) => {
    const {nome,sobrenome,cpf,email, telefone, endereco,cidade, estado,cep} = req.body;
    const cliente = {nome,sobrenome,cpf,email, telefone, endereco,cidade, estado,cep};
    const query = connecta.query("INSERT INTO clientes SET ? ", cliente, (err) => {
        if(err){
            console.error("erro ao inserir na tebela clientes " + err);
            res.status(500).send("Erro");
        }
        console.log("Cliente inserido no banco de dados");
    })
    console.log("Cliente inserido no banco de dados");
    res.status(202).redirect("/cliente");
});

app.delete("/cliente/:id", (req, res) => {
    const cliId = req.params.id;
    const query = connecta.query("DELETE FROM clientes WHERE id = ?", [cliId], (err, result) => {
        if (err) {
            console.error("Erro ao excluir na tabela clientes: " + err);
            res.status(500).send("Erro");
            return;
        }
        if (result.affectedRows === 0) {
            res.status(404).send("Cliente não encontrado!");
            return;
        }
        console.log("Cliente excluído");
        res.status(200).send("Cliente excluído");
    });
});

app.get("/editarCliente/:id", (req, res) => {
    const cliId = req.params.id;
    connecta.query("SELECT * FROM clientes WHERE id = ?", [cliId], (err, results) => {
        if (err) {
            console.error("Erro na consulta: " + err);
            res.status(500).render("erro");
            return;
        }
        if (results.length === 0) {
            res.status(404).render("erro");
            return;
        }
        res.status(200).render("editarCliente", { cliente: results[0] });
    });
});

app.put("/cliente/:id", (req, res) => {
    const cliId = req.params.id;
    const { nome, sobrenome, email, endereco, telefone, cidade, estado, cep } = req.body;
    const cliente = { nome, sobrenome, email, telefone, endereco, cidade, estado, cep };

    const query = connecta.query("UPDATE clientes SET ? WHERE id = ?", [cliente, cliId], (err, result) => {
        if (err) {
            console.error("Erro ao atualizar a tabela clientes: " + err);
            res.status(500).send("Erro");
            return;
        }
        if (result.affectedRows === 0) {
            res.status(404).send("Cliente não encontrado!");
            return;
        }
        console.log("Cliente atualizado");
        res.status(200).send("Cliente atualizado");
    });
});

app.listen(3000, () => {
    console.log("Servidor executado na porta 3000");
});