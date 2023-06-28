const express = require('express');// Importando o módulo Express
const sqlite3 = require('sqlite3').verbose(); // Importando o módulo SQLite3
const Rota = express(); // aqui ta criando uma instancia na rota
const cors = require('cors');
const db = new sqlite3.Database(':memory:'); // vai Criar uma instância do banco de dados SQLite em memória

Rota.use(express.json());
Rota.use(cors())

// Criando a tabela "alunos" no banco de dados
//ta adicioanddo uma chave primaria no id
//dai ele adiciona coisas como nome idade e etc não consegui comentar do lado.
db.run(`CREATE TABLE IF NOT EXISTS alunos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,  
  nome TEXT,
  idade INTEGER,
  endereco TEXT,
  curso TEXT,
  email TEXT
)`);

// Rota para cadastrar um novo aluno
Rota.post('/alunos', (req, res) => {

  const aluno = req.body; // aqui ele ta Obtendo o aluno do corpo da requisição
 
  const { nome, idade, endereco, curso, email } = aluno; // Desestruturando o objeto aluno para obter suas propriedades
  db.run(`INSERT INTO alunos (nome, idade, endereco, curso, email) VALUES (?, ?, ?, ?, ?)`,
    [nome, idade, endereco, curso, email],
    function (err) {
      if (err) { //aqui se for um erro 
        console.error(err);
        res.status(500).json({ error: 'Erro ao cadastrar aluno.' });//Aqui vai Retornar um erro 500 em formato JSON em caso de erro
      } else {
        res.json({ id: this.lastID, ...aluno });
      }
    }
  );//aqui ele ta mandando na instancia do banco de dados com o comando insert dai ele tem uma garantia se der erro 
});

// Rota para consultar informações de um aluno específico
Rota.get('/alunos/:id', (req, res) => {
  const id = req.params.id;
  db.get(`SELECT * FROM alunos WHERE id = ?`, [id], (err, row) => {//aqui faz um select no banco de dados com um get
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Erro ao consultar aluno.' });
    } else if (row) {
      res.json(row);
    } else {
      res.json({ log: 'Aluno não encontrado.' });
    }
  });
});

// Rota para atualizar informações de um aluno
Rota.put('/alunos/:id', (req, res) => {
  const id = req.params.id;
  const aluno = req.body;
  const { nome, idade, endereco, curso, email } = aluno;
  db.run(`UPDATE alunos SET nome = ?, idade = ?, endereco = ?, curso = ?, email = ? WHERE id = ?`,
    [nome, idade, endereco, curso, email, id],
    function (err) {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao atualizar aluno.' });
      } else if (this.changes > 0) {
        res.json({ id, ...aluno });
      } else {
        res.status(404).json({ error: 'Aluno não encontrado.' });
      }
    }
  );
});

// Rota para remover um aluno
Rota.delete('/alunos/:id', (req, res) => {
  
  const id = req.params.id;
  db.run(`DELETE FROM alunos WHERE id = ?`, [id], function (err) {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Erro ao remover aluno.' });
    } else if (this.changes > 0) {
      res.json({ id });
    } else {
      res.status(404).json({ error: 'Aluno não encontrado.' });
    }
  });
});

// Rota para listar todos os alunos
Rota.get('/alunos', (req, res) => {
  db.all(`SELECT * FROM alunos`, (err, rows) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Erro ao listar alunos.' });
    } else {
      res.json(rows);
    }
  });
});

// Iniciar o servidor
const port = 8080;
Rota.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
