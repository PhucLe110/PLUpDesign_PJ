const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Design = require("./models/Design");
const User = require("./models/User");
const bcrypt = require("bcryptjs");

// Load environment variables
dotenv.config();

// Kết nối DB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
    process.exit(1);
  }
};

// Sample users (2 user mẫu)
const sampleUsers = [
  {
    name: "Sample Designer 1",
    email: "designer1@example.com",
    password: "123456",
    avatar:
      "https://i.pinimg.com/1200x/a0/5c/bb/a05cbbae51343d0449fa60b8b4f392bc.jpg",
  },
  {
    name: "Sample Designer 2",
    email: "designer2@example.com",
    password: "123456",
    avatar:
      "https://i.pinimg.com/1200x/7a/ea/6f/7aea6fd1a681dbbfc766a9d4e242e674.jpg",
  },
];

// Sample designs (9 mẫu, với hình ảnh mới để tránh trùng lặp visual)
const sampleDesigns = [
  {
    title: "Logo Modern Brand",
    title_en: "Modern Brand Logo",
    title_jp: "モダンブランドロゴ",
    description: "Thiết kế logo hiện đại cho thương hiệu công nghệ",
    description_en: "Modern logo design for technology brand",
    description_jp: "テクノロジーブランドのためのモダンなロゴデザイン",
    author: "Nguyễn Văn A",
    likes: 42,
    comments: [
      {
        id: 1,
        author: "Nguyễn Văn A",
        text: "Thiết kế rất đẹp và sáng tạo!",
        timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(), // 2 minutes ago
      },
      {
        id: 2,
        author: "Trần Thị B",
        text: "Màu sắc rất hài hòa, tôi thích cách phối màu này.",
        timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(), // 10 minutes ago
      },
    ],
    image:
      "https://i.pinimg.com/1200x/70/63/91/706391b7e9aed8e4ff811414c7ad1142.jpg",
    liked: false,
    saved: false,
    hashtags: ["logo", "modern", "brand", "technology"],
  },
  {
    title: "App Interface Design",
    title_en: "App Interface Design",
    title_jp: "アプリインターフェースデザイン",
    description: "Giao diện người dùng cho ứng dụng di động",
    description_en: "User interface for mobile application",
    description_jp: "モバイルアプリケーションのユーザーインターフェース",
    author: "Trần Thị B",
    likes: 28,
    comments: [
      {
        id: 3,
        author: "Lê Văn C",
        text: "Giao diện này rất thân thiện với người dùng.",
        timestamp: new Date().toISOString(),
      },
    ],
    image:
      "https://i.pinimg.com/1200x/4b/1f/a9/4b1fa90e79dbafc6702b822d23c1332c.jpg",
    liked: true,
    saved: false,
    hashtags: ["app", "ui", "mobile", "interface"],
  },
  {
    title: "Website Redesign",
    title_en: "Website Redesign",
    title_jp: "ウェブサイトリデザイン",
    description: "Thiết kế lại website công ty với phong cách mới",
    description_en: "Company website redesign with new style",
    description_jp: "新しいスタイルでの会社ウェブサイトのリデザイン",
    author: "Lê Văn C",
    likes: 35,
    comments: [],
    image:
      "https://i.pinimg.com/1200x/1d/f9/6e/1df96e19bb49e5922cd34f9ebbe17c82.jpg",
    liked: false,
    saved: true,
    hashtags: ["website", "redesign", "corporate", "web"],
  },
  {
    title: "E-commerce UI Kit",
    title_en: "E-commerce UI Kit",
    title_jp: "EコマースUIキット",
    description: "Bộ UI kit hoàn chỉnh cho ứng dụng thương mại điện tử",
    description_en: "Complete UI kit for e-commerce application",
    description_jp: "Eコマースアプリケーション用の完全なUIキット",
    author: "Phạm Văn D",
    likes: 50,
    comments: [
      {
        id: 4,
        author: "Nguyễn Văn A",
        text: "Rất chuyên nghiệp!",
        timestamp: new Date().toISOString(),
      },
    ],
    image:
      "https://i.pinimg.com/1200x/97/bd/93/97bd93c45ff20ed7f2de38bc4015792d.jpg",
    liked: false,
    saved: false,
    hashtags: ["ecommerce", "ui", "kit", "design"],
  },
  {
    title: "Dashboard Analytics",
    title_en: "Analytics Dashboard",
    title_jp: "分析ダッシュボード",
    description: "Thiết kế bảng điều khiển phân tích dữ liệu trực quan",
    description_en: "Intuitive data analytics dashboard design",
    description_jp: "直感的なデータ分析ダッシュボードデザイン",
    author: "Lê Thị E",
    likes: 60,
    comments: [],
    image:
      "https://i.pinimg.com/1200x/9b/1f/bd/9b1fbd021d3c54530d7fa80db2d50eb5.jpg",
    liked: true,
    saved: false,
    hashtags: ["dashboard", "analytics", "data", "ui"],
  },
  {
    title: "Mobile Game Concept",
    title_en: "Mobile Game Concept",
    title_jp: "モバイルゲームコンセプト",
    description: "Ý tưởng thiết kế cho một trò chơi di động phiêu lưu",
    description_en: "Design concept for an adventure mobile game",
    description_jp: "アドベンチャーモバイルゲームのデザインコンセプト",
    author: "Trần Văn F",
    likes: 30,
    comments: [
      {
        id: 5,
        author: "Phạm Văn D",
        text: "Ý tưởng rất hay, hình ảnh đẹp!",
        timestamp: new Date().toISOString(),
      },
    ],
    image:
      "https://i.pinimg.com/1200x/61/c3/a8/61c3a8958a04335e929b5504b8485314.jpg",
    liked: false,
    saved: true,
    hashtags: ["game", "mobile", "concept", "art"],
  },
  {
    title: "Food Delivery App",
    title_en: "Food Delivery App",
    title_jp: "フードデリバリーアプリ",
    description: "Giao diện người dùng cho ứng dụng đặt đồ ăn",
    description_en: "User interface for a food delivery application",
    description_jp:
      "フードデリバリーアプリケーションのユーザーインターフェース",
    author: "Nguyễn Thị G",
    likes: 45,
    comments: [],
    image:
      "https://i.pinimg.com/1200x/27/0e/be/270ebe5df6692cf91623e3b20f4d7c0c.jpg",
    liked: false,
    saved: false,
    hashtags: ["food", "app", "delivery", "ui"],
  },
  {
    title: "Travel Website Layout",
    title_en: "Travel Website Layout",
    title_jp: "旅行ウェブサイトレイアウト",
    description: "Bố cục website du lịch với hình ảnh sống động",
    description_en: "Travel website layout with vibrant imagery",
    description_jp: "鮮やかな画像を使った旅行ウェブサイトのレイアウト",
    author: "Lê Văn H",
    likes: 55,
    comments: [
      {
        id: 6,
        author: "Lê Thị E",
        text: "Rất cuốn hút, muốn đi du lịch ngay!",
        timestamp: new Date().toISOString(),
      },
    ],
    image:
      "https://i.pinimg.com/1200x/a5/08/81/a5088175102f41ac9b165db8ae2b83d4.jpg",
    liked: true,
    saved: false,
    hashtags: ["travel", "website", "layout", "web"],
  },
  {
    title: "Fitness App Design",
    title_en: "Fitness App Design",
    title_jp: "フィットネスアプリデザイン",
    description: "Thiết kế ứng dụng theo dõi sức khỏe và tập luyện",
    description_en: "Health and fitness tracking app design",
    description_jp: "健康とフィットネス追跡アプリのデザイン",
    author: "Trần Thị I",
    likes: 38,
    comments: [],
    image:
      "https://i.pinimg.com/1200x/5d/c5/ad/5dc5adcbc4fd08d6d073394ef4d4b567.jpg",
    liked: false,
    saved: false,
    hashtags: ["fitness", "app", "health", "ui"],
  },
  {
    title: "Smart Home Dashboard",
    title_en: "Smart Home Dashboard",
    title_jp: "スマートホームダッシュボード",
    description: "Bảng điều khiển nhà thông minh hiện đại và trực quan",
    description_en: "Modern and intuitive smart home dashboard",
    description_jp: "モダンで直感的なスマートホームダッシュボード",
    author: "Nguyễn Văn A",
    likes: 65,
    comments: [],
    image:
      "https://i.pinimg.com/1200x/68/ff/a4/68ffa410be0a8af0b303b1743336faa1.jpg",
    liked: false,
    saved: false,
    hashtags: ["smarthome", "dashboard", "iot", "ui"],
  },
  {
    title: "Online Learning Platform",
    title_en: "Online Learning Platform",
    title_jp: "オンライン学習プラットフォーム",
    description: "Giao diện nền tảng học trực tuyến thân thiện",
    description_en: "User-friendly online learning platform interface",
    description_jp:
      "ユーザーフレンドリーなオンライン学習プラットフォームインターフェース",
    author: "Trần Thị B",
    likes: 72,
    comments: [],
    image:
      "https://i.pinimg.com/1200x/9b/8e/46/9b8e4677da4b369baa5a44d729766b9c.jpg",
    liked: true,
    saved: false,
    hashtags: ["education", "online", "platform", "ui"],
  },
  {
    title: "Music Player UI",
    title_en: "Music Player UI",
    title_jp: "音楽プレーヤーUI",
    description: "Thiết kế giao diện trình phát nhạc tối giản",
    description_en: "Minimalist music player interface design",
    description_jp: "ミニマリストな音楽プレーヤーインターフェースデザイン",
    author: "Lê Văn C",
    likes: 48,
    comments: [],
    image:
      "https://i.pinimg.com/1200x/70/87/1d/70871d39dd6d2ea853f91477a3166923.jpg",
    liked: false,
    saved: true,
    hashtags: ["music", "player", "ui", "minimalist"],
  },
  {
    title: "Weather App Concept",
    title_en: "Weather App Concept",
    title_jp: "天気アプリコンセプト",
    description: "Ý tưởng ứng dụng thời tiết với hình ảnh động",
    description_en: "Weather app concept with animated visuals",
    description_jp: "アニメーションビジュアル付きの天気アプリコンセプト",
    author: "Phạm Văn D",
    likes: 58,
    comments: [],
    image:
      "https://i.pinimg.com/1200x/08/4d/e5/084de5f98a9faec8297424ea6eecb19a.jpg",
    liked: false,
    saved: false,
    hashtags: ["weather", "app", "concept", "animation"],
  },
  {
    title: "NFT Marketplace UI",
    title_en: "NFT Marketplace UI",
    title_jp: "NFTマーケットプレイスUI",
    description: "Giao diện thị trường NFT hiện đại và bảo mật",
    description_en: "Modern and secure NFT marketplace interface",
    description_jp: "モダンで安全なNFTマーケットプレイスインターフェース",
    author: "Lê Thị E",
    likes: 80,
    comments: [],
    image:
      "https://i.pinimg.com/1200x/65/50/26/65502648696a15614d164dd2d7a54bfa.jpg",
    liked: true,
    saved: false,
    hashtags: ["nft", "marketplace", "crypto", "ui"],
  },
  {
    title: "Podcast App Design",
    title_en: "Podcast App Design",
    title_jp: "ポッドキャストアプリデザイン",
    description: "Thiết kế ứng dụng podcast với trải nghiệm người dùng tốt",
    description_en: "Podcast app design with good user experience",
    description_jp:
      "優れたユーザーエクスペリエンスを備えたポッドキャストアプリデザイン",
    author: "Trần Văn F",
    likes: 40,
    comments: [],
    image:
      "https://i.pinimg.com/1200x/2b/51/c1/2b51c17ef31f51937335190247ec13df.jpg",
    liked: false,
    saved: true,
    hashtags: ["podcast", "app", "audio", "ux"],
  },
  {
    title: "VR Game Environment",
    title_en: "VR Game Environment",
    title_jp: "VRゲーム環境",
    description: "Môi trường game thực tế ảo sống động",
    description_en: "Vibrant virtual reality game environment",
    description_jp: "鮮やかなバーチャルリアリティゲーム環境",
    author: "Nguyễn Văn A",
    likes: 62,
    comments: [],
    image:
      "https://i.pinimg.com/1200x/f1/a3/8b/f1a38b7c1c0193ff8ae4de878b7e8305.jpg",
    liked: false,
    saved: false,
    hashtags: ["vr", "game", "environment", "3d"],
  },
  {
    title: "Medical App UI",
    title_en: "Medical App UI",
    title_jp: "医療アプリUI",
    description: "Giao diện ứng dụng y tế thân thiện và dễ sử dụng",
    description_en: "User-friendly and easy-to-use medical app interface",
    description_jp:
      "ユーザーフレンドリーで使いやすい医療アプリインターフェース",
    author: "Trần Thị B",
    likes: 33,
    comments: [],
    image:
      "https://i.pinimg.com/1200x/55/e4/dc/55e4dcc0bb711751f2960cec038aae94.jpg",
    liked: false,
    saved: false,
    hashtags: ["medical", "app", "health", "ui"],
  },
  {
    title: "Smartwatch Interface",
    title_en: "Smartwatch Interface",
    title_jp: "スマートウォッチインターフェース",
    description: "Thiết kế giao diện đồng hồ thông minh tối giản",
    description_en: "Minimalist smartwatch interface design",
    description_jp: "ミニマリストなスマートウォッチインターフェースデザイン",
    author: "Lê Văn C",
    likes: 49,
    comments: [],
    image:
      "https://i.pinimg.com/1200x/ba/01/c4/ba01c4af0cf96b9f0159065caf74e8b8.jpg",
    liked: true,
    saved: false,
    hashtags: ["smartwatch", "wearable", "ui", "minimalist"],
  },
  {
    title: "Online Banking App",
    title_en: "Online Banking App",
    title_jp: "オンラインバンキングアプリ",
    description: "Ứng dụng ngân hàng trực tuyến an toàn và tiện lợi",
    description_en: "Secure and convenient online banking application",
    description_jp: "安全で便利なオンラインバンキングアプリケーション",
    author: "Phạm Văn D",
    likes: 70,
    comments: [],
    image:
      "https://i.pinimg.com/1200x/03/3b/3a/033b3ae16dbaf22a134d5e0d61c6fe01.jpg",
    liked: false,
    saved: false,
    hashtags: ["banking", "finance", "app", "security"],
  },
  {
    title: "Education Platform UI",
    title_en: "Education Platform UI",
    title_jp: "教育プラットフォームUI",
    description: "Giao diện người dùng cho nền tảng giáo dục trực tuyến",
    description_en: "User interface for online education platform",
    description_jp: "オンライン教育プラットフォームのユーザーインターフェース",
    author: "Lê Thị E",
    likes: 53,
    comments: [],
    image:
      "https://i.pinimg.com/1200x/8e/2b/42/8e2b42b0fd151bebe5e576ca57139e17.jpg",
    liked: false,
    saved: true,
    hashtags: ["education", "platform", "online", "ui"],
  },
  {
    title: "Gaming Website Concept",
    title_en: "Gaming Website Concept",
    title_jp: "ゲームウェブサイトコンセプト",
    description: "Ý tưởng website gaming với thiết kế hiện đại",
    description_en: "Gaming website concept with modern design",
    description_jp: "モダンなデザインのゲームウェブサイトコンセプト",
    author: "Trần Văn F",
    likes: 59,
    comments: [],
    image:
      "https://i.pinimg.com/1200x/0c/84/d0/0c84d0994a793f26551d21236571b3ca.jpg",
    liked: false,
    saved: false,
    hashtags: ["gaming", "website", "concept", "web"],
  },
  {
    title: "Smart Home Security",
    title_en: "Smart Home Security",
    title_jp: "スマートホームセキュリティ",
    description: "Hệ thống bảo mật nhà thông minh",
    description_en: "Smart home security system",
    description_jp: "スマートホームセキュリティシステム",
    author: "Nguyễn Thị G",
    likes: 47,
    comments: [],
    image:
      "https://i.pinimg.com/1200x/89/72/5f/89725f056b6515f090c970378ed8af2a.jpg",
    liked: true,
    saved: false,
    hashtags: ["smarthome", "security", "iot", "app"],
  },
  {
    title: "Fashion E-commerce",
    title_en: "Fashion E-commerce",
    title_jp: "ファッションEコマース",
    description: "Thiết kế website thương mại điện tử thời trang",
    description_en: "Fashion e-commerce website design",
    description_jp: "ファッションEコマースウェブサイトデザイン",
    author: "Lê Văn H",
    likes: 68,
    comments: [],
    image:
      "https://i.pinimg.com/1200x/74/36/95/743695d1bf8ea485ba5e26c6d3b27b51.jpg",
    liked: false,
    saved: false,
    hashtags: ["fashion", "ecommerce", "website", "shop"],
  },
  {
    title: "Recipe App UI",
    title_en: "Recipe App UI",
    title_jp: "レシピアプリUI",
    description: "Giao diện ứng dụng công thức nấu ăn",
    description_en: "Recipe application user interface",
    description_jp: "レシピアプリケーションユーザーインターフェース",
    author: "Trần Thị I",
    likes: 41,
    comments: [],
    image:
      "https://i.pinimg.com/1200x/d9/38/cd/d938cd6ebf637acfc093245a5394d1a1.jpg",
    liked: false,
    saved: true,
    hashtags: ["recipe", "food", "app", "cooking"],
  },
  {
    title: "Event Management Dashboard",
    title_en: "Event Management Dashboard",
    title_jp: "イベント管理ダッシュボード",
    description: "Bảng điều khiển quản lý sự kiện",
    description_en: "Event management dashboard",
    description_jp: "イベント管理ダッシュボード",
    author: "Nguyễn Văn A",
    likes: 55,
    comments: [],
    image:
      "https://i.pinimg.com/1200x/43/3f/a7/433fa7a3a558b3dc854cfc339d0cb377.jpg",
    liked: false,
    saved: false,
    hashtags: ["event", "dashboard", "management", "ui"],
  },
  {
    title: "Smart City Map",
    title_en: "Smart City Map",
    title_jp: "スマートシティマップ",
    description: "Bản đồ thành phố thông minh tương tác",
    description_en: "Interactive smart city map",
    description_jp: "インタラクティブなスマートシティマップ",
    author: "Trần Thị B",
    likes: 63,
    comments: [],
    image:
      "https://i.pinimg.com/1200x/61/b4/c5/61b4c5998fa2b57d9ca35c9980144f86.jpg",
    liked: true,
    saved: false,
    hashtags: ["smartcity", "map", "urban", "iot"],
  },
  {
    title: "AR Shopping App",
    title_en: "AR Shopping App",
    title_jp: "ARショッピングアプリ",
    description: "Ứng dụng mua sắm thực tế tăng cường",
    description_en: "Augmented reality shopping application",
    description_jp: "拡張現実ショッピングアプリケーション",
    author: "Lê Văn C",
    likes: 75,
    comments: [],
    image:
      "https://i.pinimg.com/1200x/1c/48/20/1c482059a2d329f037338d25486cf4d5.jpg",
    liked: false,
    saved: true,
    hashtags: ["ar", "shopping", "app", "retail"],
  },
  {
    title: "Cybersecurity Dashboard",
    title_en: "Cybersecurity Dashboard",
    title_jp: "サイバーセキュリティダッシュボード",
    description: "Bảng điều khiển an ninh mạng",
    description_en: "Cybersecurity dashboard",
    description_jp: "サイバーセキュリティダッシュボード",
    author: "Phạm Văn D",
    likes: 88,
    comments: [],
    image:
      "https://i.pinimg.com/1200x/10/c7/99/10c799f3b328614d1a18369a6ddc1803.jpg",
    liked: false,
    saved: false,
    hashtags: ["cybersecurity", "dashboard", "security", "it"],
  },
  {
    title: "Sustainable Energy App",
    title_en: "Sustainable Energy App",
    title_jp: "持続可能エネルギーアプリ",
    description: "Ứng dụng quản lý năng lượng bền vững",
    description_en: "Sustainable energy management application",
    description_jp: "持続可能エネルギー管理アプリケーション",
    author: "Lê Thị E",
    likes: 44,
    comments: [],
    image:
      "https://i.pinimg.com/1200x/a6/4f/bb/a64fbbc07a41506486c10273b92ba6ac.jpg",
    liked: false,
    saved: true,
    hashtags: ["energy", "sustainable", "green", "app"],
  },
  {
    title: "AI Chatbot Interface",
    title_en: "AI Chatbot Interface",
    title_jp: "AIチャットボットインターフェース",
    description: "Giao diện chatbot AI thân thiện",
    description_en: "User-friendly AI chatbot interface",
    description_jp: "ユーザーフレンドリーなAIチャットボットインターフェース",
    author: "Trần Văn F",
    likes: 51,
    comments: [],
    image:
      "https://i.pinimg.com/1200x/08/32/28/083228929b876b0d00a24ea70b23fcd4.jpg",
    liked: true,
    saved: false,
    hashtags: ["ai", "chatbot", "interface", "ux"],
  },
  {
    title: "Space Exploration UI",
    title_en: "Space Exploration UI",
    title_jp: "宇宙探査UI",
    description: "Giao diện người dùng cho ứng dụng khám phá không gian",
    description_en: "User interface for space exploration application",
    description_jp: "宇宙探査アプリケーションのユーザーインターフェース",
    author: "Nguyễn Thị G",
    likes: 66,
    comments: [],
    image:
      "https://i.pinimg.com/1200x/67/62/72/676272a5ae866505336f1d46ed517ed2.jpg",
    liked: false,
    saved: false,
    hashtags: ["space", "exploration", "ui", "science"],
  },
  {
    title: "Smart Farming Dashboard",
    title_en: "Smart Farming Dashboard",
    title_jp: "スマート農業ダッシュボード",
    description: "Bảng điều khiển nông nghiệp thông minh",
    description_en: "Smart farming dashboard",
    description_jp: "スマート農業ダッシュボード",
    author: "Lê Văn H",
    likes: 40,
    comments: [],
    image:
      "https://i.pinimg.com/1200x/90/71/17/907117b0255bf03979efd26ad7367d46.jpg",
    liked: false,
    saved: true,
    hashtags: ["farming", "agriculture", "iot", "dashboard"],
  },
  {
    title: "Language Learning App",
    title_en: "Language Learning App",
    title_jp: "語学学習アプリ",
    description: "Ứng dụng học ngôn ngữ tương tác",
    description_en: "Interactive language learning application",
    description_jp: "インタラクティブな語学学習アプリケーション",
    author: "Trần Thị I",
    likes: 52,
    comments: [],
    image:
      "https://i.pinimg.com/1200x/1f/1d/fe/1f1dfea0b75e05a6420403872dcf8324.jpg",
    liked: true,
    saved: false,
    hashtags: ["language", "learning", "education", "app"],
  },
  {
    title: "Robotics Control UI",
    title_en: "Robotics Control UI",
    title_jp: "ロボット制御UI",
    description: "Giao diện điều khiển robot",
    description_en: "Robotics control interface",
    description_jp: "ロボット制御インターフェース",
    author: "Nguyễn Văn A",
    likes: 71,
    comments: [],
    image:
      "https://i.pinimg.com/736x/e7/84/29/e784296fa69dc987326c315a6abc0829.jpg",
    liked: false,
    saved: false,
    hashtags: ["robotics", "control", "automation", "ui"],
  },
  {
    title: "Virtual Event Platform",
    title_en: "Virtual Event Platform",
    title_jp: "バーチャルイベントプラットフォーム",
    description: "Nền tảng sự kiện ảo",
    description_en: "Virtual event platform",
    description_jp: "バーチャルイベントプラットフォーム",
    author: "Trần Thị B",
    likes: 60,
    comments: [],
    image:
      "https://i.pinimg.com/1200x/4f/95/e8/4f95e8b0cf9b0514874056380f7e236a.jpg",
    liked: false,
    saved: true,
    hashtags: ["virtual", "event", "platform", "online"],
  },
  {
    title: "Data Visualization Tool",
    title_en: "Data Visualization Tool",
    title_jp: "データ視覚化ツール",
    description: "Công cụ trực quan hóa dữ liệu",
    description_en: "Data visualization tool",
    description_jp: "データ視覚化ツール",
    author: "Lê Văn C",
    likes: 82,
    comments: [],
    image:
      "https://i.pinimg.com/1200x/7d/fb/91/7dfb91d5d89d7a5dd67c5a603ba919f1.jpg",
    liked: true,
    saved: false,
    hashtags: ["data", "visualization", "tool", "analytics"],
  },
  {
    title: "Personal Finance Tracker",
    title_en: "Personal Finance Tracker",
    title_jp: "個人財務トラッカー",
    description: "Ứng dụng theo dõi tài chính cá nhân",
    description_en: "Personal finance tracking application",
    description_jp: "個人財務追跡アプリケーション",
    author: "Phạm Văn D",
    likes: 45,
    comments: [],
    image:
      "https://i.pinimg.com/1200x/4a/4b/24/4a4b24da628a3767efbbf9a6d222c990.jpg",
    liked: false,
    saved: false,
    hashtags: ["finance", "personal", "money", "app"],
  },
  {
    title: "Smart Retail Solution",
    title_en: "Smart Retail Solution",
    title_jp: "スマートリテールソリューション",
    description: "Giải pháp bán lẻ thông minh",
    description_en: "Smart retail solution",
    description_jp: "スマートリテールソリューション",
    author: "Lê Thị E",
    likes: 58,
    comments: [],
    image:
      "https://i.pinimg.com/1200x/c0/4f/45/c04f45e354d80aa29411909bf45e2888.jpg",
    liked: false,
    saved: true,
    hashtags: ["retail", "smart", "solution", "business"],
  },
  {
    title: "Digital Art Gallery",
    title_en: "Digital Art Gallery",
    title_jp: "デジタルアートギャラリー",
    description: "Nền tảng trưng bày nghệ thuật số",
    description_en: "Digital art display platform",
    description_jp: "デジタルアート展示プラットフォーム",
    author: "Trần Văn F",
    likes: 69,
    comments: [],
    image:
      "https://i.pinimg.com/1200x/d4/36/d7/d436d7ddb5a35811141af57d579a6d50.jpg",
    liked: false,
    saved: false,
    hashtags: ["art", "digital", "gallery", "creative"],
  },
  {
    title: "Home Automation App",
    title_en: "Home Automation App",
    title_jp: "ホームオートメーションアプリ",
    description: "Ứng dụng tự động hóa nhà cửa",
    description_en: "Home automation application",
    description_jp: "ホームオートメーションアプリケーション",
    author: "Nguyễn Thị G",
    likes: 50,
    comments: [],
    image:
      "https://i.pinimg.com/1200x/9c/b2/8b/9cb28be1b726b687e20002ed377dd81c.jpg",
    liked: true,
    saved: false,
    hashtags: ["home", "automation", "iot", "app"],
  },
  {
    title: "Fitness Tracker Dashboard",
    title_en: "Fitness Tracker Dashboard",
    title_jp: "フィットネストラッカーダッシュボード",
    description: "Bảng điều khiển theo dõi thể dục",
    description_en: "Fitness tracker dashboard",
    description_jp: "フィットネストラッカーダッシュボード",
    author: "Lê Văn H",
    likes: 55,
    comments: [],
    image:
      "https://i.pinimg.com/1200x/00/2c/0b/002c0b33f65c540f9799b360c52ab2df.jpg",
    liked: false,
    saved: true,
    hashtags: ["fitness", "tracker", "dashboard", "health"],
  },
  {
    title: "Smart Office Solution",
    title_en: "Smart Office Solution",
    title_jp: "スマートオフィスソリューション",
    description: "Giải pháp văn phòng thông minh",
    description_en: "Smart office solution",
    description_jp: "スマートオフィスソリューション",
    author: "Trần Thị I",
    likes: 62,
    comments: [],
    image:
      "https://i.pinimg.com/1200x/bd/3a/48/bd3a4840a14147b89d79f26fb738ebaa.jpg",
    liked: false,
    saved: false,
    hashtags: ["office", "smart", "solution", "work"],
  },
  {
    title: "Eco-friendly Product Design",
    title_en: "Eco-friendly Product Design",
    title_jp: "環境に優しい製品デザイン",
    description: "Thiết kế sản phẩm thân thiện với môi trường",
    description_en: "Eco-friendly product design",
    description_jp: "環境に優しい製品デザイン",
    author: "Nguyễn Văn A",
    likes: 78,
    comments: [],
    image:
      "https://i.pinimg.com/1200x/a9/c5/31/a9c531a75d23240f912da0db5b0851b0.jpg",
    liked: true,
    saved: false,
    hashtags: ["eco", "product", "design", "sustainable"],
  },
  {
    title: "Interactive Kiosk UI",
    title_en: "Interactive Kiosk UI",
    title_jp: "インタラクティブキオスクUI",
    description: "Giao diện kiosk tương tác",
    description_en: "Interactive kiosk user interface",
    description_jp: "インタラクティブキオスクユーザーインターフェース",
    author: "Trần Thị B",
    likes: 49,
    comments: [],
    image:
      "https://i.pinimg.com/1200x/5b/9d/fc/5b9dfcbd1f032728384b57885a055b6c.jpg",
    liked: false,
    saved: true,
    hashtags: ["kiosk", "interactive", "ui", "public"],
  },
  {
    title: "Blockchain Wallet UI",
    title_en: "Blockchain Wallet UI",
    title_jp: "ブロックチェーンウォレットUI",
    description: "Giao diện ví blockchain an toàn",
    description_en: "Secure blockchain wallet interface",
    description_jp: "安全なブロックチェーンウォレットインターフェース",
    author: "Lê Văn C",
    likes: 85,
    comments: [],
    image:
      "https://i.pinimg.com/1200x/65/c2/9f/65c29f034b33b356cfd75ae71f0a5eab.jpg",
    liked: false,
    saved: false,
    hashtags: ["blockchain", "wallet", "crypto", "ui"],
  },
  {
    title: "Smart Agriculture Drone",
    title_en: "Smart Agriculture Drone",
    title_jp: "スマート農業ドローン",
    description: "Thiết kế drone nông nghiệp thông minh",
    description_en: "Smart agriculture drone design",
    description_jp: "スマート農業ドローンデザイン",
    author: "Phạm Văn D",
    likes: 53,
    comments: [],
    image:
      "https://i.pinimg.com/1200x/f3/4b/43/f34b431ecfdb5b21fa91562562032097.jpg",
    liked: true,
    saved: false,
    hashtags: ["agriculture", "drone", "smart", "farming"],
  },
  {
    title: "AI Assistant Interface",
    title_en: "AI Assistant Interface",
    title_jp: "AIアシスタントインターフェース",
    description: "Giao diện trợ lý AI",
    description_en: "AI assistant interface",
    description_jp: "AIアシスタントインターフェース",
    author: "Lê Thị E",
    likes: 67,
    comments: [],
    image:
      "https://i.pinimg.com/1200x/2f/4f/f6/2f4ff61459fe495a2e08b55062449822.jpg",
    liked: false,
    saved: true,
    hashtags: ["ai", "assistant", "interface", "voice"],
  },
  {
    title: "Cloud Storage UI",
    title_en: "Cloud Storage UI",
    title_jp: "クラウドストレージUI",
    description: "Giao diện lưu trữ đám mây",
    description_en: "Cloud storage user interface",
    description_jp: "クラウドストレージユーザーインターフェース",
    author: "Trần Văn F",
    likes: 48,
    comments: [],
    image:
      "https://i.pinimg.com/1200x/f4/63/54/f46354c39334a6d9b89b38a39172e94a.jpg",
    liked: false,
    saved: false,
    hashtags: ["cloud", "storage", "ui", "data"],
  },
  {
    title: "Smart Home Energy Monitor",
    title_en: "Smart Home Energy Monitor",
    title_jp: "スマートホームエネルギーモニター",
    description: "Thiết bị giám sát năng lượng nhà thông minh",
    description_en: "Smart home energy monitoring device",
    description_jp: "スマートホームエネルギー監視デバイス",
    author: "Nguyễn Thị G",
    likes: 59,
    comments: [],
    image:
      "https://i.pinimg.com/1200x/f2/0b/06/f20b06627e3303b224d0bb06887e5185.jpg",
    liked: true,
    saved: false,
    hashtags: ["smarthome", "energy", "monitor", "iot"],
  },
  {
    title: "Virtual Classroom UI",
    title_en: "Virtual Classroom UI",
    title_jp: "バーチャル教室UI",
    description: "Giao diện lớp học ảo",
    description_en: "Virtual classroom user interface",
    description_jp: "バーチャル教室ユーザーインターフェース",
    author: "Lê Văn H",
    likes: 72,
    comments: [],
    image:
      "https://i.pinimg.com/1200x/44/12/09/441209ed9e6de77325a36d3cb865efbf.jpg",
    liked: false,
    saved: true,
    hashtags: ["virtual", "classroom", "education", "online"],
  },
  {
    title: "Wearable Health Device",
    title_en: "Wearable Health Device",
    title_jp: "ウェアラブルヘルスデバイス",
    description: "Thiết bị y tế đeo tay",
    description_en: "Wearable medical device",
    description_jp: "ウェアラブル医療デバイス",
    author: "Trần Thị I",
    likes: 65,
    comments: [],
    image:
      "https://i.pinimg.com/1200x/dd/5f/a2/dd5fa2f584bd2ed2ad70a54f6475d76c.jpg",
    liked: false,
    saved: false,
    hashtags: ["wearable", "health", "device", "medical"],
  },
  {
    title: "Smart City Traffic Control",
    title_en: "Smart City Traffic Control",
    title_jp: "スマートシティ交通制御",
    description: "Hệ thống điều khiển giao thông thành phố thông minh",
    description_en: "Smart city traffic control system",
    description_jp: "スマートシティ交通制御システム",
    author: "Nguyễn Văn A",
    likes: 70,
    comments: [],
    image:
      "https://i.pinimg.com/1200x/7b/c6/0b/7bc60b5c4da1673f79fd15930077d636.jpg",
    liked: true,
    saved: false,
    hashtags: ["smartcity", "traffic", "control", "iot"],
  },
  {
    title: "Augmented Reality Game",
    title_en: "Augmented Reality Game",
    title_jp: "拡張現実ゲーム",
    description: "Game thực tế tăng cường",
    description_en: "Augmented reality game",
    description_jp: "拡張現実ゲーム",
    author: "Trần Thị B",
    likes: 80,
    comments: [],
    image:
      "https://i.pinimg.com/1200x/4c/49/0d/4c490d1a62396e3d8896f819a51720c4.jpg",
    liked: false,
    saved: true,
    hashtags: ["ar", "game", "reality", "interactive"],
  },
  {
    title: "AI-powered Healthcare",
    title_en: "AI-powered Healthcare",
    title_jp: "AI搭載ヘルスケア",
    description: "Giải pháp chăm sóc sức khỏe ứng dụng AI",
    description_en: "AI-powered healthcare solution",
    description_jp: "AI搭載ヘルスケアソリューション",
    author: "Lê Văn C",
    likes: 90,
    comments: [],
    image:
      "https://i.pinimg.com/1200x/2c/a8/d7/2ca8d7378e9adeb7d03ae9c2b35c95b4.jpg",
    liked: false,
    saved: false,
    hashtags: ["ai", "healthcare", "medical", "solution"],
  },
  {
    title: "Smart Logistics Dashboard",
    title_en: "Smart Logistics Dashboard",
    title_jp: "スマートロジスティクスダッシュボード",
    description: "Bảng điều khiển logistics thông minh",
    description_en: "Smart logistics dashboard",
    description_jp: "スマートロジスティクスダッシュボード",
    author: "Phạm Văn D",
    likes: 65,
    comments: [],
    image:
      "https://i.pinimg.com/1200x/72/a0/2c/72a02c36d0ba0aaa3dff28a4d8abd3f8.jpg",
    liked: true,
    saved: false,
    hashtags: ["logistics", "smart", "dashboard", "supplychain"],
  },
  {
    title: "Green Building Design",
    title_en: "Green Building Design",
    title_jp: "グリーンビルディングデザイン",
    description: "Thiết kế tòa nhà xanh",
    description_en: "Green building design",
    description_jp: "グリーンビルディングデザイン",
    author: "Lê Thị E",
    likes: 75,
    comments: [],
    image:
      "https://i.pinimg.com/1200x/8c/87/b6/8c87b64ef7d45553d0da73e37bff1fff.jpg",
    liked: false,
    saved: true,
    hashtags: ["green", "building", "design", "architecture"],
  },
  {
    title: "Interactive Museum Guide",
    title_en: "Interactive Museum Guide",
    title_jp: "インタラクティブ博物館ガイド",
    description: "Ứng dụng hướng dẫn bảo tàng tương tác",
    description_en: "Interactive museum guide application",
    description_jp: "インタラクティブ博物館ガイドアプリケーション",
    author: "Trần Văn F",
    likes: 50,
    comments: [],
    image:
      "https://i.pinimg.com/1200x/46/a1/29/46a129f79d37c39316ef3f87a2cb311f.jpg",
    liked: false,
    saved: false,
    hashtags: ["museum", "interactive", "guide", "culture"],
  },
  {
    title: "Quantum Computing UI",
    title_en: "Quantum Computing UI",
    title_jp: "量子コンピューティングUI",
    description: "Giao diện điện toán lượng tử",
    description_en: "Quantum computing interface",
    description_jp: "量子コンピューティングインターフェース",
    author: "Nguyễn Thị G",
    likes: 88,
    comments: [],
    image:
      "https://i.pinimg.com/1200x/14/75/ed/1475ed31fff2f1d07824ec173da916f3.jpg",
    liked: true,
    saved: false,
    hashtags: ["quantum", "computing", "science", "ui"],
  },
  {
    title: "Smart Waste Management",
    title_en: "Smart Waste Management",
    title_jp: "スマート廃棄物管理",
    description: "Hệ thống quản lý chất thải thông minh",
    description_en: "Smart waste management system",
    description_jp: "スマート廃棄物管理システム",
    author: "Lê Văn H",
    likes: 60,
    comments: [],
    image:
      "https://i.pinimg.com/1200x/14/0c/18/140c187af42f5f7b92a343891004bffb.jpg",
    liked: false,
    saved: true,
    hashtags: ["waste", "management", "smart", "environment"],
  },
  {
    title: "Personalized Learning App",
    title_en: "Personalized Learning App",
    title_jp: "パーソナライズされた学習アプリ",
    description: "Ứng dụng học tập cá nhân hóa",
    description_en: "Personalized learning application",
    description_jp: "パーソナライズされた学習アプリケーション",
    author: "Trần Thị I",
    likes: 70,
    comments: [],
    image:
      "https://i.pinimg.com/736x/5a/a6/92/5aa6927ab6fb44c84ebbebd2a9307d40.jpg",
    liked: false,
    saved: false,
    hashtags: ["learning", "personalized", "education", "app"],
  },
];

