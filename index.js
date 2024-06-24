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



//Gustavo - Propriedade
app.get('/propriedade', (req, res) => {
    connecta.query('SELECT * FROM Propriedades', (err, result) => {
        if (err) {
            console.error('Erro ao consultar propriedades:', err);
            res.status(500).send('Erro ao consultar propriedades');
            return;
        }
        
        res.render('propriedade', { propriedades: result });
    });
});

app.get('/cadastraPropriedade', (req, res) => {
    res.status(200).render('cadastraPropriedade');
});

app.post('/cadastraPropriedade', (req, res) => {
    const { valor, rua, numero, bairro, cidade, estado, pais, cep, tipo, area_m2, disponibilidade } = req.body;
    const propriedade = { valor, rua, numero, bairro, cidade, estado, pais, cep, tipo, area_m2, disponibilidade };

    connecta.query('INSERT INTO Propriedades SET ?', propriedade, (err, result) => {
        if (err) {
            console.error('Erro ao cadastrar propriedade:', err);
            res.status(500).send('Erro ao cadastrar propriedade');
            return;
        }
        console.log('Propriedade cadastrada com sucesso.');
        res.status(202).redirect('/propriedade');
    });
});

app.delete("/propriedade/:id", (req, res) => {
    const propriedadeId = req.params.id;

    connecta.query("DELETE FROM Propriedades WHERE id = ?", propriedadeId, (err, result) => {
        if (err) {
            console.error("Erro ao excluir propriedade:", err);
            res.status(500).send("Erro ao tentar excluir a propriedade");
            return;
        }

        if (result.affectedRows === 0) {
            res.status(404).send("Propriedade não encontrada");
            return;
        }

        console.log("Propriedade excluída com sucesso");
        res.status(200).send("Propriedade excluída com sucesso");
    });
});

app.get('/atualizaPropriedade/:id', (req, res) => {
    const propriedadeId = req.params.id;
    
    connecta.query('SELECT * FROM Propriedades WHERE Id = ?', [propriedadeId], (err, result) => {
        if (err) {
            console.error('Erro ao consultar propriedade:', err);
            res.status(500).send('Erro ao consultar propriedade');
            return;
        }

        if (result.length === 0) {
            res.status(404).send('Propriedade não encontrada');
            return;
        }

        res.render('atualizaPropriedade', { propriedade: result[0] });
    });
});

app.put('/propriedade/:id', (req, res) => {
    const propriedadeId = req.params.id;
    const dadosAtualizados = req.body;

    connecta.query('UPDATE Propriedades SET ? WHERE Id = ?', [dadosAtualizados, propriedadeId], (err, result) => {
        if (err) {
            console.error('Erro ao atualizar propriedade:', err);
            res.status(500).send('Erro ao atualizar propriedade');
            return;
        }

        if (result.affectedRows === 0) {
            res.status(404).send('Propriedade não encontrada');
            return;
        }

        console.log('Propriedade atualizada com sucesso');
        res.status(200).send('Propriedade atualizada com sucesso');
    });
});
// - - - -- - - - - -



  



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