import express from 'express'
let ajaxRouter = express.Router();
import serverSettings from './settings'
import api from 'cezerin-client';
api.init(serverSettings.api.baseUrl, serverSettings.api.token);

const cartCookieOptions = {
  maxAge: serverSettings.cart_cookie_max_age,
  secure: serverSettings.cart_cookie_secure,
  httpOnly: true,
  signed: true,
  sameSite: 'strict'
}

ajaxRouter.get('/products', (req, res, next) => {
  api.products.list(req.query).then(({status, json}) => {
    res.send(json);
  })
})

ajaxRouter.get('/products/:id', (req, res, next) => {
  api.products.retrieve(req.params.id).then(({status, json}) => {
    res.send(json);
  })
})

ajaxRouter.get('/cart', (req, res, next) => {
  const order_id = req.signedCookies.order_id;
  if (order_id) {
    api.orders.retrieve(order_id).then(({status, json}) => {
      res.send(json);
    })
  } else {
    res.end();
  }
})

ajaxRouter.post('/cart/items', (req, res, next) => {
  const order_id = req.signedCookies.order_id;
  const item = req.body;
  if (order_id) {
    api.orders.addItem(order_id, item).then(({status, json}) => {
      res.send(json);
    })
  } else {
    // let ip = req.get('x-forwarded-for') || req.connection.remoteAddress;
    let ip = req.ip || '';
    if(ip && ip.includes('::ffff:')) {
      ip = ip.replace('::ffff:', '');
    }

    api.orders.create({
      draft: true,
      referrer_url: req.signedCookies.referrer_url,
      landing_url: req.signedCookies.landing_url,
      browser: {
        ip: ip,
        user_agent: req.get('user-agent')
      }
    }).then(({status, json}) => {
      res.cookie('order_id', json.id, cartCookieOptions);
      api.orders.addItem(json.id, item).then(({status, json}) => {
        res.send(json);
      })
    })
  }
})

ajaxRouter.delete('/cart/items/:item_id', (req, res, next) => {
  const order_id = req.signedCookies.order_id;
  const item_id = req.params.item_id;
  if (order_id && item_id) {
    api.orders.deleteItem(order_id, item_id).then(({status, json}) => {
      res.send(json);
    })
  } else {
    res.end();
  }
})

ajaxRouter.put('/cart/items/:item_id', (req, res, next) => {
  const order_id = req.signedCookies.order_id;
  const item_id = req.params.item_id;
  const item = req.body;
  if (order_id && item_id) {
    api.orders.updateItem(order_id, item_id, item).then(({status, json}) => {
      res.send(json);
    })
  } else {
    res.end();
  }
})

ajaxRouter.put('/cart/finish', (req, res, next) => {
  /*
  1. get order info
  2. delete order_id cookie
  3. send email to client
  4. response with order info
  5. call api.order.finish (for Webhooks)
  */
  const order_id = req.signedCookies.order_id;
  if (order_id) {
    api.orders.retrieve(order_id).then(({status, json}) => {
      res.clearCookie('order_id');
      res.send(json);
    })
  } else {
    res.end();
  }
});

ajaxRouter.put('/cart', (req, res, next) => {
  const order_id = req.signedCookies.order_id;
  if (order_id) {
    api.orders.update(order_id, req.body).then(({status, json}) => {
      res.send(json);
    })
  } else {
    res.end();
  }
})

ajaxRouter.put('/cart/shipping_address', (req, res, next) => {
  const order_id = req.signedCookies.order_id;
  if (order_id) {
    api.orders.updateShippingAddress(order_id, req.body).then(({status, json}) => {
      res.send(json);
    })
  } else {
    res.end();
  }
})

ajaxRouter.put('/cart/billing_address', (req, res, next) => {
  const order_id = req.signedCookies.order_id;
  if (order_id) {
    api.orders.updateBillingAddress(order_id, req.body).then(({status, json}) => {
      res.send(json);
    })
  } else {
    res.end();
  }
})

ajaxRouter.get('/product_categories', (req, res, next) => {
  api.product_categories.list().then(({status, json}) => {
    res.send(json);
  })
})

ajaxRouter.get('/product_categories/:id', (req, res, next) => {
  api.product_categories.retrieve(req.params.id).then(({status, json}) => {
    res.send(json);
  })
})

ajaxRouter.get('/sitemap', (req, res, next) => {
  api.sitemap.retrieve(req.query.path).then(({status, json}) => {
    res.send(json);
  })
})

ajaxRouter.get('/payment_methods', (req, res, next) => {
  const filter = {
    order_id: req.signedCookies.order_id
  };
  api.payment_methods.list(filter).then(({status, json}) => {
    res.send(json);
  })
})

ajaxRouter.get('/shipping_methods', (req, res, next) => {
  const filter = {
    order_id: req.signedCookies.order_id
  };
  api.shipping_methods.list(filter).then(({status, json}) => {
    res.send(json);
  })
})

ajaxRouter.get('/countries', (req, res, next) => {
  api.countries.list().then(({status, json}) => {
    res.send(json);
  })
})

ajaxRouter.all('*', (req, res, next) => {
  res.status(405).send({'error': 'Method Not Allowed'});
})

ajaxRouter.use(function(err, req, res, next) {
  if (err) {
    res.status(500).send({'error': err});
  }
});

module.exports = ajaxRouter;
