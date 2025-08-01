# LEAPS

![version](https://img.shields.io/badge/version-1.0.0-red.svg)
![stars](https://img.shields.io/github/stars/yushin-ito/leaps?color=yellow)
![commit-activity](https://img.shields.io/github/commit-activity/t/yushin-ito/leaps)
![license](https://img.shields.io/badge/license-MIT-green)

<br/>

## 📝 Overview

LEAPSは、少数の実験データからでも高性能なタンパク質配列の設計を可能にするために開発された対話型のWebアプリケーションです。難しい操作は一切なく、誰でも簡単に使えるインターフェースを提供しています。

<br/>

## ✨ Features
> [!CAUTION]
> このアプリケーションは現在、開発中です。

<br/>
<br/>

## ⚡️ Structure

```
leaps/
├── actions/            # サーバーアクション
├── app/
│   ├── (auth)/         # 認証ページ
│   ├── (chat)/         # チャットページ
│   ├── (settings)/     # 設定ページ
│   ├── (top)/          # トップページ
│   └── api/            # API
├── components/         # コンポーネント
│   └── ui/
├── config/             # アプリ設定
├── hooks/              # カスタムフック
├── i18n/               # 国際化
├── lib/                # ライブラリ
├── messages/           # 言語ファイル
├── prisma/             # データベーススキーマ
├── public/             # アセット
├── schemas/            # フォームスキーマ
├── styles/             # スタイル
└── types/              # 型定義
```

<br/>

## 🚀　Install

1. リポジトリをクローン

   ```bash
   git clone https://github.com/yourusername/leaps.git
   cd leaps
   ```

2. パッケージのインストール

   ```bash
   pnpm install
   ```

3. 環境変数の設定

   `.env.saple`を参考に`.env.local`を作成してください。

4. データベースのマイグレーション

   ```bash
   pnpm prisma migrate dev
   ```

5. 開発サーバーの起動

   ```bash
   pnpm dev
   ```

6. ブラウザで [http://localhost:3000](http://localhost:3000) にアクセス

<br/>

## 🤝 Contributer

<a href="https://github.com/yushin-ito">
  <img  src="https://avatars.githubusercontent.com/u/75526539?s=48&v=4" width="64px">
</a>

<br/>

## 📜 LICENSE
