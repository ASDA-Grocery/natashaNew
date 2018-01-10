function getPackageTime(diff){
  var currentDate = new Date()
  currentDate.setTime(currentDate.getTime() + (diff*60000));
  return currentDate;
}

exports.packageDb = [
  {
    packageId: 'OR100001',
    productList: [
      {
        productId: 'PR100001',
        productName: 'product1',
        quantity: '2'
      }
    ],
    packageSentDate: 'January 2, 2018',
    value: '20 $',
    status: 'outForDelivery',
    destination: 'Dallas',
    shipped: 'false',
    deliveryTime: getPackageTime(30)
  },
  {
    packageId: 'OR100002',
    productList: [
      {
        productId: 'PR100001',
        productName: 'product1',
        quantity: '2'
      },
      {
        productId: 'PR100004',
        productName: 'product4',
        quantity: '1'
      }
    ],
    packageSentDate: 'December 31, 2017',
    value: '35 $',
    destination: 'Chicago',
    status: 'transit',
    shipped: 'false',
    deliveryTime: getPackageTime(40)
  }
]
