# Outline Editor

小説やドキュメントの執筆に特化したアウトラインエディタです。Markdown形式での執筆をサポートし、階層構造を持つアウトラインを視覚的に管理できます。

## 主な機能

### 📝 複数のビューモード
- **Markdownビュー**: Markdown記法でのリッチな執筆体験
- **プレビュービュー**: Markdownのライブプレビューを確認しながら執筆
- **アウトラインビュー**: ドキュメントの構造を階層的に表示
- **プレーンビュー**: Markdown記号を除いたプレーンテキストでの編集

### 📂 プロジェクト管理
- 複数のドキュメントを1つのプロジェクトで管理
- ドキュメント、あらすじ、資料ノートのセクション分け
- ドキュメントの作成、編集、削除

### 🎨 エディタ機能
- CodeMirror 6ベースの高機能エディタ
- シンタックスハイライト
- 行番号表示
- ダークテーマ対応

### 💾 データ永続化
- localStorageによる自動保存
- ドキュメント切り替え時の即座保存
- データの安全な保持

## プロジェクト構成

このプロジェクトはモノレポ構成を採用しており、以下のディレクトリ構造で構成されています：

```
outline-editor/
├── client/          # フロントエンドアプリケーション
│   ├── src/        # Reactソースコード
│   │   ├── components/  # UIコンポーネント
│   │   ├── contexts/    # React Context（状態管理）
│   │   ├── lib/         # ユーティリティ関数
│   │   └── pages/       # ページコンポーネント
│   ├── public/     # 静的ファイル
│   └── index.html  # エントリーポイント
├── server/         # バックエンド（将来の拡張用）
├── shared/         # フロントエンドとバックエンドで共有するコード
├── patches/        # 依存パッケージのパッチ
└── README.md       # プロジェクトドキュメント
```

### 主要なディレクトリの説明

- **`client/src/components/`**: 再利用可能なUIコンポーネント（MarkdownEditor、OutlineView、ProjectSidebar等）
- **`client/src/contexts/`**: React Contextによる状態管理（EditorContext）
- **`client/src/pages/`**: ページレベルのコンポーネント（Editor、Home等）
- **`client/src/lib/`**: ユーティリティ関数（アウトライン解析、Markdown処理等）

## 技術スタック

- **フロントエンド**: React 18, TypeScript
- **エディタ**: CodeMirror 6
- **スタイリング**: Tailwind CSS, shadcn/ui
- **ビルドツール**: Vite
- **状態管理**: React Context API
- **データ永続化**: localStorage（ブラウザローカルストレージ）

## 開発履歴

### 2024年10月24日 - ドキュメント切り替え時のコンテンツ保持機能の実装

**問題の発見:**
ドキュメント間を切り替える際に、以下の問題が発生していました：
- ドキュメントAからドキュメントBに切り替えた後、ドキュメントAに戻るとコンテンツが消失または別のドキュメントのコンテンツに書き換えられる
- ドキュメント名を変更すると、コンテンツが部分的に消失する
- ユーザーが入力したテキストが予期せず失われる

**根本原因の特定:**
1. CodeMirror 6の内部状態とReact Contextの状態が正しく同期していなかった
2. ドキュメント切り替え時に、前のドキュメントのコンテンツが保存される前に次のドキュメントが読み込まれていた
3. `isExternalUpdate`フラグによる外部更新の判定ロジックが、非同期処理により正しく動作していなかった
4. 同一のCodeMirrorインスタンスを使い回していたため、状態の不整合が発生していた

**実装した解決策:**

1. **MarkdownEditorコンポーネントのキー管理** (`client/src/pages/Editor.tsx`)
   - MarkdownEditorコンポーネントに`key={currentDocumentId}`を追加
   - ドキュメント切り替え時に、CodeMirrorインスタンスを完全に破棄して再作成
   - これにより、各ドキュメントが独立したエディタインスタンスを持つようになった

2. **シンプルな状態管理** (`client/src/components/MarkdownEditor.tsx`)
   - 複雑な`isExternalUpdate`フラグと外部更新を反映する`useEffect`を削除
   - ドキュメント切り替え時にコンポーネントが再作成されるため、外部更新の処理が不要に
   - ユーザー入力時には`onChange`を直接呼び出すシンプルな実装

3. **即座保存の実装** (`client/src/contexts/EditorContext.tsx`)
   - `updateDocumentContent`関数でコンテンツ更新時に即座にlocalStorageに保存
   - `updateDocumentTitle`関数でタイトル更新時に即座にlocalStorageに保存
   - 1秒の遅延を持つ自動保存`useEffect`を削除（不要になったため）

**結果:**
- ドキュメント間を何度切り替えても、各ドキュメントのコンテンツが正しく保持される
- ドキュメント名を変更しても、コンテンツが失われない
- CodeMirrorの内部状態とReact Contextの状態が完全に同期
- ユーザーが入力したテキストが安全に保護される

**技術的な学び:**
- Reactの`key` propを活用したコンポーネントの完全な再作成パターン
- CodeMirror 6のような複雑なエディタライブラリとReactの統合における状態管理の重要性
- 非同期処理とフラグ管理の複雑さを避け、シンプルな設計を選択することの価値

## セットアップ

### 前提条件

- Node.js 18以上
- pnpm 8以上

### インストール手順

```bash
# リポジトリをクローン
git clone https://github.com/pxrllc/outline-editor.git
cd outline-editor

# 依存関係のインストール
pnpm install

# 開発サーバーの起動
pnpm dev
```

開発サーバーが起動したら、ブラウザで `http://localhost:5173` にアクセスしてください。

### ビルド

```bash
# プロダクションビルド
pnpm build

# ビルドしたファイルをプレビュー
pnpm preview
```

## ライセンス

MIT

## 作者

pxrllc

