# Opto Wallet

<img src="https://optowallet.com/logo.png" width="300" height="300" />

### CLI

Build Android APK for test

```ts
eas build --profile development --platform android
```

Build & Submit

```ts
eas build --platform android
eas submit --platform android
```

Build a development version

```ts
eas build --profile development --platform ios
```

Install it, and run command below, you can debug it now:

```ts
expo start --dev-client
```

## Features

- [x] Wallet
  - [x] Import
    - [x] Mnemonic
    - [x] Private Key
    - [x] From Near Wallet
      - [x] testnet
    - [x] From Ledger
  - [x] Export
    - [x] Mnemonic
    - [x] Private key
  - [x] Export
    - [x] Mnemonic
    - [x] Private Key
  - [x] Send
  - [x] Set NRAvatar
  - [x] Manage Authorized Apps
- [x] dApp browser
- [x] Ledger
- [x] WalletConnect 2.0
- [x] QR Code
  - [x] Scanner
  - [x] Generator
  - [x] Share
  - [x] Save
- [x] Keypom
- [x] NFT
