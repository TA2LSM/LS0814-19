const Tour = require('../models/tourModel');
const { getFileInfo } = require('prettier');

//MIDDLEWARE. 3. parametre her zaman "next" olacak. Çıkışta da next(); demek zorundayız. Yoksa kod takılır.
//birisi /top-5-cheap olarak istekte bulunursa aşağıdaki parametreler query objesine yerleştirilir ve
//getAllTours() fonksiyonu bu parametrelere göre çalışır.
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';

  next();
};

exports.getAllTours = async (req, res) => {
  try {
    console.log(req.query);

    // BUILD QUERY
    // 1A) Filtering

    // hard copy alındı
    const queryObj = { ...req.query }; //... ile distructor işlemi yapılıp, {} ile yeni obje oluşturuldu.
    const excludedFields = ['page', 'sort', 'limit', 'fields'];

    excludedFields.forEach((el) => delete queryObj[el]); //page için mesela queryObj[page] olan yerleri siler

    //console.log(req.query, queryObj);

    // 1B) Advanced Filtering
    let queryStr = JSON.stringify(queryObj);

    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    //\b ile tam eşleşme /g ile ilk bulduğu yerden sonra aramaya devam ettirilir.
    //replace işlevinin callback fonksiyonu vardır. ${match} kısmı bulunan değer biz başına $ ekledik. ondan iki $ var.

    //console.log(JSON.parse(queryStr));
    // { difficulty: 'easy', duration: { gte: '5' } }
    // { difficulty: 'easy', duration: { $gte: 5} } }  üsttekini buna çevirmek için uğraştık.

    //.find() metodu promise döner. Aynı zamanda da query döner
    //bir kere await ile beklenirse sort gibi işlevler yapılamaz. Bu nedenle
    //bulanacak ve tours içine kaydedilecek veriler için aşağıda const tours = await query; kullanıldı.
    let query = Tour.find(JSON.parse(queryStr));

    // 2) Sorting
    if (req.query.sort) {
      //her bir sort parametresi ayrılır ve dizi olarak depolanır.
      //join ile aralarında boşluk olacak şekilde tekrar birleştirilir.
      const sortBy = req.query.sort.split(',').join(' ');

      query = query.sort(sortBy);
    } else {
      //eğer herhangi bir sort parametresi gelmezse default olarak en son yaratılan dökümanı önce listeleyecek
      query = query.sort('-createdAt');
    }

    // 3) Field Limiting
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' '); //(name duration difficulty price) gibi alanları alacak

      query = query.select(fields);
    } else {
      //mongoDB'nin kendi içinde kullandığı "__v:0" değerlerini geri dönecek data'dan çıkartır
      //sadece __v:0 alanları çıkartılır. diğer herşey aynen kalır
      query = query.select('-__v');
    }

    // 4) Pagination
    //string'i sayıya çevirmek için kısa yol 1 ile çarpmak
    //eğer ki page parametresi gelmezse diye "|| 1" ile default olarak 1 yapılıyor.
    const page = req.query.page * 1 || 1;

    //eğer ki limit parametresi gelmezse diye "|| 100 ile default olarak 100 yapılıyor.
    const limit = req.query.limit * 1 || 100;

    const skip = (page - 1) * limit;

    // page=2&limit=10 >> 1-10 on page 1, 11-20 on page2, 21-30 on page 3
    // query = query.skip(page).limit(limit); //eğer 3. sayfa istenirse ve limit 10 ise skip(20) olması lazım
    query = query.skip(skip).limit(limit);

    if (req.query.page) {
      const numTours = await Tour.countDocuments();

      // try bloğu içinde olduğumuzdan hata fırlatılırsa direkt olarak catch bloğuna dallanılır.
      if (skip >= numTours) throw new Error('This page does not exist!');
    }

    // EXECUTE QUERY
    const tours = await query;

    // SEND RESPONSE
    res.status(200).json({
      status: 'success', //success, fail, error
      results: tours.length, //json standardında bu alan genelde olmaz ama client tarafında işe yarayabilir diye yollanıyor
      data: {
        //tours: tours, //ES6'de aynı isimlileri yazmaya gerek yok ama standart olarak yazılabilir.
        tours,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id); //buradaki "id" tourRoutes içindeki .route('/:id') kısmından geliyor
    // Tour.findOne({ _id: req.params.id })

    res.status(200).json({
      status: 'success', //success, fail, error
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

//create a new tour (client to server)
exports.createTour = async (req, res) => {
  try {
    //-----------------------
    // aşağıdaki iki ayrı kısım sonuçta aynı işi yapıyor aslında ama tamamen farklı şekillerde...

    // save methodu direkt yeni Tour dokümanı üzerine uygulanıyor.
    // const newTour = new Tour({...});
    // newTour.save();

    // create methodu direkt Tour modeli üzerine uygulanıyor. (promise döner) then() kullanmamak
    // için createTour fonksiyonunu yukarıda async yaptık.
    //Tour.create({}).then();
    const newTour = await Tour.create(req.body); // bu promise "rejected" olursa catch kısmına atlanır !!!
    //-----------------------

    // 200 kodu "ok", 201 kodu "created", 404 "not found" demek
    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    // catch her zaman err objesine erişir. Hata yakalama bloğudur.
    res.status(400).json({
      //400: bad request
      status: 'fail',
      //message: err,
      message: 'Invalid data sent!', //bu tip bir mesaj, gerçek bir uygulama için önerilmez !!!
    });
  }

  /** aşağıdaki gibi "post" request'i çekilirse gelen cevapta "difficulty" ve "rating" olmayacak.
   *  nedeni ise şemada bu alanların olmaması. Bu alanlar "ignore" edilir yani dikkate alınmaz.
  {
    "name": "Test Tour 2",
    "duration": 5,
    "difficulty": "easy",
    "price": 100,
    "rating": 4.7
  }
  */
};

// Update Tour
exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // return the modified document,
      runValidators: true, // Örn: sayı yerine metin girilmeye çalışılırsa hata verdirir. Şemada tip olarak ne dediysek o olsun diye.
    });

    res.status(200).json({
      status: 'success',
      data: {
        //tour: tour,
        // "tour" property is set to "tour" object. In ES6 this will be no more needed if names are same. like below.
        tour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

// Delete Tour. REST API'de delete için client'e cevap dönülmemesi önerilir.
exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);

    // 204 kodu "no content" demek. Standart gibi bir şey
    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

//exports. şeklinde yazılan fonksiyonlar dosya dışına erişime açılmış demektir.
