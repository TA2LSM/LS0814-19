const mongoose = require('mongoose');

//--- Şema oluşturma ----------
const toursSchema = new mongoose.Schema({
  //name: String,
  //rating: Number,
  //price: Number,
  name: {
    type: String,
    //required: true,
    //Aşağıdaki için ilk parametre required için olması gereken değer, ikincisi hata olursa görüntülenecek mesaj
    required: [true, 'A tour must have a name!'], // <-- validator
    unique: true, //Her tur ismi özel olmalıdır. Aynı isimli tur olamaz.
    trim: true,
  }, //Schema Type Options Object
  duration: {
    type: Number,
    required: [true, 'A tour must have a duration!'],
  },
  maxGroupSize: {
    type: Number,
    required: [true, 'A tour must have a group size!'],
  },
  difficulty: {
    type: String,
    required: [true, 'A tour must have a dificulty!'],
  },
  ratingsAverage: {
    type: Number,
    default: 4.5, //eğer rating değeri oluşturma sırasında boş bırakılırsa bu değer otomatik atanır
  },
  ratingsQuantity: {
    type: Number,
    default: 0,
  },
  price: {
    type: Number,
    required: [true, 'A tour must have a price!'],
  },
  priceDiscount: Number,
  summary: {
    type: String,
    trim: true, //baştaki ve sondaki boşlukları siler
    required: [true, 'A tour must have a summary!'],
  },
  description: {
    type: String,
    trim: true,
  },
  imageCover: {
    type: String,
    required: [true, 'A tour must have a cover image!'],
  },
  images: [String], // String array
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false, //bu bilgi eklenecek ama kullanıcı sorgu çekince ona yollanmayacak *****
  },
  startDates: [Date], // date format array
});

//--- Şemadan model oluşturma ----------
//ilk harfi büyük olarak özellikle yazılıyor ki "model" olarak tanımlandığı anlaşılsın.
//parametre olan Tour modelin ismi, ikinci parametre ise kullanılacak şema.
const Tour = mongoose.model('Tour', toursSchema);

/*
// Modelden döküman oluşturmak
// const testTour = new Tour({
//   name: 'The Forest Hiker',
//   rating: 4.7,
//   price: 497,
// });

//ValidatorError: A tour must have a price! verecek çünkü price->required olarak ayarlı idi
// const testTour = new Tour({
//   name: 'The Park Camper',
// });

//rating: 4.5 olarak ayarlanacak. rating key'i olmadığı için "default" değer atandı. (şemadan geliyor)
const testTour = new Tour({
  name: 'The Park Camper',
  price: 997,
});

// testTour dökümanı "save" methodu ile database'e kaydedilir. save(), promise döner.
testTour
  .save()
  .then((doc) => {
    console.log(doc);
  })
  .catch((err) => {
    console.log('ERROR: ', err);
  });
//aynı döküman tekrar kaydedilmek istenirse şemadaki "name->unique" özelliğinden dolayı hata verecektir.
*/

module.exports = Tour;
