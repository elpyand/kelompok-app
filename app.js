const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const multer = require('multer');

const app = express();

const db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'kelompokuser',
    password: 'passwordku',
    database: 'kelompokdb'
});
db.connect();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layout');
app.use(expressLayouts);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Konfigurasi upload foto
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/uploads'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

app.get('/', (req, res) => {
  db.query('SELECT * FROM anggota', (err, result) => {
    res.render('index', { anggota: result });
  });
});

app.get('/tambah', (req, res) => {
  res.render('tambah');
});

app.post('/tambah', upload.single('foto'), (req, res) => {
  const { nama } = req.body;
  const foto = req.file ? '/uploads/' + req.file.filename : null;
  db.query('INSERT INTO anggota (nama, foto) VALUES (?, ?)', [nama, foto], () => {
    res.redirect('/');
  });
});

app.get('/edit/:id', (req, res) => {
  const id = req.params.id;
  db.query('SELECT * FROM anggota WHERE id = ?', [id], (err, result) => {
    res.render('edit', { anggota: result[0] });
  });
});

app.post('/edit/:id', upload.single('foto'), (req, res) => {
  const id = req.params.id;
  const { nama } = req.body;
  if (req.file) {
    const foto = '/uploads/' + req.file.filename;
    db.query('UPDATE anggota SET nama = ?, foto = ? WHERE id = ?', [nama, foto, id], () => {
      res.redirect('/');
    });
  } else {
    db.query('UPDATE anggota SET nama = ? WHERE id = ?', [nama, id], () => {
      res.redirect('/');
    });
  }
});

app.get('/delete/:id', (req, res) => {
  const id = req.params.id;
  db.query('DELETE FROM anggota WHERE id=?', [id], (err) => {
    if (err) throw err;
    res.redirect('/');
  });
});

app.listen(3000, () => console.log('Server jalan di http://localhost:3000'));
