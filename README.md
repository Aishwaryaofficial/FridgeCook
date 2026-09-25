# 🥗 FridgeCook — Photo in. Three recipes out.

<p align="center">
  <img src="src/assets/logo.png" alt="FridgeCook logo" width="112" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React_Native-0.87-61DAFB?style=for-the-badge&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Gemini-Vision-4285F4?style=for-the-badge&logo=google&logoColor=white" />
  <img src="https://img.shields.io/badge/Platform-iOS%20%7C%20Android-lightgrey?style=for-the-badge" />
</p>

> Open the fridge. Snap a pic. Get **3 easy recipes** from what you already have. React Native CLI (**not Expo**). Google Gemini free vision API. No backend. No grocery list.

<p align="center">
  <img src="src/assets/sample-fridge.png" alt="Sample fridge ingredients" width="280" />
</p>

---

## ✨ What you get

| Screen | What it does |
|--------|-------------|
| 🏠 **Home** | Camera or gallery, **Try a sample**, vibe pills (Anything / Veg / 15 min) |
| 🍽️ **Result** | 3 recipe cards: time, why it fits, ingredients, short steps |

- 📷 Real photo → Gemini vision
- ✨ Sample fridge if you don’t want to shoot
- 🥬 Vegetarian or 15-minute night
- 🔐 Key stays in `.env`

---

## 🏗️ How it works

```
Fridge photo (or sample list)
        ↓
base64 image + prompt
        ↓
Gemini generateContent
        ↓
JSON: seen foods + 3 recipes
        ↓
Result cards
```

Same idea as a weather API: URL, key, request, JSON. The model just looks at a picture.

---

## 🚀 Getting started

```bash
git clone https://github.com/Aishwaryaofficial/FridgeCook.git
cd FridgeCook
npm install

cp .env.example .env
# GEMINI_API_KEY=your_key   (https://aistudio.google.com/apikey)

# iOS
bundle install
cd ios && bundle exec pod install && cd ..

npm start
# other terminal
npm run ios
# or
npm run android
```

Restart Metro after changing `.env`.

### Try it

1. Tap **Try a sample** or pick a fridge photo
2. Pick **Anything**, **Veg**, or **15 min**
3. Tap **Cook these 3**

---

## 🛠️ Stack

- React Native 0.87 CLI
- TypeScript
- React Navigation 7
- `react-native-image-picker`
- Gemini 2.0 Flash (`inline_data` image)

---

## 🧪 Tests

```bash
npm test
```

---

## 📄 License

MIT
