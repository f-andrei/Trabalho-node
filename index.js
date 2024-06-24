const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const connecta = require('./config/conectaBanco');
const { error } = require('console');


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

    

app.get("/propriedade", (req,res) => {
    res.status(200).render("propriedade");
});

app.post('/cadastroCli', (req,res) => {
    let {nome,sobrenome,email,endereco,cidade, estado,cep} = req.body;
    let cliente = {nome,sobrenome,email,endereco,cidade, estado,cep};
    let query = connecta.query("INSERT INTO clientes SET ? ", cliente, (err) => {
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
            console.error("Erro ao excluir na tabela clientes " + err);
            res.status(500).send("Erro");
            return;
        }
        if (result.affectedRows === 0) {
            res.status(404).send("Cliente não encontrado!");
            return;
        }
        console.log("Cliente excluído");
        res.redirect("/cliente");
    });
});

app.put("/cliente/:id", (req,res) => {
    const cliId = req.params.id;
    console.log("atualizando cliente com id " + cliId);
    res.redirect('/cliente');
});

app.listen(3000, () => {
    console.log("Servidor executado na porta 3000");
});



app.get('/corretor', (req, res) => {
    connecta.query("SELECT * FROM corretor;", (err, results, fields) => {
        if(err){
            console.error("Erro na cosulta" + err);
            res.status(500).render("erro");
            return;
        }
        res.status(200).render("corretor", {corretores: results});
    });
});

app.get("/corretor/cadastraCorretor", (req,res) => {
    res.status(200).render("cadastraCorretor"); 
});


app.post('/corretor/cadastroCorretor', (req,res) => {
    let {nome,email, cpf, telefone, localidade} = req.body;
    let corretor = {nome,email, cpf, telefone, localidade};
    let query = connecta.query("INSERT INTO corretor SET ? ", corretor, (err) => {
        if(err){
            console.error("erro ao inserir na tebela corretor " + err);
            res.status(500).send("Erro");
        }
        console.log("Corretor inserido no banco de dados");
    })
    console.log("Corretor inserido no banco de dados");
    res.status(202).redirect("/corretor");
});


app.delete("/corretor/:id", (req, res) => {
    const corretorId = req.params.id;
    const query = connecta.query("DELETE FROM corretor WHERE id = ?", [corretorId], (err, result) => {
        if (err) {
            console.error("Erro ao excluir corretor " + err);
            res.status(500).send("Erro");
            return;
        }
        if (result.affectedRows === 0) {
            res.status(404).send("Corretor não encontrado!");
            return;
        }
        console.log("Corretor excluído");
        res.redirect("/corretor");
    });
});

app.get("/editarCorretor/:id", (req, res) => {
    const corretorId = req.params.id;
    connecta.query("SELECT * FROM corretor WHERE id = ?", [corretorId], (err, results) => {
        if (err) {
            console.error("Erro na consulta: " + err);
            res.status(500).render("erro");
            return;
        }
        if (results.length === 0) {
            res.status(404).render("erro");
            return;
        }
        res.status(200).render("editarCorretor", { corretor: results[0] });
    });
});

app.put("/corretor/:id", (req, res) => {
    const corretorId = req.params.id;
    let {nome,email, telefone, localidade} = req.body;
    let corretor = {nome,email, telefone, localidade};

    const query = connecta.query("UPDATE corretor SET ? WHERE id = ?", [corretor, corretorId], (err, result) => {
        if (err) {
            console.error("Erro ao atualizar a tabela corretor: " + err);
            res.status(500).send("Erro");
            return;
        }
        if (result.affectedRows === 0) {
            res.status(404).send("Corretor não encontrado!");
            return;
        }
        console.log("Corretor atualizado");
        res.status(200).send("Corretor atualizado");
    });
});