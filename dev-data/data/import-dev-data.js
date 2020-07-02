const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const Tour = require('./../../models/tourModel');

dotenv.config({ path: './config.env' });
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

// READ JSON FILE
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8')
);

// IMPORT DATA INTO DATABASE
const importData = async () => {
  try {
    await Tour.create(tours);
    console.log('Data successfully loaded!');
  } catch (err) {
    console.log(err);
  }

  process.exit(); // uygulamayı doğru sonlandırmak için çok uygun bir yöntem değil.
};

// DELETE ALL DATA FROM DB COLLECTION
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('Data successfully deleted!');
  } catch (err) {
    console.log(err);
  }

  process.exit();
};

if (process.argv[2] === '--import') importData();
else if (process.argv[2] === '--delete') deleteData();

console.log(process.argv);
