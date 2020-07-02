const mongoose = require('mongoose');
const dotenv = require('dotenv');

// bu kısım API ile ilgili istekleri gösteren kısım. Yerlerşimini "./app" kısmından önce yapmak lazım.
dotenv.config({ path: './config.env' });

//burası yukardaki satırdan sonra gelmeli ki config.env işledikten sonra o değişkenlerle
//beraber bu dosyaya gelinebilsin.
const app = require('./app');

//node.js'in çok daha fazla environment variable seçeneği var
//console.log(process.env);
//console.log(app.get('env')); //development mode activated by express

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

//bu bağlantı kodu geriye bir promise döner.
mongoose
  //.connect(process.env.DATABASE_LOCAL, {
  .connect(DB, {
    //bu parametreler şu an için önemli değil. Genel kullanım bu şekilde.
    //detay için araştırma yapılabilir.
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true, //mongoose uyarı verdiği için bu satır eklendi. (Kursta yok)
  })
  //con değişkeni promis'in resolve değeri olacak
  // .then((con) => {
  //   console.log(con.connections);
  //   console.log('DB connection successful!');
  // });
  .then(() => console.log('DB connection successful!'));

const port = process.env.PORT || 8000; //process.env.PORT varsa o değeri yoksa 8000'i alır.

app.listen(port, () => {
  console.log(`App running on port ${port}...`); //buradaki tırnak işaretleri Alt Gr ile basılan ;'den geliyor
});
