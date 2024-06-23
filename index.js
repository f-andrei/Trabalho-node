const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const connecta = require('./config/conectaBanco');

const app = express();
app.set("view engine","ejs")
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));


app.get("/", (req, res) => {
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


app.get("/vendas", (req, res) => {
    res.status(200).render("venda/venda");
});


app.get("/criar-venda", (req, res) => {
    connecta.query("SELECT * FROM clientes;", (err, clientesResults) => {
        if (err) {
            console.error("Erro na consulta: " + err);
            res.status(500).render("erro");
            return;
        }

        connecta.query("SELECT * FROM corretor;", (err, corretoresResults) => {
            if (err) {
                console.error("Erro na consulta: " + err);
                res.status(500).render("erro");
                return;
            }

            connecta.query(`
                SELECT Propriedade.*, clientes.nome, clientes.sobrenome
                FROM Propriedade
                JOIN clientes ON Propriedade.cliente_ID = clientes.id;
            `, (err, propriedadesResults) => {
                if (err) {
                    console.error("Erro na consulta: " + err);
                    res.status(500).render("erro");
                    return;
                }

                res.status(200).render("venda/criarVenda", {
                    clientes: clientesResults,
                    corretores: corretoresResults,
                    propriedades: propriedadesResults
                });
            });
        });
    });
});


app.get("/listar-vendas", (req, res) => {
    const query = `
        SELECT venda.*, 
               comprador.nome AS comprador_nome, 
               comprador.sobrenome AS comprador_sobrenome,
               dono.nome AS dono_nome, 
               dono.sobrenome AS dono_sobrenome,
               corretor.nome AS corretor_nome,
               Propriedade.rua AS propriedade_rua,
               Propriedade.numero AS propriedade_numero,
               Propriedade.bairro AS propriedade_bairro,
               Propriedade.tipo AS propriedade_tipo
        FROM venda
        JOIN clientes AS comprador ON venda.cliente_id = comprador.id
        JOIN clientes AS dono ON venda.dono_id = dono.id
        JOIN corretor ON venda.corretor_id = corretor.id
        JOIN Propriedade ON venda.propriedade_id = Propriedade.Id;
    `;

    connecta.query(query, (err, results) => {
        if (err) {
            console.error("Erro na consulta: " + err);
            res.status(500).render("erro");
            return;
        }

        const vendas = results.map(row => ({
            comprador: { nome: row.comprador_nome, sobrenome: row.comprador_sobrenome },
            dono: { nome: row.dono_nome, sobrenome: row.dono_sobrenome },
            corretor: { nome: row.corretor_nome },
            propriedade: {
                rua: row.propriedade_rua,
                numero: row.propriedade_numero,
                bairro: row.propriedade_bairro,
                tipo: row.propriedade_tipo
            },
            valor: row.valor,
            forma_pagamento: row.forma_pagamento,
            qtd_parcelas: row.qtd_parcelas,
            data_venda: row.data_venda
        }));

        res.status(200).render("venda/listarVenda", { vendas: vendas });
    });
});


app.post("/venda", (req, res) => {
    let {propriedade_id, dono_id, cliente_id, corretor_id, valor, forma_pagamento, qtd_parcelas} = req.body;
    let venda = {propriedade_id, dono_id, cliente_id, corretor_id, valor, forma_pagamento, qtd_parcelas};
    let query = connecta.query("INSERT INTO venda SET ?", venda, (err) => {
        if(err){
            console.error("Erro ao inserir na tabela vendas " + err);
            res.status(500).send("Erro");
            return;
        }
        console.log("Venda inserida no banco de dados");
    });
    res.status(202).redirect("/criar-venda");
});


app.post('/cadastroCli', (req,res) => {
    const {nome,sobrenome,email,endereco,cidade, estado,cep} = req.body;
    const cliente = {nome,sobrenome,email,endereco,cidade, estado,cep};
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