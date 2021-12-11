# toko

株式売買をする上で、過去のデータを収集して判断材料にする web アプリケーションのバックエンド予定地です.

## 導入

```bash
$ yarn

# mock serverを起動する場合
$ cd mock
$ yarn
```

## 開発

```bash
# mysqlを裏で起動しておく
$ docker-compose up -d

# development
$ yarn start:dev

# production mode
$ yarn start:prod

# mock server
# mock serverの起動をやる場合はmysqlの起動は必要なし
$ yarn dev
```

## Test

```bash
# unit tests
$ yarn test

# e2e tests
$ yarn test:e2e

# test coverage
$ yarn test:cov
```

## 技術スタック

mock serverは`Swagger`を用いて実装してます。
`mock/swagger.yaml`はStoplight Studioを用いて作成し、起動はPrismを使ってます。

本体の方は`Nest.js`をメインに色々やってます。