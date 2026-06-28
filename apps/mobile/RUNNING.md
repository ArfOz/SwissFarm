# MapLibre GL ile Çalıştırma

MapLibre native modüller içerdiği için **Expo Go'da çalışmaz**. Development build ile çalıştırmanız gerekir.

## 1. Gerekli paketi yükle

```bash
pnpm --filter mobile add expo-dev-client
```

## 2. Native projeleri oluştur (prebuild)

```bash
cd apps/mobile
npx expo prebuild
```

Bu komut `android/` ve `ios/` klasörlerini oluşturur ve MapLibre'in native modüllerini kaydeder.

## 3. Development build al

### Android (telefon bağlı veya emülatör)
```bash
npx expo run:android
```

### iOS (sadece Mac)
```bash
npx expo run:ios
```

## 4. Build sonrası çalıştır

```bash
npx expo start --dev-client
```

Kodu değiştirdikten sonra yeniden build almanız gerekmez — development build hot-reload'u destekler.

---

### Alternatif: EAS Build (bulutta build)

```bash
npx eas build --platform android --profile development
npx eas build --platform ios --profile development