const importData = async () => {
  try {
    await connectDB();

    // BƯỚC 1: XÓA DỮ LIỆU CŨ (designs và users)
    console.log("Đang xóa dữ liệu cũ...");
    const deletedDesigns = await Design.deleteMany({});
    const deletedUsers = await User.deleteMany({});

    console.log(`Đã xóa ${deletedDesigns.deletedCount} designs`);
    console.log(`Đã xóa ${deletedUsers.deletedCount} users`);

    if (deletedDesigns.deletedCount === 0 && deletedUsers.deletedCount === 0) {
      console.log("Không có dữ liệu cũ để xóa.");
    }

    // BƯỚC 2: TẠO USERS MỚI
    console.log("Đang tạo users mẫu...");
    const users = [];
    for (const userData of sampleUsers) {
      // Kiểm tra user đã tồn tại chưa (email unique)
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        console.log(`User  ${userData.email} đã tồn tại, bỏ qua.`);
        users.push(existingUser);
        continue;
      }

      // Hash password và tạo user mới
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);
      const user = new User({ ...userData, password: hashedPassword });
      await user.save();
      users.push(user);
      console.log(`Tạo user: ${userData.name}`);
    }

    // BƯỚC 3: GÁN AUTHORID VÀ TẠO DESIGNS MỚI
    console.log("Đang tạo designs mẫu...");
    let createdDesigns = 0;
    for (const designData of sampleDesigns) {
      // Kiểm tra design đã tồn tại chưa (dựa trên title + author)
      const existingDesign = await Design.findOne({
        title: designData.title,
        author: designData.author,
      });
      if (existingDesign) {
        console.log(`Design "${designData.title}" đã tồn tại, bỏ qua.`);
        continue;
      }

      // Gán authorId (luân phiên users)
      const userIndex = createdDesigns % users.length;
      designData.authorId = users[userIndex]._id;

      // Tạo design mới
      const design = new Design(designData);
      await design.save();
      createdDesigns++;
      console.log(`Tạo design: ${designData.title}`);
    }

    console.log(`\n✅ Reseed thành công!`);
    console.log(`- Users: ${users.length}`);
    console.log(
      `- Designs mới: ${createdDesigns} (tổng có thể nhiều hơn nếu giữ cũ)`
    );
    console.log("Bây giờ bạn có thể chạy backend và kiểm tra frontend.");

    // Đóng kết nối
    mongoose.connection.close();
  } catch (error) {
    console.error("❌ Lỗi trong quá trình reseed:", error.message);
    process.exit(1);
  }
};

// Chạy reseed nếu file được gọi trực tiếp
if (require.main === module) {
  console.log("🚀 Bắt đầu reseed dữ liệu...");
  importData();
}
