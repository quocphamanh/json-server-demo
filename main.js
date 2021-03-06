const jsonServer = require("json-server");
const server = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();
const queryString = require("query-string");
const _ = require("lodash");

// Set default middlewares (logger, static, cors and no-cache)
server.use(middlewares);

// Add custom routes before JSON Server router
server.get("/api/provider/global/get_global", (req, res) => {
  const { APINo, _page, _limit } = req.query;
  const db = router.db;
  const apiInfos = db.get("apiInfos").__wrapped__.apiInfos;
  const inviteInfo = db
    .get("inviteInfo")
    .__wrapped__.inviteInfo.slice(
      Number(_page) === 1 ? 0 : (Number(_page) - 1) * Number(_limit),
      Number(_page) * Number(_limit)
    );
  //   res.jsonp(req.query);
  res.jsonp({
    data: {
      common: { status: 200, message: "success" },
      apiInfo: {
        ...apiInfos.find((item) => item.APINo === APINo),
      },
      inviteInfo: [...inviteInfo],
      panigation: {
        _page: Number(_page) || 1, // page hiện tại
        _limit: Number(_limit) || 2, // giới hạn item mỗi trang
        _totalPages: Math.ceil(apiInfos.length / Number(_limit)), // tổng số page phân trang
      },
    },
  });
});

server.get("/api/provider/global/search_users", (req, res) => {
  const { Name } = req.query;
  const db = router.db;
  const accountInfos = db.get("accountInfo").__wrapped__.accountInfo;
  res.jsonp({
    data: {
      common: { status: 200, message: "success" },
      accountInfo: [
        ...accountInfos.filter((item) => item.Name.indexOf(Name) !== -1),
      ],
    },
  });
});

server.post("/api/provider/global/delete_api_info", (req, res) => {
  const { APINo } = req.query;
  const db = router.db;
  const table = db.get("apiInfos");
  const apiInfoDelete = db
    .get("apiInfos")
    .__wrapped__.apiInfos.find((item) => item.APINo === APINo);

  if (apiInfoDelete) {
    table.remove(apiInfoDelete).write();
  }

  res.jsonp({
    data: {
      common: { status: 200, message: "success" },
    },
  });
});

server.post("/api/provider/global/update_status", (req, res) => {
  const { APINo, apiInfo } = req.query;
  const db = router.db;
  const apiInfos = db.get("apiInfos").__wrapped__.apiInfos;
  const apiInfoUpdate = apiInfos.find((item) => item.APINo === APINo);
  const newApiInfo = {
    ...apiInfoUpdate,
    PublicStatus: JSON.parse(apiInfo).PublicStatus,
  };
  const table = db.get("apiInfos");
  table.remove(apiInfoUpdate).write();
  table.push(newApiInfo).write();

  res.jsonp({
    data: {
      common: { status: 200, message: "success" },
    },
  });
});

server.get("/api/statistic/provider/get_information", (req, res) => {
  const db = router.db;
  const apiSummary = db.get("apiSummary").__wrapped__.apiSummary;
  const apiLogs = db.get("apiLogs").__wrapped__.apiLogs;

  res.jsonp({
    data: {
      common: { status: 200, message: "success" },
      apiSummary,
      apiLogs,
    },
  });
});

server.get("/api/statistic/provider/get_api_summary", (req, res) => {
  const db = router.db;
  const apiSummary = db.get("apiSummary").__wrapped__.apiSummary;

  res.jsonp({
    data: {
      common: { status: 200, message: "success" },
      apiSummary,
    },
  });
});

// To handle POST, PUT and PATCH you need to use a body-parser
// You can use the one used by JSON Server
server.use(jsonServer.bodyParser);
server.use((req, res, next) => {
  if (req.method === "POST") {
    req.body.createdAt = Date.now();
    req.body.updateAt = Date.now();
  } else if (req.method === "PATCH") {
    req.body.updateAt = Date.now();
  }
  // Continue to JSON Server router
  next();
});

// In this example, returned resources will be wrapped in a body property
router.render = (req, res) => {
  const headers = res.getHeaders();
  const totalCountHeader = headers["x-total-count"];
  if (req.method === "GET" && totalCountHeader) {
    const queryParams = queryString.parse(req._parsedUrl.query);

    const result = {
      data: res.locals.data,
      panigation: {
        _page: Number.parseInt(queryParams._page) || 1,
        _limit: Number.parseInt(queryParams._limit) || 3,
        _totalRows: Number.parseInt(totalCountHeader),
      },
    };

    return res.jsonp({ ...result });
  }

  res.jsonp({
    data: {
      ...res.locals.data[0],
      common: { status: 200, message: "success" },
    },
  });
};

// Use default router
server.use("/api", router);

const PORT = process.env.PORT || 8888;

server.listen(PORT, () => {
  console.log("JSON Server is running");
});
