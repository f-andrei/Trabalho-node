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
    connecta.query("SELECT * FROM cliente;", (err, results, fields) => {
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



//Gustavo - Propriedade
app.get('/propriedade', (req, res) => {
    connecta.query('SELECT * FROM propriedade', (err, result) => {
        if (err) {
            console.error('Erro ao consultar propriedades:', err);
            res.status(500).send('Erro ao consultar propriedades');
            return;
        }
        
        res.render('propriedade', { propriedades: result });
    });
});

app.get('/cadastraPropriedade', (req, res) => {
    const queryClientes = 'SELECT id, nome, sobrenome FROM cliente';
    const queryCorretores = 'SELECT id, nome FROM corretor';

    connecta.query(queryClientes, (err, clientes) => {
        if (err) {
            console.error('Erro ao buscar clientes:', err);
            res.status(500).send('Erro ao buscar dados dos clientes no banco de dados.');
            return;
        }

        connecta.query(queryCorretores, (err, corretores) => {
            if (err) {
                console.error('Erro ao buscar corretores:', err);
                res.status(500).send('Erro ao buscar dados dos corretores no banco de dados.');
                return;
            }

            res.render('cadastraPropriedade', { clientes, corretores });
        });
    });
});

app.post('/cadastraPropriedade', (req, res) => {
    const { valor, rua, numero, bairro, cidade, estado, pais, cep, tipo, area_m2, disponibilidade, cliente_id, corretor_id } = req.body;
    const propriedade = { valor, rua, numero, bairro, cidade, estado, pais, cep, tipo, area_m2, disponibilidade, cliente_id, corretor_id };

    connecta.query('INSERT INTO propriedade SET ?', propriedade, (err, result) => {
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

    connecta.query("DELETE FROM propriedade WHERE id = ?", propriedadeId, (err, result) => {
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
    
    connecta.query('SELECT * FROM propriedade WHERE id = ?', [propriedadeId], (err, result) => {
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


app.get("/vendas", (req, res) => {
    res.status(200).render("venda/venda");
});


app.get("/criar-venda", (req, res) => {
    connecta.query("SELECT * FROM cliente;", (err, clientesResults) => {
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
                SELECT propriedade.*, cliente.nome, cliente.sobrenome
                FROM propriedade
                JOIN cliente ON propriedade.cliente_id = cliente.id;
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
               propriedade.rua AS propriedade_rua,
               propriedade.numero AS propriedade_numero,
               propriedade.bairro AS propriedade_bairro,
               propriedade.tipo AS propriedade_tipo
        FROM venda
        JOIN cliente AS comprador ON venda.cliente_id = comprador.id
        JOIN cliente AS dono ON venda.dono_id = dono.id
        JOIN corretor ON venda.corretor_id = corretor.id
        JOIN propriedade ON venda.propriedade_id = propriedade.id;
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
            id: row.id,
            valor: row.valor,
            forma_pagamento: row.forma_pagamento,
            qtd_parcelas: row.qtd_parcelas,
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
    res.status(202).redirect("/listar-vendas");
});


app.get("/editar-venda/:id", (req, res) => {
    id = req.params.id;
    connecta.query("SELECT * FROM venda WHERE id = ?", [id], (err, vendaResults) => {
        if (err) {
            console.error("Erro na consulta: " + err);
            res.status(500).render("erro");
            return;
        }
        connecta.query("SELECT nome FROM cliente WHERE id = ?", [vendaResults[0].cliente_id], (err, clienteResults) => {
            if (err) {
                console.error("Erro na consulta: " + err);
                res.status(500).render("erro");
                return;
            }
            connecta.query("SELECT nome FROM cliente WHERE id = ?", [vendaResults[0].dono_id], (err, donoResults) => {
                if (err) {
                    console.error("Erro na consulta: " + err);
                    res.status(500).render("erro");
                    return;
                }
                connecta.query("SELECT * FROM cliente", (err, clientesResults) => {
                    if (err) {
                        console.error("Erro na consulta: " + err);
                        res.status(500).render("erro");
                        return;
                    }

                    connecta.query("SELECT nome FROM corretor WHERE id = ?", [vendaResults[0].corretor_id], (err, corretorResults) => {
                        if (err) {
                            console.error("Erro na consulta: " + err);
                            res.status(500).render("erro");
                            return;
                        }
                        connecta.query("SELECT * FROM corretor", (err, corretoresResults) => {
                            if (err) {
                                console.error("Erro na consulta: " + err);
                                res.status(500).render("erro");
                                return;
                            }
                            connecta.query("SELECT rua, numero, bairro, tipo FROM propriedade WHERE id = ?", [vendaResults[0].propriedade_id], (err, propriedadeResults) => {
                                if (err) {
                                    console.error("Erro na consulta: " + err);
                                    res.status(500).render("erro");
                                    return;
                                }
                                connecta.query("SELECT * FROM propriedade", (err, propriedadesResults) => {
                                    if (err) {
                                        console.error("Erro na consulta: " + err);
                                        res.status(500).render("erro");
                                        return;
                                    }
                                    res.status(200).render("venda/editarVenda", {
                                        venda: vendaResults[0],
                                        cliente: clienteResults[0],
                                        clientes: clientesResults,
                                        dono: donoResults[0],
                                        corretor: corretorResults[0],
                                        corretores: corretoresResults,
                                        propriedade: propriedadeResults[0],
                                        propriedades: propriedadesResults
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});

app.put('/propriedade/:id', (req, res) => {
    const propriedadeId = req.params.id;
    const dadosAtualizados = req.body;

    connecta.query('UPDATE propriedade SET ? WHERE id = ?', [dadosAtualizados, propriedadeId], (err, result) => {
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

app.put("/edita-venda/:id", (req, res) => {
    let id = req.params.id;
    let { propriedade_id, dono_id, cliente_id, corretor_id, valor, forma_pagamento, qtd_parcelas } = req.body;
    let venda = { propriedade_id, dono_id, cliente_id, corretor_id, valor, forma_pagamento, qtd_parcelas };

    connecta.query("UPDATE venda SET ? WHERE id = ?", [venda, id], (err) => {
        if (err) {
            console.error("Erro ao atualizar na tabela vendas: " + err);
            return res.status(500).send("Erro ao atualizar a venda");
        }
        console.log("Venda atualizada no banco de dados");
        res.status(202).send("Venda atualizada com sucesso");
    });
});


app.delete("/venda/:id", (req, res) => {
    let id = req.params.id;
    connecta.query("DELETE FROM venda WHERE id = ?", [id], (err) => {
        if (err) {
            console.error("Erro ao excluir na tabela vendas: " + err);
            return res.status(500).send("Erro ao excluir a venda");
        }
        console.log("Venda excluída do banco de dados");
        res.status(202).send("Venda excluída com sucesso");
    });
});


app.post('/cadastroCli', (req,res) => {
    const {nome,sobrenome,cpf,email, telefone, endereco,cidade, estado,cep} = req.body;
    const cliente = {nome,sobrenome,cpf,email, telefone, endereco,cidade, estado,cep};
    const query = connecta.query("INSERT INTO cliente SET ? ", cliente, (err) => {
        if(err){
            console.error("erro ao inserir na tebela cliente " + err);
            res.status(500).send("Erro");
        }
        console.log("Cliente inserido no banco de dados");
    })
    console.log("Cliente inserido no banco de dados");
    res.status(202).redirect("/cliente");
});


app.delete("/cliente/:id", (req, res) => {
    const cliId = req.params.id;
    const query = connecta.query("DELETE FROM cliente WHERE id = ?", [cliId], (err, result) => {
        if (err) {
            console.error("Erro ao excluir na tabela cliente: " + err);
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
    connecta.query("SELECT * FROM cliente WHERE id = ?", [cliId], (err, results) => {
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

    const query = connecta.query("UPDATE cliente SET ? WHERE id = ?", [cliente, cliId], (err, result) => {
        if (err) {
            console.error("Erro ao atualizar a tabela cliente: " + err);
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

app.get('/relatorio', (req, res) => {
    connecta.query(`SELECT c.nome AS corretor_nome,
        COUNT(v.id) AS total_vendas, 
        SUM(v.valor) AS total_valor_vendas
        FROM venda v 
        JOIN corretor c 
        ON v.corretor_id = c.id 
        GROUP BY c.nome;`, 
        (err, totalVendas) => {
            if(err){
                console.error("Erro: " + err);
                res.status(500).send("Erro");
                return;
            }
            connecta.query(`SELECT forma_pagamento, 
                COUNT(*) AS total_vendas, 
                SUM(valor) AS total_valor
                FROM venda
                GROUP BY forma_pagamento;`, (err, formaPagamento) =>{
                    if(err){
                        console.error("Erro: " + err);
                        res.status(500).send("Erro forma pagamento");
                        return;
                    }
                    res.status(200).render('relatorio', {totalVendas, formaPagamento});
                });
    });
});