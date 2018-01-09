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
    status: 'transit',
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
    destination: 'New York',
    status: 'closed',
    shipped: 'false',
    deliveryTime: getPackageTime(40)
  },
  {
    packageId: 'OR100003',
    productList: [
      {
        productId: 'PR100002',
        productName: 'product2',
        quantity: '3'
      }
    ],
    packageSentDate: 'December 29, 2017',
    value: '15 $',
    destination: 'California',
    status: 'closed',
    shipped: 'false',
    deliveryTime: getPackageTime(25)
  },
  {
    packageId: 'OR100004',
    productList: [
      {
        productId: 'PR100001',
        productName: 'product1',
        quantity: '4'
      }
    ],
    packageSentDate: 'January 4, 2018',
    value: '40 $',
    destination: 'San Francisco',
    status: 'open',
    shipped: 'true',
    deliveryTime: getPackageTime(30)
  },
  {
    packageId: 'OR100005',
    productList: [
      {
        productId: 'PR100001',
        productName: 'product1',
        quantity: '2'
      },
      {
        productId: 'PR100002',
        productName: 'product2',
        quantity: '3'
      },
      {
        productId: 'PR100003',
        productName: 'product3',
        quantity: '5'
      }
    ],
    packageSentDate: 'December 31, 2017',
    value: '15 $',
    destination: 'Chicago',
    status: 'open',
    shipped: 'false',
    deliveryTime: getPackageTime(50)
  }
]
