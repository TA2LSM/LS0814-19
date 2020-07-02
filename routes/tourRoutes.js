const express = require('express');

// tourController obje olarak tüm exports'ları almış oluyor. tourController.getAllTours(); şeklinde erişilebilir.
const tourController = require('../controllers/tourController');

/**
 * Eğer şu şekilde tanımlama yapsaydık aşağıda tourController. ile erişim yapmamıza gerek kalmazdı
 * const {getAllTours, ..., deleteTour } = require('./../controllers/tourController');
 */

const router = express.Router();

// ** Param Middleware **
// URL mesela şu şekilde gelirse /api/v1/tours/5 burada 5, id kısmı oluyor değeri (val) de 5 oluyor.
// Bu middleware sadece bu parametre altında ve tour'lar için çalışacak. Çünkü bu dosyayı ana uygulamaya
// app.use('/api/v1/tours', tourRouter); ile bağladık sadece tour'larla ilgili isteklerde bu dosyaya
// gelinecek ve  işlem yapılacak. Bunu aynen böyle userRoutes.js'ye eklersek de çalışır.
// Böylece burada mini application yapmış gibi oluyoruz...
// router.param('id', (req, res, next, val) => {
//   //console.log(`Tour ID is: ${val}`);
//   next();
// });

// router.param('id', tourController.checkID);

//önce tourController.aliasTopTours middleware'i çalışacak olumlu dönerse ardından tourController.getAllTours
//çalışacak. Amaç arama parametrelerine göre çıkan sonuçları manipüle ederek verileri geri döndürmek
router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

// .post(middlewareFunc, tourController.createTour); gibi birşey olacak. middlewareFunc olumlu dönerse
// tourController.createTour çalışacak. (Middleware chain)
router
  .route('/')
  .get(tourController.getAllTours)
  .post(tourController.createTour); // multiple middleware chain
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
