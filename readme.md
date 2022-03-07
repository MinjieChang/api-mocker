# @bike/api-mocker

基于 `webpack-dev-server`，提供本地开发数据 `mock` 服务

## Install

```shell
mnpm install @bike/api-mocker
```

## Use

使用上，只需要做三处地方的配置

### webpack.config.js

在 `webpack5`中配置 `devServer`：

```js
const apiMocker = require('@bike/api-mocker')
{
  devServer: {
    ...
    onBeforeSetupMiddleware(devServer) {
      apiMocker(devServer.app, {
        watch: '/gov/*',
        api: path.resolve(__dirname, '../src/utils/api.js'),
      })
    },
  }
}
```

在 `webpack4`中配置：

```js
const apiMocker = require('@bike/api-mocker')
{
  devServer: {
    ...
    before(app) {
      apiMocker(app, {
        watch: '/gov/*',
        api: path.resolve(__dirname, '../src/utils/api.js'),
      })
    },
  }
}
```

`option` 选项有两个参数：

- watch：需要监听的 `url` 前缀，默认为 `/api/*`，建议本地开发加上此前缀，只对本地开发生效，不影响测试泳道和 `st` 环境
- api：提供本地 `api`文件地址

### api 文件

api.js

```js
// 这个文件会在node环境中使用，需要判断window
let locationOrigin =
  typeof window === "undefined" ? "" : window.location.origin;

if (!locationOrigin || locationOrigin.indexOf("localhost") > -1) {
  // 这里加的前缀和提供给 api-mocker 的前缀保持一致
  locationOrigin = locationOrigin + "/gov";
}

let domain = locationOrigin + "/api/xxx";

const api = {
  getUserInfo: `${domain}/user/getUserInfo`,
  someOtherApi: `${domain}/otherApi`,
};
// 使用 commonjs 导出方式
module.exports = api;
```

### 新建 mock 文件夹

在项目根目录下提供 `mock` 文件夹，以上面提供的 `api` 为例，**在此目录下建立对应的 `json` 文件即可，支持多级目录**

```js
├── mock
│   ├── getUserInfo.json
│   └── other
│       └── someOtherApi.json

```

## feature

使用上只需要三个地方的配置即可。开发过程中，新建一个 `api`后，只需要在 `mock` 文件夹下新建对应的 `json`文件即可，无需再做其他更改，此 `mock` 方式有如下特点：

1. **支持 `mock` 文件热更新**，新增或修改 `mock` 文件后，无需重启服务，直接调用即可，具备写后不管的特点
2. `mock` 文件支持 `json` 格式和 `js` 格式

json 文件格式：

```json
{
  "code": 0,
  "data": [1, 2, 3]
}
```

js 文件格式：

```js
module.exports = function (req, res) {
  res.json({ code: 0, data: [1, 2, 3] });
};
```
